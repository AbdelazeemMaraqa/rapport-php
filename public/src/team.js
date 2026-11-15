// Team-level aggregation and rule-based insights for the lead dashboard.
import { STYLES, discProfile } from './assessments/disc.js';
import { DIMS, POLES, typeProfile } from './assessments/type.js';
import { TRAITS } from './assessments/big5.js';
import { groupOf } from './types16.js';

const L = (ar, en) => ({ ar, en });

const MISSING = {
  D: L('لا أحد في الفريق يميل طبيعياً إلى الحسم السريع. ضع مواعيد واضحة للقرارات وحدّد صاحب كل قرار.', 'No one leans naturally toward fast decisions. Set clear decision dates and name the owner of each decision.'),
  I: L('لا أحد يميل طبيعياً إلى التأثير والحماس. احتفِ بالإنجازات علناً، وكلّف أحداً بالتواصل مع الفرق الأخرى.', 'No one leans naturally toward influence and enthusiasm. Celebrate wins visibly and give someone the job of reaching out to other teams.'),
  S: L('لا أحد يميل طبيعياً إلى الثبات. راقب إرهاق التغيير المتكرر، وتأكد أن الأعمال تُكمَل لا أنها تبدأ فقط.', "No one leans naturally toward steadiness. Watch for change fatigue, and make sure work gets finished, not just started."),
  C: L('لا أحد يميل طبيعياً إلى الدقة والتدقيق. اجعل المراجعة ومعايير الجودة خطوة إلزامية.', 'No one leans naturally toward precision. Make reviews and quality criteria a required step.'),
};

const CROWDED = {
  D: L('أكثر من نصف الفريق يميل إلى الحسم: انتبه للصراع على القرار ولأصوات الزملاء الأهدأ.', 'More than half the team leans toward Dominance: watch for clashes over decisions and for quieter voices being drowned out.'),
  I: L('أكثر من نصف الفريق يميل إلى التأثير: الأفكار كثيرة، فانتبه للمتابعة والتوثيق.', 'More than half the team leans toward Influence: ideas are plentiful, so watch follow-through and documentation.'),
  S: L('أكثر من نصف الفريق يميل إلى الثبات: انتبه لبطء التغيير ولتجنّب الخلاف.', 'More than half the team leans toward Steadiness: watch for slow change and avoided conflict.'),
  C: L('أكثر من نصف الفريق يميل إلى الدقة: انتبه لطول التحليل وتأخر الحسم.', 'More than half the team leans toward Conscientiousness: watch for long analysis and late decisions.'),
};

export function computeTeam(members) {
  const withDisc = members.filter((m) => m.results?.disc);
  const withType = members.filter((m) => m.results?.type);
  const withBig5 = members.filter((m) => m.results?.big5);

  const discCounts = { D: 0, I: 0, S: 0, C: 0 };
  const discSecondary = { D: 0, I: 0, S: 0, C: 0 };
  for (const m of withDisc) {
    const p = discProfile(m.results.disc);
    discCounts[p.primary] += 1;
    if (p.secondary) discSecondary[p.secondary] += 1;
  }

  const typeSplit = {};
  for (const d of DIMS) typeSplit[d] = { [POLES[d][0]]: 0, [POLES[d][1]]: 0, balanced: 0 };
  const groupCounts = { NT: 0, NF: 0, SJ: 0, SP: 0 };
  for (const m of withType) {
    const tp = typeProfile(m.results.type);
    groupCounts[groupOf(tp.code)] += 1;
    for (const d of tp.dims) {
      if (d.balanced) typeSplit[d.dim].balanced += 1;
      else typeSplit[d.dim][d.letter] += 1;
    }
  }

  const big5Avg = {};
  for (const t of TRAITS) {
    big5Avg[t] = withBig5.length ? Math.round(withBig5.reduce((s, m) => s + (Number(m.results.big5[t]) || 0), 0) / withBig5.length) : null;
  }

  const insights = [];
  if (withDisc.length >= 3) {
    for (const s of STYLES) {
      if (discCounts[s] === 0 && discSecondary[s] === 0) insights.push({ src: 'DISC', text: MISSING[s] });
    }
    for (const s of STYLES) {
      if (discCounts[s] / withDisc.length > 0.5) insights.push({ src: 'DISC', text: CROWDED[s] });
    }
  }
  if (withType.length >= 3) {
    const n = withType.length;
    const share = (dim, letter) => typeSplit[dim][letter] / n;
    if (share('EI', 'I') >= 0.6) insights.push({ src: 'Type', text: L('أغلب الفريق يميل إلى الانطواء: أرسل جدول الاجتماعات مسبقاً، واجعل التواصل الكتابي هو الأساس.', 'Most of the team leans introverted: send agendas in advance and default to written communication.') });
    if (share('EI', 'E') >= 0.6) insights.push({ src: 'Type', text: L('أغلب الفريق يميل إلى الانبساط: أعطِ الأصوات الأهدأ فرصة، بجولة آراء أو أسئلة مكتوبة قبل النقاش.', 'Most of the team leans extraverted: make room for quieter voices with a round of views or written questions before discussion.') });
    if (share('TF', 'T') >= 0.7) insights.push({ src: 'Type', text: L('أغلب الفريق يقرر بالمنطق: لا تنسَ الحديث عن أثر القرارات على الناس.', 'Most of the team decides by logic: remember to talk about how decisions affect people.') });
    if (share('TF', 'F') >= 0.7) insights.push({ src: 'Type', text: L('أغلب الفريق يقرر بالقيم: اربط القرارات بمعايير واضحة حتى لا تبدو شخصية.', "Most of the team decides by values: tie decisions to clear criteria so they don't feel personal.") });
    if (share('JP', 'J') >= 0.3 && share('JP', 'P') >= 0.3) insights.push({ src: 'Type', text: L('الفريق منقسم بين محبي التخطيط ومحبي المرونة: اتفقوا معاً على قواعد التخطيط والمواعيد.', 'The team is split between planners and improvisers: agree on planning and deadline norms together.') });
    else if (share('JP', 'P') >= 0.7) insights.push({ src: 'Type', text: L('أغلب الفريق يحب المرونة: قسّموا العمل إلى محطات قصيرة بمواعيد واضحة.', 'Most of the team prefers flexibility: break work into short milestones with clear dates.') });
  }
  if (withBig5.length >= 3) {
    if (big5Avg.C < 40) insights.push({ src: 'Big Five', text: L('متوسط الانضباط في الفريق منخفض: اعتمدوا على أدوات تتبع ومواعيد مرئية للجميع.', "The team's average conscientiousness is low: lean on tracking tools and deadlines everyone can see.") });
    if (big5Avg.A > 70) insights.push({ src: 'Big Five', text: L('الفريق متوافق جداً: اطلب الاعتراض صراحةً حتى لا تمر الأفكار الضعيفة.', "A very agreeable team: ask for disagreement explicitly so weak ideas don't slip through.") });
    if (big5Avg.ES < 40) insights.push({ src: 'Big Five', text: L('الفريق يشعر بالضغط أكثر من المعتاد: راقب عبء العمل وأبلغ بالتغييرات مبكراً.', 'The team feels pressure more than usual: watch the workload and give early notice of changes.') });
  }

  return {
    count: members.length,
    counts: { disc: withDisc.length, type: withType.length, big5: withBig5.length },
    discCounts,
    typeSplit,
    groupCounts,
    big5Avg,
    insights,
  };
}
