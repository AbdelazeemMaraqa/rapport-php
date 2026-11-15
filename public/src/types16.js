// Portraits of the 16 four-letter types. All names and text are original to this app.
// They describe common tendencies of people who share a pattern of preferences, not fixed categories.
const L = (ar, en) => ({ ar, en });

export const GROUPS = {
  NT: {
    name: L('الاستراتيجيون', 'Strategists'),
    desc: L('يحبون الفهم العميق والأنظمة الذكية، ويقيسون الأفكار بالمنطق.', 'Drawn to deep understanding and smart systems; they test ideas with logic.'),
  },
  NF: {
    name: L('المرشدون', 'Mentors'),
    desc: L('يحرّكهم المعنى والناس، ويبحثون عن الأثر الذي يتركه العمل.', 'Driven by meaning and people; they look for the impact the work leaves.'),
  },
  SJ: {
    name: L('الأمناء', 'Stewards'),
    desc: L('يحمون النظام والجودة والالتزام، ويعتمد عليهم الفريق.', 'Guard order, quality and commitments; the team leans on them.'),
  },
  SP: {
    name: L('صُنّاع الفعل', 'Makers'),
    desc: L('عمليون وسريعو الاستجابة، يتعلمون بالتجربة المباشرة.', 'Practical and quick to respond; they learn by doing.'),
  },
};

/** NT, NF, SJ or SP for a four-letter code. */
export function groupOf(code) {
  if (!code || code.length !== 4) return null;
  return code[1] === 'N' ? 'N' + code[2] : 'S' + code[3];
}

export const TYPES16 = {
  INTJ: {
    name: L('المخطِّط بعيد المدى', 'The Long-Range Planner'),
    summary: L(
      'يرى إلى أين يجب أن تصل الأمور بعد سنة، ويبني الطريق إليها بهدوء. مستقل في تفكيره، ويثق بالخطة المدروسة أكثر من الحماس.',
      'Sees where things should be a year from now and quietly builds the road there. Independent in thought; trusts a well-reasoned plan more than enthusiasm.'
    ),
    strengths: [
      L('يربط القرارات اليومية بهدف بعيد', 'Connects daily decisions to a long-term goal'),
      L('يكتشف نقاط الضعف في الخطط مبكراً', 'Spots weak points in plans early'),
      L('يعمل باستقلالية عالية دون متابعة لصيقة', 'Works with high independence, without close supervision'),
    ],
    watch: [
      L('قد يبدو بارداً أو غير صبور مع من لا يرى ما يراه', "Can seem cold or impatient with people who don't see what they see"),
      L('قد يتمسك بخطته ويتأخر في إشراك الآخرين', 'May hold on to their plan and involve others late'),
    ],
    thrives: L('مشكلات معقدة، وصلاحية على الطريقة، ووقت للتفكير المتواصل.', 'Complex problems, authority over the method, and time for uninterrupted thinking.'),
    lead: [
      L('ناقشه في المنطق والأولويات، لا في التفاصيل الصغيرة', 'Engage them on reasoning and priorities, not small details'),
      L('اطلب منه أن يشرح خطته للفريق مبكراً، لا بعد اكتمالها', 'Ask them to share their plan with the team early, not once it is finished'),
    ],
    develop: [
      L('عرض الأفكار وهي مسودات لجمع آراء مبكرة', 'Share ideas as drafts to gather early input'),
      L('التدرّب على شرح «لماذا» بلغة يفهمها غير المتخصص', "Practise explaining the 'why' in plain language"),
    ],
  },
  INTP: {
    name: L('مفكّر الأنظمة', 'The System Thinker'),
    summary: L(
      'يريد أن يفهم كيف يعمل الشيء من الداخل. يحلل بعمق، ويحب النماذج والحلول الأنيقة، ويسأل «لماذا» قبل «كيف».',
      "Wants to understand how things work from the inside. Analyses deeply, enjoys models and elegant solutions, and asks 'why' before 'how'."
    ),
    strengths: [
      L('يحل المشكلات الغامضة التي لا حل جاهزاً لها', 'Solves fuzzy problems that have no ready answer'),
      L('يكتشف التناقضات في الأفكار والأنظمة', 'Finds contradictions in ideas and systems'),
      L('يبني أدوات ونماذج تبسّط العمل المعقد', 'Builds tools and models that simplify complex work'),
    ],
    watch: [
      L('قد يستمر في التحليل بعد أن يكفي ما لديه لاتخاذ القرار', 'May keep analysing past the point where there is enough to decide'),
      L('قد يفقد اهتمامه بعد حل الجزء الممتع من المشكلة', 'May lose interest once the interesting part is solved'),
    ],
    thrives: L('حرية في الاستكشاف، وأسئلة صعبة، وقليل من الاجتماعات والقواعد غير المبررة.', 'Freedom to explore, hard questions, and few meetings or unexplained rules.'),
    lead: [
      L('أعطه المشكلة لا الحل، واتفقا على موعد للنتيجة', 'Give them the problem, not the solution, and agree a date for the result'),
      L('ساعده على تحويل الفكرة إلى خطوات تسليم واضحة', 'Help them turn the idea into clear delivery steps'),
    ],
    develop: [
      L('تحديد «الحل الكافي» مسبقاً والتوقف عنده', "Define 'good enough' up front and stop there"),
      L('إنهاء العمل حتى التوثيق والتسليم', 'Carry work through to documentation and handover'),
    ],
  },
  ENTJ: {
    name: L('المُحرِّك', 'The Mobilizer'),
    summary: L(
      'يرى الهدف وينظّم الناس والموارد للوصول إليه بسرعة. حاسم ومباشر، ويحب أن تتحول النقاشات إلى قرارات.',
      'Sees the goal and organises people and resources to reach it fast. Decisive and direct; likes discussions to end in decisions.'
    ),
    strengths: [
      L('يحوّل الرؤية إلى خطة ومسؤوليات ومواعيد', 'Turns a vision into a plan, owners and dates'),
      L('يتخذ القرارات الصعبة ولا يتركها معلقة', "Makes hard calls and doesn't leave them hanging"),
      L('يرفع سقف التوقعات ويدفع الفريق للأفضل', 'Raises the bar and pushes the team to do better'),
    ],
    watch: [
      L('قد يتجاوز مشاعر الناس في طريقه إلى النتيجة', 'Can run over people’s feelings on the way to the result'),
      L('قد يقاطع أو يحسم قبل أن يتكلم الأهدأ', 'May interrupt or decide before quieter people speak'),
    ],
    thrives: L('أهداف طموحة، وصلاحية حقيقية، وفريق يتحرك بسرعة.', 'Ambitious goals, real authority, and a team that moves fast.'),
    lead: [
      L('كن مباشراً، وقدّم الاعتراض بالحقائق', 'Be direct, and challenge them with facts'),
      L('اجعله مسؤولاً عن نتائج، وقيّمه أيضاً على كيف وصل إليها', 'Make them own outcomes, and judge them on how they got there too'),
    ],
    develop: [
      L('طرح الأسئلة قبل الإجابات في الاجتماعات', 'Ask questions before giving answers in meetings'),
      L('تفويض الطريقة لا المهمة فقط', 'Delegate the method, not just the task'),
    ],
  },
  ENTP: {
    name: L('مختبِر الأفكار', 'The Idea Tester'),
    summary: L(
      'يرى الاحتمالات في كل شيء ويحب أن يختبر الأفكار بالنقاش والجدل. سريع البديهة، ويمل من الروتين بسرعة.',
      'Sees possibilities everywhere and likes to test ideas through debate. Quick-witted, and bored by routine fast.'
    ),
    strengths: [
      L('يولّد بدائل لم يفكر فيها أحد', 'Generates options nobody else considered'),
      L('يتحدى الافتراضات بطريقة تكشف المخاطر', 'Challenges assumptions in a way that exposes risks'),
      L('يتكيف بسرعة عندما يتغير الوضع', 'Adapts quickly when the situation changes'),
    ],
    watch: [
      L('قد يبدأ أكثر مما ينهي', 'May start more than they finish'),
      L('قد يُفهم جداله كرفض أو استخفاف', 'Their debating can come across as dismissive'),
    ],
    thrives: L('مشكلات جديدة، ونقاش مفتوح، ومساحة لتجربة الحلول.', 'New problems, open debate, and room to try solutions.'),
    lead: [
      L('استخدمه في مراحل الفكرة والاستكشاف، واقرنه بمن يُكمل التنفيذ', 'Use them in ideation and discovery, and pair them with a strong finisher'),
      L('اتفقا على متى ينتهي النقاش ويبدأ التنفيذ', 'Agree when debate ends and execution starts'),
    ],
    develop: [
      L('اختيار فكرة واحدة وإيصالها للنهاية', 'Pick one idea and carry it to completion'),
      L('التمييز بين نقد الفكرة وصاحبها في النقاش', 'Separate challenging the idea from challenging the person'),
    ],
  },
  INFJ: {
    name: L('المرشد الهادئ', 'The Quiet Guide'),
    summary: L(
      'يفهم الناس بعمق ويرى إلى أين يمكن أن يصلوا. هادئ ومتأمل، يعمل من أجل معنى يؤمن به، ويخطط بعناية.',
      'Understands people deeply and sees where they could grow. Calm and reflective; works for a purpose they believe in and plans with care.'
    ),
    strengths: [
      L('يقرأ ما وراء الكلام ويلتقط المشكلات قبل ظهورها', 'Reads between the lines and senses problems before they surface'),
      L('يربط العمل بمعنى يحفّز الفريق', 'Connects the work to a meaning that motivates the team'),
      L('يقدّم نصيحة عميقة في الجلسات الفردية', 'Gives thoughtful advice one to one'),
    ],
    watch: [
      L('قد يحمل ضغطاً كبيراً بصمت حتى يُنهك', 'May carry heavy pressure silently until burned out'),
      L('قد يتجنب المواجهة المباشرة', 'May avoid direct confrontation'),
    ],
    thrives: L('عمل له معنى، وعلاقات قائمة على الثقة، ووقت للتفكير.', 'Meaningful work, trust-based relationships, and time to reflect.'),
    lead: [
      L('اسأله عن رأيه في جلسة فردية؛ قد لا يطرحه في الاجتماع', 'Ask for their view one to one; they may not raise it in a meeting'),
      L('راقب عبء العمل واسأله صراحةً عن طاقته', 'Watch their workload and ask directly about their energy'),
    ],
    develop: [
      L('قول «لا» مبكراً وبوضوح', "Say 'no' early and clearly"),
      L('طرح الخلاف في وقته بدل تأجيله', 'Raise disagreement when it happens, not later'),
    ],
  },
  INFP: {
    name: L('حارس القيم', 'The Values Keeper'),
    summary: L(
      'يعمل بأفضل شكل عندما يؤمن بما يفعل. مبدع ومتعاطف، ويهتم بالصدق والإنصاف، وقد يتأثر بالنقد أكثر مما يظهر.',
      'Does their best work when they believe in it. Creative and empathetic; cares about honesty and fairness, and may feel criticism more than they show.'
    ),
    strengths: [
      L('يكتب ويصمم بأسلوب إنساني يلامس الناس', 'Writes and designs in a human way that reaches people'),
      L('ينبّه الفريق عندما يبتعد عن قيمه', 'Flags when the team drifts from its values'),
      L('يستمع بتعاطف ويفهم وجهات النظر المختلفة', 'Listens with empathy and understands different views'),
    ],
    watch: [
      L('قد يؤجل المهام التي لا يشعر بقيمتها', "May put off tasks they don't see value in"),
      L('قد يأخذ الملاحظات على محمل شخصي', 'May take feedback personally'),
    ],
    thrives: L('مهام مرتبطة بقيمه، واستقلالية، وتقدير صادق.', 'Work tied to their values, autonomy, and sincere appreciation.'),
    lead: [
      L('اشرح «لماذا» قبل «ماذا»', "Explain the 'why' before the 'what'"),
      L('قدّم الملاحظات على انفراد، وابدأ بما تقدّره فعلاً', 'Give feedback in private, starting with what you genuinely value'),
    ],
    develop: [
      L('تقسيم الأهداف الكبيرة إلى خطوات بمواعيد', 'Break big goals into dated steps'),
      L('فصل نقد العمل عن تقدير الذات', 'Separate criticism of the work from self-worth'),
    ],
  },
  ENFJ: {
    name: L('مُنمّي الناس', 'The People Developer'),
    summary: L(
      'يرى إمكانات الآخرين ويحب أن يساعدهم على الوصول إليها. دافئ ومنظم، ويجمع الفريق حول هدف مشترك.',
      "Sees others' potential and loves helping them reach it. Warm and organised; rallies the team around a shared goal."
    ),
    strengths: [
      L('يبني الثقة والانسجام في الفريق', 'Builds trust and cohesion in the team'),
      L('يحفّز الناس ويعطيهم الثقة بأنفسهم', 'Motivates people and builds their confidence'),
      L('ينظم المبادرات التي تجمع أكثر من قسم', 'Organises initiatives that bring units together'),
    ],
    watch: [
      L('قد يتحمل مسؤولية مشاعر الجميع على حساب نفسه', "May take responsibility for everyone's feelings at their own expense"),
      L('قد يصعب عليه قرار يزعج أحداً', 'May find it hard to make a call that upsets someone'),
    ],
    thrives: L('دور فيه تطوير للناس، وفريق متعاون، وهدف واضح.', 'A role that develops people, a collaborative team, and a clear goal.'),
    lead: [
      L('أعطه فرصاً لتوجيه زملاء أو قيادة مبادرة', 'Give them chances to mentor or lead an initiative'),
      L('ساعده على وضع حدود لما يتحمله', 'Help them set limits on what they take on'),
    ],
    develop: [
      L('إعطاء ملاحظات صعبة بوضوح ودون تلطيف زائد', 'Give hard feedback clearly, without over-softening'),
      L('حماية وقته من طلبات الآخرين', "Protect their time from others' requests"),
    ],
  },
  ENFP: {
    name: L('الشرارة', 'The Spark'),
    summary: L(
      'متحمس وفضولي، يرى الإمكانات في الناس والأفكار ويُشعل الحماس حوله. يحب البدايات والتجارب الجديدة.',
      'Enthusiastic and curious; sees potential in people and ideas and lights up the room. Loves beginnings and new experiences.'
    ),
    strengths: [
      L('يُطلق أفكاراً جديدة ويُقنع الآخرين بها', 'Launches new ideas and gets others on board'),
      L('يبني علاقات بسهولة داخل الفريق وخارجه', 'Builds relationships easily inside and outside the team'),
      L('يرفع معنويات الفريق في الأوقات الصعبة', 'Lifts team morale in hard times'),
    ],
    watch: [
      L('قد يتشتت بين أفكار كثيرة', 'Can scatter across too many ideas'),
      L('قد تضيع التفاصيل والمتابعة بعد الحماس الأول', 'Details and follow-up can slip after the first burst'),
    ],
    thrives: L('تنوّع، وتفاعل مع الناس، ومساحة للإبداع.', 'Variety, contact with people, and room to create.'),
    lead: [
      L('اتفقا على أولويتين أو ثلاث فقط في كل فترة', 'Agree on just two or three priorities at a time'),
      L('تابع معه بمحطات قصيرة بدل موعد نهائي بعيد', 'Check in at short milestones rather than one distant deadline'),
    ],
    develop: [
      L('إنهاء ما بدأه قبل البدء بجديد', 'Finish what they started before starting something new'),
      L('استخدام أداة بسيطة لتتبع الالتزامات', 'Use a simple tool to track commitments'),
    ],
  },
  ISTJ: {
    name: L('المنظّم الموثوق', 'The Reliable Organizer'),
    summary: L(
      'إذا قال سأفعل، يفعل. منظم ودقيق، يحترم الإجراءات والتجربة، ويفضّل أن تكون التوقعات واضحة ومكتوبة.',
      "If they say they'll do it, they do it. Organised and precise; respects process and experience, and prefers clear, written expectations."
    ),
    strengths: [
      L('يسلّم في الموعد وبالجودة المتفق عليها', 'Delivers on time and to the agreed standard'),
      L('يحفظ المعرفة والإجراءات ويوثقها', 'Keeps and documents knowledge and procedures'),
      L('يلتقط الأخطاء والمخاطر العملية', 'Catches errors and practical risks'),
    ],
    watch: [
      L('قد يقاوم التغيير الذي لم يُشرح سببه', "May resist change whose reason wasn't explained"),
      L('قد لا يطلب المساعدة حتى يتأخر', "May not ask for help until it's late"),
    ],
    thrives: L('أدوار واضحة، وخطط واقعية، ووقت كافٍ لإتقان العمل.', 'Clear roles, realistic plans, and enough time to do things properly.'),
    lead: [
      L('أبلغه بالتغيير مبكراً ومعه السبب والخطوات', 'Give early notice of change, with the reason and the steps'),
      L('اكتب التوقعات والمواعيد بوضوح', 'Write down expectations and dates clearly'),
    ],
    develop: [
      L('تجربة طريقة جديدة على نطاق صغير', 'Try a new approach on a small scale'),
      L('مشاركة رأيه في الاجتماعات لا بعدها', 'Share their view in meetings, not afterwards'),
    ],
  },
  ISFJ: {
    name: L('السَّنَد الثابت', 'The Steady Supporter'),
    summary: L(
      'يهتم بالناس بطريقة عملية: يتذكر التفاصيل، ويسد الفجوات، ويحرص على أن يسير العمل بهدوء. مخلص وصبور.',
      'Cares for people in practical ways: remembers details, fills gaps and keeps work running smoothly. Loyal and patient.'
    ),
    strengths: [
      L('يُكمل ما يتركه الآخرون دون أن يُطلب منه', 'Picks up what others leave without being asked'),
      L('يتذكر احتياجات الناس والتفاصيل المهمة', "Remembers people's needs and the details that matter"),
      L('يوفر الاستقرار للفريق وقت الضغط', 'Steadies the team under pressure'),
    ],
    watch: [
      L('قد يتحمل فوق طاقته ولا يقول', 'May take on too much and not say so'),
      L('قد لا يُرى عمله لأنه لا يتحدث عنه', "Their work may go unseen because they don't talk about it"),
    ],
    thrives: L('بيئة مستقرة، وتقدير ملموس، وتعاون هادئ.', 'A stable setting, concrete appreciation, and calm teamwork.'),
    lead: [
      L('اشكره على أمثلة محددة من عمله', 'Thank them for specific examples of their work'),
      L('اسأله عن عبء العمل؛ لن يشتكي من نفسه', "Ask about their workload; they won't complain on their own"),
    ],
    develop: [
      L('عرض إنجازاته على الفريق والإدارة', 'Show their achievements to the team and management'),
      L('رفض الطلبات الإضافية عندما يكون مثقلاً', 'Decline extra requests when already stretched'),
    ],
  },
  ESTJ: {
    name: L('قائد التشغيل', 'The Operations Lead'),
    summary: L(
      'يجعل الأمور تعمل: يحدد المسؤوليات، ويضع المواعيد، ويتابع حتى التسليم. عملي وحاسم، ويقدّر الكفاءة والوضوح.',
      'Makes things run: sets owners and dates and follows through to delivery. Practical and decisive; values efficiency and clarity.'
    ),
    strengths: [
      L('ينظم الفريق ويوزع العمل بوضوح', 'Organises the team and assigns work clearly'),
      L('يتابع الالتزامات حتى تُغلق', 'Follows commitments through until closed'),
      L('يتخذ القرار العملي بسرعة', 'Makes practical decisions quickly'),
    ],
    watch: [
      L('قد يفرض الطريقة المعتادة على أفكار جديدة', 'May force the usual method onto new ideas'),
      L('قد يبدو صارماً في التعامل مع الأخطاء', 'Can come across as harsh about mistakes'),
    ],
    thrives: L('مسؤوليات واضحة، ونتائج قابلة للقياس، وفريق ملتزم.', 'Clear responsibilities, measurable results, and a committed team.'),
    lead: [
      L('كن واضحاً في الأهداف والمعايير والمواعيد', 'Be clear on goals, standards and dates'),
      L('اطلب منه أن يسمع الاقتراحات قبل أن يحكم عليها', 'Ask them to hear suggestions out before judging them'),
    ],
    develop: [
      L('تجربة فكرة من الفريق حتى لو لم تكن طريقته', "Pilot an idea from the team even if it isn't their way"),
      L('الحديث عن المشاعر والدوافع لا المهام فقط', 'Talk about feelings and motives, not just tasks'),
    ],
  },
  ESFJ: {
    name: L('رابط الفريق', 'The Team Connector'),
    summary: L(
      'يجعل الناس يشعرون بأنهم جزء من الفريق. اجتماعي ومنظم، يهتم بالانسجام وبأن يحصل كل شخص على ما يحتاجه.',
      'Makes people feel part of the team. Sociable and organised; cares about harmony and that everyone has what they need.'
    ),
    strengths: [
      L('يربط الناس والأقسام ببعضها', 'Connects people and units to each other'),
      L('ينظم الفعاليات والمتابعات العملية بدقة', 'Organises events and practical follow-up reliably'),
      L('يلاحظ من يحتاج دعماً', 'Notices who needs support'),
    ],
    watch: [
      L('قد يتأثر كثيراً بالخلاف أو بعدم التقدير', 'Can be strongly affected by conflict or lack of appreciation'),
      L('قد يجامل بدل أن يقول رأيه الصريح', 'May please people instead of giving a frank view'),
    ],
    thrives: L('فريق متعاون، وتقدير ظاهر، وأدوار واضحة.', 'A cooperative team, visible appreciation, and clear roles.'),
    lead: [
      L('أعطه دوراً في ربط الفريق بالأقسام الأخرى', 'Give them a role connecting the team with other units'),
      L('عبّر عن تقديرك علناً، وقدّم الملاحظات على انفراد', 'Appreciate them publicly; give feedback privately'),
    ],
    develop: [
      L('قول الرأي المخالف بلطف ووضوح', 'Voice a dissenting view kindly and clearly'),
      L('اتخاذ قرار عادل حتى لو لم يُرضِ الجميع', "Make a fair call even if it doesn't please everyone"),
    ],
  },
  ISTP: {
    name: L('حلّال الأعطال', 'The Troubleshooter'),
    summary: L(
      'هادئ تحت الضغط، يفكك المشكلة العملية ويجد الحل الأبسط. يتعلم بالتجربة ويفضّل الفعل على الكلام.',
      'Calm under pressure; takes a practical problem apart and finds the simplest fix. Learns by doing and prefers action to talk.'
    ),
    strengths: [
      L('يحل الأعطال والطوارئ بهدوء وسرعة', 'Handles breakdowns and emergencies calmly and fast'),
      L('يجد حلولاً عملية بأقل موارد', 'Finds practical fixes with minimal resources'),
      L('يقيّم المخاطر بموضوعية', 'Assesses risk objectively'),
    ],
    watch: [
      L('قد لا يشرح ما فعله أو يوثقه', "May not explain or document what they did"),
      L('قد يبتعد عن الاجتماعات والنقاشات الطويلة', 'May disengage from meetings and long discussions'),
    ],
    thrives: L('مشكلات حقيقية، واستقلالية، وأدوات جيدة، وقليل من البيروقراطية.', 'Real problems, autonomy, good tools, and little bureaucracy.'),
    lead: [
      L('أعطه المشكلة والحدود، ثم ابتعد', 'Give them the problem and the limits, then step back'),
      L('اجعل التوثيق جزءاً من تعريف «انتهى»', "Make documentation part of the definition of 'done'"),
    ],
    develop: [
      L('مشاركة طريقة الحل مع الفريق', 'Share how they solved it with the team'),
      L('التواصل المبكر عن التقدم قبل أن يُسأل', 'Communicate progress early, before being asked'),
    ],
  },
  ISFP: {
    name: L('المبدع الهادئ', 'The Quiet Creator'),
    summary: L(
      'لطيف ومتواضع، يهتم بالجمال والجودة والتفاصيل التي يشعر بها الناس. يعمل جيداً بهدوء ويقدّر حرية الأسلوب.',
      'Gentle and modest; cares about craft, quality and the details people feel. Works well quietly and values freedom of style.'
    ),
    strengths: [
      L('يتقن العمل الذي يحتاج حساً وذوقاً', 'Excels at work that needs taste and feel'),
      L('يتعامل مع الناس بلطف واحترام', 'Treats people with kindness and respect'),
      L('يتكيف مع الظروف دون ضجيج', 'Adapts to circumstances without fuss'),
    ],
    watch: [
      L('قد لا يدافع عن أفكاره أمام الأصوات العالية', "May not defend their ideas against louder voices"),
      L('قد يتجنب الخلاف ويحتفظ باعتراضه', 'May avoid conflict and keep objections to themselves'),
    ],
    thrives: L('بيئة هادئة، ومساحة للإبداع، وتقدير صادق للجودة.', 'A calm setting, room to create, and sincere appreciation of quality.'),
    lead: [
      L('اسأله عن رأيه مباشرة وأعطه وقتاً للرد', 'Ask for their view directly and give them time to answer'),
      L('أعطه حرية في الأسلوب مع هدف واضح', 'Give freedom of style with a clear goal'),
    ],
    develop: [
      L('عرض أعماله وأفكاره بثقة أمام الفريق', 'Present their work and ideas confidently to the team'),
      L('التعبير عن الاعتراض في وقته', 'Express objections when they arise'),
    ],
  },
  ESTP: {
    name: L('سريع الاستجابة', 'The Fast Responder'),
    summary: L(
      'يعيش اللحظة ويتحرك بسرعة. عملي وجريء، يقرأ الموقف بسرعة ويحب التحدي والنتائج الفورية.',
      'Lives in the moment and moves fast. Practical and bold; reads situations quickly and loves challenges and immediate results.'
    ),
    strengths: [
      L('يتصرف بسرعة وحسم في المواقف الطارئة', 'Acts quickly and decisively in urgent situations'),
      L('يفاوض ويقنع بواقعية', 'Negotiates and persuades realistically'),
      L('يحوّل الأفكار إلى تجربة فورية', 'Turns ideas into an immediate trial'),
    ],
    watch: [
      L('قد يتجاوز التخطيط والتفاصيل', 'May skip planning and details'),
      L('قد يملّ من المشاريع الطويلة', 'May get bored on long projects'),
    ],
    thrives: L('حركة، وتحديات قصيرة، ونتائج يراها بسرعة.', 'Action, short challenges, and results they can see fast.'),
    lead: [
      L('أعطه مهام ذات نتيجة سريعة ومرئية', 'Give them tasks with quick, visible results'),
      L('اتفقا على الحد الأدنى من التخطيط قبل التنفيذ', 'Agree on a minimum of planning before execution'),
    ],
    develop: [
      L('التفكير في أثر القرار على المدى البعيد', 'Think through the long-term effect of decisions'),
      L('المتابعة حتى الإغلاق لا حتى الإطلاق فقط', 'Follow through to closure, not just to launch'),
    ],
  },
  ESFP: {
    name: L('باعث الحماس', 'The Energizer'),
    summary: L(
      'يجلب الطاقة والمرح إلى الفريق، ويحب العمل مع الناس والتجربة المباشرة. عفوي ومتعاطف، ويستجيب لما يحدث الآن.',
      'Brings energy and fun to the team, and loves working with people and hands-on experience. Spontaneous and warm; responds to what is happening now.'
    ),
    strengths: [
      L('يخلق جواً إيجابياً ويكسر الجمود', 'Creates a positive mood and breaks tension'),
      L('يتواصل بسهولة مع العملاء والزملاء', 'Connects easily with clients and colleagues'),
      L('يتعامل مع المواقف المفاجئة بمرونة', 'Handles surprises flexibly'),
    ],
    watch: [
      L('قد يؤجل المهام المملة أو الطويلة', 'May put off boring or long tasks'),
      L('قد يتخذ قراراً بحماس اللحظة', 'May decide in the excitement of the moment'),
    ],
    thrives: L('عمل مع الناس، وتنوّع، وتقدير فوري.', 'Work with people, variety, and immediate appreciation.'),
    lead: [
      L('اجعل الأهداف قصيرة وواضحة واحتفل بالإنجاز', 'Keep goals short and clear, and celebrate wins'),
      L('ساعده على التخطيط للمهام الطويلة بخطوات صغيرة', 'Help them plan long tasks in small steps'),
    ],
    develop: [
      L('الالتزام بخطة أسبوعية بسيطة', 'Stick to a simple weekly plan'),
      L('التوقف للتفكير قبل القرارات الكبيرة', 'Pause to think before big decisions'),
    ],
  },
};

export const TYPE_CODES = Object.keys(TYPES16);
