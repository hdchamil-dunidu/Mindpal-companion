# A clear 8–10 minute MindPal demonstration

Use a fresh real account. Prepare a few tasks, an event and a couple of transactions yourself beforehand. Describe them as demonstration entries you created; do not claim fabricated histories or long-term results.

## 0:00–1:00 — Purpose and identity

“MindPal is a study and everyday wellbeing companion. It combines small tasks, focus, mood reflection and finance awareness around Luma. It supports everyday routines and enjoyment; it does not diagnose mental health conditions.”

Show the welcome screen. Move over Luma, tap, then Continue. Explain that this is an actual animated GLB, not a screenshot. The original round Luma model is preserved exactly.

## 1:00–2:00 — Accounts and personal space

Sign in. Show your name and real dashboard totals. Explain that MongoDB stores each user’s records and the API scopes requests to the signed-in user. Passwords are hashed and sessions use HttpOnly cookies.

If Google/Apple are not configured, point out the disabled provider buttons honestly rather than presenting them as live.

## 2:00–3:30 — Worklist CRUD and validation

Create a task, edit it, complete it, reopen it, and delete a temporary task. Show a rejected reversed time range. Add an exam to the calendar and select its day. Luma reacts when a task completes.

Suggested files if asked: `components/pages/Tasks.jsx`, `app/api/records/[kind]/route.js`, `lib/domain.js`.

## 3:30–4:30 — Mood and immediate reactions

Select Stressed or Happy. Luma reacts before saving. Add a note, save it, and inspect mood history. Mention that multiple check-ins can occur in one day and the graph uses saved records.

## 4:30–5:30 — Focus and breathing

Start a 1-minute focus session early enough to finish during the presentation. Show pause/resume and explain the timestamp-based approach. Completed study sessions count; a cancelled timer or rest break does not count toward the crown.

Briefly open Breathing, show the 4/4/6-second cycle, and stop if you do not want to complete it.

## 5:30–6:30 — Finance and real reports

Add an expense, edit it and show updated totals. Set a monthly budget. Explain amounts are stored as integer minor units, avoiding fractional-cent errors. Reports reflect actual records; an empty period stays empty. Download the CSV if needed.

## 6:30–7:30 — Chat, voice and consent

If no AI key is configured, explicitly call it the predefined-response demo mode. If configured, show a real response. The key lives on the server.

Show Settings → Personalized AI context. Explain it is off by default and only sends recent mood/task/focus data after the user enables and saves the setting. Voice input and read-aloud use the browser’s supported speech features.

## 7:30–8:30 — Accessories and reward rules

Preview Cap, Headphones, Reading glasses and Sunglasses. Save a look, then remove it. Show the locked rewards and explain 5 tasks / 10 focus sessions / 7 distinct check-in days. The server checks those rules.

## 8:30–10:00 — Installation and technical proof

Show PWA installation if supported on the demonstration device. Explain Android uses the same hosted experience through a separate TWA project, with signed-domain verification. Do not claim an APK was tested if you have not built and tested it.

Show `docs/VERIFICATION.md`, the test commands, and selected MongoDB collections. Keep real credentials and personal records out of the projection.

## Before presenting

- Start MongoDB and the app.
- Test your chosen browser’s WebGL and audio permission.
- Decide whether you are demonstrating demo chat or configured AI.
- Keep the server terminal open.
- Use the production build if possible: `npm run build`, then `npm start`.
- Have the README open for setup questions.
- Don’t rely on closed-app reminders; they are outside this version.
