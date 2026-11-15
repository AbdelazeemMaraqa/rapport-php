// Development-plan suggestions drawn from a member's results. All text is original to this app.
// Suggestions are a starting point for a conversation with the member, not a plan imposed on them.
import { discProfile } from './assessments/disc.js';
import { typeProfile } from './assessments/type.js';
import { level } from './assessments/big5.js';
import { buildGuide } from './guidance.js';
import { TYPES16 } from './types16.js';

const L = (ar, en) => ({ ar, en });

const DISC_GROW = {
  D: [
    L('اطلب رأيين على الأقل قبل أي قرار يمس الفريق', 'Ask for at least two views before any decision that affects the team'),
    L('اشرح سبب القرار في جملتين عند إعلانه', 'Explain the reason for a decision in two sentences when announcing it'),
  ],
  I: [
    L('اختم كل اجتماع بقائمة مكتوبة: من يفعل ماذا ومتى', 'End every meeting with a written list: who does what, by when'),
    L('تتبّع الالتزامات في أداة واحدة وراجعها كل أسبوع', 'Track commitments in one tool and review them weekly'),
  ],
  S: [
    L('عبّر عن ملاحظاتك على التغيير في أول أسبوع، لا بعد التطبيق', 'Raise concerns about a change in the first week, not after it lands'),
    L('تولَّ مهمة واحدة خارج منطقة الراحة كل ربع سنة', 'Take on one stretch task outside your comfort zone each quarter'),
  ],
  C: [
    L('حدّد سقفاً زمنياً للتحليل، وقرّر بما يتوفر من معلومات', 'Set a time limit on analysis, then decide with what you have'),
    L('شارك العمل قبل أن يكتمل لتحصل على ملاحظات مبكرة', 'Share work before it is perfect to get early feedback'),
  ],
};

const BIG5_GROW = {
  O: {
    low: L('جرّب أداة أو طريقة جديدة واحدة كل ربع سنة', 'Try one new tool or method each quarter'),
    high: L('اختر فكرة واحدة وأوصلها للنهاية قبل الانتقال لغيرها', 'Pick one idea and finish it before moving to the next'),
  },
  C: {
    low: L('استخدم لوحة مهام مرئية بمواعيد واضحة', 'Use a visible task board with clear dates'),
    high: L('اقبل «الجيد بما يكفي» في الأعمال قليلة المخاطر', "Accept 'good enough' on low-risk work"),
  },
  E: {
    low: L('حضّر نقطة واحدة تشاركها في كل اجتماع', 'Prepare one point to share in every meeting'),
    high: L('اترك مساحة للآخرين: تكلم بعد أن يتكلم اثنان', 'Leave room for others: speak after two people have spoken'),
  },
  A: {
    low: L('اسأل عن قيود الآخرين قبل أن تضغط عليهم', "Ask about others' constraints before pushing"),
    high: L('تدرّب على قول «لا» وعلى الاعتراض المهذب', "Practise saying 'no' and disagreeing politely"),
  },
  ES: {
    low: L('اتفق مع قائدك على إشارات مبكرة لضغط العمل وموعد ثابت للمتابعة', 'Agree early-warning signs of overload with your lead, and a regular check-in'),
    high: L('انتبه لقلق الزملاء حتى لو لم تشعر به أنت', "Notice colleagues' worries even when you don't feel them"),
  },
};

const ONE_ON_ONE = {
  general: [
    L('ما الذي أعطاك طاقة هذا الشهر، وما الذي استنزفها؟', 'What gave you energy this month, and what drained it?'),
    L('ما الذي تريد أن تتعلمه في الأشهر الثلاثة القادمة؟', 'What do you want to learn in the next three months?'),
    L('ما الذي يمكنني فعله، أو التوقف عن فعله، ليساعدك؟', 'What could I do, or stop doing, to help you?'),
  ],
  D: [L('أين تحتاج صلاحية أكبر لتتحرك أسرع؟', 'Where do you need more authority to move faster?'), L('ما القرار الذي تأخر بسبب غيرك؟', 'Which decision was delayed because of someone else?')],
  I: [L('من الذي تحب العمل معه أكثر، ولماذا؟', 'Who do you most enjoy working with, and why?'), L('أي التزام تأخر، وما الذي أبعدك عنه؟', 'Which commitment slipped, and what pulled you away?')],
  S: [L('أي تغيير قادم يقلقك؟', 'Which upcoming change worries you?'), L('هل تحمل عملاً أكثر مما يرى الآخرون؟', 'Are you carrying more work than others can see?')],
  C: [L('أين تشعر أن معايير الجودة غير واضحة؟', 'Where do quality standards feel unclear?'), L('ما المعلومات التي تنقصك لتقرر بثقة؟', 'What information do you need to decide with confidence?')],
};

const take = (arr, n) => arr.slice(0, n);

/**
 * Suggestions for one member: { strengths, growth, goals, support, questions }, each a list of { ar, en }.
 * strengths/growth come from the guide; goals are concrete practice ideas; support is how the lead can help.
 */
export function suggestions(results = {}) {
  const { guide } = buildGuide(results);
  const dp = results.disc ? discProfile(results.disc) : null;
  const tp = results.type ? typeProfile(results.type) : null;
  const portrait = tp ? TYPES16[tp.code] : null;

  const goals = [];
  const seen = new Set();
  const push = (x) => {
    if (x && !seen.has(x.en)) {
      seen.add(x.en);
      goals.push(x);
    }
  };
  if (dp) DISC_GROW[dp.primary].forEach(push);
  if (portrait) portrait.develop.forEach(push);
  if (results.big5) {
    for (const k of Object.keys(BIG5_GROW)) {
      const lv = level(results.big5[k]);
      if (lv !== 'mid') push(BIG5_GROW[k][lv]);
    }
  }

  const support = [];
  const seenS = new Set();
  for (const line of [...(portrait?.lead || []), ...(guide.motivate || []).map((l) => l.text), ...(guide.delegate || []).map((l) => l.text)]) {
    if (!seenS.has(line.en)) {
      seenS.add(line.en);
      support.push(line);
    }
  }

  return {
    strengths: take((guide.strengths || []).map((l) => l.text), 4),
    growth: take((guide.watch || []).map((l) => l.text), 4),
    goals: take(goals, 6),
    support: take(support, 4),
    questions: [...ONE_ON_ONE.general, ...(dp ? ONE_ON_ONE[dp.primary] : [])],
  };
}

export function emptyRecord() {
  return {
    info: { team: '', email: '', phone: '', startDate: '', about: '' },
    plan: { focus: '', goals: [], support: '', review: '' },
    notes: [],
    updatedAt: '',
  };
}

/** Fill any missing fields so older or partial records render safely. */
export function normalizeRecord(rec) {
  const e = emptyRecord();
  if (!rec || typeof rec !== 'object') return e;
  return {
    info: { ...e.info, ...(rec.info || {}) },
    plan: { ...e.plan, ...(rec.plan || {}), goals: Array.isArray(rec.plan?.goals) ? rec.plan.goals : [] },
    notes: Array.isArray(rec.notes) ? rec.notes : [],
    updatedAt: rec.updatedAt || '',
  };
}

export function planStats(rec) {
  const goals = rec?.plan?.goals || [];
  return {
    total: goals.length,
    done: goals.filter((g) => g.status === 'done').length,
    open: goals.filter((g) => g.status !== 'done').length,
    review: rec?.plan?.review || '',
    notes: (rec?.notes || []).length,
  };
}
