# تفاهُم · Rapport

موقع ثنائي اللغة (عربي/إنجليزي) يجري فيه أعضاء الفريق ثلاثة اختبارات قصيرة، وتصل نتيجة كل اختبار إلى لوحة قائد الفريق تلقائياً. تحوّل اللوحة النتائج إلى إرشادات عملية وخطة تطوير لكل شخص، وتصدّر مجلداً كاملاً لكل عضو.

**[English below](#english)**

## ما في الموقع

| الاختبار | الأسئلة | الوقت | المصدر |
| --- | --- | --- | --- |
| أسلوب العمل (DISC) | 24 | 4 دقائق | أسئلة أصلية مبنية على نموذج مارستون |
| الأنماط الستة عشر | 32 | 5 دقائق | أسئلة وأسماء وأوصاف أصلية، مستوحاة من أنماط يونغ |
| العوامل الخمسة الكبرى (Big Five) | 20 | 3 دقائق | Mini-IPIP، وهو مصدر علمي مفتوح (ipip.ori.org) |

### للعضو

- يكتب اسمه ويوافق مرة واحدة على مشاركة نتائجه، ثم يبدأ.
- عند إنهاء كل اختبار تُرسل النتيجة تلقائياً إلى قائد الفريق مع تاريخها، ويرى العضو تأكيد الوصول.
- إذا أعاد اختباراً أو غيّر اسمه، تتحدث نسخة القائد تلقائياً.
- يستطيع سحب نتائجه في أي وقت من «ملفّي».
- الإجابات نفسها لا تغادر جهازه؛ تُرسل الدرجات فقط.

### لقائد الفريق

لوحة على `https://موقعك/#lead`، فيها:

- **الدخول:** بلا رابط إليها في صفحات الأعضاء. تطلب رمز الدخول دائماً ما دام الخادم يعمل، ولا طريق لتجاوزه. إن كان الخادم يعمل بلا تخزين، أو لا يستجيب، تبقى مقفلة وتشرح السبب بدل أن تفتح.

- **جدول الفريق:** الاسم والدور، وأسلوب DISC، والنمط من 16، وأبرز سمات Big Five، وعدد الاختبارات المكتملة، وحالة خطة التطوير. مع بحث بالاسم.
- **صورة الفريق:** توزيع الأساليب ومجموعات الأنماط، وملاحظات تلقائية على الفجوات.
- **صفحة لكل عضو بأربعة أقسام:**
  - **النتائج:** النتيجة الكاملة لكل اختبار، مع وصف نمطه من الأنماط الستة عشر.
  - **كيف تعمل معه:** التواصل والتحفيز والملاحظات والتفويض والخلاف، ونصيحة للثنائي بين أسلوبك وأسلوبه.
  - **خطة التطوير:** محور الفترة، وأهداف بموعد وحالة، والدعم المطلوب، وموعد المراجعة. ومعها اقتراحات من نتائجه وأسئلة للجلسة الفردية. تُحفظ تلقائياً.
  - **المعلومات والملاحظات:** الفريق والبريد والهاتف وتاريخ الانضمام، وملاحظات الجلسات الفردية بالتاريخ.
- **التصدير:** ملف ZIP للفريق كله، أو لعضو واحد. لكل عضو مجلد فيه:
  - `profile.html`: النتائج الكاملة وكيف تعمل معه، ويُطبع PDF من المتصفح.
  - `development-plan.html`: الخطة والاقتراحات والملاحظات.
  - `notes.md`: الخطة والملاحظات كنص قابل للتعديل.
  - `data.json`: كل البيانات.
  - وفي المجلد الرئيسي: `team-overview.html` و`team.csv` (يفتح في Excel).

**عام:** وضع فاتح وداكن (يتبع إعداد الجهاز، ويمكن تغييره من الشريط العلوي). الواجهة JavaScript عادي بلا build، والخادم PHP عادي بلا Composer وبلا قاعدة بيانات: كل البيانات في ملف JSON واحد.

## النشر على Laravel Forge

يحتاج الخادم PHP 8.1 أو أحدث (خوادم Forge الحالية فيها ذلك). لا Composer ولا Node ولا قاعدة بيانات.

### 1. المستودع

ارفع المجلد إلى مستودع على GitHub أو GitLab أو Bitbucket (يُفضّل أن يكون خاصاً). ملف `.gitignore` يستبعد `.env` وملفات البيانات.

### 2. إنشاء الموقع

من الخادم في Forge: **New site**، ثم اختر المستودع والفرع.

- **نوع المشروع:** PHP عادي (ليس Laravel).
- **Install Composer dependencies:** أزل العلامة. المشروع بلا `composer.lock`، وإن بقيت العلامة سيفشل النشر.
- من **Advanced settings**:
  - **Web directory:** `/public` (القيمة الافتراضية). مهم: بهذا لا يصل أحد من المتصفح إلى `server/` أو `storage/` أو `.env`.
  - **PHP version:** 8.1 أو أحدث.
  - **Zero-downtime deployments:** اتركه مفعّلاً (الافتراضي) أو أطفئه، كلاهما يعمل. البيانات تُحفظ تلقائياً في مجلد الموقع لا في مجلد الإصدار، فلا تضيع مع كل نشر.

### 3. سكربت النشر

من **Deployments** افتح سكربت النشر:

- احذف أي سطر فيه `composer` أو `npm` أو `php artisan`.
- اترك الأسطر التي تبدأ بـ`$` كما هي؛ هي أوامر Forge الخاصة.

مع Zero-downtime يكفي:

```bash
$CREATE_RELEASE()

cd $FORGE_RELEASE_DIRECTORY

$ACTIVATE_RELEASE()
```

بدون Zero-downtime:

```bash
cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH

( flock -w 10 9 || exit 1
    echo 'Restarting FPM...'; sudo -S service $FORGE_PHP_FPM reload ) 9>/tmp/fpmlock
```

### 4. الإعدادات

من **Environment** أضف (انظر `.env.example`):

- `ADMIN_PASSCODE`: رمز دخول لوحتك. اجعله طويلاً وعشوائياً، فهو الحماية الوحيدة لبيانات الفريق.
- `TEAM_CODE` (اختياري ومُستحسَن): رمز يُضاف إلى رابط الفريق حتى لا يرسل أحد من خارجه نتائج.

لا حاجة لإعادة النشر بعد تغييرها؛ تُقرأ مع كل طلب.

### 5. النطاق وHTTPS

يعطيك Forge نطاقاً مجانياً على `on-forge.com` بـHTTPS جاهز. لنطاق خاص (مثل `rapport.شركتك.com`) أضفه من **Domains**، وفعّل شهادة Let's Encrypt. لا تشارك الرابط قبل أن يعمل بـHTTPS، لأن رمز اللوحة يُرسل مع كل طلب.

### 6. التشغيل والتحقق

1. اضغط **Deploy now**.
2. افتح `https://موقعك/api/config`. يجب أن ترى `"storage":"file"` و`"adminConfigured":true`.
3. افتح `https://موقعك/#lead` وادخل برمزك. يجب أن ترى سطراً أخضر: «تصل النتائج هنا تلقائياً».
4. انسخ «رابط فريقك» من اللوحة وأرسله للفريق.

إن ظهر `"storage":"none"` فمجلد البيانات غير قابل للكتابة. هذا نادر على Forge، لأن PHP يعمل بنفس مستخدم الملفات؛ تحقق من صلاحيات مجلد `storage` في مجلد الموقع.

### أين تُحفظ البيانات، والنسخ الاحتياطي

- كل البيانات في ملف واحد: `/home/forge/<موقعك>/storage/rapport.json`، بنفس المسار سواء كان Zero-downtime مفعّلاً أم لا. لتغيير المكان استخدم `DATA_DIR`.
- **نسخة يدوية:** زر «تصدير الفريق» في اللوحة يعطيك كل شيء في ZIP. احفظه بعد كل جولة جلسات فردية.
- **نسخة يومية تلقائية:** من **Site → Processes → Scheduler** اضغط **Add scheduled job**، والمستخدم `forge`، والتكرار يومي، والأمر:

  ```bash
  mkdir -p /home/forge/backups && cp /home/forge/<موقعك>/storage/rapport.json /home/forge/backups/rapport-$(date -I).json
  ```

  جرّبه مرة بخيار **Run** وتأكد أن الملف ظهر. هذه النسخة على نفس الخادم، فهي تحمي من خطأ أو حذف، لا من ضياع الخادم كله؛ لذلك احتفظ أيضاً بالتصدير على جهازك.
- **الاسترجاع:** ضع النسخة مكان `rapport.json`.

### بدون PHP

يمكنك رفع مجلد `public` وحده على أي استضافة ثابتة. يكتشف الموقع غياب الخادم تلقائياً:

- يرسل كل عضو «رمز النتيجة» لك، وتستوردها في لوحتك.
- خطط التطوير والملاحظات تُحفظ على جهازك فقط.
- يمكنك تجربة اللوحة والتصدير بزر «جرّب بفريق تجريبي».

## التشغيل محلياً

```bash
npm run dev      # http://localhost:8000 — رمز اللوحة الافتراضي: dev
npm test         # اختبارات الحساب والتصدير (Node) واختبارات الخادم (PHP)
```

`npm run dev` اختصار لـ`php -S localhost:8000 -t public server/dev-router.php`، فيكفي PHP 8.1 أو أحدث. الاختبارات تحتاج Node 18 أو أحدث أيضاً. تُحفظ البيانات في `storage/`. انسخ `.env.example` إلى `.env` لتغيير الإعدادات.

## التخصيص

| ما تريد تغييره | أين تجده |
| --- | --- |
| الاسم | `APP_NAME` في `public/src/i18n.js`، و`<title>` في `public/index.html` |
| الأسئلة | `public/src/assessments/` |
| أوصاف الأنماط الستة عشر | `public/src/types16.js` |
| اقتراحات خطط التطوير وأسئلة الجلسات الفردية | `public/src/devplan.js` |
| الإرشادات ونصائح الثنائيات | `public/src/guidance.js` |
| ملاحظات الفريق | `public/src/team.js` |
| الألوان والخطوط | أعلى `public/styles.css` |
| الخادم والتحقق من البيانات | `server/` |

## قبل أن ترسله للفريق

- **اشرح الهدف أولاً.** النتائج تصلك تلقائياً بعد موافقة العضو، فقل صراحة إنها لن تُستخدم في التقييم أو القرارات الوظيفية، والتزم بذلك. المشاركة اختيارية: من لا يوافق لا يبدأ.
- **ناقش النتيجة مع الشخص نفسه.** النتيجة بداية حوار لا حكم. اسأل كل عضو في جلسة فردية: «هل هذا يشبهك؟ ما الذي لا ينطبق عليك؟» واكتبا خطة التطوير معاً.
- **حدود علمية:**
  - DISC والأنماط الستة عشر مفيدة كلغة مشتركة، لكن قدرتها على التنبؤ بالأداء ضعيفة، والحروف القريبة من المنتصف قد تتغير عند إعادة الاختبار.
  - Big Five هو الأقوى بحثياً، لكن الترجمة العربية هنا غير مُختبرة علمياً.
- **الأنماط الستة عشر هنا ليست اختبار 16Personalities ولا MBTI®.** الأسئلة وأسماء الأنماط وأوصافها من تأليف هذا الموقع.
- **صياغة الإرشادات بصيغة المذكر.** العناوين تستخدم اسم الشخص، لكن جمل الإرشادات نفسها («أعطه»، «اسأله») بصيغة المذكر.
- **البيانات المحفوظة:**
  - من العضو: الاسم والدور والدرجات وتواريخ الاختبارات.
  - منك كقائد: المعلومات والخطة والملاحظات.
  - لا إجابات خام. ملفات التصدير والنسخ الاحتياطية بيانات شخصية؛ احفظها في مكان آمن.

---

<a id="english"></a>

## English

A small bilingual (Arabic/English) site where team members take three short assessments, and each result reaches the team lead's dashboard automatically. The dashboard turns results into practical guidance and a development plan per person, and exports a full folder per member.

**Assessments**

- DISC: 24 original items.
- 16 Types: 32 original items. Four preferences (E/I, S/N, T/F, J/P) combine into one of 16 types, each with an original name, portrait, strengths, watch-outs, how to lead them and growth ideas. This is not 16Personalities or the MBTI®.
- Big Five: the 20-item Mini-IPIP by Donnellan, Oswald, Baird & Lucas (2006), *Psychological Assessment, 18*(2), 192–203. Its IPIP items are in the public domain.

**Members**

- Enter a name and tick one consent line before starting.
- Each finished result is sent automatically with its date.
- A retake or a name change updates the lead's copy.
- Members can withdraw everything from My profile, which also stops automatic sending.
- Raw answers never leave the device.

**Lead dashboard** (at `/#lead`)

- **Access:** no link from member pages. Whenever the server is up, the passcode is required and there is no way around it. If the server has no storage or doesn't respond, the dashboard stays locked and says why, instead of opening.
- **Team table:** with search.
- **Team picture:** style mix, type groups and team observations.
- **Member page:** four tabs.
  - **Results:** the full result of every assessment.
  - **How to work together:** the guide, plus a tip for your pairing.
  - **Development plan:** focus, goals with due dates and status, support and the next review date. Comes with suggestions from the member's results and 1:1 questions. Autosaves.
  - **Info and notes:** team, email, phone, start date and dated 1:1 notes.
- **Exports:** a ZIP for the whole team, or for one member. Each member folder holds `profile.html`, `development-plan.html`, `notes.md` and `data.json`; the team ZIP adds `team-overview.html`, `team.csv` and a README.

**Stack:** a vanilla JavaScript front end with no build step, and a plain PHP 8.1+ back end with no Composer packages and no database. All data lives in one JSON file, written under a file lock and replaced atomically.

### Deploy on Laravel Forge

1. Push this folder to a GitHub, GitLab or Bitbucket repository.
2. On your server in Forge, choose **New site** and pick the repository and branch.
   - Project type: plain PHP, not Laravel.
   - Untick **Install Composer dependencies**. There is no `composer.lock`, so the install step would fail.
   - Under **Advanced settings**, keep the web directory at `/public` (the default) so `server/`, `storage/` and `.env` are never served. Choose PHP 8.1 or newer.
   - Zero-downtime deployments can stay on (the default) or be off. Either works: inside a release folder, data is kept in the site's own `storage` folder, not the release, so it survives every deploy.
3. In **Deployments**, edit the deploy script. Remove any `composer`, `npm` or `php artisan` lines, and keep Forge's `$` macros. With zero-downtime, this is enough:

   ```bash
   $CREATE_RELEASE()

   cd $FORGE_RELEASE_DIRECTORY

   $ACTIVATE_RELEASE()
   ```

   For standard deployments, use `git pull origin $FORGE_SITE_BRANCH` in `$FORGE_SITE_PATH`, then reload PHP-FPM.
4. In **Environment**, set `ADMIN_PASSCODE` (long and random; it is the only thing protecting the team's data) and optionally `TEAM_CODE`. They are read on every request, so no redeploy is needed.
5. Use the free `on-forge.com` domain, which already has HTTPS, or add your own domain with a Let's Encrypt certificate. Don't share the link before HTTPS works, because the passcode travels with every dashboard request.
6. Click **Deploy now**. Check `https://your-site/api/config` for `"storage":"file"` and `"adminConfigured":true`, then open `/#lead`. A green line saying results arrive automatically confirms everything is connected.

**Data and backups.** Everything is in `/home/forge/<site>/storage/rapport.json` in both deployment modes; set `DATA_DIR` to move it. The dashboard's team export is a complete manual backup. For a daily copy, add a scheduled job under **Site → Processes → Scheduler** (user `forge`, daily):

```bash
mkdir -p /home/forge/backups && cp /home/forge/<site>/storage/rapport.json /home/forge/backups/rapport-$(date -I).json
```

Test it once with **Run**. This copy sits on the same server, so it protects against mistakes, not against losing the server; keep the exports on your own machine too. To restore, put a copy back as `rapport.json`.

If `/api/config` shows `"storage":"none"`, the data folder isn't writable. That is rare on Forge, where PHP runs as the same user that owns the files; check the permissions of the site's `storage` folder.

**Without PHP**, host `public/` on any static host. Members then send result codes, which the lead imports. Plans and notes stay on the lead's device, and a demo team lets you try the dashboard.

### API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/config` | Storage mode and settings |
| POST | `/api/submit` | Send or update results (`TEAM_CODE` checked) |
| POST | `/api/withdraw` | Member deletes their results |
| GET / DELETE | `/api/admin/members` | Lead only; needs the `x-admin-passcode` header |
| GET / PUT | `/api/admin/records` | Lead only: info, development plan and notes per member |

**Privacy model:** the server stores name, role, scores and dates, plus a SHA-256 hash of each member's edit token. The lead's records (info, plan, notes) are readable only with the admin passcode.

**Local:** `npm run dev` (runs `php -S localhost:8000 -t public server/dev-router.php`; passcode `dev`) and `npm test` (Node 18+ for the front-end tests, PHP 8.1+ for the back-end tests).

**Use responsibly:** for conversations and development, not for hiring, ratings, promotion or discipline.
