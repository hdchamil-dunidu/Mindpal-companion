# MindPal 1.0

An Android and laptop companion built from the supplied written design and the original Luma developer assets. The Android app bundles the same responsive application that runs in a laptop browser. The supplied pearl-white GLB is unchanged.

**Start now:** install `MindPal-debug.apk`, choose Continue, and enter your name. Planning, mood check-ins, focus, activities, customization, and money management save on your device without an account.

**Connect later:** real Gemini chat and multi-device records require your own HTTPS backend, Gemini API key, and Azure MongoDB-compatible database. These were not configured during delivery. The app displays an explicit connection error until they are configured; it does not invent AI replies.

## Run on a laptop

Install Node.js 22.9 or newer (tested with 24.19). Extract this project. On Windows, double-click `START-MINDPAL.bat`, or run these commands in the project folder:

```sh
npm ci
npm start
```

Open <http://localhost:3000>. Keep the terminal open while using the app. Use the same browser and address to retain local records. `localhost` and `127.0.0.1` have separate browser storage. Internet access is needed for the first dependency installation; the included assets have no CDN dependency.

## Documentation

- [Setup, hosting, installation, and troubleshooting](docs/SETUP.md)
- [Architecture, behavior, and code guide](docs/ARCHITECTURE.md)
- [Database schema, indexes, and migration](docs/DATABASE.md)
- [Asset sources, licenses, and replacements](docs/ASSETS.md)
- [Validation results and completion table](docs/TEST-RESULTS.md)
- [Original written requirements](docs/REQUIREMENTS.md)

## Verify and build

```sh
npm test
npm run check
```

For browser tests, stop any existing server on port 3000, then install the test dependency and browser:

```sh
npm install --no-save playwright@1.62.1
npx playwright install chromium
node scripts/ui-smoke.cjs
```

Tests use an isolated browser profile and test data. Backend tests use explicit test doubles; they do not assert that Azure or Gemini is connected.

With JDK 17 and Android SDK platform 35 installed:

```sh
cd android
./gradlew assembleDebug
```

On Windows use `gradlew.bat assembleDebug`. The APK is in `android/app/build/outputs/apk/debug/`. A direct SDK build is also supplied in `scripts/build-apk.py`; that is the route actually used to produce this delivery. See the setup guide for prerequisites, signing and the exact command.

## Delivery limits

The APK was built, aligned and signature-verified. Browser flows and isolated backend/domain tests ran successfully. No physical Honor X5 or Android emulator was available. Android installation, native document dialogs, battery behavior and device audio still need checking on your phone. Real cloud connectivity is configuration-dependent. This is a debug-signed sideload build, not a Play Store release.

The Figma file contains reusable foundations. Its full screen write was blocked by an automatic approval usage limit. The app itself implements the written design.
