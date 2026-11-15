// 16-type assessment: four preferences (E/I, S/N, T/F, J/P) inspired by Jung's psychological types,
// combined into one of 16 four-letter types (portraits in ../types16.js).
// All items, type names and descriptions are original to this app. This is not the MBTI® and not 16Personalities.

export const DIMS = ['EI', 'SN', 'TF', 'JP'];
export const POLES = { EI: ['E', 'I'], SN: ['S', 'N'], TF: ['T', 'F'], JP: ['J', 'P'] };

// [id, dim, first-pole text (ar, en), second-pole text (ar, en), flip]
// flip = show the second pole on the start side, so the same letter is not always on one side.
const ITEMS = [
  ['ei1', 'EI', ['بعد أسبوع متعب أستعيد طاقتي بالخروج مع الناس', 'After a tiring week I recharge by going out with people'], ['بعد أسبوع متعب أستعيد طاقتي بوقت هادئ وحدي', 'After a tiring week I recharge with quiet time alone'], false],
  ['sn1', 'SN', ['أثق أكثر بالخبرة والحقائق المجرّبة', 'I trust experience and proven facts more'], ['أثق أكثر بالحدس والأنماط التي ألاحظها', 'I trust intuition and the patterns I notice more'], true],
  ['tf1', 'TF', ['أعتمد في قراري على المنطق والمعايير', 'I base decisions on logic and criteria'], ['أعتمد في قراري على القيم وأثره على الناس', 'I base decisions on values and the impact on people'], false],
  ['jp1', 'JP', ['أفضّل خطة واضحة أعرف خطواتها', 'I prefer a clear plan with known steps'], ['أفضّل إبقاء الخيارات مفتوحة', 'I prefer to keep my options open'], true],
  ['ei2', 'EI', ['في الاجتماعات أفكّر بصوت عالٍ', 'In meetings I think out loud'], ['في الاجتماعات أفكّر أولاً ثم أتكلم', 'In meetings I think first, then speak'], true],
  ['sn2', 'SN', ['أفضّل المهام العملية والملموسة', 'I prefer practical, concrete tasks'], ['أفضّل المهام الجديدة والمفاهيمية', 'I prefer new, conceptual tasks'], false],
  ['tf2', 'TF', ['ملاحظاتي للآخرين مباشرة وموضوعية', 'My feedback to others is direct and objective'], ['ملاحظاتي للآخرين لبقة ومراعية للمشاعر', 'My feedback to others is tactful and considerate'], true],
  ['jp2', 'JP', ['أنهي العمل قبل موعده بوقت كافٍ', 'I finish work well before the deadline'], ['أعمل بأفضل شكل قرب الموعد النهائي', 'I do my best work close to the deadline'], false],
  ['ei3', 'EI', ['أفضّل معارف كثيرين ومتنوعين', 'I prefer many varied acquaintances'], ['أفضّل علاقات قليلة وعميقة', 'I prefer a few deep relationships'], false],
  ['sn3', 'SN', ['أركّز على ما هو موجود الآن', 'I focus on what is'], ['أركّز على ما يمكن أن يكون', 'I focus on what could be'], true],
  ['tf3', 'TF', ['في الخلاف يهمني من الأصح', 'In a disagreement I care most about who is right'], ['في الخلاف يهمني الحفاظ على العلاقة', 'In a disagreement I care most about keeping the relationship'], false],
  ['jp3', 'JP', ['مفاجآت الخطة تزعجني', 'Surprises in the plan annoy me'], ['مفاجآت الخطة تثير اهتمامي', 'Surprises in the plan interest me'], true],
  ['ei4', 'EI', ['أعمل أفضل بالنقاش المفتوح مع الفريق', 'I work best through open discussion with the team'], ['أعمل أفضل بالتركيز منفرداً', 'I work best with focused time alone'], true],
  ['sn4', 'SN', ['أريد التعليمات خطوة بخطوة', 'I want instructions step by step'], ['أريد الصورة الكبيرة أولاً', 'I want the big picture first'], false],
  ['tf4', 'TF', ['العدل أن تُطبَّق القاعدة نفسها على الجميع', 'Fairness means the same rule for everyone'], ['العدل أن تُراعى ظروف كل حالة', "Fairness means considering each person's situation"], true],
  ['jp4', 'JP', ['أحب أن أحسم الأمر وأغلقه', 'I like to decide and close the matter'], ['أحب أن أستكشف أكثر قبل أن أحسم', 'I like to explore more before deciding'], false],
  ['ei5', 'EI', ['أفهم الشيء الجديد عندما أتحدث عنه', 'I understand something new by talking it through'], ['أفهم الشيء الجديد عندما أفكر فيه بهدوء', 'I understand something new by thinking it over quietly'], false],
  ['sn5', 'SN', ['أستمتع بتحسين الطرق المجرّبة', 'I enjoy improving proven methods'], ['أستمتع بابتكار طرق جديدة', 'I enjoy inventing new approaches'], true],
  ['tf5', 'TF', ['تقنعني الحجة المتماسكة', 'A sound argument convinces me'], ['تقنعني القناعة الصادقة وقصص الناس', "Sincere conviction and people's stories convince me"], false],
  ['jp5', 'JP', ['أعتمد على قوائم المهام', 'I rely on to-do lists'], ['نادراً ما أستخدم قوائم المهام', 'I rarely use to-do lists'], true],
  ['ei6', 'EI', ['المقاطعات وزيارات الزملاء لا تزعجني', "Interruptions and colleagues dropping by don't bother me"], ['المقاطعات وزيارات الزملاء تستنزفني', 'Interruptions and colleagues dropping by drain me'], true],
  ['sn6', 'SN', ['ألاحظ التفاصيل بسرعة', 'I notice details quickly'], ['ألاحظ الروابط والاحتمالات بسرعة', 'I notice connections and possibilities quickly'], false],
  ['tf6', 'TF', ['يراني الناس شخصاً تحليلياً', 'People see me as analytical'], ['يراني الناس شخصاً دافئاً', 'People see me as warm'], true],
  ['jp6', 'JP', ['مساحة عملي ومهامي منظمة', 'My workspace and tasks are organised'], ['مساحة عملي ومهامي مرنة وعفوية', 'My workspace and tasks are flexible and spontaneous'], false],
  ['ei7', 'EI', ['يتعرّف عليّ الناس بسهولة', 'People get to know me easily'], ['يحتاج الناس وقتاً ليعرفوني', 'People need time to get to know me'], false],
  ['sn7', 'SN', ['أفضّل الحديث عن أمثلة محددة', 'I prefer to talk about specific examples'], ['أفضّل الحديث عن الأفكار والنظريات', 'I prefer to talk about ideas and theories'], true],
  ['tf7', 'TF', ['أتعامل مع النقد كمعلومة مفيدة', 'I treat criticism as useful information'], ['يؤثر فيّ النقد على المستوى الشخصي', 'Criticism affects me personally'], false],
  ['jp7', 'JP', ['أحب السفر بجدول مفصّل', 'I like to travel with a detailed itinerary'], ['أحب السفر بعفوية', 'I like to travel spontaneously'], true],
  ['ei8', 'EI', ['المناسبات الجماعية تشحنني', 'Group events energise me'], ['المناسبات الجماعية تتعبني بعد فترة', 'Group events tire me after a while'], true],
  ['sn8', 'SN', ['أخطط بواقعية بناءً على ما نجح سابقاً', 'I plan realistically, based on what worked before'], ['أخطط بطموح بناءً على رؤية للمستقبل', 'I plan ambitiously, based on a vision of the future'], false],
  ['tf8', 'TF', ['القرار الجيد هو القرار الأكثر كفاءة', 'A good decision is the most efficient one'], ['القرار الجيد هو القرار الذي يتقبّله الناس', 'A good decision is one people can accept'], true],
  ['jp8', 'JP', ['القواعد تعطيني وضوحاً', 'Rules give me clarity'], ['القواعد قد تقيّدني', 'Rules can hold me back'], false],
];

export const type = {
  id: 'type',
  minutes: 5,
  scale: 'bipolar',
  name: { ar: 'الأنماط الستة عشر', en: '16 Types' },
  blurb: {
    ar: 'أربعة تفضيلات تحدد نمطك من 16 نمطاً: من أين تستمد طاقتك، وكيف تجمع المعلومات، وكيف تقرر، وكيف تنظم عملك.',
    en: 'Four preferences that place you in one of 16 types: where you get energy, how you take in information, how you decide, and how you organise work.',
  },
  items: ITEMS.map(([id, dim, a, b, flip]) => ({
    id,
    dim,
    first: { ar: a[0], en: a[1] },
    second: { ar: b[0], en: b[1] },
    flip,
  })),
};

/**
 * answers: { itemId: 1..5 }, where 1 = fully the statement shown at the start, 5 = fully the one at the end.
 * Returns { EI, SN, TF, JP } each -100..100: negative = first letter (E, S, T, J), positive = second letter (I, N, F, P).
 */
export function scoreType(answers) {
  const sums = { EI: 0, SN: 0, TF: 0, JP: 0 };
  const counts = { EI: 0, SN: 0, TF: 0, JP: 0 };
  for (const item of type.items) {
    const v = Number(answers[item.id]);
    if (!(v >= 1 && v <= 5)) continue;
    // Without flip: start = first pole, so 5 means fully second pole. With flip it is reversed.
    const towardSecond = item.flip ? 6 - v : v;
    sums[item.dim] += towardSecond - 3;
    counts[item.dim] += 1;
  }
  const out = {};
  for (const d of DIMS) {
    out[d] = counts[d] ? Math.round((sums[d] / (counts[d] * 2)) * 100) : 0;
  }
  return out;
}

export const BALANCED = 15;

/** { code: 'INTJ', letters: [...], dims: [{ dim, letter, other, clarity, balanced }] } */
export function typeProfile(scores) {
  if (!scores) return null;
  const dims = DIMS.map((dim) => {
    const v = Number(scores[dim]) || 0;
    const [a, b] = POLES[dim];
    // Ties go to the second letter (I, N, F, P), the usual convention; they are also flagged as balanced.
    const letter = v >= 0 ? b : a;
    const other = letter === a ? b : a;
    return { dim, letter, other, clarity: Math.abs(v), balanced: Math.abs(v) < BALANCED, value: v };
  });
  return { code: dims.map((d) => d.letter).join(''), dims };
}
