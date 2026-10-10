# MindPal on Windows — from the beginning

## 1. Extract and open the project

1. Download `MindPal-Complete-Project.zip`.
2. Right-click it → **Extract All**. Do not open source files from inside the ZIP.
3. Put the extracted `MindPal` folder somewhere simple, such as `C:\Projects\MindPal`.
4. Open VS Code → **File → Open Folder** → choose that folder.
5. Choose **Terminal → New Terminal**. PowerShell is fine.

The folder must contain `package.json`, `app`, `components`, and `README.md` directly. It is not the old Luma standalone project.

## 2. Check Node.js

Install Node.js 22 or newer from the official Node.js site if needed. Then reopen VS Code.

```powershell
node --version
npm --version
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm` in the commands below, or select **Command Prompt** as the VS Code terminal profile. You do not need to weaken the machine-wide execution policy.

## 3. Install the project packages

From `C:\Projects\MindPal`:

```powershell
npm ci
npm run setup
```

This creates `.env.local` with a random `NEXTAUTH_SECRET`. Keep that file private. The setup command will not overwrite an existing environment file.

## 4. Choose one MongoDB option

### Option A — Local MongoDB for a laptop demonstration

1. Install MongoDB Community Server for Windows using MongoDB’s official installer.
2. During setup, choose to run MongoDB as a Windows service.
3. MongoDB Compass is optional but useful for viewing records during your demonstration.
4. In Windows Services, confirm **MongoDB** is running. Or inspect it:

```powershell
Get-Service MongoDB
```

5. Keep these values in `.env.local`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=mindpal
NEXTAUTH_URL=http://localhost:3000
```

If you already use Docker Desktop instead of a local MongoDB installation, this project also provides:

```powershell
docker compose up -d
```

The Docker mapping exposes MongoDB only on the local machine. Do not run both local MongoDB and Docker MongoDB on the same port. The compose configuration is intended for local development, not an exposed production database.

### Option B — MongoDB Atlas

1. Create your Atlas database deployment.
2. Create a database user with access to the MindPal database.
3. Allow the IP address of the machine or server running Next.js in Atlas Network Access.
4. Copy the **Drivers / Node.js** connection string into `.env.local`:

```dotenv
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_ENCODED_PASSWORD@YOUR_CLUSTER_HOST/?retryWrites=true&w=majority
MONGODB_DB=mindpal
```

Replace every placeholder with your real configuration. URI-encode special password characters. Never put this URI in a `NEXT_PUBLIC_` variable, paste it into chat, or commit it to Git.

## 5. Initialize indexes

```powershell
npm run db:setup
```

Expected message:

```text
MongoDB connected. MindPal indexes are ready. No sample users or activity were inserted.
```

If it fails, fix the connection before continuing. No Prisma generation, migrations, or MySQL service is needed.

## 6. Start MindPal

```powershell
npm run dev
```

Open **http://localhost:3000** in your browser. Keep the terminal running.

1. On the welcome page, move over Luma and tap the model.
2. Click **Continue**.
3. Click **Create account**.
4. Enter a name, lowercase username (letters/numbers/underscore), valid email address, and password of at least 10 characters.
5. Birthday is optional. Password confirmation must match.
6. Submit. You should reach your dashboard.

No verification email is sent. Use an account you control for real use. Email-verification and password-reset email flows are outside this build; the authenticated password-change screen is included.

Google and Apple buttons become available only after their credentials are configured. You can use email/password first.

## 7. Demonstrate the features in this order

### Welcome and Luma

- Show the real model rotating slightly toward the cursor.
- Tap it; repeat taps to see annoyance.
- Open Luma’s wardrobe and try greeting, dance, happy, tired, and other reactions.
- Test front, close-up, three-quarter, and orbit camera controls.
- Luma’s base appearance must remain unchanged when accessories are removed.

### Tasks and calendar

- Worklist → **Add task**.
- Enter a title, today’s date, priority, category, and optional time range.
- Save; edit it; complete it; reopen it.
- Try an end time earlier than the start time. The server should reject it.
- Create and delete a separate temporary task to demonstrate deletion.
- Calendar → add an Exam or Birthday event, edit its date, then inspect the selected-day agenda.

### Mood

- Select a mood and watch Luma react immediately.
- Add a short optional note and save.
- Open Mood history. New accounts correctly have little or no chart data.
- Multiple check-ins on one day count as one day toward the bow-tie reward.

### Focus

- Select Focus and set **1 minute** for a short demonstration.
- Start, pause, resume, then finish the minute.
- The completed session should appear in history and reports.
- You may navigate to another page while it runs. An open app reconciles completion.
- Reset cancels a session; it does not create a completed-session reward.

### Breathing

- Choose 1 minute, start, follow the circle, pause/resume, then complete.
- Stop a separate session to demonstrate that cancellation does not count as completion.
- Turn on the optional ambient tone only when wanted.

### Finance

- Add income and an expense in LKR.
- Edit the expense amount, set a monthly budget, and inspect the category breakdown.
- Try a zero or invalid amount: validation should reject it.
- Delete a temporary transaction and show that totals update.

### Chat

- Without an AI key, point out the **Demo companion** label before demonstrating it.
- Send a message, inspect stored history, and clear it if desired.
- Try the microphone in a compatible browser and allow permission when asked.
- Click a reply’s speaker icon; use Stop speaking if needed.
- Settings → enable personal AI context only if you want those records included with live AI requests.

### Rewards

- Complete 5 tasks to unlock Party Hat.
- Complete 10 focus sessions to unlock Crown (break sessions are excluded).
- Check in on 7 different days to unlock Bow Tie.
- Try available accessories, remove them, and save the look.
- Sign out and back in to verify persistence.

Do not invent old activity or change the database just to pretend the seven-day milestone was earned. Show the locked state and explain its rule during a short demo.

## 8. Run the production build

Stop the development server with `Ctrl+C`:

```powershell
npm run build
npm start
```

Open the same localhost URL. After the first setup, `START-WINDOWS.cmd` is a convenient development launcher; it checks MongoDB first.

## 9. Install the web app

On a supported desktop browser, use its **Install app** menu or the install icon when offered. On phones, use **Add to Home Screen / Install app**.

For a phone, host the app on HTTPS first. A phone’s `localhost` is the phone itself, not your laptop. A plain HTTP LAN address is not a dependable environment for PWA installation, microphones, or browser notifications. See `DEPLOYMENT-AND-SERVICES.md` and `ANDROID.md`.

## 10. Troubleshooting

| Symptom | What to check |
|---|---|
| `package.json` missing | Open the inner extracted `MindPal` folder; check with `dir package.json` |
| `npm` not recognized | Install Node.js and reopen the terminal |
| `npm.ps1` blocked | Run `npm.cmd` or use Command Prompt |
| MongoDB connection fails | Service running, correct URI, Atlas IP allowlist, username/password |
| Login fails after changing host/port | Use one consistent URL and set `NEXTAUTH_URL` to it; restart server |
| Duplicate registration | Choose a unique username/email or sign into the existing account |
| Luma is unavailable | Enable browser hardware acceleration/WebGL 2; reload; inspect console/network for the GLB |
| OAuth button unavailable | Its provider credentials are not configured |
| AI responds with demo text | `AI_API_KEY` is absent; restart after configuring it |
| Voice input unavailable | Browser support or microphone permission; typing still works |
| Notifications do not arrive after closing app | Closed-app push is not implemented; use open-app reminders |
| No charts yet | Add real records or complete sessions; there is no fabricated sample history |
| Port 3000 occupied | Stop the old server, or choose another port and update `NEXTAUTH_URL` consistently |
| Android build says domain not configured | Follow `ANDROID.md`; the reserved example domain is intentionally rejected |

## Useful database collections for your demonstration

Open MongoDB Compass with your connection string, then the `mindpal` database:

- `users`: profile, hashed password, preferences, accessory choices.
- `accounts`: Google/Apple provider account linkage, when configured.
- `tasks`, `events`, `moods`: planner and check-in records.
- `focus`, `breathing`: timestamped running/paused/completed/cancelled sessions.
- `transactions`, `budgets`: integer minor-unit amounts and monthly limits.
- `messages`: per-user chat history and demo/AI mode.
- `limits`: expiring request counters.

Authentication uses encrypted JWT session cookies, so a separate `sessions` collection is not required for this configuration. Never expose password hashes, account-provider data, cookies, or private user notes in a public presentation.
