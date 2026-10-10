# Verification record

Delivery checked on 10 October 2026. This separates executed checks from features that still need credentials or a real browser/device.

## Executed checks

| Check | Result |
|---|---|
| Dependency installation | Successful; lockfile included |
| Production compilation | `npm run build` passed after final UI and dependency updates |
| Domain tests | 6 passed |
| Real MongoDB + HTTP integration tests | 22 passed before final packaging; see details below |
| Production dependency audit | `npm audit --omit=dev --audit-level=high` reported 0 vulnerabilities at the final check |
| Original Luma preservation | SHA-256 matches original GLB exactly |
| Original animation inventory | 13 clips present: idle + 12 reactions |
| PWA assets | Manifest, service worker, icons and original model served successfully |
| Android configuration helper | Tested in a temporary copy: valid HTTPS domain, invalid HTTP rejection, generated assetlinks JSON and Android XML |
| Android XML | Manifest and resource XML parsed successfully |
| Gradle wrapper | JAR SHA-256 matched official Gradle 8.11.1 wrapper checksum |
| Android browser helper dependency | Pinned dependency retrieved from official Google Maven repository |

The audit result is a point-in-time dependency check, not a security certification. A patched `@auth/core` override is intentionally included in `package.json`; keep it or reassess against updated upstream releases before removing it.

## Six domain tests

1. Integer minor-unit money conversion; reject extra decimal places, negatives and zero.
2. Task validation: empty titles, impossible dates, reversed time ranges.
3. Transaction validation: fractional cents and invalid types.
4. Unlock rules: breaks excluded, repeated check-ins on one local day excluded.
5. Timestamp-based timer arithmetic, pause behavior, and future-clock skew handling.
6. Sri Lankan midnight grouping and month-boundary date windows.

## Twenty-two integration checks

These used a real isolated MongoDB 7.0.24 process and the optimized Next.js server. They did not access a production database. Focus elapsed time was advanced directly in the isolated test database to verify completion without making the test wait a full minute.

1. Anonymous API access rejected.
2. Registration succeeds; duplicate email/username rejected.
3. Password stored as a bcrypt hash.
4. Incorrect password rejected.
5. Real credentials login establishes a usable session cookie.
6. New account has empty data, hidden password hash, and personal AI context off.
7. Invalid task rejected and another account cannot view/update it.
8. Task update/completion persists.
9. Cross-origin state-changing request rejected.
10. Calendar event create/edit/delete persists.
11. Repeated same-day mood logs do not unlock the seven-day accessory.
12. Locked accessory rejected server-side; available accessory choice persists.
13. Finance create/edit persists and fractional cents are rejected.
14. Monthly budget update modifies the existing record rather than duplicating it.
15. Focus pause/resume, early-finish rejection, and idempotent completion.
16. Cancelled breathing sessions do not count as completed.
17. Demo chat is labeled and chat history is isolated per account.
18. Password change and login with the new password succeed.
19. Record deletion persists.
20. All application routes respond; anonymous private-page access redirects.
21. Original GLB and installable-web assets are served.
22. AI request format and context opt-in/opt-out work against a local test endpoint.

## Not executed here

- Visual browser review at desktop, tablet and phone sizes.
- Actual WebGL rendering, pointer/touch reactions, camera controls, accessory fit and animation appearance in a browser.
- Browser speech recognition, read-aloud audio and microphone permissions.
- PWA installation, platform notification delivery and offline navigation on a device.
- Real Google or Apple provider sign-ins; owner credentials were not supplied.
- A live paid AI-provider response; only a local request-format test provider was used.
- Android Gradle compilation against an installed SDK, APK signing, installation or device testing.
- Public hosting and domain verification.

A browser automation surface and configured Android SDK were not available for those checks. Do not describe them as passed based only on successful compilation or HTTP route responses.

## Manual release checklist

- [ ] Create two real test accounts and check isolation in the browser.
- [ ] Verify Luma looks identical with all accessories removed.
- [ ] Test every reaction and all seven accessory fits on desktop/mobile.
- [ ] Check keyboard focus, contrast, dialogs and reduced-motion behavior.
- [ ] Verify task/event CRUD, date/time errors, finance edits and budget summaries in the UI.
- [ ] Complete a real focus and breathing session; navigate away and return; check pause/cancel behavior.
- [ ] Check notification permission states and document closed-app reminder limitations.
- [ ] Test browser voice availability, dictation, spoken replies and stop controls.
- [ ] Configure and test Google/Apple callbacks on the intended domain.
- [ ] Configure live AI and verify context consent on/off.
- [ ] Install the PWA on a phone and laptop, then test offline reconnection.
- [ ] Build, sign and install Android; verify its domain association and back navigation.

## Re-run commands

```powershell
npm ci
npm run build
npm test
npm run test:integration
npm audit --omit=dev --audit-level=high
```

Integration tests require network access on their first run to obtain the test MongoDB binary. They use separate database contents and do not use `.env.local` credentials. Ensure ports 3197 and 3198 are free.
