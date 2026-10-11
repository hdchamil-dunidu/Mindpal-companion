# Assets and licenses

All app assets are bundled; runtime rendering does not rely on an external font or script CDN. No generated replacement character or commercial music was used.

| Asset | Source / license | Use |
| --- | --- | --- |
| `web/mascot/models/luma-pearl.glb` | User-supplied Luma Developer Preview; Chamil Dunidu, MIT, `web/mascot/LICENSE-Luma.txt` | Original pearl-white Luma, eye morphs, BodyRig and 13 clips; unchanged bytes |
| Mascot viewer, factory metadata and accessories | Same supplied developer package, MIT | Preserved rendering foundation; app-specific behavior is in `web/mascot.js` |
| `web/mascot/vendor/` | Supplied Three.js runtime/addons, MIT, `LICENSE-three.txt` | WebGL rendering, GLB loading and environment lighting |
| `web/fonts/Manrope.ttf` | Manrope from Google Fonts: <https://github.com/google/fonts/tree/main/ofl/manrope>; SIL Open Font License 1.1, `OFL.txt` | Bundled UI typography |
| `web/audio.js` | Original code-generated tones created for this project | Cues and original activity music; no recorded third-party tracks |
| `web/icons/icon.svg`, UI icon paths, Android launcher vector | Project-created simple vectors | Navigation, controls and launcher icon |
| Gradle wrapper files | Gradle 8.9, Apache 2.0; `android/LICENSE-Gradle.txt` | Android build launcher |
| `mongodb` npm dependency | MongoDB Node driver, Apache 2.0; installed by npm with its dependency licenses | Server-side database connection; dependency files excluded from archive |

## Sound map

| Cue / track | Trigger |
| --- | --- |
| `greeting` | Initial greeting and Say hi |
| `tap` | Mascot taps and little reactions |
| `mood` | Mood preview/save |
| `send`, `receive` | Chat request/reply |
| `success`, `celebrate` | Task completion, happy double-tap, all daily tasks completed |
| `customize` | Accessory selection/reset |
| `start`, `done` | Timer/activity start and completed session |
| `error` | Available lower-tone error cue mapping |
| `dance` music | Original short repeating triangle/sine pattern |
| `breathing`, `stretching` music | Original slow sine-tone harmony |

`cue()` rate-limits closely spaced cues. `startMusic()` stops any previous music track; `stopMusic()` stops/disconnects music nodes. Master mute stops current cues, music and speech. Preferences persist through the active store. Browser autoplay rules require a user action before sound starts. A logical audio-state check was run; audible quality on a physical device was not measured.

## Replace or extend assets

Keep the GLB as supplied to preserve Luma's identity. To modify behavior, use its existing morphs/animations in `web/mascot.js`; add accessories to BodyRig without replacing the body, eye proportions or material. Dispose old accessory geometry/materials when changing selections. Eye target names are `happy`, `flat`, `angry`, `heart`, `tired`; mouth target is `yawn`.

To replace music with licensed recordings, add local audio files, record their licenses here, and implement them through SoundEngine's single-track lifecycle so mute, volume and navigation cleanup stay effective. Never hardcode an external commercial music URL. Replace fonts only with a redistributable file and update `@font-face` plus the license manifest. Preserve license notices when distributing modified source/assets.

The direct build environment additionally used official Android SDK tools and Eclipse ECJ 3.38.0. Those compiler/SDK installations are not included in the source archive or APK. ECJ is a build-time option, not an application dependency.

Original GLB SHA-256: `3e91cec286730a4589daddd93785c5a7a7d4bd4b7f7bf5d6164dff27f2eb88dc`. Verified against the supplied ZIP extraction.
