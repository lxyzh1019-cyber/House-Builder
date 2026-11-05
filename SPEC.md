# House-Designer — SPEC v1.2 (2026-11-05)

This file is the one spec for the app (decision chat-D14: the spec lives in the repo).
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
| chat-D12 (who the app serves) | Any family building in Alberta. | 2026-11-04 |
| chat-D13 (prototype first) | A chat prototype first. Done; it failed and taught the lessons in section 6. | 2026-11-04 |
| chat-D14 (where the spec lives) | This SPEC.md. | 2026-11-04 |
| chat-D15 (Firebase project) | A new project for House-Designer, never the family apps' project. | 2026-11-04 |
| chat-D16 (size check detail) | A plain rectangle, width x depth, tried either way round. | 2026-11-04 |
| chat-D17 (build base) | Pascal packages (rooms, walls, furniture, 3D view) plus Furnish2 parts. We add contents-to-minimum-size, Alberta rules, the budget meter and decision cards. | 2026-11-04 |
| chat-D18 (plan intake and room blocks) | Two separate design methods that run in parallel, not one after the other. Rooms from contents is the checker for traced plans; each method helps the other. | 2026-11-05 |
| chat-D19 (project owner on update) | Firestore rules: on update the `owner` field cannot change (owner locked). Was spike-DN1. | 2026-11-05 |
| chat-D20 (Pages deploy branch) | GitHub Pages deploys from `main` and from the working branch, so a phone test needs no merge. Was spike-Q1. | 2026-11-05 |
| chat-D21 (size model) | Living room depth = TV stand 1.5 ft + viewing distance (screen to sofa back) + walkway; width = main sofa + side seats' depth + 0.5 ft gap at each corner; open to a neighbour takes the 2.5 ft shared strip off the walkway; sizes round up to the next 0.5 ft. Was piece2-DN5. | 2026-11-05 |
| chat-D22 (office side) | An office keeps every side at 10 ft or more, so it can become a bedroom later (see open item L5). Was piece2-T3. | 2026-11-05 |
| chat-D23 (lot board done-when) | L1–L7 in section 7. Was piece3-tests. | 2026-11-05 |
| chat-D24 (garage, kitchen, back kitchen) | Plain rectangles for now: a size the user types, no questions or furniture yet. Was piece3-rooms. | 2026-11-05 |
| chat-D25 (walkway sharing and a set size) | Sharing changes the minimum and the check only; a size the user set stays; a room with no set size follows its minimum. Was piece3-shared. | 2026-11-05 |
| chat-D26 (lot shape) | A rectangle (width x depth) with 4 setbacks: front, rear, left, right, in feet. Was piece3-lot. | 2026-11-05 |

## 4. Architecture
- Vite + React. Pascal packages @pascal-app/core, viewer, nodes, editor at 1.0.6 (MIT). Deploy to GitHub Pages with GitHub Actions.
- Pascal is the only owner of walls. A room block is a Pascal zone with its walls and items. Any later floor-plan or furniture view reads from the same scene.
- Furnish2 (github.com/lxyzh1019-cyber/Furnish2, the owner's MIT fork, one index.html, no npm package): copy its furniture library sizes (74 items, mm), custom furniture, clearance labels, overlap check and wall snap. Do not copy its prices (not Alberta prices) or its apartment templates. Keep its MIT notice in THIRD_PARTY_NOTICES.md.
- Firestore: projects/{projectId} with owner, members (from the family-sharing piece), scene (Pascal nodes and rootNodeIds), rooms (type, answers, items, chosen size), budget lines.
- Units: store metres (Pascal); show feet and inches.
- Language: every screen in English and Simplified Chinese, as on the canvas.
- No AI API calls in the app (canvas rule): AI work happens in chat tools; the app saves the results.

## 5. Pieces and order
Two design methods run side by side (chat-D18). Both write to the same Pascal scene.
- Method 1, room blocks: design each room from its contents, then arrange the rooms (sections 6 and 7).
- Method 2, plan intake: trace a real or liked plan (section 11).
- How they help each other: Rooms from contents checks every traced room (section 11, P5); a traced room's size shows next to that room type's minimum as a size you know (section 6, R13).

Pieces:
1. Spike (PR #1): one Pascal room you can resize, saved to Firestore. Phone test happens after merge on the Pages link.
2. **Rooms from contents**: section 6. **Plan intake**: section 11, steps P1 to P4 and P6. These two are independent pieces and can be built at the same time, on separate branches.
3. Test fit (section 11, P5): after both pieces in step 2, because it joins them.
4. Lot board: section 7.
5. Family sharing: section 9.
6. Budget meter: section 8.
7. Later, each gets its own section here before its piece starts: every row marked "Later" in section 12.

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
- R13 Sizes you know: when a traced plan has a room of the same type, its size shows next to the minimum, as a reference.

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
- Garage, kitchen and back kitchen join the room types as plain rectangles (chat-D24).

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
- Later pieces' sections (section 12 rows marked Later) are written here before each starts.

## 11. Plan intake (trace a plan)
Restored from canvas v54 (Stage 2a and the technical flow). Used for a renovation's current house, a builder's plan, or a plan the family likes. This is a design method of its own, parallel to room blocks (chat-D18), not a step before or after it.
- P1 Upload a plan image or PDF as an underlay and trace it once in Pascal: walls, doors, windows, rooms, levels.
- P2 Size check: the user enters 3 known sizes from the drawing; if they do not match the trace, trace again. No automatic reading of drawings.
- P3 Overlay check: the drawing under, the model on top, so tracing errors show.
- P4 With no real plan yet, every piece works on a sample plan.
- P5 Test fit (a traced plan marked "test fit"): the user names each traced room's type and picks its contents (or a preset). Rooms from contents then gives each room a Check my size verdict: fits with spare, or too small by how much. A new design is a separate branch, not a change to a traced plan.
- P6 The site review finds the zone (from the land title or the City zoning map) to set setbacks, height and lot coverage.

## 12. Feature inventory (nothing leaves this list without a decision)
Status: Now = in a planned piece; Later = kept, its section is written before its piece starts.
| Feature | Source | Status |
|---|---|---|
| Stage 0 project setup: name, type, city, household, budget goal | canvas Main | Now (spike, sharing) |
| Stage 0: code, zoning and permit steps for the city; local gas and power rates | canvas Main | Later |
| Rate rows rated against the city (near, national average) | canvas Main | Later |
| Element library (E1 templates that cards start from) | canvas Main | Later |
| Many projects: method shared, data per project | canvas Main | Now (data model) |
| Schedule view, stage by stage | canvas Main | Later |
| Who leads, which AI, time and cost shown on every step | canvas Main | Later |
| Current-house video tour instructions and pain-point list | canvas 1a | Later |
| Wish-list questionnaire: 11 sections, 6 answer types, each person answers, ideas you may not know, play back and approve | canvas Questionnaire | Later (sections 3–6 feed Rooms from contents, R11) |
| Pictures we like: Pinterest and Houzz scan, house style profile | canvas 1c | Later |
| Liked floor plans with "why I like it", turned into a plan checklist | handoff 7-step process | Later |
| Cheap wins list, kept when the budget is tight | canvas 1c | Later |
| Lot checklist for buying the lot | handoff 7-step process | Later |
| Mortgage pre-approval sets the budget | handoff 7-step process | Later (budget meter input) |
| Plan intake: trace once, 3 sizes match, overlay check, sample plan | canvas 2a, technical flow | Now (parallel method, chat-D18) |
| Test fit and new-design branch | handoff (G1 fix) | Now (after both methods' pieces) |
| Rooms from contents, Check my size, smallest changes, spare cost | chat | Now |
| Lot board, shared walkway, core-route cluster | chat | Now |
| Budget meter with editable lines | chat | Now |
| Family sharing with members | chat | Now |
| Design sprints D4a–D4g, each with a fit check, a live rules check and a saved version | canvas 2b | Later |
| Plan versions; a decision re-opens only the rooms its impact chain names | canvas 2d | Later |
| Design item cards: rules limits, physical limits, verdict, impact chain, smart proposals, Keep or Delete | canvas Design item board | Later |
| Idea loop inbox: capture, sort, analyse, show, decide, apply; statuses | canvas 2e | Later |
| Room Review path, 7 levels outside in, one card per room with target and plan ft² | canvas Room Review | Later |
| 7 plan checks: flow, storage, housework, light and space, sound and comfort, safety and age, feel | handoff | Later |
| Storage by use: daily within 3 steps, weekly same floor, seasonal, archive | handoff | Later |
| Room energy score: 40% measurable, 30% feng shui form rules, 30% family feeling | handoff (L3 fix) | Later |
| Review criteria: context step, weight profiles, gates, 0–10 scores, conditions and value engineering, cost score | canvas Main | Later |
| Decision cards with "+ New comparison" | canvas Decisions | Later |
| Hidden works as its own category through every stage | canvas Main | Later |
| Furniture fit and 3D walk-through | canvas 2b D4g | Later (3D view from the spike) |
| Rate table v0 with sources, estimate classes | canvas Rate Table | Later |
| Energy model | canvas Energy Model | Later |
| Lifecycle cost, 30 years | canvas Lifecycle Cost | Later |
| Final rules gate with code clause links | canvas Stage 3 | Later |
| Work packages: scope per trade, allowances, who supplies, DIY flags | handoff 7-step process | Later |
| Permit checklist and City steps | canvas Stage 4 | Later |
| Builder checks, contract and money checks, myth library | canvas Site Walks | Later |
| Build tracking: change orders re-checked, stage cost against budget, photo and video record before drywall | canvas Stage 5 | Later |
| Move-in, possession walk and warranty walks | canvas Stage 6, Site Walks | Later |
| Furniture placement: Pascal scene with Furnish2 parts (was: export each level from Pascal to Furnish) | chat-D17 (build base) | Now (changed by chat-D17) |
