# Working record — Pascal spike

## Build (2026-11-05, local, `npm run build`, Firestore version)

| File | Size | Gzipped |
|---|---|---|
| `index-*.js` (main bundle: app + Pascal + three.js) | 7,389 kB | 2,282 kB |
| `sandbox-*.js` (Pascal editor sandbox, lazy) | 2,069 kB | 555 kB |
| `draco_decoder-*.js` (3D model decoder, lazy) | 719 kB | 150 kB |
| `store-firestore-*.js` (Firebase sign-in + Firestore) | 695 kB | 175 kB |
| All of `dist/` | 267 files, 15 MB | — |

The build needs `NODE_OPTIONS=--max-old-space-size=6144`.

## Prototype (claude.ai Artifact, browser storage) — 2026-11-05

- H: **"Pass"** on PC and phone. No GPU path or load time recorded.
- Headless Chromium (this container, no GPU):
  - WebGL path: draws the room, 4 walls and the sofa box. 15.0 x 12.3 → 20.0 x 20.0, the reload keeps 20.0 x 20.0, 0 console errors, 0 requests to outside servers.
  - Software WebGPU: draws nothing ("WebGPU device lost"). This test browser has no real GPU, so this says nothing about real devices.

## Spike result — 2026-11-05

H, after testing the Pages link on PC and phone: **"for test purpose, this is passing"**.

| DONE WHEN | Status | Evidence |
|---|---|---|
| 1. Pages link opens on PC Chrome and phone; 3D room 15 x 12.3 ft, 4 walls, camera on the room | Pass | H: "it works" on both; H's PC screenshot shows the room |
| 2. "Make it 20 x 20 ft" changes the room, its 4 walls and the label | Pass | Unit test; headless touch-tap run (8 states match); after DN3 H's screenshot shows label and room in step |
| 3. Reload keeps 20 x 20, saved in Firestore `house-designer-7b6f0` | Pass | Headless run against the real project: saved, reload → "loaded", 20.0 x 20.0 |
| 4. 3-seat sofa as a plain 7.5 x 3 ft box | Pass | Unit test (7.5 / 3.0 ft); visible in screenshots |
| 5. Vitest covers resize + save/load round trip, runs in GitHub Actions | Pass | `test` job green (runs 41963594996, 41966354799) |
| 6. Phone load time, main bundle size, WebGPU or WebGL on the phone | **Partial** | Bundle size recorded above. Phone (H, 2026-11-05): opened, showed the room in **10 s or less**, kept 20 x 20 after a reload (exact seconds not timed). GPU path on the phone **not reported** |

Closed without a change: the button text stays "Make it 20 x 20 ft" at every size (DN4 not taken; H judged it passing for the spike).

## Real devices (Pages link)

Phone, reported by H on 2026-11-05: opened yes, load 10 s or less, 20 x 20 kept after reload yes. Device, browser and GPU path not reported.

| Device | Browser | GPU path (bottom strip) | First frame (ms) | Load time on Wi-Fi | 20 x 20 kept after reload |
|---|---|---|---|---|---|
| PC | Chrome | | | | |
| Phone | | | | | |

Stop rules (from the task): no 3D on the phone → report the device, the browser and whether WebGL drew anything, and don't switch libraries. Phone load over 10 s on Wi-Fi → report the size of each chunk and stop.

## Findings

- 2026-11-05: H reported that on PC and phone the 3D room switched to 20 x 20 but the size label did not change. I could not reproduce it in my test browser (phone emulation, touch taps, real Firestore). DN3 (approved "A"): the label now reads the room live from the scene, resize errors show in the card, and the strip lists the 4 wall lengths. To be retested on both devices.

- Pascal's default wall finish loads textures from `editor.pascal.app`. The spike paints walls a plain colour instead, so the page makes no requests to outside servers.
- Pascal's post-effects (SSGI lighting) are very heavy without a GPU. `?fx=0` or `#fx0` turns them off.
- Firestore cannot store nested arrays (the room outline is a list of [x, z] pairs), so `scene` is saved as a JSON string.
- Load uses a query on `owner == uid`, because the owner-only read rule denies a `get` of a document that doesn't exist.

## Piece 2: Rooms from contents (2026-11-05)

- Build: what the page loads at start is 154 files, 7,499 kB (2,381 kB gzipped), about the same total as the spike, split into more files. The 3D viewer code loads only when the 3D tab opens.
- Headless Chromium against the real Firestore project (no GPU, WebGL path): Spec tests tab shows 6 of 6 pass. By hand: T1 15.0 x 13.5, T5 14 x 13 too small (short 1.0 / 0.5, "Remove one Loveseat" with the room turned), T4 20 x 20 fits with spare 197.5 ft², still 20 x 20 after a reload, T2 15.0 x 11.0, T3 10.0 x 10.0. Dragging an item moved it with wall snap. Phone width 412 px: no sideways scroll. 0 console errors.
- T7 (owner's phone test, after merging PR #2): **Pass**. Owner, 2026-11-05: "T7 less than 10s", recorded as written. The limit is 10 minutes per room, so it passes either way. Device and browser not reported.

## Piece 3: Lot board (2026-11-05)

- Tests: `npm run test:rules` 26 of 26 pass locally (L1–L6 in `test/lot.test.js`, L7 save and reload in the Firestore emulator, T1–T6 and the earlier tests still green).
- Headless Chromium against the real Firestore project (no GPU): three rooms placed on the 60 x 100 ft lot; the dining room dragged under the open living room snapped into contact and the living room showed "Walkway shared with Dining room", 15.0 x 11.0 ft, keeping the shared side in place (L5); turning the living room 90° gave 13.5 x 15 and flagged its overlap; a 30 ft front setback flagged all three rooms; Office + Dining glued as a core route; a reload kept the layout and the cluster (L7). Spec tests tab: 12 of 12 pass. Phone width 412 px: no sideways scroll. 0 console errors.
- Owner check of the Lot board on the Pages link: to do after deploy.
