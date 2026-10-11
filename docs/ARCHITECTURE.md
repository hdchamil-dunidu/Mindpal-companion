# Architecture and behavior

## Choice of technology

The supplied package was a Luma browser/WebGL developer preview, rather than an existing application with user records or a backend. This implementation preserves its GLB, rig, animation clips, Three.js runtime and accessory approach. It adds a single responsive application, a small Android Java WebView shell, and a Node/MongoDB API. Sharing the client avoids implementing the same features twice and keeps the supplied mascot fully recognizable.

The Android shell serves bundled assets on `https://appassets.androidplatform.net/assets/` using WebView request interception. It enables JavaScript and DOM storage, disallows file URL access and cleartext/mixed-content requests, and uses native document pickers for explicit JSON/CSV exports and JSON restore. Links to other HTTPS origins open externally after a user gesture. Only a document-export method is exposed to JavaScript.

Local mode persists real data in localStorage. Connected mode calls the HTTPS API with a bearer session token; the server validates records, supplies ownership and writes to MongoDB. Gemini requests happen only on the server. Cloud write failures are shown, not silently redirected into local storage. There is no offline cloud-write queue or automatic data merge.

## Code map

| File / folder | Responsibility |
| --- | --- |
| `web/index.html`, `web/style.css` | App shell, dark layout, safe areas, responsive forms, glow and reduced motion styles |
| `web/views.js` | All screen renderers, drawer destinations, accessible form labels, icons and empty states |
| `web/app.js` | Navigation, panels, event handlers, CRUD flows, timer coordinator, exports/restore, settings and native lifecycle hooks |
| `web/domain.js` | Canonical moods, validation, date/time rules, exact money amounts, timer elapsed math and progress summaries |
| `web/store.js` | LocalStore and ApiStore; separate local/cloud data; server-origin validation |
| `web/mascot.js` | Mood/activity/reaction priority, gaze/tap/hold/keyboard behavior and procedural expressions |
| `web/mascot/mascot-viewer.js` | Three.js loading/rendering, mixer, resize handling and resource cleanup |
| `web/mascot/accessories.js` | Geometry attached to the existing BodyRig, without modifying the GLB |
| `web/audio.js` | Original synthesized cues and music, immediate mute, volumes and optional system speech |
| `server/index.js` | Static server, JSON API, ownership checks, CORS, rate limiting and security headers |
| `server/auth.js` | Password hashing, account identity, random session issuance and session expiry |
| `server/chat.js` | Gemini JSON response validation, allowlisted cues, persisted context and request-ID retry handling |
| `server/db.js`, `server/setup.js` | MongoDB connection, explicit errors, indexes and ping |
| `android/app/src/main/java/app/mindpal/MainActivity.java` | Bundled asset origin, native Back/lifecycle and document dialogs |
| `scripts/build-apk.py` | Direct SDK build and signature verification |
| `tests/`, `scripts/ui-smoke.cjs` | Isolated domain/backend tests and interactive browser tests |

## Routes

Browser navigation uses hash routes: `#home`, `#chat`, `#customize`, `#money`, `#worklist`, `#calendar`, `#moods`, `#focus`, `#settings`, `#connection`, `#auth`, `#activity`, and initial `#welcome`. Home contains the date/greeting, Luma, chat and expandable Interactions/Customize controls. Planning features are in the drawer. No dashboard cards are appended under Luma.

Browser Back follows the history and closes activity audio. Native Back first closes an open panel, then returns a feature to Home, then permits Android to leave the app. It is intentionally a Home-first native navigation model, not a full native screen stack. Input drafts are not guaranteed across navigation; saved records and paused timer state are preserved. One WebGL scene is moved between relevant screens instead of creating multiple contexts.

## Mood and expression mapping

| Identifier | Label / accent | Luma behavior |
| --- | --- | --- |
| `calm` | Calm / `#7bd9b0` | Idle |
| `joy` | Joy / `#f2d178` | Happy eyes |
| `sad` | Sad / `#7aaeff` | Lowered eyelids, slight head tilt |
| `anxious` | Anxious / `#bd9af2` | Original stressed clip |
| `tired` | Tired / `#97b7ce` | Original tired clip |
| `love` | Love / `#f2a4bd` | Heart eye morph |

`domain.js` is the single mapping used by selection, validation, history, theme and expression binding. There is no older Sad bug source to repair: the supplied developer preview had no application mood persistence. This implementation removes identifier ambiguity by using `sad` consistently and tests it through save/reload.

Selection immediately previews the mood; Save check-in writes a record and displays confirmation. A failed save restores the previous saved mood and displays an error. Reopening restores the newest saved record. Mood notes and all user text are escaped before rendering.

The original 13 clips are `idle`, `greeting`, `working`, `slap`, `annoyed`, `error`, `happy`, `love`, `wink`, `yawn`, `dance`, `stressed`, `tired`. Additional Sad, curious, listening, talking, breathing and stretching behavior uses the existing eye morphs, transforms and tracking group. No remeshing or replacement mascot is used. Talking is a simple mouth movement, not phoneme lip sync; stretching is a gentle body tilt, not a human skeletal stretch.

Activity motion takes priority over temporary reactions, which return to the current mood afterward. A greeting, task success or accessory selection can trigger a temporary reaction. Gemini only supplies one of a short cue allowlist; it cannot execute code or change records. Reduced motion suppresses continuous movement and gaze. Device-pixel ratio is capped at 1.5 and shadow rendering is disabled in the app to reduce phone GPU load.

Pointer tracking is scoped to Luma's canvas. Scrolling gestures cancel tap reactions. A single tap gives a gentle supplied tap reaction; double-tap triggers happiness; hold triggers curiosity. Enter/Space are keyboard alternatives. Cursor following outside the mascot canvas is intentionally limited so forms/menus do not move the character.

## Records and activities

Worklist has today, upcoming seven days and completed history, with optional scheduled times, priorities and notes. The past-seven-day study chart derives from completed focus sessions. Calendar events are separate records: overlaps are allowed, highlighted and never silently rescheduled. There is no automatic task/event duplication or recurring-task engine.

Focus/break timers count elapsed timestamp intervals, excluding pauses. A timer record has a stable UUID so retries overwrite its own record. Only full target-duration sessions are saved. A phone suspension does not count extra time beyond the target. A completion-save failure offers Retry save. Activities pause on navigation/background; no cancelled session is credited. There are no OS notifications or exact background alarms.

Money amounts are integer minor units, capped per entry. Currency changes the display unit, not exchange rates. CSV export includes only the selected month and neutralizes formula-leading text. JSON export contains the current mode's records. Local restore validates records and requires confirmation before replacement.

## Chat and data boundaries

The backend sends at most the last 12 completed exchanges as conversational context. Chat history is stored per owner. A message UUID provides retry identity; completed replies are reused and fresh pending requests reject duplicates. Failed or expired pending messages can be retried. A failure to save the provider response may require a second generation, but the record ID still prevents an extra displayed conversation record. Provider requests time out; configuration, quota and malformed output have explicit errors.

The composer is text-only. Optional reply speech uses the device's speech synthesis service and is independently disabled by default. There is no microphone/voice capture. The app describes MindPal as a supportive companion, not diagnosis or emergency care. AI messages have no tool access to tasks, finances, mood records or settings.

## Figma handoff

The foundations file is <https://www.figma.com/design/7IJNcMzsdZ5YiFlsjE5wPh>. It contains dark color variables, Manrope text styles and reusable button, field and card components. The full editable screen-generation action was not executed because automatic approval review hit a usage limit. An empty screen wrapper may therefore be visible. Treat the working application and this written design/code guide as the completed UI implementation, and the Figma file as partial foundations.
