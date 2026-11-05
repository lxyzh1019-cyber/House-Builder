# House-Designer

Plan a family home in Alberta, room by room. The spec is in [SPEC.md](SPEC.md).

## Spike (now)

One Pascal living room (15 x 12.3 ft, 4 walls, a 7.5 x 3 ft sofa box), a button that makes it 20 x 20 ft,
and a save to Firestore (anonymous sign-in). Results are in [WORKING_RECORD.md](WORKING_RECORD.md).

```bash
npm ci
npm run dev          # local app (saves to Firestore project house-designer-7b6f0)
npm test             # unit test: resize + save/load round trip
npm run test:rules   # unit + Firestore rules tests in the emulator (needs Java 21)
npm run build        # production build into dist/
npm run build:local  # prototype build that saves in browser storage instead
```

Add `?fx=0` (or `#fx0`) to the URL to turn off Pascal's post-effects.
Licences: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
