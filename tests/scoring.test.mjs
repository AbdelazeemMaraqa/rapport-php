import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disc, scoreDisc, discProfile } from '../public/src/assessments/disc.js';
import { type, scoreType, typeProfile } from '../public/src/assessments/type.js';
import { big5, scoreBig5, level } from '../public/src/assessments/big5.js';
import { buildGuide, pairFor, DISC, POLE, TRAIT, PAIRS } from '../public/src/guidance.js';
import { computeTeam } from '../public/src/team.js';

const fill = (a, fn) => Object.fromEntries(a.items.map((it) => [it.id, fn(it)]));

test('item counts and unique ids', () => {
  assert.equal(disc.items.length, 24);
  assert.equal(type.items.length, 32);
  assert.equal(big5.items.length, 20);
  const ids = [...disc.items, ...type.items, ...big5.items].map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const k of ['D', 'I', 'S', 'C']) assert.equal(disc.items.filter((i) => i.key === k).length, 6);
  for (const d of ['EI', 'SN', 'TF', 'JP']) {
    const items = type.items.filter((i) => i.dim === d);
    assert.equal(items.length, 8);
    assert.equal(items.filter((i) => i.flip).length, 4, `${d} should flip half its items`);
  }
  for (const k of ['O', 'C', 'E', 'A', 'N']) assert.equal(big5.items.filter((i) => i.trait === k).length, 4);
});

test('DISC scoring: pure D profile', () => {
  const s = scoreDisc(fill(disc, (it) => (it.key === 'D' ? 5 : 1)));
  assert.deepEqual(s, { D: 100, I: 0, S: 0, C: 0 });
  assert.equal(discProfile(s).primary, 'D');
  assert.equal(discProfile(s).secondary, null);
});

test('DISC secondary within 15 points', () => {
  const p = discProfile({ D: 40, I: 20, S: 80, C: 70 });
  assert.equal(p.primary, 'S');
  assert.equal(p.secondary, 'C');
});

test('Type scoring respects flipped items', () => {
  // Choose 1 (the start-side statement) everywhere: flipped items then count toward the second pole.
  const s = scoreType(fill(type, () => 1));
  for (const d of ['EI', 'SN', 'TF', 'JP']) assert.equal(s[d], 0, 'half flipped, so all-1 answers cancel out');
  // Always pick the first-pole statement wherever it is displayed: should give E S T J at -100.
  const firstPole = scoreType(fill(type, (it) => (it.flip ? 5 : 1)));
  assert.deepEqual(firstPole, { EI: -100, SN: -100, TF: -100, JP: -100 });
  assert.equal(typeProfile(firstPole).code, 'ESTJ');
  const secondPole = scoreType(fill(type, (it) => (it.flip ? 1 : 5)));
  assert.equal(typeProfile(secondPole).code, 'INFP');
  const mid = typeProfile(scoreType(fill(type, () => 3)));
  assert.ok(mid.dims.every((d) => d.balanced));
});

test('Big Five scoring with reverse items and emotional stability', () => {
  // Answer 5 on positive items and 1 on reversed ones: every trait maxes out, N maxes out so ES = 0.
  const s = scoreBig5(fill(big5, (it) => (it.reverse ? 1 : 5)));
  assert.deepEqual(s, { O: 100, C: 100, E: 100, A: 100, ES: 0 });
  const neutral = scoreBig5(fill(big5, () => 3));
  assert.deepEqual(neutral, { O: 50, C: 50, E: 50, A: 50, ES: 50 });
  assert.equal(level(70), 'high');
  assert.equal(level(30), 'low');
  assert.equal(level(50), 'mid');
});

test('every content entry has both languages', () => {
  const check = (obj, where) => {
    if (obj && typeof obj === 'object' && 'ar' in obj && 'en' in obj) {
      assert.ok(obj.ar && obj.en, `missing text at ${where}`);
      return;
    }
    if (Array.isArray(obj)) obj.forEach((x, i) => check(x, `${where}[${i}]`));
    else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) check(v, `${where}.${k}`);
  };
  check(DISC, 'DISC');
  check(POLE, 'POLE');
  check(TRAIT, 'TRAIT');
  check(PAIRS, 'PAIRS');
  assert.equal(Object.keys(PAIRS).length, 10);
});

test('guide merges sources, removes duplicates and caps lists', () => {
  const results = {
    disc: { D: 90, I: 30, S: 20, C: 80 },
    type: { EI: 60, SN: -50, TF: -70, JP: -40 },
    big5: { O: 30, C: 80, E: 20, A: 50, ES: 70 },
  };
  const { guide, disc: dp, type: tp } = buildGuide(results);
  assert.equal(dp.primary, 'D');
  assert.equal(tp.code, 'ISTJ');
  assert.ok(guide.communicate.length > 0 && guide.communicate.length <= 5);
  assert.ok(guide.strengths.some((l) => l.src === 'Big Five'));
  const texts = Object.values(guide).flat().map((l) => l.text.en);
  assert.equal(new Set(texts).size, texts.length);
});

test('pairs are symmetric', () => {
  assert.equal(pairFor('S', 'D'), pairFor('D', 'S'));
  assert.equal(pairFor('C', 'C'), PAIRS.CC);
});

test('team insights flag a missing style', () => {
  const m = (D, I, S, C) => ({ results: { disc: { D, I, S, C } } });
  const team = computeTeam([m(90, 20, 20, 60), m(85, 30, 10, 75), m(30, 20, 40, 90)]);
  assert.equal(team.discCounts.D, 2);
  assert.ok(team.insights.some((i) => i.text.en.includes('steadiness')));
  assert.ok(team.insights.some((i) => i.text.en.includes('influence')));
});


// ---------- 16 types, development plans, lead records, export ----------
import { TYPES16, GROUPS, groupOf, TYPE_CODES } from '../public/src/types16.js';
import { suggestions, normalizeRecord, planStats } from '../public/src/devplan.js';
import { makeZip, crc32, safeName } from '../public/src/zip.js';

test('all 16 types have a full bilingual portrait', () => {
  const letters = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
  const expected = letters.reduce((acc, pair) => acc.flatMap((p) => pair.map((l) => p + l)), ['']);
  assert.deepEqual([...TYPE_CODES].sort(), expected.sort());
  for (const [code, p] of Object.entries(TYPES16)) {
    for (const k of ['name', 'summary', 'thrives']) assert.ok(p[k].ar && p[k].en, `${code}.${k}`);
    for (const k of ['strengths', 'watch', 'lead', 'develop']) {
      assert.ok(Array.isArray(p[k]) && p[k].length >= 2, `${code}.${k}`);
      for (const line of p[k]) assert.ok(line.ar && line.en, `${code}.${k}`);
    }
    assert.ok(GROUPS[groupOf(code)], `${code} has a group`);
  }
  const names = Object.values(TYPES16).map((p) => p.name.en);
  assert.equal(new Set(names).size, 16, 'type names are unique');
  assert.equal(groupOf('INTJ'), 'NT');
  assert.equal(groupOf('ENFP'), 'NF');
  assert.equal(groupOf('ISTJ'), 'SJ');
  assert.equal(groupOf('ESTP'), 'SP');
});

test('development suggestions come from every result and stay unique', () => {
  const s = suggestions({ disc: { D: 90, I: 20, S: 20, C: 40 }, type: { EI: -60, SN: 50, TF: -60, JP: -50 }, big5: { O: 80, C: 20, E: 50, A: 50, ES: 30 } });
  assert.ok(s.goals.length >= 4 && s.goals.length <= 6);
  assert.equal(new Set(s.goals.map((g) => g.en)).size, s.goals.length);
  assert.ok(s.questions.length >= 5);
  assert.ok(s.strengths.length > 0 && s.growth.length > 0 && s.support.length > 0);
  const empty = suggestions({});
  assert.equal(empty.goals.length, 0);
  assert.equal(empty.questions.length, 3);
});

test('lead records are normalised for display', () => {
  const n = normalizeRecord({ plan: { goals: [{ status: 'done' }, { status: 'todo' }] } });
  assert.deepEqual(planStats(n), { total: 2, done: 1, open: 1, review: '', notes: 0 });
  assert.equal(normalizeRecord(null).info.team, '');
  assert.deepEqual(normalizeRecord({ notes: 'x' }).notes, []);
});


// Reads a stored (uncompressed) ZIP back, checking signatures, sizes and CRCs.
function readZip(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dec = new TextDecoder('utf-8', { ignoreBOM: true });
  const out = {};
  let p = 0;
  while (dv.getUint32(p, true) === 0x04034b50) {
    const flags = dv.getUint16(p + 6, true);
    const crc = dv.getUint32(p + 14, true);
    const size = dv.getUint32(p + 18, true);
    const nameLen = dv.getUint16(p + 26, true);
    const name = dec.decode(bytes.subarray(p + 30, p + 30 + nameLen));
    const data = bytes.subarray(p + 30 + nameLen, p + 30 + nameLen + size);
    assert.equal(flags & 0x0800, 0x0800, 'UTF-8 flag set');
    assert.equal(crc32(data), crc, `crc of ${name}`);
    out[name] = dec.decode(data);
    p += 30 + nameLen + size;
  }
  assert.equal(dv.getUint32(bytes.length - 22, true), 0x06054b50, 'end of central directory');
  assert.equal(dv.getUint16(bytes.length - 22 + 10, true), Object.keys(out).length);
  return out;
}

test('zip writer round-trips UTF-8 names and content', () => {
  const zip = makeZip([
    { path: `${safeName('لينا: أحمد/؟')}/profile.html`, data: '<h1>مرحبا</h1>' },
    { path: 'team.csv', data: '﻿name\nلينا\n' },
  ]);
  const files = readZip(zip);
  assert.deepEqual(Object.keys(files), ['لينا أحمد ؟/profile.html', 'team.csv']);
  assert.equal(files['لينا أحمد ؟/profile.html'], '<h1>مرحبا</h1>');
  assert.equal(crc32(new TextEncoder().encode('The quick brown fox jumps over the lazy dog')), 0x414fa339);
  assert.equal(safeName('  ..  '), 'file');
});

test('team export builds a folder per member with every file', async () => {
  globalThis.fetch = async () => ({ ok: true, text: async () => 'body{}' });
  const { exportTeam, exportMember } = await import('../public/src/export.js');
  const { DEMO_MEMBERS, DEMO_RECORDS } = await import('../public/src/demo.js');
  const out = await exportTeam(DEMO_MEMBERS, DEMO_RECORDS, 'ar');
  assert.match(out.filename, /^Rapport-team-\d{4}-\d{2}-\d{2}\.zip$/);
  const files = readZip(out.bytes);
  const names = Object.keys(files);
  const root = names[0].split('/')[0];
  for (const f of ['README.txt', 'team-overview.html', 'team.csv']) assert.ok(names.includes(`${root}/${f}`), f);
  const folders = new Set(names.filter((n) => n.split('/').length === 3).map((n) => n.split('/')[1]));
  assert.equal(folders.size, DEMO_MEMBERS.length);
  for (const folder of folders) {
    for (const f of ['profile.html', 'development-plan.html', 'notes.md', 'data.json']) assert.ok(names.includes(`${root}/${folder}/${f}`), `${folder}/${f}`);
  }
  const samer = [...folders].find((f) => f.includes('سامر'));
  const data = JSON.parse(files[`${root}/${samer}/data.json`]);
  assert.equal(data.summary.type.code, 'ISTJ');
  assert.equal(data.leadRecord.plan.goals.length, 2);
  assert.match(files[`${root}/${samer}/development-plan.html`], /قيادة مراجعة كود أسبوعية/);
  assert.match(files[`${root}/${samer}/profile.html`], /^<!doctype html>/);
  assert.ok(files[`${root}/team.csv`].startsWith('﻿name,role'));
  assert.equal(files[`${root}/team.csv`].trim().split('\r\n').length, DEMO_MEMBERS.length + 1);
  const one = await exportMember(DEMO_MEMBERS[0], undefined, 'en');
  assert.equal(Object.keys(readZip(one.bytes)).length, 4);
});
