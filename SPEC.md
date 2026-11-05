# House-Designer — SPEC v1 (2026-11-04)

This file is the one spec for the app (decision D14: the spec lives in the repo).
The repo is public. **No family or project data goes in the repo**: no names, budgets, addresses, photos or real plans. Tests use made-up projects. Project data lives in Firestore, per project.

## 1. Goal
Help any family building a house in Alberta design it from how they live, then carry it through permits and the build.
Principle: the house fits the family, not the family the house.

Users: the project owner (leads), and each household member (answers their own part).

The method has 7 stages. The numbers D1–D21 are the method's gates (yes = go on). They are NOT chat decisions.
- Stage 0, Start a project: name and type (new build or renovation), city (Alberta only for now), household, budget goal.
- Stage 1, Living Brief: current-house video tour, wish-list questionnaire (11 sections), liked pictures. Gate D1: brief complete.
- Stage 2, Design: site review, design sprints (layout and daily paths, kitchen and mudroom, hidden works, exterior, windows and energy, finishes, furniture fit), design item cards, idea loop. Gates D4 (fits the brief) and D5 (estimate within budget).
- Stage 3, Final rules check and lock: gates D7 (building code), D8 (zoning), D9 (subdivision rules), D6 (approve and lock).
- Stage 4, Team and permits: gates D18 (builder signed), D19 (money ready), D10 (permit checklist), D11 (development permit), D12 (building permit).
- Stage 5, Build: gates D13 to D17 and D21 (photo record before drywall).
- Stage 6, Move in: gate D20 (final inspection and utilities).

## 2. Labels
- Chat decisions are written "chat-Dn (meaning)". Gate numbers D1–D21 above keep their own meaning.
- Evidence tags on every rule or rate: E1 own experience, E2 a quote or spec sheet with its source, E3 general knowledge (a starting value).

## 3. Decision ledger
| Decision | Answer | Date |
|---|---|---|
| chat-D5 (Lego method) | Rooms are pre-assembled sections. Size first, then layout. The user moves whole rooms. | 2026-10-30 |
| chat-D6 (budget gap) | The budget is a goal to work toward. No gap decision yet. | 2026-10-30 |
| chat-D7 (lot in budget) | The budget goal includes the lot. The lot price is a guess until bought. | 2026-10-30 |
| D12 (who the app serves) | Any family building in Alberta. | 2026-11-04 |
| D13 (prototype first) | A chat prototype first. Done; it failed and taught the lessons in section 6. | 2026-11-04 |
| D14 (where the spec lives) | This SPEC.md. | 2026-11-04 |
| D15 (Firebase project) | A new project for House-Designer, never the family apps' project. | 2026-11-04 |
| D16 (size check detail) | A plain rectangle, width x depth, tried either way round. | 2026-11-04 |
| D17 (build base) | Pascal packages (rooms, walls, furniture, 3D view) plus Furnish2 parts. We add contents-to-minimum-size, Alberta rules, the budget meter and decision cards. | 2026-11-04 |
| spike-DN1 (project owner on update) | Firestore rules: on update the `owner` field cannot change (owner locked). Kept from PR #1. | 2026-11-05 |
| spike-Q1 (Pages deploy branch) | GitHub Pages deploys from `main` and from the working branch, so a phone test needs no merge. Kept from PR #1. | 2026-11-05 |
| piece2-DN5 (size model) | Living room depth = TV stand 1.5 ft + viewing distance (screen to sofa back) + walkway; width = main sofa + side seats' depth + 0.5 ft gap at each corner; open to a neighbour takes the 2.5 ft shared strip off the walkway; sizes round up to the next 0.5 ft. | 2026-11-05 |
| piece2-T3 (office side) | An office keeps every side at 10 ft or more, so it can become a bedroom later (see open item L5). | 2026-11-05 |
| piece3-tests (lot board done-when) | L1–L7 in section 7. | 2026-11-05 |
| piece3-rooms (garage, kitchen, back kitchen) | Plain rectangles for now: a size the user types, no questions or furniture yet. | 2026-11-05 |
| piece3-shared (walkway sharing and a set size) | Sharing changes the minimum and the check only; a size the user set stays; a room with no set size follows its minimum. | 2026-11-05 |
| piece3-lot (lot shape) | A rectangle (width x depth) with 4 setbacks: front, rear, left, right, in feet. | 2026-11-05 |

## 4. Architecture
- Vite + React. Pascal packages @pascal-app/core, viewer, nodes, editor at 1.0.6 (MIT). Deploy to GitHub Pages with GitHub Actions.
- Pascal is the only owner of walls. A room block is a Pascal zone with its walls and items. Any later floor-plan or furniture view reads from the same scene.
- Furnish2 (github.com/lxyzh1019-cyber/Furnish2, the owner's MIT fork, one index.html, no npm package): copy its furniture library sizes (74 items, mm), custom furniture, clearance labels, overlap check and wall snap. Do not copy its prices (not Alberta prices) or its apartment templates. Keep its MIT notice in THIRD_PARTY_NOTICES.md.
- Firestore: projects/{projectId} with owner, members (from the family-sharing piece), scene (Pascal nodes and rootNodeIds), rooms (type, answers, items, chosen size), budget lines.
- Units: store metres (Pascal); show feet and inches.

## 5. Pieces and order
1. Spike (PR #1): one Pascal room you can resize, saved to Firestore. Phone test happens after merge on the Pages link.
2. **Rooms from contents** (next): section 6.
3. Lot board: section 7.
4. Family sharing: section 9.
5. Budget meter: section 8.
6. Later, each gets its own section here before its piece starts: Living Brief questionnaire, design item cards, decision cards, room review, rate table, energy model, lifecycle cost, site walks.

## 6. Rooms from contents
Lessons from the failed chat prototype (2026-11-04): the user could not set a room size; three coarse questions stood in for furniture; there were no furniture items to add, move or resize.

Requirements:
- R1 Room types at start: living room, office, dining room, primary bedroom, kid bedroom, mudroom. Living room and office get the full question set first.
- R2 Contents are real furniture items from the library, each with width x depth, plus custom items and quantities. Each room type has presets (for example "Family TV room").
- R3 Plain questions add items (how many seats, TV size, how many desks, storage). The user can then add, remove, move, rotate and resize items.
- R4 The minimum size is the smallest rectangle where the items fit with their clearances, using the rules table (R12).
- R5 The room size is set by the user, width x depth. The default is the minimum. Any bigger size is accepted and saved.
- R6 A smaller size shows "Too small", short by how many feet in width and depth, then the smallest changes that fit (remove or shrink items) and "or make it W x D".
- R7 A bigger size shows the spare ft² and what it costs at the build rate range (default C$175–275 per ft², E3, editable).
- R8 A to-scale drawing shows the items, walkways (hatched), clearance labels and overlaps (red). Items drag inside the room with wall snap.
- R9 The room is saved in Firestore and survives a reload.
- R10 An open living room can share its main walkway with an open neighbour; the lot board applies this (section 7).
- R11 Questionnaire sections 3 (cooking), 4 (storage), 5 (work) and 6 (guests) become room questions, so answering them also sizes rooms.
- R12 Rules table: each row has its value, unit, source and evidence tag, refreshed when older than 2 years.

Starting values (E3; replace with sourced rows):
- Main walkway 3 ft.
- Seat to TV screen: 1.2 to 1.6 x the screen diagonal (THX 40 degrees, SMPTE 30 degrees); use 1.4.
- Seats facing each other with no TV: 8 ft apart.
- Desk chair space 3 ft behind each desk; a shelf wall 1 ft deep.
- Dining chair space 3 ft on every side of the table.
- Sofa bed open 6.5 ft; a sofa bed means an egress window if anyone sleeps there.

Tests (done when):
- T1 Living room, 6–8 seats, 75-in TV, separate room: minimum 15 x 13.5 ft.
- T2 Same room, open to dining: 15 x 11 ft.
- T3 Office, 1 person, 6 ft desk, shelf wall: 10 x 10 ft.
- T4 User sets T1's room to 20 x 20 ft: accepted, saved, still 20 x 20 after reload; spare 197.5 ft².
- T5 User sets T1's room to 14 x 13 ft: "Too small", width short 1.0 ft, depth short 0.5 ft, with smallest changes listed.
- T6 Round trip: the minimum passes its own check; 0.5 ft smaller fails.
- T7 Owner's phone test: a family member sizes the living room and office alone, in under 10 minutes each.

## 7. Lot board (after rooms)
- Drag rooms onto a lot (default 60 x 100 ft), 2 ft snap, rotate, overlap flags, setbacks entered by the user from the zone.
- Ports: each room side can be a door, an open side or a wall. An open living room touching another open room shares its walkway (minus a 2.5 ft strip); alone, the strip is added back.
- The daily core route (garage, mudroom, back kitchen, kitchen, dining) can be glued into one cluster that moves as a whole.
- Garage, kitchen and back kitchen join the room types as plain rectangles (piece3-rooms).

Tests (done when):
- L1 A new lot is 60 x 100 ft and rooms drag on it with 2 ft snap.
- L2 A room rotates 90°.
- L3 Two overlapping rooms are flagged red.
- L4 A room crossing a setback line is flagged.
- L5 The T1 living room, open, placed against an open dining room needs 15 x 11 ft; moved away it needs 15 x 13.5 again.
- L6 A glued core route moves as one.
- L7 The layout is saved and survives a reload.

## 8. Budget meter
- Lines, all editable, no hidden numbers: budget goal, lot price, soft costs line by line, contingency %, build rate low and high.
- The lot price is inside the goal by default (chat-D7, lot in budget).
- Shows rooms placed so far (ft² and cost range) and what is left of the goal.

## 9. Family sharing
- projects/{id} holds a members list. Members read and write; only the owner adds members or deletes.
- Firestore emulator tests: a member writes, a non-member is denied.

## 10. Open items
- 12 canvas fixes from the canvas v54 review, to apply when the matching piece starts: C1 ledger, L2 sun room, L3 feng shui roles, G1 new-design branch, L5 study bedroom-ready, L6 homework, O1 tour copy, C3 back-kitchen make-up air, O2 feng shui list, C2 sizes from questionnaire counts, K1 date old items, L4 rename the two 7 lists.
- Later pieces' sections (piece 6 list) are written here before each starts.
