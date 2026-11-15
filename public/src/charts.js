// SVG and CSS charts. Colors come from CSS tokens (--d, --i, --s, --c) so both themes work.
import { esc } from './util.js';
import { STYLES } from './assessments/disc.js';
import { POLES } from './assessments/type.js';
import { TRAITS, level } from './assessments/big5.js';
import { DISC, POLE, TRAIT } from './guidance.js';
import { t } from './i18n.js';
import { GROUPS } from './types16.js';

// Quadrants in the classic DISC circle: D top-left, I top-right, S bottom-right, C bottom-left.
// Angles are SVG angles (0 = right, clockwise).
const QUAD = { D: [180, 270], I: [270, 360], S: [0, 90], C: [90, 180] };
const rad = (deg) => (deg * Math.PI) / 180;

function wedge(r, a1, a2) {
  const gap = 3;
  const s = rad(a1 + gap);
  const e = rad(a2 - gap);
  const p = (a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  return `M0 0 L${p(s)} A${r} ${r} 0 0 1 ${p(e)} Z`;
}

/** The DISC rose: each person's visual signature. */
export function rose(scores, { size = 64, labels = false, title = '' } = {}) {
  const R = 44;
  const rings = [0.25, 0.5, 0.75, 1].map((f) => `<circle r="${(R * f).toFixed(1)}" class="rose-ring"/>`).join('');
  const wedges = scores
    ? STYLES.map((k) => {
        const v = Math.max(0, Math.min(100, Number(scores[k]) || 0));
        const r = 6 + (R - 6) * (v / 100);
        return `<path d="${wedge(r, ...QUAD[k])}" class="rose-${k.toLowerCase()}"/>`;
      }).join('')
    : '';
  const lab = labels
    ? STYLES.map((k) => {
        const mid = rad((QUAD[k][0] + QUAD[k][1]) / 2);
        const x = (R + 4.5) * Math.cos(mid);
        const y = (R + 4.5) * Math.sin(mid);
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="rose-label" text-anchor="middle" dominant-baseline="central">${k}</text>`;
      }).join('')
    : '';
  const vb = labels ? '-56 -56 112 112' : '-47 -47 94 94';
  return `<svg class="rose" viewBox="${vb}" width="${size}" height="${size}" role="img" aria-label="${esc(title)}"><g>${rings}<line x1="-${R}" y1="0" x2="${R}" y2="0" class="rose-axis"/><line x1="0" y1="-${R}" x2="0" y2="${R}" class="rose-axis"/>${wedges}</g>${lab}</svg>`;
}

function bar(label, value, cls, extra = '') {
  const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `<div class="bar-row"><span class="bar-label">${label}</span><span class="bar-track"><span class="bar-fill ${cls}" style="inline-size:${v}%"></span></span><span class="bar-value">${v}%</span>${extra}</div>`;
}

export function discBars(scores, lang) {
  return `<div class="bars">${STYLES.map((k) => bar(`<b class="chip chip-${k.toLowerCase()}">${k}</b> ${esc(DISC[k].name[lang])}`, scores[k], 'fill-' + k.toLowerCase())).join('')}</div>`;
}

export function typeSliders(tp, lang) {
  return `<div class="sliders">${tp.dims
    .map((d) => {
      const [a, b] = POLES[d.dim];
      const pos = (d.value + 100) / 2;
      // Share of answers leaning to the winning letter: 50% = exactly in the middle, 100% = fully one side.
      const pct = Math.round(50 + d.clarity / 2);
      const status = d.balanced ? `${t('balanced', lang)} · ${pct}% ${POLE[d.letter].name[lang]}` : `${pct}% ${POLE[d.letter].name[lang]}`;
      return `<div class="slider">
        <div class="slider-ends"><span class="${d.letter === a && !d.balanced ? 'is-on' : ''}"><b>${a}</b> ${esc(POLE[a].name[lang])}</span><span class="${d.letter === b && !d.balanced ? 'is-on' : ''}">${esc(POLE[b].name[lang])} <b>${b}</b></span></div>
        <div class="slider-track"><span class="slider-mid"></span><span class="slider-dot" style="inset-inline-start:${pos}%"></span></div>
        <div class="slider-status">${esc(status)}</div>
      </div>`;
    })
    .join('')}</div>`;
}

export function big5Bars(scores, lang) {
  return `<div class="bars">${TRAITS.map((k) => {
    const lv = level(scores[k]);
    const lvLabel = t(lv === 'high' ? 'levelHigh' : lv === 'low' ? 'levelLow' : 'levelMid', lang);
    return bar(esc(TRAIT[k].name[lang]), scores[k], 'fill-trait', `<span class="bar-level lvl-${lv}">${esc(lvLabel)}</span>`);
  }).join('')}</div>`;
}

/** Stacked bar of primary DISC styles across the team. */
export function discMix(counts, lang) {
  const total = STYLES.reduce((s, k) => s + counts[k], 0);
  if (!total) return '';
  const segs = STYLES.filter((k) => counts[k])
    .map((k) => `<span class="mix-seg fill-${k.toLowerCase()}" style="flex-grow:${counts[k]}" title="${esc(DISC[k].name[lang])}: ${counts[k]}"></span>`)
    .join('');
  const legend = STYLES.map((k) => `<li><b class="chip chip-${k.toLowerCase()}">${k}</b> ${esc(DISC[k].name[lang])} <span class="num">${counts[k]}</span></li>`).join('');
  return `<div class="mix">${segs}</div><ul class="mix-legend">${legend}</ul>`;
}

export function typeMix(split, lang) {
  return `<div class="split-rows">${Object.entries(split)
    .map(([dim, c]) => {
      const [a, b] = POLES[dim];
      return `<div class="split-row">
        <span class="split-end"><b>${a}</b> <span class="num">${c[a]}</span></span>
        <span class="split-track"><span class="split-a" style="flex-grow:${c[a]}"></span><span class="split-bal" style="flex-grow:${c.balanced}"></span><span class="split-b" style="flex-grow:${c[b]}"></span></span>
        <span class="split-end"><span class="num">${c[b]}</span> <b>${b}</b></span>
        ${c.balanced ? `<span class="split-note">${esc(t('balanced', lang))}: <span class="num">${c.balanced}</span></span>` : ''}
      </div>`;
    })
    .join('')}</div>`;
}

/** Counts of the four 16-type groups (NT, NF, SJ, SP). */
export function groupMix(counts, lang) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (!total) return '';
  const keys = ['NT', 'NF', 'SJ', 'SP'];
  const segs = keys.filter((k) => counts[k]).map((k) => `<span class="mix-seg fill-g-${k.toLowerCase()}" style="flex-grow:${counts[k]}" title="${esc(GROUPS[k].name[lang])}: ${counts[k]}"></span>`).join('');
  const legend = keys.map((k) => `<li><span class="dot-key fill-g-${k.toLowerCase()}"></span> ${esc(GROUPS[k].name[lang])} <span class="num">${counts[k]}</span></li>`).join('');
  return `<div class="mix">${segs}</div><ul class="mix-legend">${legend}</ul>`;
}

export function big5Avg(avg, lang) {
  if (Object.values(avg).every((v) => v == null)) return '';
  return `<div class="bars">${TRAITS.map((k) => bar(esc(TRAIT[k].name[lang]), avg[k], 'fill-trait')).join('')}</div>`;
}
