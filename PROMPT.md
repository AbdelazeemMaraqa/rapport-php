# Build prompt: Rapport (تفاهُم)

Use this prompt with any coding agent (Claude Code, Cursor, etc.) to build or rebuild the site from scratch.

---

## Role and goal

You are a senior full-stack engineer and product designer. Build **Rapport (تفاهُم)**: a small, bilingual (Arabic RTL by default, English LTR) web app where members of an engineering team take short personality and work-style assessments, and their team lead sees a dashboard that turns each person's results into practical guidance (how to communicate with them, motivate them, give them feedback, delegate to them, handle conflict with them, their strengths and watch-outs), a development plan per person, 1:1 notes, and an export folder per member.

The lead runs a team of 12–14 backend engineers in an edtech company in Jordan. Members take the tests voluntarily, mostly on their phones. The lead uses the dashboard on a laptop.

## Hard constraints

1. **Original or public-domain items only.** Do NOT copy questions, type names, or descriptions from 16Personalities, the MBTI®, Everything DiSC®, mindprofile.co, or any other proprietary test. Write original items for DISC and the 16-type assessment, and original names and portraits for the 16 types. For the Big Five, use the 20-item Mini-IPIP (Donnellan et al., 2006), whose IPIP items are public domain (ipip.ori.org). Do not use 16Personalities' type nicknames ("Architect", "Logician", etc.) or the MBTI trademark as product names.
2. **Zero runtime dependencies, no build step.** Vanilla JavaScript ES modules, one CSS file, one `index.html`, and a plain PHP 8.1+ back end with no Composer packages and no database server. It must deploy to a Laravel Forge site (Nginx + PHP-FPM, web directory `/public`, Forge's default Nginx config) with no build or install step, and also work on any static host (in a reduced, server-less mode).
3. **Consent first, then automatic.** Before the first assessment the member enters their name and ticks one explicit consent line. After that, each finished result (scores and completion date) is sent to the lead automatically, and re-sent on a retake or a name change. Raw answers never leave the device. Members can withdraw everything at any time, which also turns automatic sending off.
4. **Not an evaluation tool.** The app states plainly, on the About page and in the dashboard, that results are a conversation starter and must not be used for hiring, performance ratings, promotion, or discipline.

## Assessments

All items use a 5-point scale, one question per screen, auto-advance on answer, Back button, number keys 1–5, progress bar, and progress saved locally so a member can resume.

### 1. DISC work style (24 items, ~4 min)
- Original workplace statements, 6 per style: D (Dominance), I (Influence), S (Steadiness), C (Conscientiousness). Agreement scale.
- Present items interleaved (D, I, S, C, D, I, ...).
- Score: mean per style mapped to 0–100. Primary style = highest; secondary = second highest when within 15 points.

### 2. 16 Types (32 items, ~5 min)
- Jungian dichotomies: E/I (energy), S/N (information), T/F (decisions), J/P (structure). 8 bipolar items per dichotomy: two short statements at each end, 5 positions between.
- Flip the side of about half the items so the "first" pole is not always on the same side.
- Score each dichotomy from -100 (fully first letter) to +100 (fully second letter). Show each letter's share as a percentage (50 + |score| / 2); label |score| < 15 as "balanced". Read percentages, not just letters.
- Combine the four letters into one of 16 types. Each type gets an original nickname, a summary, strengths, watch-outs, what it works best with, how to lead it and growth ideas, plus one of four original groups (NT, NF, SJ, SP).

### 3. Big Five (20 items, ~3 min)
- Mini-IPIP items, translated to Arabic for this app (mark as not a validated Arabic version). Accuracy scale.
- Traits: Openness/Imagination, Conscientiousness, Extraversion, Agreeableness, and Emotional Stability (report Neuroticism reversed, with respectful wording).
- Levels: low (< 40), moderate, high (> 60).

## Member experience

- **Home:** name (and optional role), the consent line, the three assessments with status (not started / n of N / done), start, resume or retake buttons, link to "My profile" and "About & privacy". No link to the lead dashboard anywhere in the member pages; the lead opens `/#lead` directly.
- **My profile:** a result block per completed assessment (DISC "rose" chart and bars, type code with four dichotomy sliders, Big Five bars), plus "How others work best with you" generated from the results.
- **Sending status:** a line showing whether results reached the lead, with "Send now" after a failure, and "Withdraw my results". On a host with no database, a "Copy my result code" fallback instead.
- **Theme:** a light/dark toggle in the top bar, defaulting to the system setting.

## Lead dashboard

- Access, decided from `/api/config` once at load (retry once after a network failure):
  - API with storage: the passcode (`ADMIN_PASSCODE` env var) is always required, for the team page and every member page. No "continue without passcode" option.
  - API without storage, an API error, or no answer at all (including an HTML 5xx from the proxy): the dashboard stays locked with a message saying what to fix. Never fall back to local mode here.
  - No API at all (a 404, or a plain page from a static host's fallback): local mode, clearly labelled, showing only this browser's imported codes and demo team.
- **Team overview:** member count, DISC distribution, letter splits for each dichotomy, Big Five averages, and rule-based team insights (for example: no S-style members means change fatigue and follow-through may go unnoticed; mostly introverts means agendas in advance and written-first communication).
- **Team table:** search by name; columns for name and role, DISC, 16-type code and nickname, Big Five highs and lows, tests completed, development-plan status, last updated.
- **Member detail:** "How to work with them" (communicate, motivate, give feedback, delegate, handle conflict), strengths, watch-outs, stress triggers, what to avoid, every tip tagged with its source assessment, a pair tip comparing the lead's DISC style with the member's (the lead's own profile on the same device, or a member the lead picks as "me"), and the full result of every assessment. Delete member with an inline confirmation (no `confirm()` dialogs).
- **Development plan tab:** focus, goals (text, how we'll know, due date, status), support from the lead, next review date, with suggestions from the results (strengths to build on, areas to develop, suggested goals with "Add as goal", how to support them, 1:1 questions). Autosaves.
- **Info and notes tab:** team, email, phone, start date, general notes, and dated 1:1 notes. Private to the lead.
- **Exports:** a ZIP for the whole team (README, team-overview.html, team.csv, and one folder per member with profile.html, development-plan.html, notes.md and data.json) and a ZIP per member. Write the ZIP with a small in-house writer (stored, UTF-8 names).
- Import result codes, refresh, and a demo team for trying the dashboard on a host with no database.

## Guidance content

Write original, bilingual guidance:
- Per DISC style: name, one-line summary, and lists for strengths, watch-outs, communicate, motivate, feedback, delegate, conflict, stress triggers, avoid.
- Per type pole (E, I, S, N, T, F, J, P): a description plus communicate and work-style tips, a strength and a watch-out.
- Per Big Five trait at high and low levels: a description, a tip, a strength and a watch-out.
- Ten DISC pair tips (DD, DI, DS, DC, II, IS, IC, SS, SC, CC) on where the two styles help each other and where they clash.
- A synthesis function that merges these into one guide per person, removes duplicates, caps list lengths, and keeps the source tag on each line.

## Backend (plain PHP for Laravel Forge)

- `public/index.php` is the front controller. Forge's Nginx config sends every path that isn't a real file to it: `/api/*` goes to the API, `/` serves `index.html`, anything else is a 404. Code outside `public/` (`server/`, `storage/`, `.env`) is never served.
- Settings come from real environment variables first, then from `.env` in the project root, which Forge's Environment panel edits: `ADMIN_PASSCODE`, optional `TEAM_CODE`, `MAX_MEMBERS` (default 200) and `DATA_DIR`.
- `GET /api/config` returns `{ storage: "file" | "none", teamCodeRequired, adminConfigured }`.
- `POST /api/submit` creates or updates a member's shared scores. A new member gets `{ id, token }`; the token is stored only as a SHA-256 hash and is required for later updates. The client sends `TEAM_CODE` from the `?team=` link parameter. Validate and clamp all scores; cap names at 60 characters; cap the member count.
- `POST /api/withdraw` with `{ id, token }` deletes a member.
- `GET /api/admin/records` and `PUT /api/admin/records` (`{ id, record }`) read and write the lead's record per member (info, plan, notes), validated and size-capped, with the same passcode header.
- `GET /api/admin/members` and `DELETE /api/admin/members?id=` require the `x-admin-passcode` header (constant-time compare, short delay on failure).
- Storage: one JSON file guarded by a lock file (shared lock for reads, exclusive for writes), written to a temp file and renamed so a crash never leaves half a file. Refuse to overwrite a file that no longer parses. Default folder: `<project>/storage`, except inside a Forge zero-downtime release (`<site>/releases/<id>`), where it is `<site>/storage` so data survives deploys. If the folder isn't writable, `/api/config` reports `"none"` and writes return 503, so the client falls back to result codes.
- Store only: id, token hash, name, role, language, scores, completion dates, created/updated dates, and the lead's records.
- Local development: `php -S localhost:8000 -t public server/dev-router.php`, with the passcode defaulting to `dev`.

## Design

- Fonts: Reem Kufi for headings, IBM Plex Sans Arabic for everything else (both on Google Fonts).
- Cool neutral palette with a deep navy accent. The four DISC colors (D red, I amber, S green, C blue) and four type-group colors are the only saturated colors, used strictly for data.
- The memorable element is each person's DISC rose: a four-quadrant polar chart (D top-left, I top-right, S bottom-right, C bottom-left) used as their visual signature on cards and profiles.
- Mobile-first for members, roomier grid for the dashboard. Full light and dark themes, visible focus states, reduced-motion respected, logical CSS properties so RTL and LTR both work.

## Deliverables

`public/` (static app and `index.php`), `server/` (PHP API, validation, storage and the local dev router), `storage/` (kept in git only through its `.gitignore`), `tests/` (front-end tests with `node --test` and back-end tests with plain PHP, including concurrent writers), `.env.example`, and a README in Arabic and English with Forge deployment steps (site settings, deploy script for both deployment modes, environment, HTTPS, checks, backups).
