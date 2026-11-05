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

## Real devices (Pages link) — to fill in

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
