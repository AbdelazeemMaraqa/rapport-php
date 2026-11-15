// Original guidance content for leads. Every string is bilingual: { ar, en }.
import { discProfile } from './assessments/disc.js';
import { typeProfile } from './assessments/type.js';
import { level } from './assessments/big5.js';

const L = (ar, en) => ({ ar, en });

export const DISC = {
  D: {
    name: L('الحسم', 'Dominance'),
    tagline: L('يريد النتيجة، الآن', 'Wants the result, now'),
    summary: L(
      'يتحرك بسرعة نحو النتيجة، ويرتاح لاتخاذ القرار وتحمّل المخاطرة. يتواصل بشكل مباشر وقد يبدو حاداً دون أن يقصد.',
      'Moves fast toward results and is comfortable deciding and taking risks. Communicates directly and can come across as blunt without meaning to.'
    ),
    strengths: [
      L('يحسم القرارات ولا يترك الأمور معلّقة', "Makes decisions and doesn't leave things hanging"),
      L('يتولى المسؤولية في الأزمات والمواقف الغامضة', 'Takes ownership in crises and unclear situations'),
      L('يدفع الفريق نحو أهداف طموحة', 'Pushes the team toward ambitious goals'),
    ],
    watch: [
      L('قد يتخذ القرار قبل سماع الآخرين', 'May decide before hearing others out'),
      L('قد تبدو مباشرته جارحة لبعض الزملاء', 'Their directness can land as harsh for some colleagues'),
      L('قد يتجاوز التفاصيل والإجراءات ليصل أسرع', 'May skip details and process to get there faster'),
    ],
    communicate: [
      L('ابدأ بالخلاصة، وأعطِ التفاصيل عند الطلب', 'Lead with the bottom line; give detail on request'),
      L('اعرض خيارات واضحة ودعه يختار', 'Offer clear options and let them choose'),
      L('اجعل الاجتماعات والرسائل قصيرة ومحددة', 'Keep meetings and messages short and specific'),
    ],
    motivate: [
      L('أهداف صعبة وصلاحية حقيقية على النتيجة', 'Stretch goals and real authority over the outcome'),
      L('ربط عمله بأثر واضح وقابل للقياس', 'A clear, measurable link between their work and its impact'),
    ],
    feedback: [
      L('كن مباشراً وواضحاً، ولا تلفّ حول الموضوع', "Be direct and plain; don't talk around the point"),
      L('ركّز على أثر السلوك على النتائج', 'Focus on how the behaviour affects results'),
    ],
    delegate: [
      L('حدّد الهدف والحدود، واترك له الطريقة', 'Set the goal and the boundaries; leave the method to them'),
      L('اتفقا مسبقاً على القرارات التي ترجع إليك', 'Agree up front which decisions come back to you'),
    ],
    conflict: [
      L('عالج الخلاف بسرعة ووجهاً لوجه', 'Deal with disagreement quickly and face to face'),
      L('ناقش بالحقائق، ولا تأخذ حدّته على محمل شخصي', "Argue with facts and don't take their sharpness personally"),
    ],
    stress: [
      L('البطء والتردد', 'Slow pace and indecision'),
      L('فقدان السيطرة أو الإدارة التفصيلية', 'Losing control, or being micromanaged'),
    ],
    avoid: [
      L('الشرح الطويل قبل الوصول إلى النقطة', 'Long explanations before getting to the point'),
      L('سحب الصلاحية منه دون تفسير', 'Taking authority away without explanation'),
    ],
  },
  I: {
    name: L('التأثير', 'Influence'),
    tagline: L('يحرّك الناس بالحماس', 'Moves people with enthusiasm'),
    summary: L(
      'يبني العلاقات بسرعة ويحمّس الآخرين للأفكار. يحب التفاعل والتقدير، وقد تضيع منه التفاصيل والمتابعة.',
      'Builds relationships fast and gets people excited about ideas. Thrives on interaction and recognition, and may let details and follow-through slip.'
    ),
    strengths: [
      L('يرفع حماس الفريق ومعنوياته', "Lifts the team's energy and morale"),
      L('يقنع ويبني جسوراً مع الفرق الأخرى', 'Persuades and builds bridges with other teams'),
      L('يولّد أفكاراً كثيرة بسرعة', 'Generates many ideas quickly'),
    ],
    watch: [
      L('قد يَعِد بأكثر مما يستطيع إنجازه', 'May promise more than they can deliver'),
      L('قد تضعف متابعته للتفاصيل والمواعيد', 'Follow-through on details and deadlines can slip'),
      L('قد يتجنب نقل الأخبار السيئة', 'May avoid delivering bad news'),
    ],
    communicate: [
      L('ابدأ بالجانب الإنساني والصورة الكبيرة قبل التفاصيل', 'Open with the people side and the big picture before details'),
      L('اترك له مساحة للحديث، ثم وثّق الاتفاق كتابياً', 'Give them room to talk, then confirm agreements in writing'),
    ],
    motivate: [
      L('التقدير العلني لإنجازاته', 'Public recognition of their wins'),
      L('مهام فيها تواصل وتعاون وظهور', 'Work with interaction, collaboration and visibility'),
    ],
    feedback: [
      L('ابدأ بنقطة إيجابية صادقة ثم كن محدداً', 'Start with a genuine positive, then be specific'),
      L('انتقد على انفراد دائماً، لا أمام الآخرين', 'Always criticise in private, never in front of others'),
    ],
    delegate: [
      L('أشركه في العصف الذهني وأعطه المهام التي تتعامل مع الناس', 'Involve them in brainstorming; give them the people-facing work'),
      L('اتفقا على نقاط متابعة ومواعيد واضحة', 'Agree on check-ins and clear deadlines'),
    ],
    conflict: [
      L('حافظ على نبرة إيجابية وعلى العلاقة', 'Keep the tone positive and protect the relationship'),
      L('عالج الخلاف على انفراد', 'Handle it one to one'),
    ],
    stress: [
      L('العزلة أو العمل الطويل منفرداً', 'Isolation or long stretches of solo work'),
      L('الرفض أو النقد أمام الآخرين', 'Rejection, or criticism in front of others'),
    ],
    avoid: [
      L('النبرة الباردة والرسمية الجافة', 'A cold, overly formal tone'),
      L('إطفاء حماسه بالتفاصيل منذ البداية', 'Shutting down their enthusiasm with details from the start'),
    ],
  },
  S: {
    name: L('الثبات', 'Steadiness'),
    tagline: L('هادئ وصبور ويمكن الاعتماد عليه', 'Steady, patient and dependable'),
    summary: L(
      'هادئ وصبور ويمكن الاعتماد عليه. يقدّر الاستقرار وانسجام الفريق، ويحتاج وقتاً ليتقبّل التغيير.',
      'Calm, patient and dependable. Values stability and team harmony, and needs time to adjust to change.'
    ),
    strengths: [
      L('ثابت وموثوق في التسليم', 'Consistent and reliable in delivery'),
      L('مستمع جيد ويدعم زملاءه', 'A good listener who supports colleagues'),
      L('يحافظ على تماسك الفريق', 'Holds the team together'),
    ],
    watch: [
      L('قد يقاوم التغيير أو يتأخر في تقبّله', 'May resist change or be slow to accept it'),
      L('قد يتجنب الخلاف ويخفي اعتراضه', 'May avoid conflict and keep disagreement to themselves'),
      L('قد يقبل أكثر مما يستطيع لأنه لا يحب الرفض', 'May take on too much because they dislike saying no'),
    ],
    communicate: [
      L('تحدّث بهدوء وصدق، وأعطِ السياق والسبب', 'Speak calmly and sincerely; give context and the why'),
      L('اسأله عن رأيه صراحةً، فقد لا يبادر بقوله', 'Ask for their opinion directly; they may not volunteer it'),
    ],
    motivate: [
      L('التقدير الشخصي المستمر لجهده', 'Steady, personal appreciation of their effort'),
      L('توقعات واضحة وبيئة مستقرة', 'Clear expectations and a stable environment'),
    ],
    feedback: [
      L('على انفراد، وبلطف، وبأمثلة محددة', 'Privately, gently, and with specific examples'),
      L('طمئنه أن العلاقة بخير، وامنحه وقتاً للتفكير', 'Reassure them the relationship is fine, and give them time to process'),
    ],
    delegate: [
      L('خطوات واضحة وسبب المهمة', 'Clear steps and the reason behind the task'),
      L('لا تبدّل أولوياته فجأة، وأخبره مبكراً بأي تغيير', "Don't switch priorities suddenly; warn early of any change"),
    ],
    conflict: [
      L('قد يوافق ظاهرياً وهو غير مقتنع، فارجع إليه لاحقاً على انفراد', 'They may agree on the surface while unconvinced, so check back privately'),
    ],
    stress: [
      L('التغيير المفاجئ والضغط للقرار الفوري', 'Sudden change and pressure to decide on the spot'),
      L('الخلافات المفتوحة في الفريق', 'Open conflict in the team'),
    ],
    avoid: [
      L('المفاجآت في الاجتماعات العامة', 'Surprises in group meetings'),
      L('النبرة الحادة أو الاستعجال المستمر', 'A harsh tone or constant rushing'),
    ],
  },
  C: {
    name: L('الدقة', 'Conscientiousness'),
    tagline: L('يريد أن يكون العمل صحيحاً', 'Wants it done right'),
    summary: L(
      'يهتم بالدقة والجودة والمنطق. يحلّل قبل أن يقرر، ويتوقع معايير واضحة، وقد يبطئه السعي إلى الكمال.',
      'Cares about accuracy, quality and logic. Analyses before deciding, expects clear standards, and can be slowed by perfectionism.'
    ),
    strengths: [
      L('دقيق ويلتقط الأخطاء مبكراً', 'Precise; catches errors early'),
      L('يحلّل المخاطر ويخطط بعناية', 'Analyses risks and plans carefully'),
      L('يرفع معايير الجودة في الفريق', "Raises the team's quality bar"),
    ],
    watch: [
      L('قد يتأخر في القرار طلباً لمعلومات أكثر', 'May delay decisions while seeking more information'),
      L('قد يبدو ناقداً أو متحفظاً', 'Can come across as critical or reserved'),
      L('قد يتضايق من الغموض والتغيير المتكرر', 'Can be frustrated by ambiguity and frequent change'),
    ],
    communicate: [
      L('كن منظماً ودقيقاً، ويُفضَّل كتابياً', 'Be structured and precise, preferably in writing'),
      L('قدّم البيانات والأسباب، وأعطه وقتاً للتحليل', 'Bring data and reasoning, and allow time to analyse'),
    ],
    motivate: [
      L('معايير جودة واضحة ووقت كافٍ لإتقان العمل', 'Clear quality standards and enough time to do it right'),
      L('تقدير خبرته ودقته', 'Recognition of their expertise and precision'),
    ],
    feedback: [
      L('محددة ومبنية على أدلة، وموجهة للعمل لا للشخص', 'Specific and evidence-based, about the work and not the person'),
      L('تجنّب المديح العام غير المحدد', 'Avoid vague, general praise'),
    ],
    delegate: [
      L('متطلبات ومعايير قبول واضحة ومكتوبة', 'Clear, written requirements and acceptance criteria'),
      L('لا تغيّر المواصفات في منتصف الطريق دون سبب', "Don't change the spec midway without a reason"),
    ],
    conflict: [
      L('استخدم المنطق والأدلة لا الضغط العاطفي', 'Use logic and evidence, not emotional pressure'),
      L('أعطه وقتاً للتحضير قبل النقاش', 'Give them time to prepare before the discussion'),
    ],
    stress: [
      L('الغموض والقرارات المستعجلة', 'Ambiguity and rushed decisions'),
      L('انتقاد جودة عمله دون دليل', 'Criticism of their work without evidence'),
    ],
    avoid: [
      L('الطلبات المبهمة', 'Vague requests'),
      L('الضغط للقرار دون بيانات', 'Pressure to decide without data'),
    ],
  },
};

export const POLE = {
  E: {
    name: L('الانبساط', 'Extraversion'),
    desc: L('يستمد طاقته من التفاعل ويفكر بصوت عالٍ', 'Draws energy from interaction and thinks out loud'),
    communicate: L('ناقش الأفكار معه مباشرة أو في مكالمة سريعة', 'Talk ideas through live or in a quick call'),
    work: L('أشركه في النقاشات الجماعية والعصف الذهني', 'Include them in group discussions and brainstorming'),
    strength: L('يحرّك النقاش ويبني العلاقات بسرعة', 'Gets discussion going and builds relationships quickly'),
    watch: L('قد يطغى صوته على الزملاء الأهدأ', 'Can talk over quieter colleagues'),
  },
  I: {
    name: L('الانطواء', 'Introversion'),
    desc: L('يستمد طاقته من التركيز الهادئ ويفكر قبل أن يتكلم', 'Recharges through quiet focus and thinks before speaking'),
    communicate: L('أرسل جدول الاجتماع والأسئلة مسبقاً، ولا تطلب منه رأياً فورياً أمام الجميع', "Send the agenda and questions in advance; don't put them on the spot in front of everyone"),
    work: L('احمِ وقته للتركيز وقلّل المقاطعات', 'Protect their focus time and limit interruptions'),
    strength: L('يتعمق في التفكير ويستمع جيداً', 'Thinks deeply and listens well'),
    watch: L('قد لا تسمع أفكاره إن لم تسأله عنها', "You may not hear their ideas unless you ask"),
  },
  S: {
    name: L('الواقعية', 'Sensing'),
    desc: L('يثق بالحقائق والتجربة ويهتم بالتفاصيل العملية', 'Trusts facts and experience; attends to practical detail'),
    communicate: L('استخدم أمثلة ملموسة وخطوات واضحة', 'Use concrete examples and clear steps'),
    work: L('أعطه مهام تحتاج دقة وتنفيذاً عملياً', 'Give them work that needs precision and hands-on execution'),
    strength: L('واقعي ويلتقط ما لن ينجح عند التطبيق', "Realistic; spots what won't work in practice"),
    watch: L('قد يتحفّظ على الأفكار الجديدة غير المجربة', 'May be wary of new, untested ideas'),
  },
  N: {
    name: L('الحدس', 'Intuition'),
    desc: L('يرى الأنماط والاحتمالات ويهتم بالصورة الكبيرة', 'Sees patterns and possibilities; focuses on the big picture'),
    communicate: L('ابدأ بالهدف والصورة الكبيرة قبل التفاصيل', 'Start with the purpose and the big picture before details'),
    work: L('أعطه مساحة لتجربة أفكار وحلول جديدة', 'Give them room to try new ideas and solutions'),
    strength: L('يرى الحلول البديلة والاتجاهات المستقبلية', 'Spots alternatives and future directions'),
    watch: L('قد يقفز عن التفاصيل التنفيذية', 'May skip over execution details'),
  },
  T: {
    name: L('التفكير المنطقي', 'Thinking'),
    desc: L('يقرر بالمنطق والمعايير الموضوعية', 'Decides by logic and objective criteria'),
    communicate: L('قدّم الحجة والمعايير بوضوح', 'Lay out the reasoning and criteria clearly'),
    work: L('اشرح منطق القرارات، لا القرار فقط', 'Explain the logic behind decisions, not just the decision'),
    strength: L('موضوعي في تقييم الحلول', 'Objective when weighing options'),
    watch: L('قد يغفل أثر القرار على مشاعر الناس', 'May overlook how a decision lands with people'),
  },
  F: {
    name: L('القيم والمشاعر', 'Feeling'),
    desc: L('يقرر بالقيم وبمراعاة أثر القرار على الناس', 'Decides by values and the impact on people'),
    communicate: L('اذكر أثر القرار على الناس وعلى قيم الفريق', 'Mention how the decision affects people and team values'),
    work: L('عبّر عن تقديرك لمساهمته بصدق', 'Show genuine appreciation for their contribution'),
    strength: L('يلتقط مزاج الفريق ويحافظ على الثقة', "Reads the team's mood and protects trust"),
    watch: L('قد يتجنب القرارات أو الملاحظات الصعبة', 'May avoid hard decisions or tough feedback'),
  },
  J: {
    name: L('التنظيم', 'Judging'),
    desc: L('يحب الخطة الواضحة وحسم الأمور', 'Likes a clear plan and closure'),
    communicate: L('أعطه مواعيد وخطة واضحة، وأبلغه بأي تغيير مبكراً', 'Give clear dates and a plan, and flag any change early'),
    work: L('تجنّب تغيير الأولويات في اللحظة الأخيرة', 'Avoid last-minute priority changes'),
    strength: L('منظم ويلتزم بالمواعيد', 'Organised and meets deadlines'),
    watch: L('قد يحسم قبل أن تكتمل المعلومات', 'May close a decision before all the information is in'),
  },
  P: {
    name: L('المرونة', 'Perceiving'),
    desc: L('يحب المرونة وإبقاء الخيارات مفتوحة', 'Likes flexibility and keeping options open'),
    communicate: L('اعرض خيارات واترك مجالاً للتعديل', 'Offer options and leave room to adjust'),
    work: L('قسّم العمل إلى محطات قصيرة مع متابعة منتظمة', 'Break work into short milestones with regular check-ins'),
    strength: L('يتكيف بسرعة مع التغيير', 'Adapts quickly to change'),
    watch: L('قد يؤجل الحسم حتى اللحظة الأخيرة', 'May put off closing a decision until the last minute'),
  },
};

export const TRAIT = {
  O: {
    name: L('الانفتاح على التجربة', 'Openness'),
    high: {
      desc: L('فضولي ويحب الأفكار والتجارب الجديدة', 'Curious; enjoys new ideas and experiences'),
      tip: L('أعطه مشكلات جديدة ومساحة للاستكشاف', 'Give them novel problems and room to explore'),
      strength: L('يأتي بأفكار وحلول غير تقليدية', 'Brings unconventional ideas and solutions'),
      watch: L('قد يملّ من العمل الروتيني', 'Can get bored with routine work'),
    },
    low: {
      desc: L('عملي ويفضّل الطرق المجرّبة', 'Practical; prefers proven approaches'),
      tip: L('اشرح فائدة أي تغيير بأمثلة عملية', 'Explain the benefit of any change with practical examples'),
      strength: L('يحافظ على الحلول بسيطة ومستقرة', 'Keeps solutions simple and stable'),
      watch: L('قد يتردد أمام الأدوات والأساليب الجديدة', 'May hesitate with new tools and methods'),
    },
  },
  C: {
    name: L('الانضباط', 'Conscientiousness'),
    high: {
      desc: L('منظم ومنضبط ويفي بما يعد به', 'Organised, disciplined and keeps commitments'),
      tip: L('أعطه ملكية الجودة والتخطيط', 'Give them ownership of quality and planning'),
      strength: L('يُعتمد عليه في تسليم عمل متقن', 'Delivers reliably and to standard'),
      watch: L('قد يُثقل نفسه بمعايير عالية جداً', 'May overload themselves with very high standards'),
    },
    low: {
      desc: L('مرن وعفوي في طريقة عمله', 'Flexible and spontaneous in how they work'),
      tip: L('مواعيد واضحة ومتابعة قصيرة ومنتظمة', 'Clear deadlines and short, regular check-ins'),
      strength: L('يتأقلم بسهولة مع تغيّر الأولويات', 'Adapts easily when priorities shift'),
      watch: L('قد تضيع منه المواعيد أو التفاصيل', 'Deadlines or details can slip'),
    },
  },
  E: {
    name: L('الانبساط', 'Extraversion'),
    high: {
      desc: L('اجتماعي ونشيط ويحب التفاعل', 'Sociable and energetic; enjoys interaction'),
      tip: L('أعطه أدواراً فيها تواصل وتمثيل للفريق', 'Give them roles that involve communicating and representing the team'),
      strength: L('يرفع طاقة المجموعة', "Raises the group's energy"),
      watch: L('قد يأخذ المساحة كلها في النقاشات', 'May take up all the space in discussions'),
    },
    low: {
      desc: L('هادئ ويفضّل العمل المركّز', 'Quiet; prefers focused work'),
      tip: L('اطلب رأيه كتابياً أو في جلسة فردية', 'Ask for their input in writing or one to one'),
      strength: L('يركّز بعمق لفترات طويلة', 'Focuses deeply for long stretches'),
      watch: L('قد تمر مساهماته دون أن يلاحظها أحد', 'Their contributions can go unnoticed'),
    },
  },
  A: {
    name: L('التوافق', 'Agreeableness'),
    high: {
      desc: L('متعاون ومراعٍ ويثق بالآخرين', 'Cooperative, considerate and trusting'),
      tip: L('شجّعه صراحةً على قول اعتراضه', 'Explicitly invite them to voice disagreement'),
      strength: L('يبني الثقة ويسهّل العمل المشترك', 'Builds trust and eases collaboration'),
      watch: L('قد يجامل ويتجنب قول «لا»', 'May go along to get along and avoid saying no'),
    },
    low: {
      desc: L('صريح وناقد ويقول رأيه بوضوح', 'Candid, critical and outspoken'),
      tip: L('وجّه تفكيره النقدي إلى مراجعة الحلول والمخاطر', 'Channel their critical thinking into reviewing designs and risks'),
      strength: L('يتحدى الأفكار الضعيفة ولا يجامل', "Challenges weak ideas and doesn't sugar-coat"),
      watch: L('قد تسبب صراحته احتكاكاً مع الزملاء', 'Their bluntness can cause friction with colleagues'),
    },
  },
  ES: {
    name: L('الاتزان الانفعالي', 'Emotional stability'),
    high: {
      desc: L('هادئ تحت الضغط ولا يتأثر بسهولة', 'Calm under pressure and not easily rattled'),
      tip: L('يمكن الاعتماد عليه في فترات الضغط والأزمات', 'A good anchor in high-pressure periods'),
      strength: L('يحافظ على هدوئه في الأزمات', 'Stays composed in a crisis'),
      watch: L('قد لا يُظهر أنه مثقل بالعمل حتى يتأخر الوقت', "May not show they're overloaded until it's late"),
    },
    low: {
      desc: L('يشعر بالضغط أكثر من غيره ويلتقط المخاطر مبكراً', 'Feels pressure more strongly and picks up on risks early'),
      tip: L('وضّح التوقعات، وأبلغه بالتغييرات مبكراً، وادعمه في فترات الضغط', 'Make expectations clear, give early notice of changes, and offer support in busy periods'),
      strength: L('ينبّه إلى المخاطر قبل غيره', 'Flags risks before others do'),
      watch: L('قد يستنزفه الضغط المستمر', 'Sustained pressure can wear them down'),
    },
  },
};

// DISC pairs, keyed in D-I-S-C order.
export const PAIRS = {
  DD: { together: L('سرعة وحسم وتركيز على النتيجة', 'Speed, decisiveness and a focus on results'), friction: L('صراع على السيطرة ومن يقرر', 'A tug-of-war over control and who decides'), tip: L('حدّدا مسبقاً من يملك أي قرار', 'Agree up front who owns which decision') },
  DI: { together: L('طاقة عالية وحركة سريعة', 'High energy and fast movement'), friction: L('الأول يريد النتيجة، والثاني يريد التفاعل والتقدير', 'One wants results; the other wants engagement and recognition'), tip: L('اترك مساحة للحديث، ثم ثبّت الالتزامات كتابياً', 'Leave room to talk, then pin commitments down in writing') },
  DS: { together: L('دفع إلى الأمام مع ثبات في التنفيذ', 'Forward drive plus steady execution'), friction: L('سرعة D وحدّته قد تُربك S', "D's speed and bluntness can unsettle S"), tip: L('أبطئ الإيقاع، وأعطِ إنذاراً مسبقاً بالتغيير، واسأل عن الرأي صراحةً', 'Slow the pace, give notice of change, and ask for their view directly') },
  DC: { together: L('قرار سريع مدعوم بتحليل دقيق', 'Fast decisions backed by careful analysis'), friction: L('D يريد الحسم وC يريد مزيداً من البيانات', 'D wants to decide; C wants more data'), tip: L('اتفقا مسبقاً على معيار «جيد بما يكفي» وعلى موعد للحسم', "Agree in advance on a 'good enough' bar and a decision date") },
  II: { together: L('أفكار كثيرة وحماس مشترك', 'Lots of ideas and shared enthusiasm'), friction: L('قد تضيع المتابعة والتفاصيل', 'Follow-through and details can get lost'), tip: L('عيّنا مسؤولاً وموعداً لكل فكرة تُعتمد', 'Name an owner and a date for every idea you adopt') },
  IS: { together: L('علاقة دافئة وثقة متبادلة', 'A warm relationship and mutual trust'), friction: L('قد يتجنب الاثنان المواضيع الصعبة', 'Both may avoid difficult topics'), tip: L('حدّدا جلسة صريحة منتظمة للمواضيع غير المريحة', 'Schedule a regular, candid check-in for uncomfortable topics') },
  IC: { together: L('حماس متوازن بالدقة', 'Enthusiasm balanced by precision'), friction: L('I يتحدث بالعموميات وC يريد التفاصيل والدليل', 'I speaks in broad strokes; C wants detail and evidence'), tip: L('احضر بالحقائق، وتابع كتابياً، واحترم الحاجة إلى التفاصيل', 'Bring facts, follow up in writing, and respect the need for detail') },
  SS: { together: L('انسجام وثقة واستقرار', 'Harmony, trust and stability'), friction: L('بطء في القرارات وتجنّب للخلاف', 'Slow decisions and avoided conflict'), tip: L('ضعا مواعيد للحسم وشجّعا الاعتراض الصريح', 'Set decision deadlines and encourage open disagreement') },
  SC: { together: L('عمل متقن ومستقر', 'Careful, stable work'), friction: L('مقاومة مشتركة للتغيير', 'Shared resistance to change'), tip: L('خطّطا للتغيير مبكراً، بسبب واضح وخطوات صغيرة', 'Plan change early, with a clear reason and small steps') },
  CC: { together: L('جودة عالية وتحليل عميق', 'High quality and deep analysis'), friction: L('قد يطول التحليل ويتأخر الحسم', 'Analysis can drag on and decisions stall'), tip: L('حدّدا وقتاً للتحليل ثم احسما', 'Time-box the analysis, then decide') },
};

export function pairFor(a, b) {
  if (!a || !b) return null;
  const order = 'DISC';
  const key = [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join('');
  return PAIRS[key] || null;
}

export const SECTIONS = ['communicate', 'motivate', 'feedback', 'delegate', 'conflict', 'workstyle', 'strengths', 'watch', 'stress', 'avoid'];
const CAPS = { communicate: 5, motivate: 3, feedback: 3, delegate: 3, conflict: 3, workstyle: 4, strengths: 5, watch: 5, stress: 3, avoid: 3 };

/**
 * Merge all available results into one guide. Each line: { text: {ar,en}, src: 'DISC'|'Type'|'Big Five' }.
 */
export function buildGuide(results) {
  // Collect lines per source, then interleave them so the caps don't drop a whole assessment.
  const buckets = { primary: {}, Type: {}, 'Big Five': {}, secondary: {} };
  for (const b of Object.values(buckets)) for (const s of SECTIONS) b[s] = [];
  const srcBucket = { DISC: 'primary', Type: 'Type', 'Big Five': 'Big Five' };
  let secondaryPhase = false;
  const add = (section, text, src) => {
    if (!text) return;
    buckets[secondaryPhase ? 'secondary' : srcBucket[src]][section].push({ text, src });
  };

  const dp = results?.disc ? discProfile(results.disc) : null;
  if (dp) {
    const p = DISC[dp.primary];
    for (const s of ['communicate', 'motivate', 'feedback', 'delegate', 'conflict', 'strengths', 'watch', 'stress', 'avoid']) {
      for (const line of p[s]) add(s, line, 'DISC');
    }
  }

  const tp = results?.type ? typeProfile(results.type) : null;
  if (tp) {
    for (const d of tp.dims) {
      if (d.balanced) continue;
      const pole = POLE[d.letter];
      add('communicate', pole.communicate, 'Type');
      add('workstyle', pole.work, 'Type');
      add('strengths', pole.strength, 'Type');
      add('watch', pole.watch, 'Type');
    }
  }

  if (results?.big5) {
    for (const [k, def] of Object.entries(TRAIT)) {
      const lv = level(results.big5[k]);
      if (lv === 'mid') continue;
      const block = def[lv];
      add('workstyle', block.tip, 'Big Five');
      add('strengths', block.strength, 'Big Five');
      add('watch', block.watch, 'Big Five');
    }
  }

  if (dp?.secondary) {
    secondaryPhase = true;
    const s = DISC[dp.secondary];
    for (const sec of ['communicate', 'motivate', 'strengths', 'watch']) add(sec, s[sec][0], 'DISC');
  }

  const guide = {};
  const seen = new Set();
  for (const s of SECTIONS) {
    const lists = [buckets.primary[s], buckets.Type[s], buckets['Big Five'][s], buckets.secondary[s]];
    const out = [];
    for (let i = 0; out.length < CAPS[s] && lists.some((l) => i < l.length); i++) {
      for (const l of lists) {
        const line = l[i];
        if (!line || seen.has(line.text.en) || out.length >= CAPS[s]) continue;
        seen.add(line.text.en);
        out.push(line);
      }
    }
    guide[s] = out;
  }
  return { guide, disc: dp, type: tp };
}

/** A one-paragraph description of a four-letter type, composed from its poles. */
export function typeSummary(tp, lang) {
  if (!tp) return '';
  const parts = tp.dims.map((d, i) => {
    let s = POLE[d.letter].desc[lang];
    if (lang === 'en' && i > 0) s = s.charAt(0).toLowerCase() + s.slice(1);
    return s + (d.balanced ? (lang === 'ar' ? ' (بفارق بسيط)' : ' (only slightly)') : '');
  });
  return parts.join(lang === 'ar' ? '، و' : '; ') + '.';
}
