# Installation and setup

## 1. Use the Android app now

1. Download `MindPal-debug.apk` to your phone and open it in Files.
2. If Android asks, allow installation from that particular file or browser app, then install MindPal. You can turn that permission off afterward.
3. Open MindPal, choose Continue, enter your first name, and choose Meet Luma.
4. Open the top-left menu for Mood check-in, Worklist, Calendar, Focus, Money and Settings. Interactions and Customize expand from Home.

The APK targets Android 14 / API 34, compiles against API 35 and supports API 26 onward. Its package is `app.mindpal`, version 1.0.0. It contains Java bytecode and web assets, with no CPU-specific native library. Keep Android System WebView updated. Device support depends on working WebGL2 and a current WebView. The Honor X5 was not available for installation/performance testing.

This is a debug-signed personal test build. Export your local data in Settings before uninstalling it or installing a differently signed version. Android may require uninstalling the delivered build before installing your own build because their signing keys differ. No signing key is distributed.

## 2. Laptop version

Install Node.js 22.9+ from <https://nodejs.org>. Extract the source archive, open its `MindPal` folder, and run:

```sh
npm ci
npm start
```

Open <http://localhost:3000>. Windows users can instead double-click `START-MINDPAL.bat`. Node 24.19 was used for verification. The Windows launcher was reviewed but not run on Windows.

No `.env` is required for local mode. Local records stay in that browser profile, separate from the phone. Export a JSON backup in Settings and restore it on the other device if you want to move local records. Restoring requires confirmation and replaces the destination's local records; conversations from a cloud account are not imported into local mode.

## 3. Configure the optional cloud backend

The app needs a public HTTPS server address, not provider keys. The project has a real Node HTTP API, MongoDB driver integration and a Gemini REST integration. Hosting was not selected, and no service credentials were available, so no paid hosting was created and no live cloud test was possible.

Copy `.env.example` to `.env` for local development. On a hosted service, enter the same values in its private environment settings instead. Do not commit `.env` or place secrets in `web/` or `android/`.

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Newly rotated connection string from your Azure database portal, including its required connection options |
| `MONGODB_DB` | `mindpal`, or a new isolated database name for first deployment |
| `GEMINI_API_KEY` | Your private Gemini developer API key |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` is the supplied configurable default; verify access with your key |
| `SESSION_SECRET` | A private random value with at least 32 characters |
| `ALLOWED_ORIGINS` | Exact comma-separated client origins; include `https://appassets.androidplatform.net` and your HTTPS website origin |
| `PORT` / `HOST` | Hosting platform's assigned port / `0.0.0.0` |
| `NODE_ENV` | `production` on the hosted server |

Generate a session secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Save the result directly in your private server environment. Do not send it in a chat. Changing this value invalidates existing sessions; users can sign in again. User identities remain stable across session-secret rotation.

The requirements mention a database credential exposed in an earlier conversation. No such credential was available or copied into this project. Rotate that database password in Azure before deploying. Keep the complete new URI private and use the provider's exact TLS, authentication, replica-set and retry-write settings. Do not disable certificate verification. The exact Azure service/tier remains unknown; see DATABASE.md before running setup.

### Gemini

Create a key in [Google AI Studio](https://aistudio.google.com/apikey), with an appropriate quota/billing configuration. Set the key only on the backend. The default model was selected from Google's stable model documentation on 2026-10-11; model availability can change and has not been tested with your account. See the [model reference](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) and [deprecations](https://ai.google.dev/gemini-api/docs/deprecations).

```sh
npm run db:setup
npm run check:services
```

`db:setup` creates the listed indexes and pings the database. `check:services` independently checks the database and the configured Gemini model metadata. A successful model lookup does not prove response generation or quota. Then send a real message from the app, test one follow-up, reload, and verify the saved history. Failed replies can be retried without intentionally duplicating a completed reply.

### Deploy over HTTPS

Use a host that runs Node.js 24 or the included Dockerfile. For a Node service, use build command `npm ci --omit=dev` and start command `node server/index.js`. Set private environment values through the hosting dashboard. Serve traffic through the host's HTTPS endpoint. Include that origin in `ALLOWED_ORIGINS`. The health route is `/api/health` and reports configuration flags only; it does not ping providers.

Container example, on your own machine/server:

```sh
docker build -t mindpal .
docker run --env-file .env -p 3000:3000 mindpal
```

Place that container behind your host's HTTPS termination; `-p` alone does not create HTTPS. The Docker recipe is provided but was not built in the delivery environment. Configure Azure network access for the backend host, rather than exposing the database to clients. Run the database setup and service checks in the same environment as the hosted backend.

In Android: Settings → Connection settings → enter `https://your-real-server-domain` → Check connection → create an account. The browser can visit that same HTTPS origin and sign in to the same account. Local and cloud data remain separate; no automatic merge or deletion takes place. A cloud session token is held in session storage, so signing in again after restarting is expected.

### Phone-to-laptop development

`localhost` on a phone refers to the phone, not the laptop. The delivered APK requires an HTTPS backend with a trusted certificate; HTTP LAN addresses are deliberately rejected. Use your real deployed HTTPS endpoint or an HTTPS development endpoint forwarding to the laptop, configured with the same allowed origins. Keep the laptop server running for such a forwarding setup. No tunnel service has been created for you.

## 4. Android builds

Open `android/` in Android Studio. Install JDK 17, Android SDK Platform 35 and Build Tools 35.0.0. The Gradle wrapper uses Gradle 8.9 and Android Gradle Plugin 8.7.3. Internet access is needed for its first dependency download.

```sh
cd android
./gradlew assembleDebug
```

Windows: `gradlew.bat assembleDebug`. Output: `app/build/outputs/apk/debug/app-debug.apk`. Gradle rebuilds were not executed in the delivery environment; the direct toolchain below produced the actual delivered APK.

### Exact build route used for this delivery

The environment had a Java 17 runtime but no `javac`, so Eclipse ECJ 3.38.0 compiled the Java source. Official Android SDK 35 tools packaged, converted, aligned and signed the APK:

```sh
python scripts/build-apk.py --sdk /absolute/path/to/android-sdk --ecj /absolute/path/to/ecj-3.38.0.jar
```

With a full JDK, omit `--ecj`. This direct script is intended for Linux. It expects SDK `platforms/android-35` and `build-tools/35.0.0`, plus `java` and `keytool` on PATH. It calls `aapt2`, ECJ or `javac`, `d8`, `zipalign`, `apksigner`, then verifies the output. Its debug key is generated in a temporary directory outside the source. Output: `build/MindPal-debug.apk`.

### Release signing

For ongoing distribution use your own signing key, stored outside the project. In Android Studio, choose Build → Generate Signed App Bundle or APK and follow the signing flow for `app`. Keep encrypted backups of the signing key and its passwords. Never upload them with the source.

For a manual signed APK, build an unsigned release with `./gradlew assembleRelease`, create your key with `keytool -genkeypair`, then run the SDK's `zipalign` before `apksigner sign`. Let the tools prompt for the password rather than storing it in a command or repository:

```sh
zipalign -f 4 app/build/outputs/apk/release/app-release-unsigned.apk app-release-aligned.apk
apksigner sign --ks /private/path/mindpal-release.jks --out MindPal-release.apk app-release-aligned.apk
apksigner verify --verbose MindPal-release.apk
```

See [Android command-line builds](https://developer.android.com/build/building-cmdline) and [app signing](https://developer.android.com/studio/publish/app-signing). This delivery does not claim current Play Store policy compliance; review target-API and store requirements before a store submission.

## 5. Expected background behavior

Focus and break timers use timestamps, excluding paused time and capping the completed duration. A finished session is saved and announced when the app resumes. The recorded completion timestamp reflects its actual calculated deadline. There is no Android foreground service, exact alarm or background notification.

Dance, breathing and stretching pause when you leave the activity or background the app. Music stops, and restarting playback requires a user action. Cancelled sessions are not saved as completed. Device clock changes can affect timestamp-based focus timers; this is not a billing/timekeeping system.

## 6. Troubleshooting

| Symptom | Action |
| --- | --- |
| Chat says a connected server is required | Configure the backend, connect its HTTPS address, and sign in. Local mode does not include an AI provider. |
| Server reached but not ready | Set `MONGODB_URI` and a valid `SESSION_SECRET`; restart the server. |
| Database connection error | Check the rotated URI, TLS options, Azure firewall/network access and service type. Run `npm run db:setup` on the backend host. |
| Gemini rejected configuration / quota reached | Check the API key, model access, billing/quota and provider status. No fallback fabricated reply is returned. |
| Connection fails only on the phone | Use a real HTTPS origin; include the appassets origin in CORS. Phone localhost is not the laptop. |
| Luma cannot load | Update WebView/browser; enable hardware acceleration/WebGL. Planning tools still work if the 3D scene fails. |
| No audio | Tap Start or a reaction first, check device volume, master mute, activity music and volume. Speech also depends on installed system voices. |
| Data differs between devices | Local profiles are separate. Use export/restore or sign in to the same configured cloud account. |
| APK will not update | A different signing key may be installed. Export records before uninstalling; then install and restore the backup. |
| Session expired | Sign in again; server sessions expire after seven days. There is no email password-reset service. |
| Browser address already in use | Stop the other server or set another `PORT`; update `ALLOWED_ORIGINS` to include the new origin. |

Before relying on the app daily, run the physical-device checklist in TEST-RESULTS.md. Keep periodic backups of local records.
