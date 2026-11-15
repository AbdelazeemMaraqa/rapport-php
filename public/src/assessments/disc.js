// DISC work-style assessment. Items are original to this app (not taken from any commercial DISC test).
// The DISC model itself comes from William Marston (1928) and is not proprietary.

export const STYLES = ['D', 'I', 'S', 'C'];

const ITEMS = [
  ['d1', 'D', 'أحب اتخاذ القرار بسرعة ثم المضيّ قدماً.', 'I like to make decisions quickly and move on.'],
  ['i1', 'I', 'أستمتع بلقاء أشخاص جدد وبدء الحديث معهم.', 'I enjoy meeting new people and starting conversations.'],
  ['s1', 'S', 'أقدّر الاستقرار والروتين الواضح في العمل.', 'I value stability and a predictable routine at work.'],
  ['c1', 'C', 'أحب أن تكون كل المعلومات أمامي قبل أن أقرر.', 'I like to have all the facts before I decide.'],
  ['d2', 'D', 'أتولى زمام الأمور عندما يكون الوضع غير واضح.', 'I take charge when a situation is unclear.'],
  ['i2', 'I', 'يمنحني العصف الذهني مع الآخرين طاقة.', 'Brainstorming with others gives me energy.'],
  ['s2', 'S', 'أستمع بصبر عندما يحتاج زميل إلى الدعم.', 'I listen patiently when a colleague needs support.'],
  ['c2', 'C', 'الدقة والجودة أهم عندي من السرعة.', 'Accuracy and quality matter more to me than speed.'],
  ['d3', 'D', 'أرتاح لمعارضة الآخرين عندما أختلف معهم.', 'I am comfortable challenging people when I disagree.'],
  ['i3', 'I', 'أحب إقناع الناس وتحميسهم لفكرة جديدة.', 'I like persuading people and getting them excited about an idea.'],
  ['s3', 'S', 'أفضّل إنهاء مهمة قبل البدء بمهمة أخرى.', 'I prefer to finish one task before starting another.'],
  ['c3', 'C', 'أتّبع الإجراءات والمعايير المتفق عليها بدقة.', 'I follow agreed processes and standards closely.'],
  ['d4', 'D', 'أركّز على النتيجة أكثر من الطريقة التي نصل بها إليها.', 'I focus on the result more than on how we get there.'],
  ['i4', 'I', 'أعبّر عن حماسي ومشاعري بوضوح.', 'I show my enthusiasm and feelings openly.'],
  ['s4', 'S', 'أحاول الحفاظ على الانسجام في الفريق وتجنّب الخلاف.', 'I try to keep harmony in the team and avoid conflict.'],
  ['c4', 'C', 'ألاحظ الأخطاء والتفاصيل التي يغفل عنها غيري.', 'I notice errors and details that others miss.'],
  ['d5', 'D', 'أفقد صبري عندما تسير الأمور ببطء.', 'I get impatient when things move slowly.'],
  ['i5', 'I', 'التقدير أمام الآخرين يحفّزني.', 'Recognition in front of others motivates me.'],
  ['s5', 'S', 'تزعجني التغييرات المفاجئة في الخطة.', 'Sudden changes to the plan unsettle me.'],
  ['c5', 'C', 'أفضّل التعليمات المكتوبة والمحددة على التعليمات العامة.', 'I prefer written, specific instructions over general ones.'],
  ['d6', 'D', 'تجذبني الأهداف الصعبة والتحديات التنافسية.', 'I am drawn to tough goals and competitive challenges.'],
  ['i6', 'I', 'أفضّل بيئة عمل حيوية ومليئة بالتواصل.', 'I prefer a lively, social work environment.'],
  ['s6', 'S', 'يعرف زملائي أنهم يستطيعون الاعتماد عليّ دائماً.', 'My colleagues know they can always count on me.'],
  ['c6', 'C', 'لا أخاطر قبل أن أحلّل الاحتمالات.', 'I avoid taking risks before I have analysed the options.'],
];

export const disc = {
  id: 'disc',
  minutes: 4,
  scale: 'agree',
  name: { ar: 'أسلوب العمل (DISC)', en: 'Work style (DISC)' },
  blurb: {
    ar: 'كيف تتصرف عادةً في العمل: سرعتك، وطريقة تواصلك، وكيف تتخذ القرار.',
    en: 'How you tend to act at work: your pace, how you communicate, and how you decide.',
  },
  items: ITEMS.map(([id, key, ar, en]) => ({ id, key, text: { ar, en } })),
};

/** answers: { itemId: 1..5 } → { D, I, S, C } each 0..100 */
export function scoreDisc(answers) {
  const sums = { D: 0, I: 0, S: 0, C: 0 };
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  for (const item of disc.items) {
    const v = Number(answers[item.id]);
    if (v >= 1 && v <= 5) {
      sums[item.key] += v;
      counts[item.key] += 1;
    }
  }
  const out = {};
  for (const k of STYLES) {
    out[k] = counts[k] ? Math.round(((sums[k] / counts[k] - 1) / 4) * 100) : 0;
  }
  return out;
}

/** Primary style, plus a secondary when it is within 15 points of the primary. */
export function discProfile(scores) {
  if (!scores) return null;
  const ranked = STYLES.map((k) => [k, Number(scores[k]) || 0]).sort((a, b) => b[1] - a[1]);
  const [first, second] = ranked;
  const secondary = first[1] - second[1] <= 15 ? second[0] : null;
  return { primary: first[0], secondary, ranked };
}
