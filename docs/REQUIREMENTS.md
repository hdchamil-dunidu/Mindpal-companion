# MindPal — Complete Android App and Laptop Version: Updated Developer Prompt

Build and deliver a complete, working MindPal application using any suitable technology. The primary deliverable is an installable Android app, with a usable laptop/browser version. This is an implementation request: produce the project, assets, backend, database integration, APK where the build environment permits, tests, and documentation—not just a design, prototype, or implementation plan.

## 1. Resolve the existing project and choose the technology

Inspect the supplied project, original Luma 3D model, animations, screenshots, audio assets, frontend, backend, authentication, database code, and Gemini integration before making changes.

You may choose any suitable technology or migrate the project when necessary to meet the requirements. Prefer preserving useful, working code and assets when practical. Explain the chosen architecture and any necessary migration in the documentation. Avoid unnecessary dependencies, duplicate components, and parallel implementations of the same feature.

If no project source is provided, build the application from scratch using the supplied Luma assets and visual references. If the exact original model or essential assets are missing, ask for them rather than silently substituting another character.

Target Android 14 on an Honor X5 and laptop use. Online access is acceptable; full offline operation is not required. Make the interface responsive and efficient enough for the target phone. Use real integrations and persisted user data. Do not simulate successful AI replies, database writes, task completion, or APK builds.

## 2. Requirements that replace earlier instructions

These updates take priority over conflicting earlier requirements:

- Technology is flexible; retaining the original stack is not mandatory.
- Android is a primary deliverable, alongside laptop/browser support.
- The home page focuses on Luma, chat access, expandable interactions, and expandable customization.
- Do not display Worklist, Calendar, Mood Check-In, or other dashboard cards below Luma on the home page. Open those features through the top-left navigation menu.
- Keep the supplied Luma character exactly recognizable: preserve its round pearl-white body, eyes, proportions, materials, and identity. Improve animation and facial behavior without redesigning it.
- Use the MindPal screenshot for mascot scale and main-page proportions. Use the other references for timeline layout and mood colors only; do not copy their light backgrounds or unrelated branding.
- Gemini is the required AI provider.
- Use the supplied MongoDB-compatible Azure database through the backend.
- Add coordinated sounds for interactions, activities, and feedback, with persistent sound settings and a master mute.

Preserve all other existing features, user records, and routes where applicable. Document any necessary route migration.

## 3. Visual design and home page

Keep MindPal branding, typography, and the polished style of the supplied screenshot. Use a nearly pure black background with a brighter, soft radial glow centered behind Luma. The glow is strongest near the center and fades smoothly into black toward the edges.

Keep the glow behind the character so it does not wash out Luma's pearl material, eyes, or expressions. Improve brightness while maintaining readable text and comfortable contrast. The mood determines the glow and coordinated interface accent colors.

Match Luma's relative size and placement in the supplied MindPal mobile screenshot; do not make it noticeably smaller. Adapt to different screen sizes without cropping the character. Respect safe areas, the Android status/navigation areas, and the on-screen keyboard.

Home page elements:
- Top-left navigation button.
- MindPal branding and profile access.
- Date and personalized greeting.
- The large interactive Luma character.
- Friendly status or activity text.
- Chat composer and access to the complete conversation.
- Compact Interactions and Customize controls that expand only when selected.

Use expandable panels, drawers, or bottom sheets that are easy to discover and close. Show only relevant controls while an activity is running. Keep Luma visible where practical; full-screen feature pages may use a smaller persistent Luma companion.

Do not show every interaction or customization option at once. Choose clear icons, accessible labels, comfortable touch targets, and positions that do not obstruct Luma or chat.

## 4. Navigation

Use a top-left drawer for primary feature selection. Keep the earlier main destinations available: Overview/Home, Talk to Luma, Customize, and Money Management. Make Worklist, Calendar/Day Plan, Mood Check-In, and Settings reachable from this drawer, using logical grouping or nested entries.

Interactions and customization must also be accessible through expandable controls on the main page. Breathing, stretching, dancing, and other existing mascot interactions should be discoverable through the interaction panel.

Ensure Android Back closes an open panel or returns to the previous screen predictably. Preserve state when changing sections where appropriate.

## 5. Luma's 3D behavior

Preserve the existing cursor interaction and support touch interaction on Android.

- On laptop, Luma's eyes and face follow the cursor naturally within comfortable limits.
- On Android, Luma follows touch positions and reacts to taps and appropriate gestures.
- Prevent pointer tracking from interfering with scrolling, form controls, menus, or the chat composer.
- Add natural blinking, subtle idle movement, and smooth transitions between expressions.
- Maintain the original available reactions, including greeting, working, happy/love, wink, yawn, dance, annoyed, angry/error, stressed, tired, and existing tap reactions.
- Preserve existing tap/slap-style interaction if supplied, keeping it playful and gentle.
- React to selected moods, task completion, all-daily-tasks completion, chat input, AI replies, dancing, breathing, stretching, and customization.
- When a user says “hi,” show a greeting reaction and play a short greeting sound if enabled.
- During chat, use appropriate listening/thinking/responding expressions. Let replies influence expressions through a validated, limited set of animation cues.
- Do not execute arbitrary AI-generated animation commands or let chat override user preferences.
- Coordinate mood, activity, and temporary reactions so animations do not fight each other. Return to the appropriate mood/idle state afterward.

Use the existing rig, animation clips, facial controls, or model-compatible procedural animation. If richer expressions require model changes, preserve appearance and document the approach. Explain limitations honestly.

## 6. Mood Check-In

Fix the Sad mood bug at its actual source, including identifier mapping, selected state, rendering, persistence, and expression binding.

Provide existing moods and the reference palette where applicable: calm green, joy yellow/gold, anxious lavender, tired muted blue, and love rose. Give Sad a distinct readable blue tone. Map every existing mood consistently and show text labels, not color alone.

When a mood is selected:
- Update the selected state immediately.
- Change the whole interface's accents, surfaces, highlights, and Luma glow smoothly while keeping the black base.
- Change Luma's eyes, facial expression, and reaction.
- Play a subtle mood-selection sound when enabled.
- Save the check-in with user ownership, timestamp, and optional note.
- Clearly show whether saving is pending, successful, or failed; recover correctly from failed saves.
- Restore the relevant saved mood on reopening the app.
- Display mood history and a summary using real records.

Use the emotion reference for colors and visual grouping, adapted to MindPal's dark theme.

## 7. Gemini chat

Implement real Gemini responses through a secure backend.

- Store the Gemini API key only in server environment settings.
- Never embed provider keys in the Android APK, browser bundle, source repository, screenshots, logs, or documentation.
- Display user and Luma messages in separate chat bubbles.
- Support sending, visible loading/thinking state, useful errors, and retry.
- Keep conversation context and persist each user's chat history securely.
- Prevent duplicate messages or replies after retries.
- Make the composer work with the Android keyboard and scroll new messages into view.
- Use friendly, natural replies and appropriate follow-up questions.
- Connect replies to Luma's expression and subtle sound feedback.
- Make any optional speech playback separately controllable; greeting sounds do not imply full voice chat.
- Treat MindPal as a supportive companion, not a medical diagnosis service.
- If configuration or quota is missing, show a clear real error rather than a fabricated answer.

Do not change plans, moods, finances, or other saved records solely because the model suggests doing so. Any supported chat-driven action must be validated and confirmed through the relevant user flow.

## 8. Worklist and focus

Keep existing Worklist capabilities and complete their functionality:

- Hourly, daily, and weekly plans.
- Task creation, viewing, editing, deletion, priority, date, and time.
- Immediate completion feedback with reliable database persistence.
- Completed-task history and accurate task progress.
- Happy Luma reaction, encouraging message, and optional success sound.
- One coordinated celebration when all daily tasks are completed.
- Weekly study progress and suggestions derived from real activity.

Provide a configurable focus timer with breaks, start/pause/resume/reset, and saved sessions. Calculate duration accurately across navigation and app suspension. Never count a paused or incomplete session as completed work. Explain background timer and notification behavior for Android.

## 9. Calendar and day plan

Use the planning reference for a readable weekly date strip, selected-day state, chronological timeline, and scheduled-event cards, adapted to the black MindPal theme and active mood accents.

Support creating, viewing, editing, and deleting events with title, date, start/end time, and optional details. Validate required fields and end time after start time. Explain overlap handling. Saved events must immediately appear in the correct date/time position and remain after reopening the app.

Keep calendar events and Worklist tasks distinct unless there is an explicit, documented linking feature. Do not create duplicate entries automatically.

## 10. Dancing, breathing, and stretching

Dancing:
- Use suitable licensed or original tracks and working dance animations.
- Provide play, pause, resume, stop, mute, and volume controls.
- Show an appropriate Luma reaction and completion feedback when finished.
- Stop audio and clean up playback when leaving the activity.

Breathing and stretching:
- Provide clear instructions, timers, and start/pause/resume/stop controls.
- Synchronize the breathing guide, countdown, and Luma animation.
- Use calming activity accents without losing the chosen mood state.
- Offer optional relaxing audio and calm Luma expressions.
- Show completion feedback and persist activity records where supported.
- Avoid recording cancelled activities as completed sessions.

Stop activity audio on navigation away. Define app-background behavior and prevent unintended playback.

## 11. Sound system and settings

Provide appropriate sound feedback for all meaningful interactions: greeting, mood changes, mascot taps/reactions, chat send/receive, task success, celebrations, dance, breathing, stretching, and customization selection.

“Sound for every interaction” means a coherent set of contextual cues, not continuously playing sounds for every cursor movement.

Include persistent settings for:
- Master mute.
- Interface/reaction sounds on or off.
- Background/activity music on or off.
- Sound-effect volume and music volume.
- Optional voice playback, if implemented.
- Reduced motion.

Mute must take effect immediately, including currently playing audio. Keep music controls and interface-sound preferences coordinated. Avoid loud defaults, repetitive loops, stacked sound effects, or multiple simultaneous music tracks. Begin playback only after a permitted user action. Dispose of audio resources correctly.

Make tracks and sound mappings easy to replace later. Include an asset manifest with source, license, and purpose. Do not download copyrighted commercial music without permission.

## 12. Customization and existing features

Show customization through an expandable interface matching the interaction panel. Preserve the original Luma body and appearance while applying supported accessories or cosmetic options. Keep blinking, gaze, moods, and animations working with accessories.

Persist each user's selected customization and enforce any existing unlock rules. Preserve Money Management and all other existing features, including working CRUD, validation, totals, categorization, and exports where already required. Do not silently remove functionality while redesigning the main page.

## 13. Backend, MongoDB, and authentication

Use the supplied Azure-hosted MongoDB-compatible endpoint through backend code only. The connection string was shared in conversation and includes credentials; require the database password to be rotated before deployment. Do not copy the exposed password into this project or its documentation.

Provide a secret-free environment example:

MONGODB_URI=<newly rotated connection string supplied privately>
MONGODB_DB=mindpal
GEMINI_API_KEY=<private Gemini API key>
GEMINI_MODEL=<supported model selected at implementation time>
SESSION_SECRET=<generated private session secret>

Use the provider-required TLS/authentication/connection options. Verify compatibility with this specific database service, rather than assuming every MongoDB feature is available.

Persist users, mood check-ins, tasks, calendar events, chats/messages, focus/activity sessions, settings, customization, and finance records as applicable. Validate requests on the server, enforce record ownership, protect authentication, and handle connection errors clearly.

Include required indexes/setup instructions and safe migrations. Do not delete existing data or insert fake personal activity. Do not expose a direct database connection or database credentials to either client.

The installed APK must reach a deployed HTTPS backend. Document that a local laptop backend is only a development setup, with explicit instructions for phone access; localhost on the phone does not refer to the laptop.

## 14. UX, performance, and verification

Check every button, menu, form, icon, navigation link, animation, sound control, and CRUD flow. Fix causes of bugs rather than hiding broken behavior. Include loading, empty, success, and error states.

Support accessible labels, readable contrast in every mood, keyboard use on laptop, comfortable touch targets, and reduced motion. Avoid hover-only controls. Optimize the 3D scene, glow, assets, rendering quality, and animation cleanup for the target phone without changing Luma's identity.

Run the project's applicable build, lint, type checks, and tests. Verify:
- Sad and every other mood, persistence, global colors, and expression changes.
- Cursor tracking, touch tracking, blinking, and expression transitions.
- Real Gemini replies, history, failures, and retry behavior.
- Task/event CRUD, progress, dates, focus accounting, and user isolation.
- All audio controls, master mute, sound persistence, and navigation cleanup.
- Drawer, expandable panels, Android Back, keyboard, and screen resizing.
- Customization and preserved finance features.
- Database connectivity, authentication, and backend access from Android.
- Android build/install/startup and laptop operation.

Use an emulator and the target phone where available. Clearly separate actual device testing, automated tests, code review, and checks that could not be run. Never claim a successful test or APK build without performing it.

## 15. Deliverables and completion criteria

Deliver:
1. Complete source project, frontend, backend, Android project/build configuration, and all required assets.
2. Installable APK when the environment supports building it; otherwise the exact build command and a clear account of the remaining blocker.
3. Laptop/browser version and instructions.
4. Secret-free environment example.
5. Database setup, schema/collection descriptions, indexes, and migration instructions.
6. Documentation covering prerequisites, installation, configuration, Gemini setup, database setup, local run, phone-to-backend connection, HTTPS backend deployment, Android debug/release builds, signing, installation, and troubleshooting.
7. Architecture and code-location guide for mood mapping, expressions, interactions, audio, settings, API integration, and future updates.
8. Asset licenses and replacement instructions.
9. Test results and a feature completion table distinguishing working, untested, blocked, and configuration-dependent features.
10. A distributable source archive without secrets, signing credentials, or unnecessary generated dependencies.

Double-check the finished project against every requirement. Work through implementation and verification until the authorized scope is complete. Ask only for essential missing assets, secrets, or decisions that materially block progress. Choose sensible defaults for routine details. Do not leave placeholder interactions, dead controls, fake AI responses, or silently failed data writes.

