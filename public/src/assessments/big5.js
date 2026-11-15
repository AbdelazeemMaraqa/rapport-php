// Big Five: the 20-item Mini-IPIP (Donnellan, Oswald, Baird & Lucas, 2006).
// IPIP items are in the public domain (https://ipip.ori.org). The Arabic wording is this app's own
// translation and has not been validated as an Arabic version of the scale.

export const TRAITS = ['O', 'C', 'E', 'A', 'ES'];

// [id, trait, reverse, ar, en]. N items feed Emotional Stability (ES) reversed.
const ITEMS = [
  ['b1', 'E', false, 'أكون مصدر الحيوية في التجمعات.', 'Am the life of the party.'],
  ['b2', 'A', false, 'أتعاطف مع مشاعر الآخرين.', "Sympathize with others' feelings."],
  ['b3', 'C', false, 'أنجز المهام المطلوبة مني فوراً.', 'Get chores done right away.'],
  ['b4', 'N', false, 'يتقلّب مزاجي كثيراً.', 'Have frequent mood swings.'],
  ['b5', 'O', false, 'لديّ خيال واسع.', 'Have a vivid imagination.'],
  ['b6', 'E', true, 'لا أتحدث كثيراً.', "Don't talk a lot."],
  ['b7', 'A', true, 'لا تعنيني مشكلات الآخرين.', "Am not interested in other people's problems."],
  ['b8', 'C', true, 'كثيراً ما أنسى إعادة الأشياء إلى مكانها.', 'Often forget to put things back in their proper place.'],
  ['b9', 'N', true, 'أشعر بالاسترخاء معظم الوقت.', 'Am relaxed most of the time.'],
  ['b10', 'O', true, 'لا تستهويني الأفكار المجردة.', 'Am not interested in abstract ideas.'],
  ['b11', 'E', false, 'أتحدث مع أشخاص كثيرين ومختلفين في المناسبات.', 'Talk to a lot of different people at parties.'],
  ['b12', 'A', false, 'أشعر بمشاعر الآخرين.', "Feel others' emotions."],
  ['b13', 'C', false, 'أحب النظام والترتيب.', 'Like order.'],
  ['b14', 'N', false, 'أنزعج بسهولة.', 'Get upset easily.'],
  ['b15', 'O', true, 'أجد صعوبة في فهم الأفكار المجردة.', 'Have difficulty understanding abstract ideas.'],
  ['b16', 'E', true, 'أفضّل البقاء في الخلفية.', 'Keep in the background.'],
  ['b17', 'A', true, 'لا أهتم كثيراً بالآخرين.', 'Am not really interested in others.'],
  ['b18', 'C', true, 'تعمّ الفوضى الأشياء من حولي.', 'Make a mess of things.'],
  ['b19', 'N', true, 'نادراً ما أشعر بالحزن أو الإحباط.', 'Seldom feel blue.'],
  ['b20', 'O', true, 'ليس لديّ خيال جيد.', 'Do not have a good imagination.'],
];

export const big5 = {
  id: 'big5',
  minutes: 3,
  scale: 'accurate',
  name: { ar: 'العوامل الخمسة الكبرى (Big Five)', en: 'Big Five' },
  blurb: {
    ar: 'النموذج الأقوى علمياً في أبحاث الشخصية: خمس سمات تقيس الدرجة لا النوع.',
    en: 'The best-supported model in personality research: five traits measured by degree, not type.',
  },
  intro: {
    ar: 'صِف نفسك كما أنت عادةً الآن، لا كما تتمنى أن تكون.',
    en: 'Describe yourself as you generally are now, not as you wish to be.',
  },
  items: ITEMS.map(([id, trait, reverse, ar, en]) => ({ id, trait, reverse, text: { ar, en: `I ${en.charAt(0).toLowerCase()}${en.slice(1)}` } })),
};

/** answers: { itemId: 1..5 } → { O, C, E, A, ES } each 0..100 */
export function scoreBig5(answers) {
  const sums = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  for (const item of big5.items) {
    const raw = Number(answers[item.id]);
    if (!(raw >= 1 && raw <= 5)) continue;
    const v = item.reverse ? 6 - raw : raw;
    sums[item.trait] += v;
    counts[item.trait] += 1;
  }
  const pct = (k) => (counts[k] ? Math.round(((sums[k] / counts[k] - 1) / 4) * 100) : 0);
  return { O: pct('O'), C: pct('C'), E: pct('E'), A: pct('A'), ES: counts.N ? 100 - pct('N') : 0 };
}

export function level(score) {
  if (score > 60) return 'high';
  if (score < 40) return 'low';
  return 'mid';
}
