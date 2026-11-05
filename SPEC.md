# House-Designer — SPEC

This file is the one spec for House-Designer (D14). Decisions are numbered once and never reused.

## Decision ledger

| Code | Topic | Decision | Status |
|---|---|---|---|
| D12 | Who the app serves | Any family building in Alberta. | Decided |
| D13 | Prototype first | B: done in chat. The chat prototype is replaced by the Pascal route (this repo). | Decided |
| D14 | Where the spec lives | B: `SPEC.md` in this repo is the one spec. | Decided |
| D15 | Firebase project | A: a new project for House-Designer (`house-designer-7b6f0`). Never `chore-tracker-a461b`. | Decided |
| D16 | Size check detail | A: plain rectangle. | Decided |
| D17 | Build base | A: Pascal (rooms, walls, furniture, 3D view) plus Furnish2 parts. We add contents-to-minimum-size checks, Alberta rules, the budget meter and decision cards. | Decided |
| chat-D5 | Lego method | Rooms are pre-assembled sections. Size first, then layout. The user moves whole rooms. | Decided |
| chat-D6 | Budget gap | C$700K is a goal. No gap decision yet. | Open |
| chat-D7 | Lot in budget | The C$700K includes the lot (C$230K is a guess). | Decided |
| Spike-DN1 | Project owner on update | Firestore rules: on update the `owner` field cannot change (owner locked). Approved 2026-11-05. | Decided |
| Spike-Q1 | Pages deploy branch | Deploy from `main` and from the spike branch, so the phone test needs no merge. Approved 2026-11-05. | Decided |

## Rules that hold across the app

- **Room size:** a room's contents give its minimum size and what fits. The user can set any bigger size.
- **Saving (spike):** `projects/{projectId}` holds `owner` (uid) and `scene` (the Pascal scene as a JSON string). Only the owner can read or write.
- **Later (not the spike):** projects get a `members` list so each family member can save.

## Open — not in the spike PR

The 12 canvas fixes from canvas v54:

| Code | Fix |
|---|---|
| C1 | Ledger |
| L2 | Sun room |
| L3 | Feng shui roles |
| G1 | New-design branch |
| L5 | Study: bedroom-ready |
| L6 | Homework |
| O1 | Tour copy |
| C3 | Back-kitchen make-up air |
| O2 | Feng shui list |
| C2 | Sizes from questionnaire counts |
| K1 | Date old items |
| L4 | Rename the two 7 lists |

## Out of scope for the spike

Lot board, room questions, budget meter, 2D plan, furniture library, sign-in by email.
