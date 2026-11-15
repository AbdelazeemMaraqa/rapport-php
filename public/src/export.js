// Builds the lead's exports: one folder per member (profile, development plan, notes, data) plus team files.
import { makeZip, safeName } from './zip.js';
import { ASSESSMENTS } from './assessments/index.js';
import { resultBlock, guideHtml, summaryOf } from './blocks.js';
import { suggestions, normalizeRecord, planStats } from './devplan.js';
import { computeTeam } from './team.js';
import { discMix, groupMix, typeMix, big5Avg } from './charts.js';
import { APP_NAME, t, fmtDate, SRC_LABEL } from './i18n.js';
import { esc } from './util.js';

let cssCache = null;
async function appCss() {
  if (cssCache !== null) return cssCache;
  try {
    const res = await fetch(new URL('../styles.css', import.meta.url));
    cssCache = res.ok ? await res.text() : '';
  } catch {
    cssCache = '';
  }
  return cssCache;
}

const DOC_CSS = `
body { background: #fff; }
.doc { max-width: 960px; margin: 0 auto; padding: 32px 22px 48px; }
.doc-kicker { color: var(--muted); font-size: .85rem; margin: 0 0 4px; }
.doc h1 { font-family: var(--font-display); font-size: 2rem; margin-bottom: 6px; }
.doc h2 { font-family: var(--font-display); font-size: 1.3rem; margin: 30px 0 12px; }
.doc-meta { display: flex; flex-wrap: wrap; gap: 6px 18px; color: var(--muted); margin: 6px 0 0; padding: 0; list-style: none; }
.doc-meta b { color: var(--ink); font-weight: 600; }
.doc .result { break-inside: avoid; }
.doc-table { inline-size: 100%; border-collapse: collapse; margin: 8px 0 4px; }
.doc-table th, .doc-table td { border-block-end: 1px solid var(--line); padding: 8px 10px; text-align: start; vertical-align: top; }
.doc-table th { color: var(--muted); font-weight: 600; font-size: .85rem; }
.pre { white-space: pre-wrap; }
.doc-foot { margin-top: 40px; color: var(--muted); font-size: .85rem; border-top: 1px solid var(--line); padding-top: 12px; }
@media print { .doc { padding: 0; } a { color: inherit; } }
`;

function page(lang, title, body, css) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return `<!doctype html>
<html lang="${lang}" dir="${dir}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Reem+Kufi:wght@500;600;700&display=swap">
<style>${css}${DOC_CSS}</style>
</head>
<body><main class="doc">${body}</main></body>
</html>`;
}

const today = () => new Date().toISOString().slice(0, 10);

function infoList(m, rec, lang) {
  const i = rec.info;
  const rows = [
    [t('roleLabel', lang).replace(/\s*\(.*\)$/, ''), m.role],
    [t('infoTeam', lang), i.team],
    [t('infoEmail', lang), i.email],
    [t('infoPhone', lang), i.phone],
    [t('infoStart', lang), i.startDate && fmtDate(i.startDate, lang)],
  ].filter(([, v]) => v);
  return rows.length ? `<ul class="doc-meta">${rows.map(([k, v]) => `<li>${esc(k)}: <b>${esc(v)}</b></li>`).join('')}</ul>` : '';
}

function profileHtml(m, rec, lang, css) {
  const done = ASSESSMENTS.filter((a) => m.results?.[a.id]);
  const dates = done.map((a) => `<li>${esc(a.name[lang])}: <b>${esc(fmtDate(m.completedAt?.[a.id] || m.updatedAt, lang))}</b></li>`).join('');
  const blocks = ASSESSMENTS.map((a) => `<section class="result">
      <div class="result-head"><h2>${esc(a.name[lang])}</h2></div>
      ${m.results?.[a.id] ? resultBlock(a.id, m.results[a.id], lang, { audience: 'lead' }) : `<p class="muted">${t('notShared', lang)}</p>`}
    </section>`).join('');
  const body = `
    <p class="doc-kicker">${esc(APP_NAME[lang])} · ${esc(t('tabOverview', lang))}</p>
    <h1>${esc(m.name)}</h1>
    ${infoList(m, rec, lang)}
    ${dates ? `<ul class="doc-meta">${dates}</ul>` : ''}
    ${blocks}
    <section class="guide">
      <h2>${esc(t('howToWork', lang, { name: m.name }))}</h2>
      ${guideHtml(m.results || {}, lang)}
    </section>
    <p class="doc-foot">${esc(t('leadReminder', lang))} · ${esc(fmtDate(today(), lang))}</p>`;
  return page(lang, `${m.name} · ${APP_NAME[lang]}`, body, css);
}

function bullets(items, lang) {
  return items.length ? `<ul class="plain-list">${items.map((x) => `<li>${esc(x[lang])}</li>`).join('')}</ul>` : '<p class="muted">–</p>';
}

function planHtml(m, rec, lang, css) {
  const p = rec.plan;
  const s = suggestions(m.results || {});
  const goals = p.goals.length
    ? `<table class="doc-table"><thead><tr><th>${t('goalText', lang)}</th><th>${t('goalMeasure', lang)}</th><th>${t('goalDue', lang)}</th><th>${t('goalStatus', lang)}</th></tr></thead><tbody>${p.goals
        .map((g) => `<tr><td class="pre">${esc(g.text)}</td><td class="pre">${esc(g.measure)}</td><td>${esc(g.due ? fmtDate(g.due, lang) : '')}</td><td>${esc(t('status_' + g.status, lang))}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muted">${t('noGoals', lang)}</p>`;
  const notes = rec.notes.length
    ? [...rec.notes].sort((a, b) => b.date.localeCompare(a.date)).map((n) => `<div class="note-item"><p class="note-date">${esc(fmtDate(n.date, lang))}</p><p class="pre">${esc(n.text)}</p></div>`).join('')
    : `<p class="muted">${t('noNotes', lang)}</p>`;
  const body = `
    <p class="doc-kicker">${esc(APP_NAME[lang])} · ${esc(t('tabPlan', lang))}</p>
    <h1>${esc(m.name)}</h1>
    ${infoList(m, rec, lang)}
    <ul class="doc-meta">${p.review ? `<li>${esc(t('planReview', lang))}: <b>${esc(fmtDate(p.review, lang))}</b></li>` : ''}${rec.updatedAt ? `<li>${esc(t('updatedAt', lang, { date: fmtDate(rec.updatedAt, lang) }))}</li>` : ''}</ul>
    <h2>${t('planFocus', lang)}</h2>
    ${p.focus ? `<p class="pre">${esc(p.focus)}</p>` : '<p class="muted">–</p>'}
    <h2>${t('planGoals', lang)}</h2>
    ${goals}
    <h2>${t('planSupport', lang)}</h2>
    ${p.support ? `<p class="pre">${esc(p.support)}</p>` : '<p class="muted">–</p>'}
    <h2>${t('suggestionsTitle', lang)}</h2>
    <p class="muted">${t('suggestionsBody', lang)}</p>
    <div class="guide-grid">
      <div class="guide-block"><h3>${t('sugStrengths', lang)}</h3>${bullets(s.strengths, lang)}</div>
      <div class="guide-block"><h3>${t('sugGrowth', lang)}</h3>${bullets(s.growth, lang)}</div>
      <div class="guide-block"><h3>${t('sugGoals', lang)}</h3>${bullets(s.goals, lang)}</div>
      <div class="guide-block"><h3>${t('sugSupport', lang)}</h3>${bullets(s.support, lang)}</div>
      <div class="guide-block"><h3>${t('sugQuestions', lang)}</h3>${bullets(s.questions, lang)}</div>
    </div>
    <h2>${t('notesTitle', lang)}</h2>
    ${notes}
    ${rec.info.about ? `<h2>${t('infoAbout', lang)}</h2><p class="pre">${esc(rec.info.about)}</p>` : ''}
    <p class="doc-foot">${esc(t('privateNote', lang))} · ${esc(fmtDate(today(), lang))}</p>`;
  return page(lang, `${t('tabPlan', lang)} · ${m.name}`, body, css);
}

function notesMd(m, rec, lang) {
  const i = rec.info;
  const p = rec.plan;
  const lines = [`# ${m.name}`, ''];
  const meta = [
    [t('roleLabel', lang).replace(/\s*\(.*\)$/, ''), m.role],
    [t('infoTeam', lang), i.team],
    [t('infoEmail', lang), i.email],
    [t('infoPhone', lang), i.phone],
    [t('infoStart', lang), i.startDate],
    [t('planReview', lang), p.review],
  ].filter(([, v]) => v);
  for (const [k, v] of meta) lines.push(`- **${k}:** ${v}`);
  lines.push('', `## ${t('planFocus', lang)}`, '', p.focus || '–', '', `## ${t('planGoals', lang)}`, '');
  if (!p.goals.length) lines.push('–');
  for (const g of p.goals) {
    lines.push(`- [${g.status === 'done' ? 'x' : ' '}] ${g.text}${g.due ? ` (${t('goalDue', lang)}: ${g.due})` : ''} · ${t('status_' + g.status, lang)}`);
    if (g.measure) lines.push(`  - ${t('goalMeasure', lang)}: ${g.measure}`);
  }
  lines.push('', `## ${t('planSupport', lang)}`, '', p.support || '–', '', `## ${t('notesTitle', lang)}`, '');
  if (!rec.notes.length) lines.push('–');
  for (const n of [...rec.notes].sort((a, b) => b.date.localeCompare(a.date))) lines.push(`### ${n.date}`, '', n.text, '');
  if (i.about) lines.push('', `## ${t('infoAbout', lang)}`, '', i.about);
  return lines.join('\n') + '\n';
}

function dataJson(m, rec, lang) {
  const sum = summaryOf(m.results || {}, lang);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: APP_NAME.en,
      member: {
        id: m.id,
        name: m.name,
        role: m.role || '',
        results: m.results || {},
        completedAt: m.completedAt || {},
        createdAt: m.createdAt || null,
        updatedAt: m.updatedAt || null,
        source: m.source || 'server',
      },
      summary: {
        disc: sum.disc ? { primary: sum.disc.primary, secondary: sum.disc.secondary, name: sum.disc.name } : null,
        type: sum.type ? { code: sum.type.code, name: sum.type.name, group: sum.type.group, letters: sum.type.dims.map((d) => ({ letter: d.letter, percent: Math.round(50 + d.clarity / 2) })) } : null,
        big5: sum.big5 || null,
      },
      leadRecord: rec,
    },
    null,
    2
  );
}

function memberFiles(folder, m, rec, lang, css) {
  return [
    { path: `${folder}/profile.html`, data: profileHtml(m, rec, lang, css) },
    { path: `${folder}/development-plan.html`, data: planHtml(m, rec, lang, css) },
    { path: `${folder}/notes.md`, data: notesMd(m, rec, lang) },
    { path: `${folder}/data.json`, data: dataJson(m, rec, lang) },
  ];
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function teamCsv(members, records, lang) {
  const head = ['name', 'role', 'team', 'email', 'start_date', 'disc_primary', 'disc_secondary', 'D', 'I', 'S', 'C', 'type_code', 'type_name', 'type_group', 'EI', 'SN', 'TF', 'JP', 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability', 'goals_open', 'goals_done', 'next_review', 'notes', 'updated'];
  const rows = members.map((m) => {
    const r = m.results || {};
    const rec = normalizeRecord(records[m.id]);
    const s = summaryOf(r, lang);
    const st = planStats(rec);
    return [
      m.name, m.role, rec.info.team, rec.info.email, rec.info.startDate,
      s.disc?.primary, s.disc?.secondary, r.disc?.D, r.disc?.I, r.disc?.S, r.disc?.C,
      s.type?.code, s.type?.name, s.type?.group, r.type?.EI, r.type?.SN, r.type?.TF, r.type?.JP,
      r.big5?.O, r.big5?.C, r.big5?.E, r.big5?.A, r.big5?.ES,
      st.open, st.done, st.review, st.notes, (m.updatedAt || '').slice(0, 10),
    ].map(csvCell).join(',');
  });
  return '﻿' + [head.join(','), ...rows].join('\r\n') + '\r\n';
}

function overviewHtml(members, records, lang, css) {
  const team = computeTeam(members);
  const rows = members
    .map((m, i) => {
      const s = summaryOf(m.results || {}, lang);
      const rec = normalizeRecord(records[m.id]);
      const st = planStats(rec);
      return `<tr><td>${i + 1}</td><td><b>${esc(m.name)}</b>${m.role ? `<br><span class="muted">${esc(m.role)}</span>` : ''}</td><td>${s.disc ? `<b class="chip chip-${s.disc.primary.toLowerCase()}">${s.disc.primary}</b>` : '–'}</td><td>${s.type ? `${s.type.code} · ${esc(s.type.name)}` : '–'}</td><td>${esc(rec.info.team || '')}</td><td>${st.total ? esc(t('planSummary', lang, { open: st.open, done: st.done })) : '–'}</td></tr>`;
    })
    .join('');
  const insights = team.insights.length ? `<ul class="insights">${team.insights.map((x) => `<li>${esc(x.text[lang])} <span class="src">${esc(SRC_LABEL[x.src][lang])}</span></li>`).join('')}</ul>` : '';
  const body = `
    <p class="doc-kicker">${esc(APP_NAME[lang])}</p>
    <h1>${esc(t('teamTitle', lang))}</h1>
    <ul class="doc-meta"><li>${esc(t('membersCount', lang, { n: members.length }))}</li><li>${esc(fmtDate(today(), lang))}</li></ul>
    <table class="doc-table"><thead><tr><th>#</th><th>${t('colName', lang)}</th><th>DISC</th><th>${t('colType', lang)}</th><th>${t('infoTeam', lang)}</th><th>${t('colPlan', lang)}</th></tr></thead><tbody>${rows}</tbody></table>
    <h2>${t('overview', lang)}</h2>
    <div class="overview-grid">
      <div><h3>${t('discMix', lang)}</h3>${discMix(team.discCounts, lang) || '–'}</div>
      <div><h3>${t('groupMix', lang)}</h3>${groupMix(team.groupCounts, lang) || '–'}${team.counts.type ? typeMix(team.typeSplit, lang) : ''}</div>
      <div><h3>${t('big5Avg', lang)}</h3>${big5Avg(team.big5Avg, lang) || '–'}</div>
    </div>
    ${insights ? `<h2>${t('insights', lang)}</h2>${insights}` : ''}
    <p class="doc-foot">${esc(t('leadReminder', lang))}</p>`;
  return page(lang, `${t('teamTitle', lang)} · ${APP_NAME[lang]}`, body, css);
}

function readme(lang) {
  return lang === 'ar'
    ? `${APP_NAME.ar} · ملفات الفريق\r\n\r\nلكل عضو مجلد فيه:\r\n- profile.html: نتائجه الكاملة وكيف تعمل معه (افتحه في المتصفح، ويمكن طباعته PDF)\r\n- development-plan.html: خطة التطوير والاقتراحات وملاحظات الجلسات الفردية\r\n- notes.md: الخطة والملاحظات كنص قابل للتعديل\r\n- data.json: كل البيانات بصيغة قابلة للمعالجة\r\n\r\nوفي المجلد الرئيسي:\r\n- team-overview.html: صورة الفريق\r\n- team.csv: جدول للفريق كله (يفتح في Excel)\r\n\r\nهذه بيانات شخصية: احفظها في مكان آمن، ولا تستخدمها في التقييم أو الترقيات.\r\n`
    : `${APP_NAME.en} · team files\r\n\r\nEach member has a folder with:\r\n- profile.html: full results and how to work with them (open in a browser; print to PDF if needed)\r\n- development-plan.html: development plan, suggestions and 1:1 notes\r\n- notes.md: the plan and notes as editable text\r\n- data.json: all the data in a machine-readable form\r\n\r\nIn the main folder:\r\n- team-overview.html: the team picture\r\n- team.csv: one table for the whole team (opens in Excel)\r\n\r\nThis is personal data: keep it somewhere safe, and don't use it for ratings or promotions.\r\n`;
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** All members: returns { filename, bytes }. */
export async function exportTeam(members, records, lang) {
  const css = await appCss();
  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name, lang));
  const root = `${APP_NAME.en}-team-${stamp()}`;
  const files = [
    { path: `${root}/README.txt`, data: readme(lang) },
    { path: `${root}/team-overview.html`, data: overviewHtml(sorted, records, lang, css) },
    { path: `${root}/team.csv`, data: teamCsv(sorted, records, lang) },
  ];
  sorted.forEach((m, i) => {
    const folder = `${root}/${String(i + 1).padStart(2, '0')} - ${safeName(m.name, 'member')}`;
    files.push(...memberFiles(folder, m, normalizeRecord(records[m.id]), lang, css));
  });
  return { filename: `${root}.zip`, bytes: makeZip(files) };
}

/** One member: returns { filename, bytes }. */
export async function exportMember(m, record, lang) {
  const css = await appCss();
  const folder = safeName(m.name, 'member');
  // Browsers may refuse non-Latin download names, so the zip name is ASCII; the folder inside keeps the real name.
  const slug = m.name.normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'member';
  return { filename: `${APP_NAME.en}-${slug}-${stamp()}.zip`, bytes: makeZip(memberFiles(folder, m, normalizeRecord(record), lang, css)) };
}
