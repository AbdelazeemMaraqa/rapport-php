// Result blocks shared by the app and the exported files. Every function takes the language explicitly.
import { discProfile } from './assessments/disc.js';
import { typeProfile } from './assessments/type.js';
import { level } from './assessments/big5.js';
import { DISC, TRAIT, SECTIONS, buildGuide } from './guidance.js';
import { TYPES16, GROUPS, groupOf } from './types16.js';
import { rose, discBars, typeSliders, big5Bars } from './charts.js';
import { t, SRC_LABEL } from './i18n.js';
import { esc } from './util.js';

const list = (items, lang) => `<ul class="plain-list">${items.map((x) => `<li>${esc(x[lang])}</li>`).join('')}</ul>`;

export function discBlock(scores, lang, { big = true } = {}) {
  const dp = discProfile(scores);
  const s = DISC[dp.primary];
  const sec = dp.secondary
    ? `<p class="muted">${t('discSecondary', lang)} <b class="chip chip-${dp.secondary.toLowerCase()}">${dp.secondary}</b> ${esc(DISC[dp.secondary].name[lang])}</p>`
    : '';
  return `<div class="disc-result">
    <div class="disc-glyph">${rose(scores, { size: big ? 200 : 150, labels: true, title: 'DISC' })}</div>
    <div class="disc-text">
      <p class="kicker">${t('discClosest', lang)}</p>
      <p class="style-name"><b class="chip chip-${dp.primary.toLowerCase()}">${dp.primary}</b> ${esc(s.name[lang])}</p>
      <p class="tagline">${esc(s.tagline[lang])}</p>
      <p>${esc(s.summary[lang])}</p>
      ${sec}
      ${discBars(scores, lang)}
    </div>
  </div>`;
}

/** The 16-type result: code, portrait, letter percentages. audience 'self' shows growth ideas; 'lead' adds how to lead. */
export function typeBlock(scores, lang, { audience = 'self' } = {}) {
  const tp = typeProfile(scores);
  const p = TYPES16[tp.code];
  const g = GROUPS[groupOf(tp.code)];
  const lead = audience === 'lead'
    ? `<div class="type-col"><h4>${t('typeLead', lang)}</h4>${list(p.lead, lang)}</div>`
    : '';
  return `<div class="type-result">
    <div class="type-head">
      <p class="type-code" aria-label="${tp.code}">${tp.dims.map((d) => `<span class="${d.balanced ? 'is-soft' : ''}">${d.letter}</span>`).join('')}</p>
      <div>
        <p class="type-name">${esc(p.name[lang])}</p>
        <p class="type-group"><span class="tag tag-group">${esc(g.name[lang])}</span> ${esc(g.desc[lang])}</p>
      </div>
    </div>
    <p class="type-summary">${esc(p.summary[lang])}</p>
    ${typeSliders(tp, lang)}
    <div class="type-cols">
      <div class="type-col"><h4>${t('typeStrengths', lang)}</h4>${list(p.strengths, lang)}</div>
      <div class="type-col"><h4>${t('typeWatch', lang)}</h4>${list(p.watch, lang)}</div>
      <div class="type-col"><h4>${t('typeThrives', lang)}</h4><p>${esc(p.thrives[lang])}</p></div>
      ${lead}
      <div class="type-col"><h4>${t(audience === 'lead' ? 'typeDevelopLead' : 'typeDevelop', lang)}</h4>${list(p.develop, lang)}</div>
    </div>
    <p class="note">${t('typeNote', lang)}</p>
  </div>`;
}

export function big5Block(scores, lang) {
  const notes = Object.entries(TRAIT)
    .map(([k, def]) => {
      const lv = level(scores[k]);
      return lv === 'mid' ? '' : `<li><b>${esc(def.name[lang])}:</b> ${esc(def[lv].desc[lang])}</li>`;
    })
    .join('');
  return `<div class="big5-result">${big5Bars(scores, lang)}${notes ? `<ul class="plain-list">${notes}</ul>` : ''}</div>`;
}

export function resultBlock(id, scores, lang, opts = {}) {
  if (id === 'disc') return discBlock(scores, lang, opts);
  if (id === 'type') return typeBlock(scores, lang, opts);
  return big5Block(scores, lang);
}

export function guideHtml(results, lang) {
  const { guide } = buildGuide(results);
  return `<div class="guide-grid">${SECTIONS.filter((s) => guide[s].length)
    .map((s) => `<div class="guide-block guide-${s}">
      <h3>${t('sec_' + s, lang)}</h3>
      <ul>${guide[s].map((line) => `<li>${esc(line.text[lang])} <span class="src" title="${t('sourceTag', lang)}">${esc(SRC_LABEL[line.src][lang])}</span></li>`).join('')}</ul>
    </div>`)
    .join('')}</div>`;
}

/** Short labels used in tables and exports. */
export function summaryOf(results = {}, lang) {
  const out = {};
  if (results.disc) {
    const dp = discProfile(results.disc);
    out.disc = { primary: dp.primary, secondary: dp.secondary, name: DISC[dp.primary].name[lang] };
  }
  if (results.type) {
    const tp = typeProfile(results.type);
    const g = groupOf(tp.code);
    out.type = { code: tp.code, name: TYPES16[tp.code].name[lang], group: GROUPS[g].name[lang], groupId: g, dims: tp.dims };
  }
  if (results.big5) {
    out.big5 = Object.fromEntries(Object.keys(TRAIT).map((k) => [k, { value: results.big5[k], level: level(results.big5[k]), name: TRAIT[k].name[lang] }]));
  }
  return out;
}
