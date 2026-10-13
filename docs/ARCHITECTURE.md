# Architecture — MindPal 1.2

The laptop and Android WebView load the same ES-module frontend. The Android app bundles the frontend, original GLB, and Three.js assets. Its native bridge supports document import/export and opening the Google authorization page in the system browser.

`web/domain.js`, `web/dates.js` and `web/finance-domain.js` share validation and deterministic calculations between local storage and Node APIs. `web/views.js`, `planner-ui.js`, `finance-ui.js`, `companion.js` and `app.js` provide the UI. One Luma WebGL canvas moves between a full-size stage and the mini dock; it is not duplicated.

`LocalStore` keeps one device's profile and records. `ApiStore` uses a configured HTTPS backend and bearer session. Cloud and local records are intentionally separate; there is no implicit merge.

Node routes enforce ownership via session-derived ownerId. Record IDs are namespaced by owner. MongoDB collections store users, expiring sessions, separate tasks/events and finance resources. New collections are empty for existing profiles; no destructive migration runs.

Gemini keys are read only on Node. `gemini.js` discovers compatible models, handles provider errors/timeouts, and validates JSON. Chat passes recent conversation. Financial requests derive authorized aggregate context; recommendations and plans are validated before saving. The frontend renders user/provider text with HTML escaping.

Google login uses a server-side authorization-code flow in a browser, state and PKCE, a client-held polling verifier, verified userinfo, five-minute expiry, and a one-time session exchange. Existing password accounts require explicit linking while signed in. OAuth secrets and provider access tokens are never delivered to the frontend.

In-app reminders and financial alerts run only while the application is open. Completed-week/month numerical reports are prepared on app open. No background push or scheduled hosting service is bundled.
