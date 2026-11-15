import { ASSESSMENTS, BY_ID, SCORERS, SCALES, isComplete, answeredCount } from './assessments/index.js';
import { discProfile } from './assessments/disc.js';
import { TRAITS } from './assessments/big5.js';
import { DISC, TRAIT, pairFor } from './guidance.js';
import { computeTeam } from './team.js';
import { rose, discMix, typeMix, groupMix, big5Avg } from './charts.js';
import { resultBlock, guideHtml, summaryOf } from './blocks.js';
import { suggestions, normalizeRecord, planStats } from './devplan.js';
import { DEMO_MEMBERS, DEMO_RECORDS } from './demo.js';
import { APP_NAME, t, fmtDate, SRC_LABEL } from './i18n.js';
import { local, session, api, loadConfig, encodeResultCode, decodeResultCode, esc, copyText, saveFile, randomId } from './util.js';

const K = { lang: 'tp.lang', me: 'tp.me', team: 'tp.team', imports: 'tp.imports', self: 'tp.self', pass: 'tp.pass', theme: 'tp.theme', records: 'tp.records' };

const freshMe = () => ({ name: '', role: '', consent: false, answers: { disc: {}, type: {}, big5: {} }, results: {}, completedAt: {}, sentAt: {}, share: null, sync: null });

const storedMe = local.get(K.me) || {};
// People who shared with an earlier version had already agreed to share.
if (storedMe.share && storedMe.consent === undefined) storedMe.consent = true;
const storedTheme = local.get(K.theme);

const state = {
  lang: local.get(K.lang) === 'en' ? 'en' : 'ar',
  theme: storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null,
  config: null,
  me: { ...freshMe(), ...storedMe, sync: storedMe.sync?.status === 'sending' ? null : storedMe.sync || null },
  teamCode: '',
  route: { name: 'home', arg: '' },
  q: 0,
  lead: {
    pass: session.get(K.pass) || '',
    members: [],
    records: {},
    localRecords: local.get(K.records) || {},
    loaded: false,
    loading: false,
    error: '',
    imports: local.get(K.imports) || [],
    selfId: local.get(K.self) || 'local',
  },
  ui: { flash: null, nextFlash: null, busy: false, withdrawAsk: false, removeAsk: false, importOpen: false, importMsg: '', code: '', linkCode: '', linkMsg: '', tab: 'overview', tabFor: '', draft: null, draftId: null, saveState: null, exporting: false },
};

// The team code arrives as ?team=CODE in the link the lead shares.
(() => {
  const fromUrl = new URLSearchParams(location.search).get('team');
  if (fromUrl) local.set(K.team, fromUrl.slice(0, 80));
  state.teamCode = local.get(K.team) || '';
})();

const root = document.getElementById('app');
const L = () => state.lang;
const tr = (key, vars) => t(key, state.lang, vars);
const saveMe = () => local.set(K.me, state.me);
const serverOn = () => !!state.config && state.config.storage !== 'none';

// ---------- Theme ----------
const prefersDark = () => !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const effectiveTheme = () => state.theme || (prefersDark() ? 'dark' : 'light');
function applyTheme() {
  const r = document.documentElement;
  if (state.theme) r.dataset.theme = state.theme;
  else delete r.dataset.theme;
}
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
  if (!state.theme) render();
});
const ICON_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

// ---------- Routing ----------
function parseRoute() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (h.startsWith('test-') && BY_ID[h.slice(5)]) return { name: 'test', arg: h.slice(5) };
  if (h === 'me' || h.startsWith('me-')) return { name: 'me', arg: h.slice(3) };
  if (h === 'about') return { name: 'about', arg: '' };
  if (h === 'lead') return { name: 'lead', arg: '' };
  if (h.startsWith('lead-m-')) return { name: 'member', arg: h.slice(7) };
  return { name: 'home', arg: '' };
}

function go(hash) {
  if (location.hash === '#' + hash) onRoute();
  else location.hash = hash;
}

function onRoute() {
  flushSave();
  state.route = parseRoute();
  state.ui.flash = state.ui.nextFlash || null;
  state.ui.nextFlash = null;
  state.ui.withdrawAsk = false;
  state.ui.removeAsk = false;
  if (state.route.name === 'member' && state.ui.tabFor !== state.route.arg) {
    state.ui.tab = 'overview';
    state.ui.tabFor = state.route.arg;
  }
  if (state.route.name === 'test') {
    const a = BY_ID[state.route.arg];
    const answers = state.me.answers[a.id] || {};
    const firstOpen = a.items.findIndex((it) => !answers[it.id]);
    state.q = firstOpen === -1 ? a.items.length - 1 : firstOpen;
  }
  if ((state.route.name === 'lead' || state.route.name === 'member') && !state.lead.loaded) loadLead();
  render();
  const focusEl = state.route.arg && state.route.name === 'me' ? document.getElementById('r-' + state.route.arg) : root.querySelector('h1');
  if (focusEl) {
    focusEl.setAttribute('tabindex', '-1');
    focusEl.focus({ preventScroll: state.route.name !== 'me' || !state.route.arg });
    if (state.route.name !== 'me' || !state.route.arg) window.scrollTo(0, 0);
  }
}

// ---------- Shell ----------
function render() {
  // Keep focus and caret in the field the person was using when the page re-renders.
  const active = document.activeElement;
  const activeId = active && active !== document.body ? active.id : '';
  let sel = null;
  try {
    if (activeId && typeof active.selectionStart === 'number') sel = [active.selectionStart, active.selectionEnd];
  } catch {
    sel = null;
  }

  applyTheme();
  document.documentElement.lang = L();
  document.documentElement.dir = L() === 'ar' ? 'rtl' : 'ltr';
  document.title = APP_NAME[L()];
  const wide = state.route.name === 'lead' || state.route.name === 'member';
  const hasResults = Object.keys(state.me.results || {}).length > 0;
  const dark = effectiveTheme() === 'dark';
  root.innerHTML = `
    <header class="topbar"><div class="wrap ${wide ? 'wrap-wide' : ''} topbar-in">
      <a class="brand" href="#">${rose({ D: 72, I: 48, S: 88, C: 64 }, { size: 30, title: APP_NAME[L()] })}<span>${esc(APP_NAME[L()])}</span></a>
      <nav class="topnav">
        ${hasResults && !wide ? `<a href="#me" class="navlink">${tr('navProfile')}</a>` : ''}
        <button type="button" class="navlink icon-btn" id="theme-btn" data-act="theme" aria-label="${tr(dark ? 'themeToLight' : 'themeToDark')}" title="${tr(dark ? 'themeToLight' : 'themeToDark')}">${dark ? ICON_SUN : ICON_MOON}</button>
        <button type="button" class="navlink lang" id="lang-btn" data-act="lang" lang="${L() === 'ar' ? 'en' : 'ar'}">${tr('langSwitch')}</button>
      </nav>
    </div></header>
    <main class="wrap ${wide ? 'wrap-wide' : ''} main">${view()}</main>
    <footer class="wrap ${wide ? 'wrap-wide' : ''} foot">
      <a href="#about">${tr('navAbout')}</a>
    </footer>`;

  if (activeId) {
    const el = document.getElementById(activeId);
    if (el && el !== document.activeElement) {
      el.focus({ preventScroll: true });
      if (sel && typeof el.setSelectionRange === 'function') {
        try {
          el.setSelectionRange(sel[0], sel[1]);
        } catch {
          /* not a text field */
        }
      }
    }
  }
}

function view() {
  switch (state.route.name) {
    case 'test': return viewTest();
    case 'me': return viewProfile();
    case 'about': return viewAbout();
    case 'lead': return viewLead();
    case 'member': return viewMember();
    default: return viewHome();
  }
}

function flash() {
  const f = state.ui.flash;
  return f ? `<p class="flash flash-${f.kind}" role="${f.kind === 'err' ? 'alert' : 'status'}">${esc(f.text)}</p>` : '';
}
const setFlash = (kind, key, vars) => (state.ui.flash = { kind, text: tr(key, vars) });
const setFlashText = (kind, text) => (state.ui.flash = { kind, text });

function errText(e) {
  if (e?.status === 0) return tr('errNetwork');
  if (e?.code === 'bad_team_code' || e?.code === 'team_code_required') return tr('errTeamCode');
  return tr('errServer', { msg: e?.message || e?.code || '' });
}

// ---------- Home ----------
const sentFor = (id) => !!state.me.sentAt?.[id] && state.me.sentAt[id] === state.me.completedAt?.[id];

function viewHome() {
  const me = state.me;
  const server = serverOn();
  const rows = ASSESSMENTS.map((a) => {
    const answers = me.answers[a.id] || {};
    const n = answeredCount(a.id, answers);
    const done = !!me.results[a.id];
    const total = a.items.length;
    let status;
    let actions;
    if (n > 0 && n < total) {
      status = `<span class="pill pill-progress">${tr('inProgress', { n, total })}</span>`;
      actions = `<button type="button" class="btn btn-primary" data-act="start" data-id="${a.id}" data-mode="resume">${tr('resume')}</button>`;
    } else if (done) {
      status = `<span class="pill pill-done">${tr('done')}</span>${server && sentFor(a.id) ? `<span class="pill pill-sent">${tr('sentPill')}</span>` : ''}`;
      actions = `<a class="btn btn-quiet" href="#me-${a.id}">${tr('viewResult')}</a><button type="button" class="btn btn-ghost" data-act="start" data-id="${a.id}" data-mode="retake">${tr('retake')}</button>`;
    } else {
      status = `<span class="pill">${tr('notStarted')}</span>`;
      actions = `<button type="button" class="btn btn-primary" data-act="start" data-id="${a.id}" data-mode="start">${tr('start')}</button>`;
    }
    return `<li class="test-row">
      <div class="test-main">
        <h3>${esc(a.name[L()])}</h3>
        <p>${esc(a.blurb[L()])}</p>
        <p class="meta"><span class="num">${total}</span> ${tr('questions')}، <span class="num">${a.minutes}</span> ${tr('minutes')}</p>
      </div>
      <div class="test-side"><div class="pills">${status}</div><div class="test-actions">${actions}</div></div>
    </li>`;
  }).join('');
  const hasResults = Object.keys(me.results).length > 0;
  const needCode = server && state.config.teamCodeRequired;
  return `
    <section class="hero">
      <h1>${tr('heroTitle')}</h1>
      <p class="lede">${tr(server ? 'heroBody' : 'heroBodyLocal')}</p>
    </section>
    <section class="identity panel" aria-labelledby="id-title">
      <h2 class="h-small" id="id-title">${tr('identityTitle')}</h2>
      <div class="identity-fields">
        <div class="field"><label for="f-name">${tr('nameLabel')}</label><input id="f-name" data-bind="name" autocomplete="name" maxlength="60" placeholder="${esc(tr('namePlaceholder'))}" value="${esc(me.name)}"></div>
        <div class="field"><label for="f-role">${tr('roleLabel')}</label><input id="f-role" data-bind="role" autocomplete="organization-title" maxlength="60" placeholder="${esc(tr('rolePlaceholder'))}" value="${esc(me.role)}"></div>
        ${needCode ? `<div class="field"><label for="f-team">${tr('teamCodeLabel')}</label><input id="f-team" data-bind="teamCode" value="${esc(state.teamCode)}" autocomplete="off" maxlength="80"><p class="help">${tr('teamCodeHelp')}</p></div>` : ''}
      </div>
      ${server
        ? `<label class="check consent"><input type="checkbox" id="f-consent" data-bind="consent" ${me.consent ? 'checked' : ''}> <span>${tr('consentLabel')}</span></label><p class="help">${tr('consentHelp')}</p>`
        : `<p class="note">${tr('fallbackNote')}</p>`}
      ${flash()}
      ${server && hasResults ? syncBox() : ''}
    </section>
    <section class="tests">
      <h2 class="section-title">${tr('assessmentsTitle')}</h2>
      <ul class="test-list">${rows}</ul>
      ${hasResults ? `<p class="cta-row"><a class="btn btn-primary" href="#me">${tr('seeProfile')}</a></p>` : ''}
    </section>`;
}

/** Why the person can't start yet: [message key, field id] or null. */
function startProblem() {
  if (!state.me.name.trim()) return ['needName', 'f-name'];
  if (serverOn() && state.config.teamCodeRequired && !state.teamCode.trim()) return ['needTeamCode', 'f-team'];
  if (serverOn() && !state.me.consent) return ['needConsent', 'f-consent'];
  return null;
}

// ---------- Assessment ----------
function viewTest() {
  const a = BY_ID[state.route.arg];
  const answers = state.me.answers[a.id] || {};
  const item = a.items[state.q];
  const total = a.items.length;
  const pct = Math.round((answeredCount(a.id, answers) / total) * 100);
  const current = answers[item.id];
  let body;
  if (a.scale === 'bipolar') {
    const startText = item.flip ? item.second : item.first;
    const endText = item.flip ? item.first : item.second;
    const labels = SCALES.bipolar[L()];
    const dots = [1, 2, 3, 4, 5].map((v) => `<button type="button" class="dot dot-${v} ${current === v ? 'is-on' : ''}" role="radio" aria-checked="${current === v}" aria-label="${esc(labels[v - 1])}" data-act="answer" data-v="${v}"><span></span></button>`).join('');
    body = `
      <p class="q-hint">${tr('bipolarHint')}</p>
      <div class="pair" id="q-text">
        <p class="pair-side pair-start">${esc(startText[L()])}</p>
        <p class="pair-side pair-end">${esc(endText[L()])}</p>
      </div>
      <div class="dots" role="radiogroup" aria-labelledby="q-text">${dots}</div>
      <div class="dots-ends" aria-hidden="true"><span>${tr('fully')}</span><span>${tr('between')}</span><span>${tr('fully')}</span></div>`;
  } else {
    const labels = SCALES[a.scale][L()];
    const opts = labels.map((label, i) => {
      const v = i + 1;
      return `<button type="button" class="opt ${current === v ? 'is-on' : ''}" role="radio" aria-checked="${current === v}" data-act="answer" data-v="${v}"><span class="opt-key num">${v}</span><span>${esc(label)}</span></button>`;
    }).join('');
    body = `
      ${a.intro ? `<p class="q-hint">${esc(a.intro[L()])}</p>` : ''}
      <p class="q-text" id="q-text">${esc(item.text[L()])}</p>
      <div class="options" role="radiogroup" aria-labelledby="q-text">${opts}</div>`;
  }
  return `
    <div class="test-head">
      <a class="back" href="#">${tr('backHome')}</a>
      <h1 class="test-title">${esc(a.name[L()])}</h1>
      <div class="progress">
        <div class="progress-meta"><span>${tr('questionOf', { n: state.q + 1, total })}</span><span class="num">${pct}%</span></div>
        <div class="progress-track"><span style="inline-size:${pct}%"></span></div>
      </div>
    </div>
    <div class="q-card" data-scale="${a.scale}">${body}</div>
    <div class="q-nav">
      <button type="button" class="btn btn-ghost" data-act="prev" ${state.q === 0 ? 'disabled' : ''}>${tr('prev')}</button>
      <span class="hint">${tr('keyHint')}</span>
    </div>`;
}

let advanceTimer = null;
function answer(v) {
  const a = BY_ID[state.route.arg];
  const item = a.items[state.q];
  state.me.answers[a.id] = { ...(state.me.answers[a.id] || {}), [item.id]: v };
  saveMe();
  render();
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(() => {
    const answers = state.me.answers[a.id];
    if (isComplete(a.id, answers)) {
      finish(a.id);
      return;
    }
    const next = a.items.findIndex((it, i) => i > state.q && !answers[it.id]);
    const anyOpen = a.items.findIndex((it) => !answers[it.id]);
    state.q = next !== -1 ? next : anyOpen;
    render();
    root.querySelector('.q-card')?.querySelector('.is-on, button')?.focus({ preventScroll: true });
  }, 220);
}

function finish(id) {
  const answers = state.me.answers[id];
  state.me.results = { ...state.me.results, [id]: SCORERS[id](answers) };
  state.me.completedAt = { ...state.me.completedAt, [id]: new Date().toISOString() };
  state.me.answers[id] = {}; // raw answers are not kept once scored
  saveMe();
  go('me-' + id);
  if (serverOn() && state.me.consent) syncResults();
}

// ---------- Sending results to the lead ----------
let syncing = false;
let syncAgain = false;

async function syncResults(retryAsNew = false) {
  const me = state.me;
  if (!serverOn() || !me.consent || !me.name.trim() || !Object.keys(me.results || {}).length) return;
  if (syncing) {
    syncAgain = true;
    return;
  }
  syncing = true;
  me.sync = { status: 'sending' };
  render();
  const body = { name: me.name.trim(), role: me.role.trim(), lang: L(), results: me.results, completedAt: me.completedAt, teamCode: state.teamCode.trim() };
  if (me.share && !retryAsNew) Object.assign(body, { id: me.share.id, token: me.share.token });
  let retry = false;
  try {
    const r = await api('/api/submit', { method: 'POST', body });
    me.share = { id: r.id, token: r.token || me.share?.token, sharedAt: me.share?.sharedAt || r.updatedAt, updatedAt: r.updatedAt };
    me.sentAt = Object.fromEntries(Object.keys(me.results).map((id) => [id, me.completedAt[id]]));
    me.sync = { status: 'ok', at: r.updatedAt };
  } catch (e) {
    if ((e.code === 'bad_token' || e.code === 'not_found') && me.share && !retryAsNew) {
      // The lead removed this entry, or it belongs to another device: send as a new entry.
      me.share = null;
      retry = true;
    } else {
      me.sync = { status: 'err', msg: errText(e) };
    }
  } finally {
    syncing = false;
    saveMe();
  }
  if (retry) return syncResults(true);
  render();
  if (syncAgain) {
    syncAgain = false;
    syncResults();
  }
}

function syncBox() {
  const me = state.me;
  const s = me.sync;
  if (!me.consent) return `<div class="sync sync-off" role="status"><p>${tr('syncOff')}</p></div>`;
  if (s?.status === 'sending') return `<div class="sync sync-busy" role="status"><span class="spinner" aria-hidden="true"></span><p>${tr('syncSending')}</p></div>`;
  const allSent = Object.keys(me.results || {}).every((id) => sentFor(id));
  if (s?.status === 'ok' && allSent) return `<div class="sync sync-ok" role="status"><span class="sync-icon" aria-hidden="true">✓</span><p>${tr('syncOk', { date: fmtDate(s.at, L()) })}</p></div>`;
  const msg = s?.status === 'err' ? tr('syncErr', { msg: s.msg }) : tr('syncNever');
  return `<div class="sync sync-err" role="${s?.status === 'err' ? 'alert' : 'status'}"><p>${esc(msg)}</p><button type="button" class="btn btn-primary btn-small" data-act="sync-now">${tr('sendNow')}</button></div>`;
}

// ---------- Profile ----------
function viewProfile() {
  const me = state.me;
  const done = ASSESSMENTS.filter((a) => me.results[a.id]);
  if (!done.length) {
    return `<header class="page-head"><h1>${tr('profileTitle')}</h1></header>
      <div class="empty"><p>${tr('profileEmpty')}</p><a class="btn btn-primary" href="#">${tr('profileEmptyAction')}</a></div>`;
  }
  const blocks = done.map((a) => `
    <section class="result" id="r-${a.id}">
      <div class="result-head"><h2>${esc(a.name[L()])}</h2><span class="muted">${esc(fmtDate(me.completedAt[a.id], L()))}</span></div>
      ${resultBlock(a.id, me.results[a.id], L(), { audience: 'self' })}
    </section>`).join('');
  const next = ASSESSMENTS.find((a) => !me.results[a.id]);
  return `
    <header class="page-head">
      <h1>${esc(me.name || tr('profileTitle'))}</h1>
      <p class="lede">${tr('profileNote')}</p>
      ${serverOn() ? syncBox() : ''}
      ${next ? `<p><button type="button" class="btn btn-quiet" data-act="start" data-id="${next.id}" data-mode="start">${tr('start')}: ${esc(next.name[L()])}</button></p>` : ''}
    </header>
    ${blocks}
    <section class="guide">
      <h2>${tr('guideSelfTitle')}</h2>
      <p class="muted">${tr('guideSelfBody')}</p>
      ${guideHtml(me.results, L())}
    </section>
    ${sharingPanel()}`;
}

function sharingPanel() {
  const me = state.me;
  if (serverOn()) {
    const withdraw = me.share
      ? state.ui.withdrawAsk
        ? `<div class="confirm" role="group"><p>${tr('withdrawConfirm')}</p><button type="button" class="btn btn-danger" data-act="withdraw-yes" ${state.ui.busy ? 'disabled' : ''}>${tr('withdrawYes')}</button><button type="button" class="btn btn-ghost" data-act="withdraw-no">${tr('cancel')}</button></div>`
        : `<button type="button" class="btn btn-ghost" data-act="withdraw-ask">${tr('withdrawButton')}</button>`
      : '';
    const consent = me.consent ? '' : `<label class="check consent"><input type="checkbox" id="f-consent" data-bind="consent"> <span>${tr('consentLabel')}</span></label>`;
    return `<section class="share panel" id="share">
      <h2>${tr('sharingTitle')}</h2>
      <p>${tr('sharingBody')}</p>
      ${consent}
      ${flash()}
      ${withdraw ? `<div class="btn-row">${withdraw}</div>` : ''}
    </section>`;
  }
  return `<section class="share panel" id="share">
    <h2>${tr('shareTitle')}</h2>
    <p>${tr('codeOnlyBody')}</p>
    ${flash()}
    <div class="code-box">
      <button type="button" class="btn btn-quiet" data-act="copy-code">${tr('copyCode')}</button>
      ${state.ui.code ? `<label class="sr-only" for="f-code">${tr('copyCode')}</label><textarea id="f-code" class="code" readonly rows="3" dir="ltr">${esc(state.ui.code)}</textarea>` : ''}
    </div>
  </section>`;
}

async function doWithdraw() {
  const share = state.me.share;
  if (!share) return;
  state.ui.busy = true;
  render();
  try {
    await api('/api/withdraw', { method: 'POST', body: { id: share.id, token: share.token } });
    afterWithdraw();
  } catch (e) {
    if (e.code === 'not_found') afterWithdraw();
    else setFlashText('err', errText(e));
  } finally {
    state.ui.busy = false;
    state.ui.withdrawAsk = false;
    render();
  }
}

function afterWithdraw() {
  Object.assign(state.me, { share: null, consent: false, sentAt: {}, sync: null });
  saveMe();
  setFlash('ok', 'withdrawn');
}

async function doCopyCode() {
  const me = state.me;
  if (!me.name.trim()) return setFlash('err', 'needName'), render(), focusName();
  state.ui.code = encodeResultCode({ name: me.name.trim(), role: me.role.trim(), lang: L(), results: me.results, updatedAt: new Date().toISOString() });
  const ok = await copyText(state.ui.code);
  setFlash(ok ? 'ok' : 'err', ok ? 'copied' : 'copyFallback');
  render();
  if (!ok) {
    const ta = document.getElementById('f-code');
    ta?.focus();
    ta?.select();
  }
}

function focusName() {
  if (!document.getElementById('f-name')) {
    go('');
    setTimeout(() => document.getElementById('f-name')?.focus(), 50);
  }
}

// ---------- About ----------
function viewAbout() {
  const ar = L() === 'ar';
  const sections = ar
    ? [
        ['ما الغرض من هذا الموقع؟', 'أن يفهم كل فرد طريقة عمله، وأن يعرف قائد الفريق كيف يتواصل مع كل شخص ويحفّزه ويدعم تطوره. النتائج بداية حوار، لا حكم نهائي.'],
        ['أسلوب العمل (DISC)', 'مبني على نموذج وليام مارستون (1928) الذي يصف السلوك في أربعة أساليب: الحسم، والتأثير، والثبات، والدقة. الأسئلة من تأليف هذا الموقع. DISC شائع جداً في بيئات العمل ومفيد كلغة مشتركة، لكن أدلته البحثية على التنبؤ بالأداء محدودة.'],
        ['الأنماط الستة عشر', 'مستوحاة من أنماط كارل يونغ: من أين تستمد طاقتك، وكيف تجمع المعلومات، وكيف تقرر، وكيف تنظم عملك. تجتمع التفضيلات الأربعة في نمط من 16 نمطاً، لكل منها وصف ونقاط قوة وأفكار للتطور. الأسئلة وأسماء الأنماط وأوصافها كلها من تأليف هذا الموقع، وهو ليس اختبار MBTI® ولا 16Personalities. الناس لا ينقسمون إلى أنواع منفصلة؛ من يقع قرب المنتصف قد يتغير حرفه عند إعادة الاختبار، لذلك اقرأ النسب.'],
        ['العوامل الخمسة الكبرى (Big Five)', 'النموذج الأقوى علمياً في أبحاث الشخصية. نستخدم مقياس Mini-IPIP المكوّن من 20 عبارة (Donnellan وزملاؤه، 2006)، وعباراته من المصدر العام IPIP (ipip.ori.org). الترجمة العربية من هذا الموقع ولم تُختبر علمياً كنسخة عربية. «الاتزان الانفعالي» سمة طبيعية في الشخصية، وليس تشخيصاً لأي حالة.'],
        ['ما الذي يُرسل لقائد الفريق؟', 'بعد موافقتك، تُرسل نتيجة كل اختبار تلقائياً عند إنهائه: اسمك، ودورك إن كتبته، ودرجاتك، وتاريخ كل اختبار. إجاباتك نفسها تبقى على جهازك وتُحذف بعد حساب النتيجة. يمكنك سحب نتائجك في أي وقت من صفحة «ملفّي».'],
        ['ما الذي يضيفه قائد الفريق؟', 'يستطيع قائد الفريق أن يضيف لكل عضو خطة تطوير وملاحظات جلسات فردية ومعلومات عمل، وأن يصدّر ملفاً لكل عضو. هذه الإضافات خاصة بالقائد.'],
        ['كيف لا تُستخدم هذه النتائج؟', 'لا تُستخدم في التوظيف، ولا في تقييم الأداء، ولا في الترقيات أو الإجراءات التأديبية. هي وصف ذاتي لميول عامة، والسياق والخبرة يغيّران السلوك كثيراً.'],
      ]
    : [
        ['What is this site for?', 'To help each person understand how they work, and to help the team lead know how to communicate with, motivate and develop each person. Results start a conversation; they are not a verdict.'],
        ['Work style (DISC)', "Based on William Marston's 1928 model, which describes behaviour in four styles: Dominance, Influence, Steadiness and Conscientiousness. The questions are written for this site. DISC is popular at work and useful as a shared language, but research support for it predicting performance is limited."],
        ['16 Types', "Inspired by Carl Jung's types: where you get energy, how you take in information, how you decide and how you organise work. The four preferences combine into one of 16 types, each with a portrait, strengths and growth ideas. The questions, type names and descriptions are all written for this site; it is not the MBTI® or 16Personalities. People don't split into separate kinds: someone near the middle may get a different letter on a retake, so read the percentages."],
        ['Big Five', "The best-supported model in personality research. We use the 20-item Mini-IPIP (Donnellan et al., 2006), whose items come from the public-domain IPIP (ipip.ori.org). The Arabic translation is this site's own and has not been validated as an Arabic version. Emotional stability is a normal personality trait, not a diagnosis of anything."],
        ['What is sent to the team lead?', 'Once you agree, each result is sent automatically when you finish: your name, your role if you entered one, your scores and the date of each assessment. Your individual answers stay on your device and are deleted once your result is calculated. You can withdraw your results at any time from My profile.'],
        ['What does the team lead add?', 'The team lead can add a development plan, 1:1 notes and work details for each member, and export a folder per member. These additions are private to the lead.'],
        ['How these results must not be used', 'Not for hiring, performance ratings, promotions or disciplinary decisions. They are a self-description of general tendencies, and context and experience change behaviour a great deal.'],
      ];
  return `<header class="page-head"><h1>${tr('aboutTitle')}</h1></header>
    <div class="prose">${sections.map(([h, p]) => `<section><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}</div>`;
}

// ---------- Lead: data ----------
const importedMembers = () => state.lead.imports.map((m) => ({ ...m, source: m.source === 'demo' ? 'demo' : 'import' }));
const findMember = (id) => state.lead.members.find((x) => x.id === id);

async function loadLead() {
  const lead = state.lead;
  lead.error = '';
  const localMembers = importedMembers();
  if (leadMode() !== 'local' && leadMode() !== 'signed-in') return; // locked or signed out: load nothing
  if (leadMode() === 'local') {
    lead.members = localMembers;
    lead.records = { ...lead.localRecords };
    lead.loaded = true;
    render();
    return;
  }
  lead.loading = true;
  render();
  try {
    const [m, r] = await Promise.all([api('/api/admin/members', { passcode: lead.pass }), api('/api/admin/records', { passcode: lead.pass })]);
    lead.members = [...(m.members || []).map((x) => ({ ...x, source: 'server' })), ...localMembers];
    lead.records = { ...lead.localRecords, ...(r.records || {}) };
    lead.loaded = true;
    // Refresh an open draft unless it has unsaved edits.
    if (state.ui.draftId && !saveTimer) state.ui.draftId = null;
  } catch (e) {
    if (e.status === 401) {
      lead.pass = '';
      session.remove(K.pass);
      lead.error = tr('wrongPass');
    } else if (e.code === 'admin_not_configured') lead.error = tr('adminNotConfigured');
    else lead.error = errText(e);
    lead.loaded = false;
  } finally {
    lead.loading = false;
    render();
  }
}

function selfDisc() {
  const id = state.lead.selfId;
  if (id === 'local') return state.me.results?.disc ? discProfile(state.me.results.disc).primary : null;
  const m = findMember(id);
  return m?.results?.disc ? discProfile(m.results.disc).primary : null;
}

// ---------- Lead: records (info, plan, notes) with autosave ----------
let saveTimer = null;
let saveSeq = 0;

function ensureDraft(id) {
  if (state.ui.draftId !== id) {
    state.ui.draftId = id;
    state.ui.draft = normalizeRecord(structuredClone(state.lead.records[id] || null));
    state.ui.saveState = null;
  }
  return state.ui.draft;
}

async function persistRecord(id, rec) {
  const m = findMember(id);
  if (m?.source === 'server') {
    const r = await api('/api/admin/records', { method: 'PUT', passcode: state.lead.pass, body: { id, record: rec } });
    return { where: 'server', at: r.updatedAt };
  }
  const at = new Date().toISOString();
  state.lead.localRecords[id] = { ...structuredClone(rec), updatedAt: at };
  local.set(K.records, state.lead.localRecords);
  return { where: 'local', at };
}

function setSaveState(s) {
  state.ui.saveState = s;
  const el = document.getElementById('save-state');
  if (el) {
    el.className = 'save-state ' + (s ? 'is-' + s.kind : '');
    el.textContent = saveStateText(s);
  }
}

function saveStateText(s) {
  if (!s) return '';
  if (s.kind === 'saving') return tr('saving');
  if (s.kind === 'saved') return tr('saved');
  if (s.kind === 'savedLocal') return tr('savedLocal');
  return tr('saveFailed', { msg: s.msg });
}

function scheduleSave(delay = 900) {
  clearTimeout(saveTimer);
  setSaveState({ kind: 'saving' });
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveDraft();
  }, delay);
}

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    return saveDraft();
  }
  return Promise.resolve();
}

async function saveDraft() {
  const id = state.ui.draftId;
  const draft = state.ui.draft;
  if (!id || !draft) return;
  const seq = ++saveSeq;
  const snapshot = structuredClone(draft);
  setSaveState({ kind: 'saving' });
  try {
    const res = await persistRecord(id, snapshot);
    state.lead.records[id] = { ...snapshot, updatedAt: res.at };
    if (seq === saveSeq && state.ui.draftId === id) setSaveState({ kind: res.where === 'server' ? 'saved' : 'savedLocal' });
  } catch (e) {
    if (seq === saveSeq && state.ui.draftId === id) setSaveState({ kind: 'err', msg: errText(e) });
  }
}

function setPath(obj, path, value) {
  const keys = path.split('.').map((k) => (/^\d+$/.test(k) ? Number(k) : k));
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    o = o?.[keys[i]];
    if (o == null) return;
  }
  o[keys[keys.length - 1]] = value;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ---------- Lead: access ----------
// The dashboard opens without a passcode only on a host with no API at all ('static'), where it shows
// nothing but this browser's own data. Wherever the API exists, it needs the passcode; if the API has no
// storage or can't be reached, it stays locked instead of falling back to local mode.
function leadMode() {
  const host = state.config?.host || 'unreachable';
  if (host === 'static') return 'local';
  if (host === 'setup' || host === 'unreachable') return 'locked';
  return state.lead.pass ? 'signed-in' : 'signed-out';
}

/** The login or locked screen, or '' when the dashboard may show. */
function leadGate() {
  const mode = leadMode();
  if (mode === 'locked') {
    const why = state.config?.host === 'setup' ? 'leadLockedSetup' : 'leadLockedOffline';
    return `<div class="login panel">
      <h1>${tr('leadTitle')}</h1>
      <p class="flash flash-err" role="alert">${tr(why)}</p>
      <button type="button" class="btn btn-quiet" data-act="reload">${tr('reload')}</button>
    </div>`;
  }
  if (mode === 'signed-out') {
    return `<div class="login panel">
      <h1>${tr('leadTitle')}</h1>
      <p>${tr('leadLoginBody')}</p>
      <form data-form="login" class="stack">
        <div class="field"><label for="f-pass">${tr('passcode')}</label><input id="f-pass" type="password" autocomplete="current-password" required></div>
        ${state.lead.error ? `<p class="flash flash-err" role="alert">${esc(state.lead.error)}</p>` : ''}
        <button class="btn btn-primary" type="submit">${tr('enter')}</button>
      </form>
    </div>`;
  }
  return '';
}

// ---------- Lead: dashboard ----------
function viewLead() {
  const gate = leadGate();
  if (gate) return gate;
  const lead = state.lead;
  const server = leadMode() === 'signed-in';
  if (lead.loading && !lead.loaded) return `<p class="muted" role="status">…</p>`;
  if (lead.error && !lead.loaded) return `<p class="flash flash-err" role="alert">${esc(lead.error)}</p>`;

  const members = [...lead.members].sort((a, b) => a.name.localeCompare(b.name, L()));
  const team = computeTeam(members);
  const live = server;
  const hasDemo = lead.imports.some((m) => m.source === 'demo');
  const table = members.length
    ? `<div class="table-tools"><label for="f-filter" class="sr-only">${tr('searchLabel')}</label><input id="f-filter" type="search" data-filter placeholder="${esc(tr('searchLabel'))}" autocomplete="off"></div>
      <div class="table-wrap"><table class="team-table">
        <thead><tr><th scope="col">${tr('colName')}</th><th scope="col">${tr('colDisc')}</th><th scope="col">${tr('colType')}</th><th scope="col">${tr('colBig5')}</th><th scope="col">${tr('colTests')}</th><th scope="col">${tr('colPlan')}</th><th scope="col">${tr('colUpdated')}</th></tr></thead>
        <tbody>${members.map(memberRow).join('')}</tbody>
      </table></div>`
    : `<div class="empty"><p>${tr('emptyTeam')}</p>${!live ? `<button type="button" class="btn btn-quiet" data-act="demo-load">${tr('demoLoad')}</button>` : ''}</div>`;
  const insights = team.counts.disc >= 3 || team.counts.type >= 3 || team.counts.big5 >= 3
    ? team.insights.length
      ? `<ul class="insights">${team.insights.map((i) => `<li>${esc(i.text[L()])} <span class="src">${esc(SRC_LABEL[i.src][L()])}</span></li>`).join('')}</ul>`
      : `<p class="muted">${tr('noInsights')}</p>`
    : `<p class="muted">${tr('needThree')}</p>`;

  const selfOptions = [`<option value="local" ${lead.selfId === 'local' ? 'selected' : ''}>${tr('selfLocal')}${state.me.results?.disc ? ` (${discProfile(state.me.results.disc).primary})` : ''}</option>`]
    .concat(members.filter((m) => m.results?.disc).map((m) => `<option value="${esc(m.id)}" ${lead.selfId === m.id ? 'selected' : ''}>${esc(m.name)} (${discProfile(m.results.disc).primary})</option>`))
    .join('');
  const base = location.origin + location.pathname;
  const link = base + (state.ui.linkCode.trim() ? `?team=${encodeURIComponent(state.ui.linkCode.trim())}` : '');

  return `
    <header class="page-head head-row">
      <div><h1>${tr('teamTitle')}</h1><p class="muted">${tr('membersCount', { n: members.length })}</p></div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-act="export-team" ${state.ui.exporting ? 'disabled' : ''}>${tr('exportAll')}</button>
        ${live ? `<button type="button" class="btn btn-quiet" data-act="lead-refresh">${tr('refresh')}</button>` : ''}
        <button type="button" class="btn btn-quiet" data-act="lead-import-toggle" aria-expanded="${state.ui.importOpen}">${tr('importCodes')}</button>
        ${!live && members.length ? `<button type="button" class="btn btn-ghost" data-act="${hasDemo ? 'demo-remove' : 'demo-load'}">${tr(hasDemo ? 'demoRemove' : 'demoLoad')}</button>` : ''}
        ${live ? `<button type="button" class="btn btn-ghost" data-act="lead-signout">${tr('signOut')}</button>` : ''}
      </div>
    </header>
    <p class="status-line ${live ? 'is-live' : 'is-local'}"><span class="status-dot" aria-hidden="true"></span>${tr(live ? 'statusServer' : 'statusLocal')}</p>
    <p class="reminder">${tr('leadReminder')}</p>
    ${flash()}
    ${state.ui.importOpen ? `<section class="panel import">
      <h2>${tr('importTitle')}</h2><p class="muted">${tr('importBody')}</p>
      <form data-form="import" class="stack"><label class="sr-only" for="f-import">${tr('importTitle')}</label><textarea id="f-import" class="code" rows="4" dir="ltr"></textarea>
      ${state.ui.importMsg ? `<p class="status" role="status">${esc(state.ui.importMsg)}</p>` : ''}
      <div class="btn-row"><button class="btn btn-primary" type="submit">${tr('importButton')}</button></div></form>
    </section>` : ''}
    <section class="members-section">
      <h2>${tr('membersTitle')}</h2>
      ${table}
    </section>
    <div class="dash">
      <div class="dash-main">
        <section class="overview panel">
          <h2>${tr('overview')}</h2>
          <div class="overview-grid">
            <div><h3>${tr('discMix')} <span class="num muted">${team.counts.disc}</span></h3>${discMix(team.discCounts, L()) || `<p class="muted">–</p>`}</div>
            <div><h3>${tr('groupMix')} <span class="num muted">${team.counts.type}</span></h3>${team.counts.type ? groupMix(team.groupCounts, L()) + typeMix(team.typeSplit, L()) : `<p class="muted">–</p>`}</div>
            <div><h3>${tr('big5Avg')} <span class="num muted">${team.counts.big5}</span></h3>${big5Avg(team.big5Avg, L()) || `<p class="muted">–</p>`}</div>
          </div>
          <h3 class="insights-title">${tr('insights')}</h3>
          ${insights}
        </section>
      </div>
      <aside class="dash-side">
        <section class="panel">
          <h2 class="h-small"><label for="f-self">${tr('selfLabel')}</label></h2>
          <select id="f-self" data-self>${selfOptions}</select>
          <p class="help">${tr('selfHint')}</p>
        </section>
        <section class="panel">
          <h2 class="h-small">${tr('shareLinkTitle')}</h2>
          <p class="help">${tr('shareLinkBody')}</p>
          <div class="field"><label for="f-linkcode">${tr('teamCodeLabel')}</label><input id="f-linkcode" data-bind="linkCode" value="${esc(state.ui.linkCode)}" autocomplete="off" dir="ltr"></div>
          <p class="link-out" dir="ltr" id="link-out">${esc(link)}</p>
          <button type="button" class="btn btn-quiet" data-act="copy-link">${tr('copyLink')}</button>
          ${state.ui.linkMsg ? `<p class="status" role="status">${esc(state.ui.linkMsg)}</p>` : ''}
        </section>
      </aside>
    </div>`;
}

function sourceTag(m) {
  if (m.source === 'demo') return `<span class="tag tag-demo">${tr('demoTag')}</span>`;
  if (m.source === 'import') return `<span class="tag">${tr('imported')}</span>`;
  return '';
}

function memberRow(m) {
  const s = summaryOf(m.results || {}, L());
  const rec = normalizeRecord(state.lead.records[m.id]);
  const st = planStats(rec);
  const tests = ASSESSMENTS.filter((a) => m.results?.[a.id]).length;
  const disc = s.disc ? `<b class="chip chip-${s.disc.primary.toLowerCase()}">${s.disc.primary}</b>${s.disc.secondary ? `<b class="chip chip-${s.disc.secondary.toLowerCase()} chip-soft">${s.disc.secondary}</b>` : ''}` : '<span class="muted">–</span>';
  const type = s.type ? `<span class="type-chip">${s.type.code}</span><span class="cell-sub cell-block">${esc(s.type.name)}</span>` : '<span class="muted">–</span>';
  let big5 = '<span class="muted">–</span>';
  if (s.big5) {
    const hi = TRAITS.filter((k) => s.big5[k].level === 'high').map((k) => TRAIT[k].name[L()]);
    const lo = TRAITS.filter((k) => s.big5[k].level === 'low').map((k) => TRAIT[k].name[L()]);
    big5 = [hi.length ? `<span class="cell-sub">${tr('highTraits')} ${esc(hi.join('، '))}</span>` : '', lo.length ? `<span class="cell-sub">${tr('lowTraits')} ${esc(lo.join('، '))}</span>` : ''].filter(Boolean).join('<br>') || '<span class="muted">–</span>';
  }
  const plan = st.total
    ? `<span class="cell-sub">${esc(tr('planSummary', { open: st.open, done: st.done }))}</span>${st.review ? `<br><span class="cell-sub muted">${esc(tr('planReviewOn', { date: fmtDate(st.review, L()) }))}</span>` : ''}`
    : `<span class="muted cell-sub">${tr('noPlan')}</span>`;
  const sub = [m.role, rec.info.team].filter(Boolean).join(' · ');
  return `<tr data-name="${esc(m.name.toLowerCase())}">
    <td><a class="row-link" href="#lead-m-${encodeURIComponent(m.id)}"><span class="row-rose">${rose(m.results?.disc || null, { size: 40, title: m.name })}</span><span class="row-name"><b>${esc(m.name)}</b>${sub ? `<span class="cell-sub">${esc(sub)}</span>` : ''}</span></a>${sourceTag(m)}</td>
    <td class="nowrap">${disc}</td>
    <td class="type-cell">${type}</td>
    <td class="b5-cell">${big5}</td>
    <td class="num nowrap">${tests}/3</td>
    <td class="plan-cell">${plan}</td>
    <td class="nowrap cell-sub">${esc(fmtDate(m.updatedAt, L()))}</td>
  </tr>`;
}

// ---------- Lead: member ----------
const TABS = ['overview', 'work', 'plan', 'notes'];
const TAB_LABEL = { overview: 'tabOverview', work: 'tabWork', plan: 'tabPlan', notes: 'tabNotes' };

function viewMember() {
  const gate = leadGate();
  if (gate) return gate;
  const lead = state.lead;
  if (lead.loading && !lead.loaded) return `<p class="muted" role="status">…</p>`;
  const m = findMember(state.route.arg);
  if (!m) return `<a class="back" href="#lead">${tr('allTeam')}</a><div class="empty"><p>${tr('notFound')}</p></div>`;
  const s = summaryOf(m.results || {}, L());
  const rec = ensureDraft(m.id);
  const tab = TABS.includes(state.ui.tab) ? state.ui.tab : 'overview';
  const tabs = TABS.map((k) => `<button type="button" role="tab" id="tab-${k}" aria-selected="${k === tab}" aria-controls="panel-${k}" tabindex="${k === tab ? 0 : -1}" class="tab ${k === tab ? 'is-on' : ''}" data-act="tab" data-tab="${k}">${tr(TAB_LABEL[k])}</button>`).join('');
  const panel = tab === 'work' ? tabWork(m) : tab === 'plan' ? tabPlan(m, rec) : tab === 'notes' ? tabNotes(m, rec) : tabOverview(m);
  const remove = state.ui.removeAsk
    ? `<div class="confirm" role="group"><p>${tr('removeConfirm')}</p><button type="button" class="btn btn-danger" data-act="remove-yes">${tr('removeYes')}</button><button type="button" class="btn btn-ghost" data-act="remove-no">${tr('cancel')}</button></div>`
    : `<button type="button" class="btn btn-ghost" data-act="remove-ask">${tr('removeMember')}</button>`;
  const sub = [m.role, rec.info.team].filter(Boolean).join(' · ');
  return `
    <a class="back" href="#lead">${tr('allTeam')}</a>
    <header class="member-head">
      <span class="member-head-rose">${rose(m.results?.disc || null, { size: 132, labels: true, title: m.name })}</span>
      <div class="member-head-main">
        <h1>${esc(m.name)}</h1>
        ${sub ? `<p class="member-role">${esc(sub)}</p>` : ''}
        <p class="member-tags">${s.disc ? `<b class="chip chip-${s.disc.primary.toLowerCase()}">${s.disc.primary}</b> ${esc(DISC[s.disc.primary].tagline[L()])}` : ''}${s.type ? ` <span class="type-chip">${s.type.code}</span> ${esc(s.type.name)}` : ''}</p>
        <p class="muted">${tr('updatedAt', { date: fmtDate(m.updatedAt, L()) })} ${sourceTag(m)}</p>
      </div>
      <div class="member-head-actions"><button type="button" class="btn btn-primary" data-act="export-member" ${state.ui.exporting ? 'disabled' : ''}>${tr('exportFolder')}</button></div>
    </header>
    ${flash()}
    <div class="tabs" role="tablist" aria-label="${esc(m.name)}">${tabs}</div>
    <div class="tab-panel" role="tabpanel" id="panel-${tab}" aria-labelledby="tab-${tab}">${panel}</div>
    <div class="danger-zone">${remove}</div>`;
}

function tabOverview(m) {
  return `<div class="results-grid">${ASSESSMENTS.map((a) => `<section class="result result-compact">
      <div class="result-head"><h3>${esc(a.name[L()])}</h3>${m.completedAt?.[a.id] ? `<span class="muted">${esc(fmtDate(m.completedAt[a.id], L()))}</span>` : ''}</div>
      ${m.results?.[a.id] ? resultBlock(a.id, m.results[a.id], L(), { big: false, audience: 'lead' }) : `<p class="muted">${tr('notShared')}</p>`}
    </section>`).join('')}</div>`;
}

function tabWork(m) {
  const dp = m.results?.disc ? discProfile(m.results.disc) : null;
  const mine = selfDisc();
  const pair = dp && mine ? pairFor(mine, dp.primary) : null;
  const pairHtml = dp
    ? pair
      ? `<section class="panel pair-panel">
          <h2>${tr('pairTitle', { name: esc(m.name) })}</h2>
          <p class="pair-styles"><span>${tr('pairYou')}: <b class="chip chip-${mine.toLowerCase()}">${mine}</b> ${esc(DISC[mine].name[L()])}</span><span>${tr('pairThem', { name: esc(m.name) })}: <b class="chip chip-${dp.primary.toLowerCase()}">${dp.primary}</b> ${esc(DISC[dp.primary].name[L()])}</span></p>
          <dl class="pair-list">
            <dt>${tr('pairTogether')}</dt><dd>${esc(pair.together[L()])}</dd>
            <dt>${tr('pairFriction')}</dt><dd>${esc(pair.friction[L()])}</dd>
            <dt>${tr('pairTip')}</dt><dd>${esc(pair.tip[L()])}</dd>
          </dl>
        </section>`
      : `<section class="panel pair-panel"><h2>${tr('pairTitle', { name: esc(m.name) })}</h2><p class="muted">${tr('pairMissing')}</p></section>`
    : '';
  return `<div class="member-layout">
      <section class="guide">
        <h2>${tr('howToWork', { name: esc(m.name) })}</h2>
        ${guideHtml(m.results || {}, L())}
      </section>
      ${pairHtml}
    </div>`;
}

function saveIndicator() {
  const s = state.ui.saveState;
  return `<span id="save-state" class="save-state ${s ? 'is-' + s.kind : ''}" role="status" aria-live="polite">${esc(saveStateText(s))}</span>`;
}

function tabPlan(m, rec) {
  const s = suggestions(m.results || {});
  const p = rec.plan;
  const statusOpts = (cur) => ['todo', 'doing', 'done'].map((k) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${tr('status_' + k)}</option>`).join('');
  const goals = p.goals.length
    ? `<ol class="goal-list">${p.goals.map((g, i) => `<li class="goal goal-${g.status}">
        <div class="field"><label for="g-${g.id}-text">${tr('goalText')} ${i + 1}</label><textarea id="g-${g.id}-text" rows="2" data-rec="plan.goals.${i}.text" maxlength="600">${esc(g.text)}</textarea></div>
        <div class="field"><label for="g-${g.id}-measure">${tr('goalMeasure')}</label><input id="g-${g.id}-measure" data-rec="plan.goals.${i}.measure" maxlength="400" value="${esc(g.measure || '')}"></div>
        <div class="goal-row">
          <div class="field"><label for="g-${g.id}-due">${tr('goalDue')}</label><input id="g-${g.id}-due" type="date" data-rec="plan.goals.${i}.due" value="${esc(g.due || '')}"></div>
          <div class="field"><label for="g-${g.id}-status">${tr('goalStatus')}</label><select id="g-${g.id}-status" data-rec="plan.goals.${i}.status">${statusOpts(g.status)}</select></div>
          <button type="button" class="btn btn-ghost btn-small" data-act="goal-remove" data-i="${i}">${tr('removeGoal')}</button>
        </div>
      </li>`).join('')}</ol>`
    : `<p class="muted">${tr('noGoals')}</p>`;
  const sugList = (items) => (items.length ? `<ul class="plain-list">${items.map((x) => `<li>${esc(x[L()])}</li>`).join('')}</ul>` : '<p class="muted">–</p>');
  const sugGoals = s.goals.length
    ? `<ul class="sug-goals">${s.goals.map((x, i) => {
        const added = p.goals.some((g) => g.text === x[L()]);
        return `<li><span>${esc(x[L()])}</span><button type="button" class="btn btn-quiet btn-small" data-act="goal-suggest" data-i="${i}" ${added ? 'disabled' : ''}>${added ? '✓' : '+ ' + tr('addAsGoal')}</button></li>`;
      }).join('')}</ul>`
    : '<p class="muted">–</p>';
  return `<div class="plan-layout">
    <section class="panel plan-editor" aria-labelledby="plan-title">
      <div class="head-row"><h2 id="plan-title">${tr('planTitle')}</h2>${saveIndicator()}</div>
      <p class="help">${tr('privateNote')}</p>
      <div class="field"><label for="p-focus">${tr('planFocus')}</label><textarea id="p-focus" rows="2" data-rec="plan.focus" maxlength="2000">${esc(p.focus)}</textarea><p class="help">${tr('planFocusHelp')}</p></div>
      <h3>${tr('planGoals')}</h3>
      ${goals}
      <p><button type="button" class="btn btn-quiet" data-act="goal-add">+ ${tr('addGoal')}</button></p>
      <div class="field"><label for="p-support">${tr('planSupport')}</label><textarea id="p-support" rows="2" data-rec="plan.support" maxlength="2000">${esc(p.support)}</textarea></div>
      <div class="field field-narrow"><label for="p-review">${tr('planReview')}</label><input id="p-review" type="date" data-rec="plan.review" value="${esc(p.review)}"></div>
    </section>
    <aside class="panel suggestions" aria-labelledby="sug-title">
      <h2 id="sug-title">${tr('suggestionsTitle')}</h2>
      <p class="help">${tr('suggestionsBody')}</p>
      <h3>${tr('sugGoals')}</h3>${sugGoals}
      <h3>${tr('sugStrengths')}</h3>${sugList(s.strengths)}
      <h3>${tr('sugGrowth')}</h3>${sugList(s.growth)}
      <h3>${tr('sugSupport')}</h3>${sugList(s.support)}
      <h3>${tr('sugQuestions')}</h3>${sugList(s.questions)}
    </aside>
  </div>`;
}

function tabNotes(m, rec) {
  const i = rec.info;
  const notes = rec.notes.length
    ? `<ul class="note-list">${rec.notes
        .map((n, idx) => ({ n, idx }))
        .sort((a, b) => b.n.date.localeCompare(a.n.date))
        .map(({ n, idx }) => `<li class="note-item"><div class="note-top"><p class="note-date">${esc(fmtDate(n.date, L()))}</p><button type="button" class="btn btn-link btn-small" data-act="note-delete" data-i="${idx}">${tr('deleteNote')}</button></div><p class="pre">${esc(n.text)}</p></li>`)
        .join('')}</ul>`
    : `<p class="muted">${tr('noNotes')}</p>`;
  return `<div class="notes-layout">
    <section class="panel" aria-labelledby="info-title">
      <div class="head-row"><h2 id="info-title">${tr('infoTitle')}</h2>${saveIndicator()}</div>
      <p class="help">${tr('privateNote')}</p>
      <div class="field"><label for="i-team">${tr('infoTeam')}</label><input id="i-team" data-rec="info.team" maxlength="80" value="${esc(i.team)}"></div>
      <div class="field"><label for="i-email">${tr('infoEmail')}</label><input id="i-email" type="email" dir="ltr" data-rec="info.email" maxlength="120" value="${esc(i.email)}"></div>
      <div class="field"><label for="i-phone">${tr('infoPhone')}</label><input id="i-phone" type="tel" dir="ltr" data-rec="info.phone" maxlength="40" value="${esc(i.phone)}"></div>
      <div class="field field-narrow"><label for="i-start">${tr('infoStart')}</label><input id="i-start" type="date" data-rec="info.startDate" value="${esc(i.startDate)}"></div>
      <div class="field"><label for="i-about">${tr('infoAbout')}</label><textarea id="i-about" rows="3" data-rec="info.about" maxlength="2000">${esc(i.about)}</textarea></div>
    </section>
    <section class="panel" aria-labelledby="notes-title">
      <h2 id="notes-title">${tr('notesTitle')}</h2>
      <form data-form="note" class="stack note-form">
        <div class="field field-narrow"><label for="n-date">${tr('noteDate')}</label><input id="n-date" type="date" value="${today()}" required></div>
        <div class="field"><label for="n-text">${tr('noteText')}</label><textarea id="n-text" rows="3" maxlength="3000" required></textarea></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">${tr('addNote')}</button></div>
      </form>
      ${notes}
    </section>
  </div>`;
}

async function removeMember() {
  const lead = state.lead;
  const m = findMember(state.route.arg);
  if (!m) return;
  if (m.source === 'server') {
    try {
      await api('/api/admin/members?id=' + encodeURIComponent(m.id), { method: 'DELETE', passcode: lead.pass });
    } catch (e) {
      setFlashText('err', errText(e));
      state.ui.removeAsk = false;
      return render();
    }
  } else {
    lead.imports = lead.imports.filter((x) => x.id !== m.id);
    local.set(K.imports, lead.imports);
    delete lead.localRecords[m.id];
    local.set(K.records, lead.localRecords);
  }
  clearTimeout(saveTimer);
  saveTimer = null;
  state.ui.draftId = null;
  delete lead.records[m.id];
  lead.members = lead.members.filter((x) => x.id !== m.id);
  state.ui.nextFlash = { kind: 'ok', text: tr('removed') };
  go('lead');
}

function importCodes(text) {
  let ok = 0;
  let bad = 0;
  for (const line of text.split(/\s+/).filter(Boolean)) {
    const d = decodeResultCode(line);
    if (!d) {
      bad += 1;
      continue;
    }
    ok += 1;
    const id = 'imp-' + randomId(8);
    // Replace an earlier import of the same person (same name).
    state.lead.imports = state.lead.imports.filter((x) => x.name !== d.name || x.source === 'demo');
    state.lead.imports.push({ id, name: d.name, role: d.role, lang: d.lang, results: d.results, updatedAt: d.updatedAt });
  }
  local.set(K.imports, state.lead.imports);
  refreshLocalMembers();
  state.ui.importMsg = tr('importResult', { ok, bad });
  render();
}

function refreshLocalMembers() {
  const lead = state.lead;
  lead.members = [...lead.members.filter((m) => m.source === 'server'), ...importedMembers()];
  lead.records = { ...lead.localRecords, ...Object.fromEntries(Object.entries(lead.records).filter(([id]) => findMember(id)?.source === 'server')) };
}

function loadDemo() {
  const lead = state.lead;
  lead.imports = [...lead.imports.filter((m) => m.source !== 'demo'), ...structuredClone(DEMO_MEMBERS)];
  local.set(K.imports, lead.imports);
  lead.localRecords = { ...structuredClone(DEMO_RECORDS), ...lead.localRecords };
  local.set(K.records, lead.localRecords);
  refreshLocalMembers();
  setFlash('ok', 'demoLoaded');
  render();
}

function removeDemo() {
  const lead = state.lead;
  const ids = new Set(lead.imports.filter((m) => m.source === 'demo').map((m) => m.id));
  lead.imports = lead.imports.filter((m) => m.source !== 'demo');
  local.set(K.imports, lead.imports);
  for (const id of ids) delete lead.localRecords[id];
  local.set(K.records, lead.localRecords);
  refreshLocalMembers();
  state.ui.flash = null;
  render();
}

// ---------- Export ----------
async function doExport(kind) {
  if (state.ui.exporting) return;
  const lead = state.lead;
  const m = kind === 'member' ? findMember(state.route.arg) : null;
  if (kind === 'team' && !lead.members.length) {
    setFlash('err', 'exportNone');
    return render();
  }
  state.ui.exporting = true;
  setFlash('info', 'exporting');
  render();
  try {
    await flushSave();
    const mod = await import('./export.js');
    const out = kind === 'team' ? await mod.exportTeam(lead.members, lead.records, L()) : await mod.exportMember(m, lead.records[m.id], L());
    const res = await saveFile(out.filename, out.bytes, 'application/zip');
    if (res === 'declined') setFlash('info', 'exportDeclined');
    else setFlash('ok', 'exportDone', { name: out.filename });
  } catch (e) {
    setFlash('err', 'exportFail', { msg: e?.message || String(e) });
  } finally {
    state.ui.exporting = false;
    render();
  }
}

// ---------- Events ----------
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  switch (act) {
    case 'lang':
      state.lang = L() === 'ar' ? 'en' : 'ar';
      local.set(K.lang, state.lang);
      if (state.ui.flash) state.ui.flash = null;
      render();
      document.getElementById('lang-btn')?.focus();
      break;
    case 'theme':
      state.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
      local.set(K.theme, state.theme);
      render();
      document.getElementById('theme-btn')?.focus();
      break;
    case 'start': {
      const id = el.dataset.id;
      const problem = startProblem();
      if (problem) {
        setFlash('err', problem[0]);
        if (state.route.name !== 'home') {
          state.ui.nextFlash = state.ui.flash;
          go('');
        } else render();
        setTimeout(() => document.getElementById(problem[1])?.focus(), 30);
        break;
      }
      if (el.dataset.mode === 'retake') {
        state.me.answers[id] = {};
        saveMe();
      }
      go('test-' + id);
      break;
    }
    case 'answer':
      answer(Number(el.dataset.v));
      break;
    case 'prev':
      if (state.q > 0) {
        clearTimeout(advanceTimer);
        state.q -= 1;
        render();
      }
      break;
    case 'sync-now':
      syncResults();
      break;
    case 'withdraw-ask':
      state.ui.withdrawAsk = true;
      render();
      break;
    case 'withdraw-no':
      state.ui.withdrawAsk = false;
      render();
      break;
    case 'withdraw-yes':
      doWithdraw();
      break;
    case 'copy-code':
      doCopyCode();
      break;
    case 'reload':
      location.reload();
      break;
    case 'lead-refresh':
      await flushSave();
      state.lead.loaded = false;
      loadLead();
      break;
    case 'lead-signout':
      await flushSave();
      state.lead.pass = '';
      state.lead.loaded = false;
      state.lead.members = [];
      state.lead.records = {};
      state.ui.draftId = null;
      session.remove(K.pass);
      render();
      break;
    case 'lead-import-toggle':
      state.ui.importOpen = !state.ui.importOpen;
      state.ui.importMsg = '';
      render();
      if (state.ui.importOpen) document.getElementById('f-import')?.focus();
      break;
    case 'demo-load':
      loadDemo();
      break;
    case 'demo-remove':
      removeDemo();
      break;
    case 'export-team':
      doExport('team');
      break;
    case 'export-member':
      doExport('member');
      break;
    case 'copy-link': {
      const text = document.getElementById('link-out')?.textContent || '';
      const ok = await copyText(text);
      state.ui.linkMsg = ok ? tr('linkCopied') : tr('copyFallback');
      render();
      break;
    }
    case 'tab':
      await flushSave();
      state.ui.tab = el.dataset.tab;
      state.ui.flash = null;
      render();
      document.getElementById('tab-' + state.ui.tab)?.focus();
      break;
    case 'goal-add': {
      const d = state.ui.draft;
      if (!d || d.plan.goals.length >= 40) break;
      const id = 'g' + randomId(6);
      d.plan.goals.push({ id, text: '', measure: '', due: '', status: 'todo' });
      render();
      document.getElementById(`g-${id}-text`)?.focus();
      scheduleSave(0);
      break;
    }
    case 'goal-suggest': {
      const d = state.ui.draft;
      const m = findMember(state.route.arg);
      const s = m ? suggestions(m.results || {}).goals[Number(el.dataset.i)] : null;
      if (!d || !s || d.plan.goals.length >= 40) break;
      d.plan.goals.push({ id: 'g' + randomId(6), text: s[L()], measure: '', due: '', status: 'todo' });
      render();
      scheduleSave(0);
      break;
    }
    case 'goal-remove': {
      const d = state.ui.draft;
      if (!d) break;
      d.plan.goals.splice(Number(el.dataset.i), 1);
      render();
      scheduleSave(0);
      break;
    }
    case 'note-delete': {
      const d = state.ui.draft;
      if (!d) break;
      d.notes.splice(Number(el.dataset.i), 1);
      render();
      scheduleSave(0);
      break;
    }
    case 'remove-ask':
      state.ui.removeAsk = true;
      render();
      break;
    case 'remove-no':
      state.ui.removeAsk = false;
      render();
      break;
    case 'remove-yes':
      removeMember();
      break;
  }
});

function onRecField(el) {
  const d = state.ui.draft;
  if (!d) return;
  setPath(d, el.dataset.rec, el.value);
  if (el.tagName === 'SELECT' && el.dataset.rec.endsWith('.status')) el.closest('.goal')?.setAttribute('class', `goal goal-${el.value}`);
  scheduleSave();
}

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset?.rec) return onRecField(el);
  if (el.hasAttribute?.('data-filter')) {
    const q = el.value.trim().toLowerCase();
    for (const row of root.querySelectorAll('.team-table tbody tr')) row.hidden = !!q && !row.dataset.name.includes(q);
    return;
  }
  const bind = el.dataset?.bind;
  if (bind === 'name' || bind === 'role') {
    state.me[bind] = el.value.slice(0, 60);
    saveMe();
  } else if (bind === 'teamCode') {
    state.teamCode = el.value.trim();
    local.set(K.team, state.teamCode);
  } else if (bind === 'linkCode') {
    state.ui.linkCode = el.value;
    const out = document.getElementById('link-out');
    if (out) out.textContent = location.origin + location.pathname + (el.value.trim() ? `?team=${encodeURIComponent(el.value.trim())}` : '');
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset?.rec) return onRecField(el);
  const bind = el.dataset?.bind;
  if (bind === 'consent') {
    state.me.consent = el.checked;
    state.ui.flash = null;
    saveMe();
    if (el.checked && Object.keys(state.me.results).length) syncResults();
    else render();
  } else if ((bind === 'name' || bind === 'role') && state.me.share && state.me.consent) {
    // Keep the lead's copy in step with a changed name or role.
    syncResults();
  } else if (el.hasAttribute?.('data-self')) {
    state.lead.selfId = el.value;
    local.set(K.self, el.value);
  }
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  if (form.dataset.form === 'login') {
    const pass = document.getElementById('f-pass')?.value || '';
    if (!pass) return;
    state.lead.pass = pass;
    session.set(K.pass, pass);
    state.lead.loaded = false;
    loadLead();
  } else if (form.dataset.form === 'import') {
    importCodes(document.getElementById('f-import')?.value || '');
  } else if (form.dataset.form === 'note') {
    const d = state.ui.draft;
    const text = (document.getElementById('n-text')?.value || '').trim();
    if (!d || !text || d.notes.length >= 150) return;
    const date = document.getElementById('n-date')?.value || today();
    d.notes.push({ id: 'n' + randomId(6), date, text });
    render();
    document.getElementById('n-text')?.focus();
    scheduleSave(0);
  }
});

document.addEventListener('keydown', (e) => {
  // Arrow keys move between tabs.
  if (e.target.matches?.('[role="tab"]') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    const i = TABS.indexOf(state.ui.tab);
    const forward = (e.key === 'ArrowLeft') === (L() === 'ar');
    const next = TABS[(i + (forward ? 1 : TABS.length - 1)) % TABS.length];
    e.preventDefault();
    flushSave();
    state.ui.tab = next;
    render();
    document.getElementById('tab-' + next)?.focus();
    return;
  }
  if (state.route.name !== 'test' || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.matches?.('input, textarea, select')) return;
  if (/^[1-5]$/.test(e.key)) {
    e.preventDefault();
    answer(Number(e.key));
  }
});

window.addEventListener('hashchange', onRoute);
window.addEventListener('beforeunload', () => {
  if (saveTimer) flushSave();
});

// ---------- Boot ----------
(async () => {
  applyTheme();
  state.config = await loadConfig();
  onRoute();
})();
