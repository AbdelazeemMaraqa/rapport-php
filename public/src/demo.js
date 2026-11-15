// A fictional demo team so the lead can try the dashboard and exports before real results arrive.
// Stored on the lead's device only and always marked as demo.
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const iso = (offset) => new Date(Date.now() + offset * 86400000).toISOString();

const raw = [
  ['لينا', 'Product Designer', { D: 38, I: 81, S: 66, C: 42 }, { EI: -46, SN: 58, TF: 40, JP: 34 }, { O: 84, C: 46, E: 72, A: 78, ES: 55 }],
  ['سامر', 'Backend Engineer', { D: 44, I: 25, S: 52, C: 86 }, { EI: 52, SN: -40, TF: -48, JP: -58 }, { O: 48, C: 82, E: 30, A: 55, ES: 68 }],
  ['ريم', 'QA Lead', { D: 30, I: 46, S: 84, C: 74 }, { EI: 34, SN: -52, TF: 30, JP: -44 }, { O: 42, C: 76, E: 44, A: 82, ES: 40 }],
  ['خالد', 'Engineering Manager', { D: 88, I: 60, S: 28, C: 52 }, { EI: -50, SN: 36, TF: -56, JP: -40 }, { O: 70, C: 72, E: 76, A: 38, ES: 74 }],
  ['نور', 'Frontend Developer', { D: 52, I: 78, S: 40, C: 36 }, { EI: -62, SN: -30, TF: 28, JP: 54 }, { O: 66, C: 34, E: 84, A: 70, ES: 62 }],
  ['مالك', 'Data Analyst', { D: 62, I: 22, S: 34, C: 80 }, { EI: 58, SN: 48, TF: -62, JP: 30 }, { O: 86, C: 58, E: 24, A: 42, ES: 58 }],
];

export const DEMO_MEMBERS = raw.map(([name, role, disc, type, big5], i) => ({
  id: 'demo-' + (i + 1),
  name,
  role,
  lang: 'ar',
  results: { disc, type, big5 },
  completedAt: { disc: iso(-9 + i), type: iso(-8 + i), big5: iso(-8 + i) },
  updatedAt: iso(-8 + i),
  source: 'demo',
}));

export const DEMO_RECORDS = {
  'demo-2': {
    info: { team: 'Platform squad', email: '', phone: '', startDate: '2024-03-10', about: '' },
    plan: {
      focus: 'أن يشارك تصميماته مبكراً، وأن يقود مراجعة كود واحدة أسبوعياً.',
      goals: [
        { id: 'g1', text: 'عرض تصميم الخدمة الجديدة كمسودة قبل التنفيذ', measure: 'ملاحظات من شخصين على الأقل', due: day(14), status: 'doing' },
        { id: 'g2', text: 'قيادة مراجعة كود أسبوعية للفريق', measure: '4 مراجعات خلال الشهر', due: day(30), status: 'todo' },
      ],
      support: 'وقت ثابت للتركيز، وتعريفه بفريق المنتج.',
      review: day(21),
    },
    notes: [{ id: 'n1', date: day(-3), text: 'مرتاح لطريقة العمل الحالية، ويريد فرصة أكبر في قرارات التصميم.' }],
    updatedAt: iso(-3),
  },
  'demo-4': {
    info: { team: 'Engineering', email: '', phone: '', startDate: '2022-09-01', about: '' },
    plan: {
      focus: 'أن يترك مساحة أكبر لفريقه في القرارات.',
      goals: [{ id: 'g1', text: 'طلب رأيين على الأقل قبل أي قرار يمس الفريق', measure: '', due: day(28), status: 'todo' }],
      support: '',
      review: day(28),
    },
    notes: [],
    updatedAt: iso(-1),
  },
};
