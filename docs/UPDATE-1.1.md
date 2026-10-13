# MindPal 1.1 — update and run

This updates the MindPal-Complete-Source.zip / MindPal-debug.apk build with the original Luma model.

## What changed

- A visible account card and navigation action: Sign out for cloud accounts, Exit local profile for local mode. Local exit preserves records and offers Continue as your name. It is not a password lock.
- Laptop chat setup detects the current localhost/HTTPS origin. Connect and sign in checks server configuration and names missing settings. Android supports a public backend origin bundled at build time or a one-time address entry.
- Slightly stronger synthesized music and sound effects, louder defaults for new profiles, existing sliders/mute retained, and a Preview sound button. Existing saved volume preferences are preserved.
- Monthly income, expenses and balance, a monthly budget, budget-used progress, seven-day spending comparison, category breakdown and simple spending suggestions from recorded data. Suggestions do not use Gemini. The suggested 10% reduction is an optional example, not a prediction.
- Calendar events can be marked Birthday, Anniversary, Celebration, Deadline, Exam or Holiday. Selected-day feature cards, highlighted dates, upcoming special days and edit controls use events you enter. Holidays are not automatically imported.
- Saved moods offer direct links to existing breathing, stretching, dance, focus, worklist and chat features as appropriate. Feedback is temporary UI feedback, not a saved mood assessment. Activity completion offers a return to mood support.

## Update your laptop

1. In the old app, Settings → Export my data. Keep the backup.
2. Stop the old terminal with Ctrl+C.
3. Extract the updated ZIP into a new folder; open its MindPal directory.
4. Copy your existing private .env into that directory, beside package.json. Do not post it publicly.
5. Open a terminal there and run npm ci, then npm start.
6. Visit http://localhost:3000 using the same browser/profile as before. Refresh with Ctrl+F5. Local data uses the existing storage key and should remain when using the same origin. Restore your backup only if needed.

Local planning features work without .env. For cloud chat, configure MONGODB_URI, MONGODB_DB, GEMINI_API_KEY, GEMINI_MODEL and SESSION_SECRET. See SETUP.md for the full template. Run npm run db:setup and npm run check:services, then use Talk to Luma → Connect and sign in. A health check confirms settings are present; it does not prove database or Gemini access. Send a real message after signing in.

## Install the Android update

Export your data from the old APK first. This APK is signed with a new temporary debug key; Android may require uninstalling the old app before installing it. Uninstalling removes local app data. After installation, enter local mode and restore your backup. Keep the backup until you have checked your records.

Version 1.1.0 / versionCode 2 / package app.mindpal. Android API 26 minimum. Physical phone testing remains necessary.

## Configure Android chat once

A database URI and a Gemini key are NOT server addresses. You need a running HTTPS deployment of this Node backend. No hosting or user credentials have been configured in this delivery.

Option A: In Android Settings → Connection settings, enter your actual backend HTTPS origin, check it, then create/sign in to an account. The address is saved on that device.

Option B: Before building your own APK, add MINDPAL_PUBLIC_SERVER_URL=https://your-real-domain to the root .env, run npm run configure:android, then rebuild Android. Only this public origin is copied into web/config.js. Never put secrets in that file. Users of that APK can use Connect and sign in without typing a server address. Leave MINDPAL_PUBLIC_SERVER_URL blank and run the same command to remove a bundled origin.

Keep https://appassets.androidplatform.net and your website origin in ALLOWED_ORIGINS. The delivered APK does not accept a plain HTTP laptop LAN address. localhost on a phone refers to the phone.

## Verification for this update

- 21 Node tests passed: original backend/domain checks plus finance periods, empty states, budgets, special-day validation and saved-mood activity selection.
- JavaScript syntax checks passed.
- DOM-only interaction checks passed for onboarding, saved mood activity links, finance entry/budget/suggestion, special events, server diagnostics and cloud sign-in/sign-out. Network responses were simulated. These checks do not verify rendering, WebGL or sound output.
- APK compiled with Android SDK 35 tools and ECJ; APK signature verified with v2 and v3 schemes. Original native API deprecation warnings remain.
- Live browser visual testing was blocked by the environment's socket restrictions. Earlier-version browser checks are not evidence for this update.
- Live Gemini, live MongoDB, physical Android installation/audio and accessibility/layout checks are still outstanding.

Before your demo: verify chat with your real server; save and reopen a special event; add income/expenses and check totals; save a mood and open an activity; preview sound on the phone; export a backup and test sign-out/exit.
