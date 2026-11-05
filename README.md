# House-Designer

Design a family home in Alberta from how the family lives. The spec is [SPEC.md](SPEC.md); results and
measurements are in [WORKING_RECORD.md](WORKING_RECORD.md).

## What it does now

- **Rooms** (SPEC §6): pick a room type, answer plain questions, adjust real furniture items, and get the
  minimum size where the items fit with their clearances. Set your own size and press **Check my size**.
- **Plan intake** (SPEC §11): put the sample plan, or your own picture or PDF, under the model; set the
  scale; trace walls, doors, windows, rooms and levels; check 3 sizes against the drawing. Your picture
  stays in your browser only.
- **Test fit** (SPEC §11 P5): name each traced room's type and contents and see whether it fits at its
  traced size; copy the rooms into Rooms as a new design. Rooms shows traced sizes as sizes you know (R13).
- **Lot board** (SPEC §7): place rooms on the lot, setbacks and a site review (zone, height, coverage).
- **Spec tests** runs T1–T6 and L1–L6 in the browser. Every screen is in English and 简体中文.

```bash
npm ci
npm run dev          # local app (saves to the House-Designer Firestore project)
npm test             # unit tests: size engine T1–T6, lot L1–L6, plan intake I1–I5 and I7, test fit F1–F5, languages, Pascal scene
npm run test:rules   # all tests, including Firestore rules and the save/reload tests T4, L7, I6, F6, in the emulator (Java 21)
npm run build        # production build into dist/
npm run build:local  # build that saves in browser storage instead of Firestore
```

Add `?fx=0` (or `#fx0`) to the URL to turn off Pascal's post-effects in the 3D view.
Licences: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
