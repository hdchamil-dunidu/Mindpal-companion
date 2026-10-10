# MindPal Android application

## What this project provides

`android/` is a separate Android Gradle project that launches your HTTPS MindPal web application using a **Trusted Web Activity (TWA)**. It installs as an Android application, uses your app name/icon, and runs the same Luma, authentication and MongoDB-backed features.

It is a web-powered Android app, not a separate native rewrite. It needs the hosted application to be online. Browser-based voice and notification support still depends on the device. No APK/AAB has been built, signed or tested in this delivery.

Why use this approach here: one implementation keeps the original 3D model and the same account data across laptop, phone and Android. OAuth runs through a real browser environment rather than an embedded WebView.

## 1. Host the web application first

Follow `DEPLOYMENT-AND-SERVICES.md` and confirm the site works on your phone through HTTPS. You must control that domain to serve Digital Asset Links.

A phone cannot use your laptop’s `localhost` as the app’s public URL. Do not use the example `.invalid` domain. The Android build intentionally refuses to use it.

## 2. Install Android build tools

Use Android Studio with:

- JDK 17.
- Android SDK Platform 35 and the Android build tools requested by Gradle.
- The Android SDK Platform-Tools for device installation.

The included project pins Android Gradle Plugin 8.9.2 and Gradle 8.11.1. The wrapper files are included; the wrapper JAR was checked against Gradle’s official SHA-256 value. Android Studio can download the pinned Gradle distribution and required dependencies when you open the project.

Open **the `android` folder** in Android Studio, not the entire Next.js folder. Let Gradle sync. If asked for the SDK location, use your local Android SDK directory. `local.properties` is machine-specific and excluded from the package/repository.

## 3. Choose your signing key

For a release build, use Android Studio’s **Generate Signed App Bundle / APK** workflow to create or select a keystore. Keep the keystore and passwords private and backed up.

To get its certificate fingerprint, run `keytool` and enter the password interactively:

```powershell
keytool -list -v -keystore "C:\private\mindpal-release.jks" -alias mindpal
```

Copy the **SHA-256** fingerprint (32 colon-separated hexadecimal byte pairs). Do not copy the password or private key.

For a debug-only local test, after Android Studio creates its standard debug keystore, inspect it with:

```powershell
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey
```

A debug certificate is not the certificate for a release or Play App Signing build. Digital Asset Links must include the certificate that actually signs the installed app.

## 4. Configure the project and domain association

Back in the root `MindPal` folder, run this command with your actual values:

```powershell
node scripts/configure-android.mjs "https://YOUR-DOMAIN" "YOUR:COLON:SEPARATED:SHA256:FINGERPRINT"
```

This updates:

- `android/app/build.gradle`: launch URL and verified host.
- `android/app/src/main/res/values/strings.xml`: app-to-site asset statement.
- `public/.well-known/assetlinks.json`: site-to-app statement.

The Android package ID is `com.mindpal.companion`. If you change it, update both the Gradle application ID and Digital Asset Links package name. The helper currently generates that package ID intentionally.

Redeploy the web app. Check this exact URL in a browser:

```text
https://YOUR-DOMAIN/.well-known/assetlinks.json
```

It must be public JSON served at the root-domain path. The certificate fingerprint must match the installed build. Until verification works, the browser can show a URL bar as a safe Custom Tabs fallback.

## 5. Build a debug APK

From the project root in PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

Expected output path after a successful build:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

Alternatively, use Android Studio’s build/run actions. If using a USB-connected phone, enable Developer options and USB debugging, select the device, and run the app. An emulator is also suitable for initial navigation tests, but test the 3D model and speech on a real device too.

## 6. Release build

Use Android Studio’s signing workflow to build a signed APK or Android App Bundle. Do not put keystore passwords into committed Gradle files. If distributing through Google Play with Play App Signing, use the appropriate app-signing certificate in the hosted Digital Asset Links statement.

This package does not submit or publish to an app store. Store policy and target SDK requirements must be checked at the time of distribution.

## 7. Device acceptance checklist

- App opens your actual HTTPS domain.
- Domain verification removes the browser URL bar where supported.
- Welcome model renders, blinks, tracks touch/mouse where applicable, and reacts to taps.
- Email sign-in works and user data persists after closing/reopening.
- Configured Google and Apple authentication return to the expected experience.
- Task edit/delete and finance edits sync with the desktop account.
- Focus timer reconciles elapsed time on returning to the app.
- Voice permission, input and spoken replies behave correctly on the target phone.
- Android back navigation behaves naturally.
- Rotation, keyboard appearance, and small screen layouts remain usable.
- Offline state explains that a connection is needed.
- Notification permissions and open-app reminder behavior match the documentation.

Official references:
- https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities
- https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide
- https://github.com/GoogleChrome/android-browser-helper
