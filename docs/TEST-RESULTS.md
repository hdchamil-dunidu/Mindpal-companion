# MindPal verification — 12 October 2026

## Completed

- **41 Node automated tests passed**, zero failures. See `unit-test-output.txt`.
- **19 DOM workflow checks passed** using jsdom, with actual UI handlers and local storage. See `dom-results.json` and `scripts/ui-smoke.mjs`.
- **37 JavaScript/ES-module files passed syntax checks.**
- Android APK compiled from this source with official Android SDK Build Tools 35.0.0, Android platform 35 and ECJ.
- APK signature verification: v2 and v3 passed. Application ID `app.mindpal`, version name `1.2.0`, version code `3`, minimum Android API 26, target API 34.
- Original `web/mascot/models/luma-pearl.glb` is byte-for-byte identical to the delivered 1.1 ZIP. SHA-256: `3e91cec286730a4589daddd93785c5a7a7d4bd4b7f7bf5d6164dff27f2eb88dc`.

Automated tests cover password/session behavior, missing configuration, owner isolation, mocked Gemini replies/errors, cached chat retries, calendar validation and overlaps, timer completion, mood mapping and temporary expression reset, finance arithmetic and date boundaries, leap-year comparison, budgets, plan balance and savings separation, CSV escaping/validation/deduplication, recurring date boundaries, local data migration, alert keys, privacy of financial AI context, grounded recommendation savings, AI validation/cache, and Google state/PKCE/polling/explicit linking safeguards.

DOM workflows cover welcome/login/signup navigation and password confirmation, local onboarding, calendar CRUD/validation, task creation/completion/edit/history, separate event/task records, six money sections, transaction fields/search/edit/delete, budgets, goals, recurring payment recording, plan validation/acceptance, numerical reports, disconnected AI errors, saved Sad mood/support links, chat scene container, companion visibility, and persistence after loading a new store.

## Not verified in this environment

- **Live MongoDB, Gemini, and Google OAuth:** no user credentials were supplied. Provider tests use explicit test doubles, not real accounts. Run `npm run check:services`, then sign in and send a real chat on laptop and phone.
- **Visual browser layout and WebGL rendering:** Chromium could not start because the environment denied its required socket operation (`Operation not permitted`). DOM checks do not verify rendered appearance, animation fidelity or performance. No browser screenshots were produced.
- **Physical Android device:** installation, external-browser return after Google login, document picker, audio volume, keyboard safe areas, touch behavior, and performance remain to be checked on the user's phone.
- **Hosted service:** no permanent server or Google Cloud project was deployed. The guide explains laptop HTTPS tunnel testing and private configuration.

## Functional boundaries

Calendar reminders run while the app is open. Numerical completed-week/month reports are prepared on app open when enabled; there is no background scheduler or push notification service. Savings progress is user-entered and no bank is connected. AI plans are drafts requiring review/acceptance. Financial chat does not execute mutations. Password reset and email verification are not included.

## Device acceptance checklist

1. Export old local records before any uninstall; install the new APK.
2. Run setup/service checks on the laptop, create an email account, then log out and back in.
3. Connect the phone to the laptop's HTTPS tunnel and sign in to the same account.
4. Create/edit/complete/delete a task and create/edit/delete an event; reload and confirm persistence on each device.
5. Test Google login and return from the external browser.
6. Choose Sad, save, confirm colour stays, expression returns to idle, and the activity suggestion appears after about fifteen seconds.
7. Visit all tabs, minimize/reopen Luma, open forms and the keyboard, and confirm controls remain reachable.
8. Record a transaction, check chart/budget changes, test CSV export/import and recurring payment recording, generate a report and Gemini plan.
9. Test a real chat, then stop the tunnel and confirm a clear connection error.
