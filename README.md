# House-Designer

Design a family home in Alberta from how the family lives. The spec is [SPEC.md](SPEC.md); results and
measurements are in [WORKING_RECORD.md](WORKING_RECORD.md).

## Now: rooms from contents (SPEC §6)

Pick a room type, answer plain questions, adjust real furniture items, and get the minimum size where the
items fit with their clearances. Set your own size and press **Check my size**. The **Spec tests** tab runs
T1–T6 in the browser.

```bash
npm ci
npm run dev          # local app (saves to the House-Designer Firestore project)
npm test             # unit tests: size engine T1–T6, Pascal scene, spike room
npm run test:rules   # all tests, including Firestore rules and T4 save/reload, in the emulator (Java 21)
npm run build        # production build into dist/
npm run build:local  # build that saves in browser storage instead of Firestore
```

Add `?fx=0` (or `#fx0`) to the URL to turn off Pascal's post-effects in the 3D view.
Licences: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
