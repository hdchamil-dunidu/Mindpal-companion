# MindPal 1.2 — setup and update guide

This release extends the delivered MindPal 1.1 project. It includes the Android APK and the same app for a laptop browser. The original Luma GLB and its animation assets are unchanged.

## Before updating

1. In the old app, open Settings → Export my data. Save the JSON backup somewhere safe.
2. Keep your old project folder and its private `.env` file. Never upload `.env`, `.env.backup`, database passwords, Gemini keys or Google client secrets.
3. Extract the new source ZIP into a new folder. Open the inner `MindPal` folder containing `package.json`.
4. If you already have a working `.env`, copy that actual file into the new `MindPal` folder. `.env.example` is only a blank template, not your configured settings. The setup command below can also create `.env` for you.
5. This APK uses a newly generated debug signing key. Android may reject it as an update to your old APK. If so, export your local data first, uninstall the old app, and install this APK. Uninstalling deletes local app records. Cloud records remain in MongoDB.

The version is now 1.2.0 (Android version code 3), so it is distinguishable from your previous 1.1 build.

## 1. Run on the Windows laptop

Use Node.js 22.9 or newer. Open the extracted `MindPal` folder in File Explorer, type `cmd` into the address bar, and press Enter. Run:

```bat
npm ci
npm run setup
```

The setup command asks for:

- **MongoDB connection string:** paste your private MongoDB URI. Input is hidden.
- **Database name:** press Enter for `mindpal`, or use your existing database name so you keep your data.
- **Gemini API key:** paste the key from your Google AI Studio API project. Input is hidden.
- **Gemini model:** press Enter for `auto`. MindPal discovers a compatible stable Flash model available to the key. Availability does not guarantee quota; the next check tests an actual response.
- **Public HTTPS address:** leave blank initially.
- **Google sign-in:** choose `n` initially if you have not created its OAuth client yet.

Existing values are kept when you press Enter. A private `.env.backup` is created before replacing an existing `.env`. A session secret is generated if missing. Keep an existing secret if you want existing sessions to remain valid.

Then run:

```bat
npm run check:services
npm run db:setup
npm start
```

Open **http://localhost:3000** in your laptop browser. Leave the terminal running.

- `check:services` actually pings MongoDB and sends one small Gemini generation request. It can consume API quota.
- `db:setup` creates ownership, session-expiry and Google identity indexes. It does not delete existing records.
- If a check fails, fix the reported setting before assuming the connection works. You can share the error message, with credentials removed.
- After changing `.env`, stop the server with Ctrl+C and run `npm start` again.

Click Continue → Create account. Your MindPal email/password are application credentials, separate from your MongoDB database username/password.

## 2. Find and check the MongoDB connection

If you use **MongoDB Atlas**:

1. Open your Atlas project and cluster. Choose Connect → Drivers → Node.js.
2. Copy the application's connection string.
3. Replace its username/password placeholders using a **database user** from Database Access. This is different from your Atlas website login.
4. Percent-encode special characters in the database username/password. For example, `@` in a password becomes `%40`. Do not encode the whole URI.
5. In Network Access, allow the laptop's current public IP address. A different Wi-Fi network can change this IP.
6. Put the completed URI into `npm run setup`; keep the database name the same as your old project.

Typical shape — an illustration, not working credentials:

```dotenv
MONGODB_URI="mongodb+srv://DATABASE_USER:ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB=mindpal
```

If you use MongoDB installed on the laptop, the Node backend can connect to it using your local URI instead. The phone still connects to the Node server; it never connects directly to MongoDB.

## 3. Verify Gemini

Use a Gemini API key from [Google AI Studio](https://aistudio.google.com/api-keys). A Gemini website subscription and an API project's quota are separate matters; inspect your API project's actual access and quota.

```bat
npm run models
npm run check:services
```

If a manually selected model returns `404`, choose an ID shown by `npm run models`, or set `GEMINI_MODEL=auto`. Auto selection prefers stable Flash Lite models returned by the API. It does not silently switch models after a generation failure.

In MindPal, sign in, open Talk to Luma, and send a message. In Settings → Connection settings → Test Gemini response, a signed-in user can test a real generation request separately from chat.

Error meanings:

| Message | What to check |
| --- | --- |
| Cannot reach MindPal | Laptop server/tunnel is stopped, address is wrong, or internet is unavailable. |
| MongoDB connection failed | URI, database user/password, cluster status, and IP access list. |
| Authentication not configured | Run setup to create a sufficiently long SESSION_SECRET. |
| Gemini key invalid / access denied | Key validity, key restrictions, project access, region and billing. |
| Model not found | Run `npm run models`; select a returned compatible model ID. |
| Quota or rate limit reached | API project quota/billing; wait before retrying. |
| Gemini response timed out | Check laptop internet and retry. |

Do not put a Gemini key into the APK, browser code or the Server address field.

## 4. Connect the APK to the laptop — no hosting required for this test

Your phone's `localhost` means the phone itself. It cannot reach the laptop backend using `http://localhost:3000`. Use a temporary HTTPS tunnel for phone testing.

Install [Cloudflare cloudflared](https://developers.cloudflare.com/tunnel/downloads/) on Windows. With Windows Package Manager, the installation command is:

```bat
winget install --id Cloudflare.cloudflared --exact
```

Open a **second terminal** after installation. Keep `npm start` running in the first terminal. Run:

```bat
cloudflared tunnel --url http://localhost:3000
```

Cloudflared prints a URL shaped like `https://random-words.trycloudflare.com`.

1. Copy the exact URL it prints.
2. Install and open `MindPal-debug.apk` on the phone.
3. Open Connection settings from the sign-in page, or Settings → Connection settings.
4. Paste the tunnel's HTTPS URL into **Server address**, and tap Check connection.
5. Sign in using the MindPal account you created on your laptop. Then test chat.

The laptop must stay on with both the server and tunnel running. Both devices need internet; they do not need the same Wi-Fi when using the tunnel. The tunnel URL changes when it restarts, so update the phone's address then.

For laptop testing through the public URL too, set `MINDPAL_PUBLIC_SERVER_URL` to that URL in `.env` and restart Node. This also allows that exact browser origin in CORS. The Android app origin is already allowed.

Quick Tunnels are temporary testing services, not permanent hosting. Anyone with the URL can reach your server's public pages; account data remains behind authentication. Do not add an interactive Cloudflare email-access layer for the APK's API requests.

For daily use without the laptop, deploy this Node project to an HTTPS Node host, set its environment variables privately, allow its outbound IP in MongoDB, and configure that permanent URL in the app. The APK does not contain a hosted backend.

## 5. Set up Google sign-in

Google sign-in is implemented through your Node backend. The laptop opens a browser popup; the APK opens the phone's external browser. After completing Google sign-in, return to MindPal. The app polls its single-use sign-in request and loads your account. It does not try to sign in inside the Android WebView.

In [Google Cloud Console](https://console.cloud.google.com/):

1. Select/create the project for MindPal.
2. Configure Google Auth Platform / OAuth consent branding and audience. While testing, add your Google account as a test user when required.
3. Create an OAuth client of type **Web application** for the Node backend.
4. Add the exact authorized redirect URI:
   - Laptop-only: `http://localhost:3000/api/auth/google/callback`
   - Phone testing: `https://YOUR-TUNNEL-HOST/api/auth/google/callback`
5. Copy the client ID and client secret into the backend using `npm run setup`, answering `y` to Google configuration.
6. Set `GOOGLE_REDIRECT_URI` to the URI matching the flow you will test. For phone testing, use the HTTPS URI, because the callback opens on the phone.
7. Restart `npm start`.

Example shape:

```dotenv
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_PRIVATE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="https://YOUR-TUNNEL-HOST/api/auth/google/callback"
MINDPAL_PUBLIC_SERVER_URL="https://YOUR-TUNNEL-HOST"
```

Click **Continue with Google**. Allow the popup in the laptop browser if asked. The request expires after five minutes.

If the tunnel URL changes, update the registered Google redirect URI and `.env`. A stable HTTPS address is much more convenient for ongoing Google testing. `redirect_uri_mismatch` means the configured callback does not exactly match Google's registered URI.

If your email already has a password-based MindPal account, sign in with that password first. Open Settings → Link matching Google account. This avoids silently merging accounts based only on matching email addresses. Use the Google account with the same verified email.

Password reset by email is not implemented. The sign-in screen states this; it does not show a nonworking reset button. Email/password signup is implemented but does not verify ownership of the email inbox.

## 6. What changed

- **Welcome and accounts:** MindPal branding, floating original 3D Luma, subtle floating shapes, Continue screen, email/password login and signup, password confirmation/show controls, Google sign-in and explicit account linking, sign-out and local-profile exit.
- **Calendar:** week navigation, date picker, Today shortcut, event markers, daily summary, chronological cards, overlap labels, edit/delete, special-day cards and optional foreground reminders.
- **Tasks:** date/time/priority/notes, CRUD and completion, real progress, hourly/today/seven-day/completed/all views, focus sessions and weekly study progress retained. Tasks and calendar events remain separate collections.
- **Luma:** one shared original 3D scene, full-size on welcome/chat/customization, mini companion elsewhere, tap/pointer reactions, greeting/celebration/thinking, minimize/visibility controls, reduced motion and hidden-app pausing. On mobile, the mini scene gets reserved space to keep it out of form controls.
- **Mood:** a matching expression for about fifteen seconds, followed by a suggested activity. Luma returns to idle; the selected colour theme remains. Saved check-ins retain activity links and feedback.
- **Money:** transaction time/description/payment method; category suggestions and custom categories; search/category/amount/payment filters within selected date periods; CSV preview/dedup/import/export; recurring payments; daily/weekly/monthly/category budgets; configurable alert thresholds; savings goals; charts; numerical weekly/monthly/yearly reports; current-record comparisons; Gemini recommendations and weekly plans; financial chat using backend-calculated statistics.
- **Connection:** interactive private `.env` setup, live DB ping, real Gemini generation test, available-model listing, automatic compatible model discovery, clearer provider errors and timeout handling.

Finance notes:

- All money calculations use integer minor units. Net cash flow is income minus expenses, not an account balance.
- Savings goals are user-confirmed amounts; there is no bank connection. Allocating savings in a plan does not create an expense.
- Record recurring payments when paid. Scheduling a future payment does not count it as spending. The payment ID prevents duplicate records if retrying the same occurrence.
- Weekly plans reserve recurring commitments and savings before allocating discretionary funds. Draft plans need acceptance. You can edit allocations and enable daily carry-forward.
- Gemini recommendations are qualitative. Supporting numbers and hypothetical savings are computed from the recorded data. AI cannot modify records by chatting; open the planner to create/accept a plan.
- Numerical reports work without Gemini. Automatic reports for completed weeks/months run when the app opens and only when records exist. There is no background server scheduler or push service. Gemini reviews are manual.
- Saved reports recalculate figures from current transactions. Old AI commentary is a dated interpretation; regenerate it after corrections.
- Currency changes relabel amounts; they do not perform currency conversion.
- Local and cloud records remain separate. Signing in does not silently upload local records. Export a backup before switching; finance CSV can be imported into the selected account with your confirmation.

## 7. Verification and limitations

Read `docs/TEST-RESULTS.md` for the exact test results and remaining checks. Automated provider tests use controlled test doubles; no user credentials were provided for live MongoDB, Gemini or Google OAuth verification. Run the service checks above and then test a real sign-in/chat on each device.

Browser visual/WebGL testing could not run in the build environment because Chromium was denied a required socket operation. DOM workflow tests exercise application controls and persistence but do not establish visual layout, animation quality, Android keyboard behavior, or phone performance. Those still need laptop and physical-phone checks.

## 8. Rebuild an APK later

Changing frontend or Java code requires rebuilding the APK. Changing private backend keys does not.

Option A: open `android` in Android Studio and build a debug APK using its normal build tools.

Option B: use the included direct-build script with Android SDK Build Tools 35.0.0 and Android platform 35:

```text
python scripts/build-apk.py --sdk YOUR_ANDROID_SDK_PATH
```

The direct script uses `javac`; an optional `--ecj PATH_TO_ECJ_JAR` can provide the Java compiler instead. Keep a stable private signing key for your own future builds. The delivered APK is a debug testing build, not a Play Store release.

## References

- MongoDB Atlas connection guide: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
- Gemini models and API: https://ai.google.dev/gemini-api/docs/models
- Google OAuth web-server flow: https://developers.google.com/identity/protocols/oauth2/web-server
- Cloudflare Quick Tunnels: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
