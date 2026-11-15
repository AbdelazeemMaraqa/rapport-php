import { disc, scoreDisc } from './disc.js';
import { type, scoreType } from './type.js';
import { big5, scoreBig5 } from './big5.js';

export const ASSESSMENTS = [disc, type, big5];
export const BY_ID = { disc, type, big5 };
export const SCORERS = { disc: scoreDisc, type: scoreType, big5: scoreBig5 };

export const SCALES = {
  agree: {
    ar: ['لا أوافق بشدة', 'لا أوافق', 'محايد', 'أوافق', 'أوافق بشدة'],
    en: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  },
  accurate: {
    ar: ['لا ينطبق عليّ إطلاقاً', 'لا ينطبق غالباً', 'بين بين', 'ينطبق غالباً', 'ينطبق عليّ تماماً'],
    en: ['Very inaccurate', 'Mostly inaccurate', 'In between', 'Mostly accurate', 'Very accurate'],
  },
  bipolar: {
    ar: ['الأولى تماماً', 'أميل للأولى', 'بين الاثنتين', 'أميل للثانية', 'الثانية تماماً'],
    en: ['Fully the first', 'Lean to the first', 'Between both', 'Lean to the second', 'Fully the second'],
  },
};

export function isComplete(id, answers) {
  const a = BY_ID[id];
  return !!a && !!answers && a.items.every((item) => answers[item.id] >= 1 && answers[item.id] <= 5);
}

export function answeredCount(id, answers) {
  const a = BY_ID[id];
  if (!a || !answers) return 0;
  return a.items.filter((item) => answers[item.id] >= 1 && answers[item.id] <= 5).length;
}
