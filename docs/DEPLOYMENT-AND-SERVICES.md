# Hosting, AI, Google and Apple

## Node.js deployment

MindPal uses Next.js route handlers and the MongoDB Node driver. Deploy the full project to a host that supports Next.js on Node.js and outbound MongoDB connections. A static file host alone cannot run this backend. The original Luma demo link has not been changed by this delivery.

1. Create a private source repository if you want one. `.gitignore` excludes `.env.local`, node_modules, build output and Android signing files.
2. Configure your Node hosting environment with Node 22 or newer.
3. Set server environment variables from `.env.example`.
4. Set `NEXTAUTH_URL` to the exact HTTPS origin, for example your own `https://mindpal.yourdomain.com`.
5. Set a fresh random `NEXTAUTH_SECRET`, generated locally by `npm run setup` or a trusted secret generator. Keep it stable across deployments.
6. Set your MongoDB Atlas connection and database name. Allow the hosting environment’s database traffic in Atlas.
7. Install with `npm ci` and build with `npm run build`. Start with `npm start` if the host asks for a start command.
8. Run the database setup against the intended deployment database from a trusted local environment (`npm run db:setup` after configuring that environment). The initialization command creates indexes, not sample data.
9. Verify registration, login, a saved task, a second-account isolation check, and the GLB download at `/models/luma-pearl.glb`.
10. Test installation and voice on HTTPS, then follow the Android guide if wanted.

The application performs exact Origin checks for state-changing API requests. Do not configure multiple unrelated frontend origins against the same backend without intentionally designing and testing that policy. Keep the frontend and API on the same origin for this build.

No public deployment or hosting account has been provisioned in this package. A real production launch also needs your own backup, monitoring, retention and operational decisions.

## Environment reference

| Variable | Meaning |
|---|---|
| `MONGODB_URI` | Server-side MongoDB connection string |
| `MONGODB_DB` | Database name; defaults to `mindpal` |
| `NEXTAUTH_URL` | Exact browser-facing application origin |
| `NEXTAUTH_SECRET` | Random secret for authentication tokens |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth web credentials |
| `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` | Apple Services ID and signed client-secret JWT |
| `AI_API_KEY` | Server-side provider credential |
| `AI_BASE_URL` | OpenAI-compatible API root, including `/v1` where required |
| `AI_MODEL` | Model name available to your provider account |

Never prefix these secrets with `NEXT_PUBLIC_`. Restart the application after editing environment variables.

## Google sign-in

1. In Google Cloud, configure the OAuth consent screen for your application.
2. Create OAuth credentials of type **Web application**.
3. Add the exact authorized JavaScript origin used by your app.
4. Add the authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Hosted: `https://YOUR-DOMAIN/api/auth/callback/google`
5. Put the ID and secret into the two Google environment variables.
6. Add permitted test users if the OAuth consent configuration is in testing mode.
7. Restart and test Google sign-in in the browser.

The Google button is disabled if its credentials are absent. Existing email/password accounts are not automatically linked to a new OAuth account with the same email. Use the original sign-in method; automatic email-only linking is deliberately not enabled.

Reference: https://next-auth.js.org/providers/google

## Apple sign-in

Apple sign-in requires your Apple developer configuration; it is not enabled merely by adding an Apple logo.

1. Configure an App ID with Sign in with Apple and an associated Services ID for the web application.
2. Register and verify your hosted domain as required by Apple.
3. Configure the HTTPS return URL: `https://YOUR-DOMAIN/api/auth/callback/apple`.
4. Create the Sign in with Apple key and retain its private key securely.
5. Generate a signed client-secret JWT according to Apple’s requirements (team ID, key ID, Services ID and expiry). Put that JWT in `APPLE_CLIENT_SECRET`; do not paste the private key into the client bundle.
6. Set `APPLE_CLIENT_ID` to your Services ID.
7. Restart and test the hosted HTTPS flow. Apple does not provide an ordinary localhost workflow equivalent to Google’s.
8. Renew the client-secret JWT before it expires.

The provider may provide a name only on initial authorization. The profile screen lets the user complete their display name/username later. Apple authorization is not live-tested in this delivery.

References:
- https://next-auth.js.org/providers/apple
- https://developer.apple.com/documentation/signinwithapple

## AI setup

This integration sends server-side requests to an **OpenAI-compatible Chat Completions endpoint**. A provider with a different API format needs an adapter in `app/api/chat/route.js`.

Example environment shape:

```dotenv
AI_API_KEY=YOUR_PRIVATE_PROVIDER_KEY
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

The supplied model is a configurable default, not a promise of access, pricing, or availability in your account. Use a model your provider supports. No paid service account is created by this project.

After changing the configuration, restart Next.js. Chat should then identify itself as an AI companion instead of Demo. If the provider rejects the request, the screen displays an error and does not pretend to have received an AI reply.

When the key is absent, the backend returns one of a small set of predefined support/productivity responses. It records those messages with `mode: demo`, and the UI identifies them accordingly.

### Personal context

Default: **off**. Settings → Personalized AI context → enable → Save.

When enabled, the server includes:

- Up to five recent mood entries and their notes.
- Up to fifteen open tasks and their due dates.
- Up to seven completed focus records.

The provider also receives a limited recent chat history for conversation continuity. Finance records are not included in personalized context. Disabling the setting stops new activity attachments; previously sent provider data is outside the app’s control. Clearing chat deletes this app’s stored messages, not the provider’s records.

The integration tests used a local stub endpoint to verify request format and opt-in/opt-out behavior. They did not call a paid provider.

## Voice and notifications

- Voice input uses browser speech recognition, with a visible start/stop control and error feedback.
- Spoken replies use device/browser speech synthesis; voice availability varies.
- Microphone processing may be handled by the browser vendor. No silent background recording is implemented.
- Browser notifications require permission and a compatible environment. Android uses a service-worker notification when available.
- Reminders are checked while the app is open. There is no closed-app push server in this project.

## Data and arithmetic

- Every activity query and mutation uses the authenticated `userId`.
- Mutable collections are selected from an allowlist, not arbitrary names from a client.
- Body schemas reject invalid date/time ranges and invalid amounts.
- Passwords use bcrypt; session cookies are HttpOnly.
- Money is stored in integer minor units: LKR 12.50 = `1250`.
- Mood analytics are self-reported reflections. Stressed, Anxious and Lonely are summarized categorically, not assigned fabricated severity values.
- Display/report day boundaries use the saved IANA timezone, defaulting to Asia/Colombo.
