# House-Designer — SPEC v1.3 (2026-11-06)

This file is the one spec for the app (decision chat-D14: the spec lives in the repo). Section 17 (batch B) is a proposal waiting for the owner; nothing in it is built.
The repo is public. **No family or project data goes in the repo**: no names, budgets, addresses, photos or real plans. Tests use made-up projects. Project data lives in Firestore, per project.

**Rule for the builder:** every number a test expects can be worked out from this file alone (section 6 and the presets data in section 6.4). If anything needed to build a piece is missing or unclear, stop and list the questions; do not guess.

v1.3 was merged onto the repo's v1.2 (chat-D39): v1.3's new decisions are numbered chat-D35 to chat-D38 because chat-D19 to chat-D34 were already taken; the done-when tests of the pieces already built (L, B, S, I, F) are kept.

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

- Chat decisions are written "chat-Dn (meaning)". Gate numbers D1–D21 above keep their own meaning. A chat decision number is never reused.
- Evidence tags on every rule or rate: E1 own experience, E2 a quote or spec sheet with its source, E3 general knowledge (a starting value).
- Requirement and test labels: R = Rooms from contents requirement, T = test, P = plan intake step, L = lot board test, B = budget test, S = sharing test, I = plan intake test, F = test fit test, N = step strip test. Canvas fix labels (C1, L2 …) are explained in section 10.
- Batch B (section 17, proposed): H = batch B test, OB = batch B open item. Inside section 17, B1–B7 are the batch B parts and M1–M16 the myths; outside it, write "part B4" or "myth M6", because B1–B7 (budget tests) and M1–M8 (Red Deer tests) keep their meaning (DN20).

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
| chat-D17 (build base) | Pascal packages (rooms, walls, furniture, 3D view) plus Furnish2 parts. We add contents-to-minimum-size, Alberta rules, the budget meter and decision cards. Commercial tools (Drafted, Maket) are rejected as a base: no proven way into the repo. | 2026-11-04 |
| chat-D18 (plan intake and room blocks) | Two separate design methods that run in parallel, not one after the other. Rooms from contents is the checker for traced plans; each method helps the other. | 2026-11-05 |
| chat-D19 (project owner on update) | Firestore rules: on update the `owner` field cannot change (owner locked). Was spike-DN1. | 2026-11-05 |
| chat-D20 (Pages deploy branch) | GitHub Pages deploys from `main` and from the working branch, so a phone test needs no merge. Was spike-Q1. | 2026-11-05 |
| chat-D21 (size model) | **Replaced by chat-D36 (2026-11-06).** Was: living room depth = TV stand 1.5 ft + viewing distance (screen to sofa back) + walkway; width = main sofa + side seats' depth + 0.5 ft gap at each corner; open to a neighbour takes the 2.5 ft shared strip off the walkway; sizes round up to the next 0.5 ft. Was piece2-DN5. | 2026-11-05 |
| chat-D22 (office side) | **Replaced by chat-D35 (2026-11-06).** Was: an office keeps every side at 10 ft or more, so it can become a bedroom later (see open item L5). Was piece2-T3. | 2026-11-05 |
| chat-D23 (lot board done-when) | L1–L7 in section 7. Was piece3-tests. | 2026-11-05 |
| chat-D24 (garage, kitchen, back kitchen) | Plain rectangles for now: a size the user types, no questions or furniture yet. Was piece3-rooms. | 2026-11-05 |
| chat-D25 (walkway sharing and a set size) | Sharing changes the minimum and the check only; a size the user set stays; a room with no set size follows its minimum. Was piece3-shared. | 2026-11-05 |
| chat-D26 (lot shape) | A rectangle (width x depth) with 4 setbacks: front, rear, left, right, in feet. Was piece3-lot. | 2026-11-05 |
| chat-D27 (where an uploaded plan picture lives) | In the browser that uploaded it only (IndexedDB), "for now". The trace itself (walls, doors, windows, rooms, scale, size checks) is saved with the project in Firestore. Was DN6. | 2026-11-05 |
| chat-D28 (one project on every device) | Not now: each device keeps its own anonymous project until family sharing (section 9) decides how people sign in. Was DN7. | 2026-11-05 |
| chat-D29 (where project data lives) | Firestore, as now. Nothing is saved to the GitHub repo (public; no real plans in it). | 2026-11-05 |
| chat-D30 (plan intake done-when) | I1–I8 in section 11. | 2026-11-05 |
| chat-D31 (test fit done-when) | F1–F7 in section 11. Only a traced room with 4 square corners gets a verdict, because the size check is a plain rectangle (chat-D16). A new design is a copy into Rooms; the traced plan never changes. | 2026-11-05 |
| chat-D32 (budget meter) | Contingency is a share of the build cost only, not of soft costs or the lot (was DN8). Build rates are the Rules table rows. Area = rooms placed on the Lot board. Done-when B1–B7 in section 8. | 2026-11-05 |
| chat-D33 (members without sign-in) | Each device's anonymous account id is its device code; the owner adds a member by pasting their code. Members read and write; only the owner adds or removes members and deletes. A later sign-in that links the anonymous account keeps the same id. Was DN9. | 2026-11-06 |
| chat-D34 (projects and setup) | Many projects per person, each with its own data; Stage 0 setup holds name, new build or renovation, city and household (the budget goal stays on the Budget tab). Done-when S1–S7 in section 9. | 2026-11-06 |
| chat-D35 (office test layout) | T3 follows the office layout written in section 6.3; its expected size is computed from that layout (9 x 9.5 ft), not a rounded guess. Replaces chat-D22. Numbered chat-D19 in the v1.3 draft. | 2026-11-06 |
| chat-D36 (how the minimum is found) | Each preset has a fixed arrangement (bands, section 6.2). The minimum is that arrangement plus its clearances. No automatic packing search. Replaces chat-D21. Numbered chat-D20 in the v1.3 draft. | 2026-11-06 |
| chat-D37 (room questions now) | Room questions use questionnaire sections 4, 5 and 6 now. Section 3 (cooking) waits for the kitchen room type. Numbered chat-D21 in the v1.3 draft. | 2026-11-06 |
| chat-D38 (room level) | Every room has a level (basement, main or upper), saved now. The lot board shows one level at a time. Numbered chat-D22 in the v1.3 draft. | 2026-11-06 |
| chat-D39 (SPEC v1.3 merge) | v1.3 is merged onto v1.2, not written over it: its new decisions get chat-D35 to chat-D38, chat-D19 to chat-D34 stay, and the built pieces' tests stay, with F2 and B3–B5 worked out again for the 9 x 9.5 ft office. Was DN10. | 2026-11-06 |
| chat-D40 (where rooms and answers are saved) | `rooms` and `answers` are fields of the project document, keyed by id; no subcollections, so the Firestore rules stay as they are. | 2026-11-06 |
| chat-D41 (rooms saved before v1.3) | Each room keeps its type, name, set size, place on the lot and ports; its contents reset to the v1.3 preset, keeping the answers that still exist (TV 55–85 in, 6–8 seats, 5 or 6 ft desk, shelf wall, open). | 2026-11-06 |
| chat-D42 (moved items and clearance) | A moved item carries its band's clearance (a desk its 3 ft chair space, a dining table 3 ft all round, a bed its side zones and foot walkway); the main and side walkways stay where the preset put them. | 2026-11-06 |
| chat-D43 (Plan intake step strip) | A step strip above the picture says the current step, what to tap next and where its result shows (P7); a greyed-out tool says why. Done-when N1–N3 in section 11. Was DN12. | 2026-11-06 |
| chat-D44 (PC first) | The owner uses the app on a PC; the phone screen is too small. T7 runs on a PC. The phone layout stays readable but is no longer a done-when gate. Was DN11. | 2026-11-06 |
| chat-D45 (trace instructions) | Plan intake has a "How to trace" box: one straight line per wall, corner to corner, traced straight through doors and windows (they are placed on the wall afterwards); rooms are traced on their own because walls make the building (3D, size check) and rooms are the named spaces (Test fit, Rooms). | 2026-11-06 |
| chat-D46 (how pieces are delivered) | No more small PRs: the remaining features are built together and handed over in as few PRs as possible; 3D work (furniture fit, 3D walk-through) comes last. | 2026-11-06 |
| chat-D47 (batch A sections) | Section 13 written and approved as one batch: schedule view, liked floor plans, cheap wins, plan versions (at most 20), idea inbox, decision cards, hidden works, build tracking; done-when K1–K16. The schedule shows the 19 gates section 1 lists (no D2 or D3). | 2026-11-06 |
| chat-D48 (batch C, Red Deer) | Section 14 built from facts opened on the official pages and checked on 2026-11-06 (Alberta, NRC, City of Red Deer, UCA, AUC, CMHC); Red Deer first; tests M1–M8. Health Canada's radon level and the federal pre-approval page stay out until checked. | 2026-11-06 |
| chat-D49 (batch D) | Section 15 approved and built as one batch: structures the owner fills in (no invented numbers or rules), tests W1–W14. Lego rules become soft checks (warnings, each can be turned off). Storage by use waits for the "3 steps" distance. | 2026-11-06 |
| chat-D50 (batch E, reduced) | Official cost per ft², component life spans and a price-rise figure were not found (2026-11-06). Built: the 9.36 energy tier reference with a target-tier pick, and a 30-year cost calculator with no built-in life spans or price rise. The rate table with estimate classes and the comparison with the city wait for sources. | 2026-11-06 |

## 4. Architecture

- Vite + React. Pascal packages @pascal-app/core, viewer, nodes, editor at 1.0.6 (MIT). Deploy to GitHub Pages with GitHub Actions.
- Pascal is the only owner of walls. A room block is a Pascal zone with its walls and items. Any later floor-plan or furniture view reads from the same scene.
- Furnish2 (github.com/lxyzh1019-cyber/Furnish2, the owner's MIT fork, one index.html, no npm package): copy its furniture library sizes (74 items, mm), custom furniture, clearance labels, overlap check and wall snap. Do not copy its prices (not Alberta prices) or its apartment templates. Keep its MIT notice in THIRD_PARTY_NOTICES.md.
- Firestore: projects/{projectId} with owner, members and memberNames (family sharing, chat-D33), setup, scene (Pascal nodes and rootNodeIds), rooms, answers, lot, clusters, trace, budget lines. `rooms` and `answers` are fields of the project document, keyed by id (chat-D40).
  - rooms/{roomId}: type, preset, level (basement | main | upper; default main), options (the preset's option values), items (each: libraryId or custom, width, depth, x, y, rotation), minimum (width, depth), chosenSize (width, depth), bedroomReady (true/false), ports.
  - answers/{questionId}: value, answeredBy (member uid), answeredAt. Question ids are listed in section 6.5. The later Stage 1 questionnaire reads and writes the same ids, so an answer is never asked twice.
- Units: store metres (Pascal); show feet and inches (nearest inch). Tests compare in feet within 0.01 ft.
- Language: every screen in English and Simplified Chinese, as on the canvas.
- No AI API calls in the app (canvas rule): AI work happens in chat tools; the app saves the results.

Known build facts (from the spike test, 2026-11-04):

- The build needs `NODE_OPTIONS=--max-old-space-size=6144`.
- A saved scene loads back only through `setScene(nodes, rootNodeIds)`; save both.
- The Vite main bundle is 7.4 MB (2.3 MB gzip). Phone load time is the biggest open risk; split chunks before adding large libraries.
- WebGPU falls back to WebGL on phones without it. If the phone shows no 3D, report the device, the browser and whether the WebGL fallback drew anything; do not switch libraries.

## 5. Pieces and order

Two design methods run side by side (chat-D18). Both write to the same Pascal scene.

- Method 1, room blocks: design each room from its contents, then arrange the rooms (sections 6 and 7).
- Method 2, plan intake: trace a real or liked plan (section 11).
- How they help each other: Rooms from contents checks every traced room (section 11, P5); a traced room's size shows next to that room type's minimum as a size you know (section 6, R13).

Pieces:

1. Spike (PR #1): one Pascal room you can resize, saved to Firestore. Phone test happens after merge on the Pages link. Pass: the 3D view shows on the phone; first load under 10 s on Wi-Fi; the 20 x 20 ft room is still 20 x 20 ft after a reload. If Pages asks for an upgrade, the repo is private; it must be public.
2. **Rooms from contents**: section 6. **Plan intake**: section 11, steps P1 to P4 and P6. These two are independent pieces and can be built at the same time, on separate branches.
3. Test fit (section 11, P5): after both pieces in step 2, because it joins them.
4. Lot board: section 7.
5. Family sharing: section 9.
6. Budget meter: section 8.
7. Later, each gets its own section here before its piece starts: every row marked "Later" in section 12.

## 6. Rooms from contents

Lessons from the failed chat prototype (2026-11-04): the user could not set a room size; three coarse questions stood in for furniture; there were no furniture items to add, move or resize.

### 6.1 Requirements

- R1 Room types at start: living room, office, dining room, primary bedroom, kid bedroom, mudroom. Living room and office get the full question set first. Kitchen, guest room and other types come later with their own presets. Garage, kitchen and back kitchen are plain rectangles until then (chat-D24, section 7).
- R2 Contents are real furniture items from the library, each with width x depth, plus custom items and quantities. Each room type has presets (for example "Family TV room"; section 6.4).
- R3 Plain questions add items (how many seats, TV size, how many desks, storage). The user can then add, remove, move, rotate and resize items.
- R4 The minimum size is the smallest rectangle that holds the arrangement with its clearances, using the rules table (R12). A preset's starting arrangement is built from bands (section 6.2, chat-D36). After the user moves items, the minimum is the bounding rectangle of all items, clearance zones and walkways as placed: a moved item carries its band's clearance, and the main and side walkways stay where the preset put them (chat-D42).
- R5 The room size is set by the user, width x depth. The default is the minimum. Any bigger size is accepted and saved.
- R6 A smaller size shows "Too small", short by how many feet in width and depth, then the smallest changes that fit (section 6.2, Smallest changes) and "or make it W x D".
- R7 A bigger size shows the spare ft² and what it costs at the build rate range (default C$175–275 per ft², E3, editable).
- R8 A to-scale drawing shows the items, walkways (hatched), clearance labels and overlaps (red). Items drag inside the room with wall snap.
- R9 The room is saved in Firestore and survives a reload.
- R10 An open living room can share its main walkway with an open neighbour; the lot board applies this (section 7).
- R11 Questionnaire sections 4 (storage), 5 (work) and 6 (guests) become room questions, so answering them also sizes rooms (section 6.5, chat-D37). Section 3 (cooking) waits for the kitchen room type.
- R12 Rules table: each row has its value, unit, source, evidence tag and date checked; a row older than 2 years shows "check again".
- R13 Sizes you know: when a traced plan has a room of the same type, its size shows next to the minimum, as a reference.
- R14 Level: every room has a level (basement, main or upper; default main), chosen on the room card and saved (chat-D38).
- R15 Bedroom-ready: an office can be marked bedroom-ready. This adds a closet band 2 ft deep along one wall and flags the room as needing an egress window (canvas fix L5).

### 6.2 How the minimum is computed (bands)

- A preset's arrangement is a stack of **bands** running from the back wall forward (depth direction). Each band holds parts placed side by side (width direction).
- Band depth = the deepest part in it. Band width = the sum of its parts' widths.
- Some presets add a **side walkway** column along one side wall, the full room depth (3 ft). It is the path from the door to the front of the room.
- **Minimum width** = side walkway + the widest band. **Minimum depth** = the sum of all band depths.
- Items are drawn in their band's position (centred in the band unless the preset says otherwise). Walkways and clearances are drawn hatched and may not hold furniture, except where a part says "items allowed".
- **Smallest changes** (R6): for each short side, try one change at a time from the option lists in section 6.4, in this order: (1) the next smaller option of the item that sets that side; (2) the low end of a range rule (seat to TV 1.2x); (3) leaving out an optional item. List every single change that closes the gap, with its new size. Walkways and required clearances are never offered as changes.

### 6.3 Rules table, starting values (E3; replace with sourced rows; date checked 2026-11-06)

- Main walkway 3 ft. Side walkway 3 ft. Bed side zone 2.5 ft (a nightstand sits in it at the head end). Bed foot walkway 3 ft.
- Seat to TV screen: 1.2 to 1.6 x the screen diagonal (THX 40 degrees, SMPTE 30 degrees); use 1.4.
- TV band 0.25 ft (screen off the wall). Eye to sofa back 1.5 ft. Sofa or seat-group depth 3 ft.
- Seats facing each other with no TV: 8 ft apart.
- Desk 2.5 ft deep. Desk chair space 3 ft behind each desk; a shelf wall 1 ft deep. Kid desk 4 x 2 ft.
- Dining chair space 3 ft on every side of the table.
- Sofa bed open 6.5 ft; a sofa bed means an egress window if anyone sleeps there. Sofa bed 7 ft wide.
- Beds (mattress, inches): twin 38 x 75, queen 60 x 80, king 76 x 80. Dresser 1.67 ft (20 in) deep. Closet 2 ft deep.
- Mudroom locker 1.5 ft wide (2 ft for heavy sports gear) x 1.67 ft deep, bench built in. Door zone 3 ft wide at the garage-door end.
- Building-code minimum room areas are not checked in this piece. The room card shows "Code minimum not checked yet" until the Final rules gate (Later) adds them.

Office layout (chat-D35), back wall to front: desk band 2.5 ft (desks side by side), chair band 3 ft, main walkway 3 ft, sofa bed 6.5 ft open (only when chosen), shelf wall 1 ft, closet 2 ft (only when bedroom-ready); plus a 3 ft side walkway. One 6 ft desk gives 9 x 9.5 ft.

Living room layout, TV wall to back: TV band 0.25 ft, viewing gap (1.4 x diagonal + 1.5 ft eye to sofa back − 3 ft sofa depth), seat-group band 3 ft, rear walkway 3 ft (0.5 ft strip when open, because the neighbour's walkway is shared); plus a 3 ft side walkway. Seat group 6–8 seats = 12 ft wide (L-sectional 10.5 ft plus 2 chairs at its open end). For a 75-in TV: 0.25 + 7.25 + 3 + 3 = 13.5 ft deep; 3 + 12 = 15 ft wide.

### 6.4 Presets data

The app reads this data (copy it to `src/data/presets.json`). Sizes in feet unless the key ends in `_in`.

```json
{
  "rules": {
    "walkway_main": 3.0, "walkway_side": 3.0, "shared_strip": 0.5,
    "tv_factor": 1.4, "tv_factor_low": 1.2, "tv_factor_high": 1.6,
    "tv_band": 0.25, "eye_to_sofa_back": 1.5, "seat_depth": 3.0,
    "desk_depth": 2.5, "desk_chair": 3.0, "shelf_depth": 1.0,
    "dining_chair": 3.0, "bed_side_zone": 2.5, "bed_foot_walkway": 3.0,
    "dresser_depth": 1.667, "closet_depth": 2.0,
    "locker_depth": 1.667, "door_zone": 3.0, "bench_depth": 1.5,
    "sofa_bed_open": 6.5, "sofa_bed_width": 7.0
  },
  "options": {
    "tv_in": [55, 65, 75, 85],
    "seat_group": {"4": 10.5, "6-8": 12.0, "10+": 14.0},
    "desk_len": [5.0, 6.0],
    "dining_table": {"4": [4.0, 3.0], "6": [6.0, 3.0], "8": [8.0, 3.5]},
    "bed_in": {"twin": [38, 75], "queen": [60, 80], "king": [76, 80]},
    "locker_w": {"normal": 1.5, "heavy": 2.0},
    "kid_desk": [4.0, 2.0]
  },
  "presets": {
    "living_tv":    {"type": "living", "name": "Family TV room", "side_walkway": true, "defaults": {"seats": "6-8", "tv_in": 75, "open": false},
                     "bands": ["tv", "viewing_gap", "seat_group", "rear_walkway"]},
    "office_desk":  {"type": "office", "side_walkway": true, "defaults": {"desks": 1, "desk_len": 6.0, "shelf": true, "sofa_bed": false, "bedroom_ready": false},
                     "bands": ["desks", "desk_chair", "walkway_main", "sofa_bed_if_chosen", "shelf", "closet_if_bedroom_ready"]},
    "dining_table": {"type": "dining", "side_walkway": false, "defaults": {"seats": "6"},
                     "bands": ["chair_space", "table", "chair_space"], "width": "chair_space + table + chair_space"},
    "primary_bed":  {"type": "primary_bedroom", "side_walkway": false, "defaults": {"bed": "queen", "dresser": true},
                     "bands": ["bed_row: side_zone + bed + side_zone", "bed_foot_walkway", "dresser_if_chosen"]},
    "kid_bed_desk": {"type": "kid_bedroom", "side_walkway": false, "defaults": {"bed": "twin", "desk": true},
                     "bands": ["closet", "walkway_main", "bed_row: bed + bed_side_zone + (desk_chair + kid_desk depth) or dresser"]},
    "mudroom_lockers": {"type": "mudroom", "side_walkway": false, "defaults": {"people": 4, "gear": "normal", "bench_opposite": false},
                     "bands": ["lockers: people x locker_w + door_zone", "walkway_main", "bench_if_chosen"]}
  },
  "tests": [
    {"id": "T1",  "preset": "living_tv", "opts": {"seats": "6-8", "tv_in": 75, "open": false}, "min": [15.0, 13.5]},
    {"id": "T2",  "preset": "living_tv", "opts": {"seats": "6-8", "tv_in": 75, "open": true},  "min": [15.0, 11.0]},
    {"id": "T3",  "preset": "office_desk", "opts": {"desks": 1, "desk_len": 6.0, "shelf": true, "sofa_bed": false, "bedroom_ready": false}, "min": [9.0, 9.5]},
    {"id": "T8",  "preset": "dining_table", "opts": {"seats": "6"}, "min": [12.0, 9.0]},
    {"id": "T9",  "preset": "primary_bed", "opts": {"bed": "queen", "dresser": true}, "min": [10.0, 11.33]},
    {"id": "T10", "preset": "kid_bed_desk", "opts": {"bed": "twin", "desk": true}, "min": [10.67, 11.25]},
    {"id": "T11", "preset": "mudroom_lockers", "opts": {"people": 4, "gear": "normal", "bench_opposite": false}, "min": [9.0, 4.67]},
    {"id": "T12", "preset": "office_desk", "opts": {"desks": 1, "desk_len": 6.0, "shelf": true, "sofa_bed": false, "bedroom_ready": true}, "min": [9.0, 11.5]},
    {"id": "T15", "preset": "office_desk", "opts": {"desks": 1, "desk_len": 6.0, "shelf": true, "sofa_bed": true, "bedroom_ready": false}, "min": [10.0, 16.0]}
  ]
}
```

Band meanings: `tv` = rules.tv_band deep, as wide as the TV; `viewing_gap` = tv_factor x tv_in / 12 + eye_to_sofa_back − seat_depth (items allowed: coffee table); `seat_group` = seat_depth deep, seat_group width; `rear_walkway` = walkway_main, or shared_strip when open; `desks` = desks x desk_len wide, desk_depth deep; `desk_chair` = desk_chair deep; `sofa_bed_if_chosen` = sofa_bed_open deep, sofa_bed_width wide (0 when not; the shelf wall behind it is reached when the bed is folded); `shelf` = shelf_depth (0 when no shelf); `closet_if_bedroom_ready` = closet_depth (0 when not); `chair_space` = dining_chair on every side of the table; `bed_row` depth = bed length; kid bed row: twin bed 38 in + bed_side_zone + desk_chair + kid desk depth (with desk) or + dresser_depth (without desk); `lockers` = locker_depth deep; `bench_if_chosen` = bench_depth (0 when not).

### 6.5 Room questions (R3, R11)

Each question shows English and 简体中文, one at a time, choices first. The id is the answer's Firestore id (section 4).

Living room:
- living.seats — How many people sit here at the same time? 这里同时坐几个人？ Pick: 4 · 6–8 · 10+ → seat group.
- living.tv — TV size? 电视尺寸？ Pick: 55 · 65 · 75 · 85 in → TV band. A room with no TV (seats facing each other 8 ft apart) is a later preset; this piece does not offer "none".
- living.open — Open to the kitchen and dining room, or a separate room? 与厨房餐厅开放相连，还是独立房间？ Pick: separate · open → rear walkway 3 ft or 0.5 ft strip.

Office:
- office.desks — How many people work here at the same time? 几个人同时在这里工作？ Pick: 1 · 2 → desks.
- office.desk_len — Desk length? 书桌长度？ Pick: 5 ft · 6 ft.
- office.shelf — A shelf wall for files and books? 要一面书架墙吗？ Pick: yes · no.
- office.sofa_bed — Do guests sometimes sleep here? 客人有时在这里睡吗？ Pick: yes · no → sofa bed (open 6.5 ft) and an egress window flag.
- office.bedroom_ready — Should this room be able to become a bedroom later? 以后要能改成卧室吗？ Pick: yes · no → R15.

From questionnaire section 4, Coming in + storage (进门与收纳):
- q4.1 — Winter coats, boots and sports bags per person. 每人冬衣、靴子、运动包数量 Pick: light · normal · heavy sports gear → locker width; household size → locker count.
- q4.2 — What gear comes home wet? 哪些装备回家是湿的？ Pick (multi): boots · skates · swim bags · none → a boot tray or drain item in the locker band.
- q4.3 Garage (Rank) and q4.4 seasonal storage (Pick): saved now, used by later pieces (garage, storage by use).

From questionnaire section 5, Work, study + hobbies (工作、学习与爱好):
- q5.1 — Who works from home, and how many days? 谁在家办公、几天？ Pick per person: 0 · 1–2 · 3–5 days → office.desks default = people with 1+ days.
- q5.2 — Do video calls need a door that closes? 视频会议要关门吗？ Pick: yes · no → office door port (closed room).
- q5.3 — Homework: near parents or in own room? 作业在哪做？ Pick: near parents · own room → kid bedroom with desk (own room) or with dresser and a homework spot added to the dining room or office (near parents) (canvas fix L6).
- q5.4 Hobby gear (Short note): saved now.

From questionnaire section 6, Guests + family (客人与家人):
- q6.1 — How often do relatives stay, and for how long? 亲戚多久来住、住多久？ Pick: never · a few nights a year · weeks at a time → if not never, offer office.sofa_bed = yes.
- q6.2 — Do guests need their own bathroom? 客人要独立卫生间吗？ Pick: yes · no → saved for the guest room type (later).
- q6.3 — Largest gathering we host. 最多招待多少人？ Pick: up to 6 · 8 · 10+ → dining table seats default (4/6 → 6, 8 → 8, 10+ → 8 plus a note) and living.seats default.
- q6.4 — Do we need a main-floor bedroom? 需要一楼卧室吗？ Pick: yes · no → suggests level = main for one bedroom (R14).

### 6.6 Tests (done when)

- T1 Living room, 6–8 seats, 75-in TV, separate room: minimum 15 x 13.5 ft.
- T2 Same room, open to dining: 15 x 11 ft.
- T3 Office, 1 person, 6 ft desk, shelf wall: 9 x 9.5 ft (chat-D35; was 10 x 10, which had no working).
- T4 User sets T1's room to 20 x 20 ft: accepted, saved, still 20 x 20 after reload; spare 197.5 ft².
- T5 User sets T1's room to 14 x 13 ft: "Too small", width short 1.0 ft, depth short 0.5 ft. Smallest changes listed: width: 4-seat group (13.5 ft wide); depth: 65-in TV (12.33 ft deep) or sit at 1.2x (12.25 ft deep); "or make it 15 x 13.5".
- T6 Round trip: the minimum passes its own check; 0.5 ft smaller in either side fails.
- T7 Owner's PC test (chat-D44; was a phone test): a family member sizes the living room and office alone, in under 10 minutes each.
- T8 Dining, 6 seats: 12 x 9 ft.
- T9 Primary bedroom, queen bed, dresser: 10 x 11.33 ft (10' 0" x 11' 4").
- T10 Kid bedroom, twin bed and desk: 10.67 x 11.25 ft (10' 8" x 11' 3").
- T11 Mudroom, 4 people, normal gear: 9 x 4.67 ft (9' 0" x 4' 8").
- T12 Office from T3 marked bedroom-ready: 9 x 11.5 ft, egress window flag on.
- T13 A room set to level basement still shows basement after a reload.
- T14 Answering q4.1 for a 4-person household sets the mudroom to 4 lockers, saves answers/q4.1, and the mudroom card reads the same answer after a reload.
- T15 Office from T3 with a sofa bed for guests: 10 x 16 ft, egress window flag on.
- Unit tests read `src/data/presets.json` and check T1–T3, T8–T12 and T15 by the band rules in section 6.2.

## 7. Lot board (after rooms)

- Drag rooms onto a lot (default 60 x 100 ft), 2 ft snap, rotate, overlap flags, setbacks entered by the user from the zone.
- Levels: a level switch (basement, main, upper) shows one level at a time; a room appears on the level saved in its card (chat-D38). The lot outline and setbacks show on every level.
- Ports: each room side can be a door, an open side or a wall. An open living room touching another open room shares its walkway (minus a 2.5 ft strip); alone, the strip is added back.
- The daily core route (garage, mudroom, back kitchen, kitchen, dining) can be glued into one cluster that moves as a whole.
- Garage, kitchen and back kitchen join the room types as plain rectangles (chat-D24).

Tests (done when, chat-D23):

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

Tests (done when, chat-D32; made-up numbers; B3–B5 worked out again for the 9 x 9.5 ft office, chat-D39):

- B1 Every line can be edited and is saved: goal, lot price, lot in the goal, soft-cost lines (add, rename, remove), contingency %, both build rates.
- B2 A goal of 800,000 with a 200,000 lot inside it and no rooms placed leaves 600,000.
- B3 The T1 living room (15 x 13.5) and the T3 office (9 x 9.5) on the lot = 288 ft²: build 50,400 to 79,200 at 175 and 275 per ft².
- B4 With 10% contingency on the build cost and 30,000 of soft costs: total 285,440 to 317,120, left 514,560 to 482,880.
- B5 With the lot taken out of the goal: left 714,560 to 682,880.
- B6 The budget is saved and survives a reload.
- B7 The owner types their own numbers on a PC and reads what is left in 5 minutes or less.

## 9. Family sharing

- projects/{id} holds a members list. Members read and write; only the owner adds members or deletes.
- Firestore emulator tests: a member writes, a non-member is denied.
- Members are added by device code (chat-D33); one project per device is gone (chat-D34).

Tests (done when, chat-D34):

- S1 A member reads and writes the project and finds it under "shared with me".
- S2 A non-member is denied and finds nothing.
- S3 A member cannot add or remove members, rename them, change the owner or delete.
- S4 The owner adds and removes members and is the only one who deletes.
- S5 Two projects per owner: both are listed, and saving one leaves the other as it was.
- S6 Project setup (name, new build or renovation, city, household) survives a reload.
- S7 The owner adds their phone by its device code and sees the same project on the phone.

## 10. Open items

12 canvas fixes from the canvas v54 review:

| Fix | What it means | Status |
|---|---|---|
| C1 ledger | Chat decisions get a ledger line the same day. | Closed by section 3 (decision ledger). |
| G1 new-design branch | A new design is a separate branch; a traced plan gets the "test fit" label. | Now: section 11, P5. |
| L5 study bedroom-ready | A study or office can be bedroom-ready: closet, egress window, full bath nearby. | Now: R15 (closet and egress flag). Full bath nearby: lot board check, Later. |
| L6 homework | Questionnaire section 5 homework answer shapes the rooms. | Now: q5.3 in section 6.5. |
| C2 sizes from questionnaire counts | Room sizes come from questionnaire counts (sections 3 and 4). | Now for section 4 (q4.1); section 3 with the kitchen type (chat-D37). |
| K1 date old items | Every rule and rate row carries the date it was checked. | Now: R12. |
| L2 sun room | Sun room is a room type that can shrink or move to "later". | Later: room type list. |
| L3 feng shui roles | The room energy score diagnoses; design gates use follow or ignore; remove the text "advisory, not scored". | Proposed in section 17.4 (DN16). |
| O1 tour copy | One copy of the video-tour instructions; no tool names ("the pain-point list", not a product's list). | Proposed in section 17.7 (DN19). |
| C3 back-kitchen make-up air | A strong back-kitchen hood comes with make-up air. | Later: kitchen type. (Myth M6 and the kitchen card prompts in section 17 carry the make-up air line.) |
| O2 feng shui list | One feng shui list, not two. | Proposed in section 17.4 (DN16). |
| L4 rename the two 7 lists | "7 plan checks" and "7 review weights" keep different names. | Proposed in section 17.3 (DN15). |

- Later pieces' sections (section 12 rows marked Later) are written here before each starts.
- Seeing a traced plan on another device: done by device code (chat-D33). The plan picture still stays on the device that uploaded it (chat-D27 "for now"). Real sign-in (chat-D28) is still open; linking keeps each device's id.

## 11. Plan intake (trace a plan)

Restored from canvas v54 (Stage 2a and the technical flow). Used for a renovation's current house, a builder's plan, or a plan the family likes. This is a design method of its own, parallel to room blocks (chat-D18), not a step before or after it.

- P1 Upload a plan image or PDF as an underlay and trace it once in Pascal: walls, doors, windows, rooms, levels.
- P2 Size check: the user enters 3 known sizes from the drawing; if they do not match the trace, trace again. No automatic reading of drawings.
- P3 Overlay check: the drawing under, the model on top, so tracing errors show.
- P4 With no real plan yet, every piece works on a sample plan.
- P5 Test fit (a traced plan marked "test fit"): the user names each traced room's type and picks its contents (or a preset). Rooms from contents then gives each room a Check my size verdict: fits with spare, or too small by how much. A new design is a separate branch, not a change to a traced plan.
- P6 The site review finds the zone (from the land title or the City zoning map) to set setbacks, height and lot coverage.
- P7 A step strip above the picture says the current step (Scale, Walls, Doors and windows, Rooms, Size check), what to tap next and where its result shows; a greyed-out tool says why (chat-D43). A "How to trace" box explains each step (chat-D45).

Tests (done when, chat-D30):

- I1 The sample plan's 4 outside walls, traced, give its printed outside size within the tolerance (rules table: plan trace tolerance).
- I2 Two points 100 px apart set to 10 ft make a 200 px wall read 20.0 ft.
- I3 Three matching sizes say the trace matches; one size off by more than the tolerance says "trace again" and names that size.
- I4 A door and a window sit on their wall in the Pascal scene, at the place and width traced.
- I5 A traced room becomes a Pascal room with its name and area; a wall traced on Level 1 sits on Level 1.
- I6 The trace is saved and survives a reload (the picture stays as chat-D27 says).
- I7 The site limits (zone, height, lot coverage) are saved; coverage = area under the placed rooms / lot area, flagged when over the limit.
- I8 The owner traces the sample plan's outside walls on a PC in 10 minutes or less.

Step strip tests (done when, chat-D43):

- N1 The strip shows each step's line: Scale 0 of 2, 1 of 2, type the length, scale set; walls with their count and last length; doors and windows counted; rooms with the last area; size check 2 of 3, matches, trace again naming the size.
- N2 Tapping a greyed-out tool before the scale is set says "Set the scale first (Step 1)", in both languages.
- N3 The owner traces the sample plan's outside walls on a PC without asking which step comes next (I8).

Test fit tests (done when, chat-D31; F2 worked out again for the 9 x 9.5 ft office, chat-D39):

- F1 The sample plan's Living room (20 x 18 ft) as a Family TV room fits, spare 157.5 ft².
- F2 The sample's Bath (6 x 12 ft) as a home office is too small: width short 3.0 ft, depth 0; it needs 9 x 9.5 (T3).
- F3 A traced room that is not a rectangle says the check needs a rectangle.
- F4 R13: a living room in Rooms shows the traced living room's 20 x 18 ft as a size you know.
- F5 "Copy into Rooms as a new design" adds the rooms at their traced sizes; the traced plan is unchanged.
- F6 The test-fit choices are saved and survive a reload.
- F7 The owner marks the sample as a test fit on a PC, names 2 rooms and reads their verdicts in 10 minutes or less.

## 12. Feature inventory (nothing leaves this list without a decision)

Status: Now = in a planned piece; Later = kept, its section is written before its piece starts; Proposed = its section is written (section 17) and waits for the owner's approval.

| Feature | Source | Status |
|---|---|---|
| Stage 0 project setup: name, type, city, household, budget goal | canvas Main | Now (spike, sharing) |
| Stage 0: code, zoning and permit steps for the city; local gas and power rates | canvas Main | Now for Red Deer (§14.1–14.4); other cities later |
| Rate rows rated against the city (near, national average) | canvas Main | Later |
| Element library (E1 templates that cards start from) | canvas Main | Proposed (§17.6, DN18) |
| Many projects: method shared, data per project | canvas Main | Now (data model) |
| Schedule view, stage by stage | canvas Main | Now (§13.1) |
| Who leads, which AI, time and cost shown on every step | canvas Main | Now (§15.1) |
| Current-house video tour instructions and pain-point list | canvas 1a | Pain-point list now (§15.2); tour page proposed (§17.7, DN19) |
| Wish-list questionnaire: 11 sections, 6 answer types, each person answers, ideas you may not know, play back and approve | canvas Questionnaire | Proposed (§17.1, DN13); sections 4–6 feed Rooms from contents now (R11); section 3 sizes the kitchen type later |
| Pictures we like: Pinterest and Houzz scan, house style profile | canvas 1c | Now without scanning (§15.3) |
| Liked floor plans with "why I like it", turned into a plan checklist | handoff 7-step process | Now (§13.2) |
| Cheap wins list, kept when the budget is tight | canvas 1c | Now (§13.3) |
| Lot checklist for buying the lot | handoff 7-step process | Now (§15.4) |
| Mortgage pre-approval sets the budget | handoff 7-step process | Now (§14.5) |
| Plan intake: trace once, 3 sizes match, overlay check, sample plan | canvas 2a, technical flow | Now (parallel method, chat-D18) |
| Test fit and new-design branch | handoff (G1 fix) | Now (after both methods' pieces) |
| Rooms from contents, Check my size, smallest changes, spare cost | chat | Now |
| Room level (basement, main, upper), one level at a time on the lot board | chat-D38 (room level) | Now |
| Bedroom-ready flag: closet band and egress window | handoff (L5 fix) | Now (R15) |
| Lot board, shared walkway, core-route cluster | chat | Now |
| Budget meter with editable lines | chat | Now |
| Family sharing with members | chat | Now |
| Design sprints D4a–D4g, each with a fit check, a live rules check and a saved version | canvas 2b | Now (§15.5) |
| Plan versions; a decision re-opens only the rooms its impact chain names | canvas 2d | Now (§13.4; the impact chain waits for design item cards) |
| Design item cards: rules limits, physical limits, verdict, impact chain, smart proposals, Keep or Delete | canvas Design item board | Now with typed proposals (§15.6) |
| Idea loop inbox: capture, sort, analyse, show, decide, apply; statuses | canvas 2e | Now (§13.5) |
| Room Review path, 7 levels outside in, one card per room with target and plan ft² | canvas Room Review | Proposed (§17.2, DN14) |
| 7 plan checks: flow, storage, housework, light and space, sound and comfort, safety and age, feel | handoff | Proposed (§17.3, DN15) |
| Storage by use: daily within 3 steps, weekly same floor, seasonal, archive | handoff | Proposed as ticked lines (§17.3); the 3-step distance is deferred by the owner |
| Room energy score: 40% measurable, 30% feng shui form rules, 30% family feeling | handoff (L3 fix) | Proposed (§17.4, DN16) |
| Review criteria: context step, weight profiles, gates, 0–10 scores, conditions and value engineering, cost score | canvas Main | Now (§15.7) |
| Decision cards with "+ New comparison" | canvas Decisions | Now (§13.6) |
| Hidden works as its own category through every stage | canvas Main | Now (§13.7) |
| Systems fine-tune checklist: smart home, HVAC and HRV, air quality (radon, filters, humidity), efficiency, EV and solar ready, sound | handoff 7-step process (step 6) | Now (§15.8) |
| Furniture fit and 3D walk-through | canvas 2b D4g | Later (3D view from the spike) |
| Rate table v0 with sources, estimate classes | canvas Rate Table | Later |
| Energy model | canvas Energy Model | 9.36 tier reference and target now (§16); a model waits for an official method |
| Lifecycle cost, 30 years | canvas Lifecycle Cost | Calculator now (§16); no built-in life spans or price rise |
| Final rules gate with code clause links | canvas Stage 3 | Now (§14.1) |
| Work packages: scope per trade, allowances, who supplies, DIY flags | handoff 7-step process | Now (§15.9) |
| Builder price and mortgage draw schedule | handoff 7-step process (step 7) | Now (§14.5, §15.10) |
| Permit checklist and City steps | canvas Stage 4 | Now for Red Deer (§14.2) |
| Builder checks, contract and money checks, myth library | canvas Site Walks | Proposed (§17.5, DN17, DN21, DN23) |
| Build tracking: change orders re-checked, stage cost against budget, photo and video record before drywall | canvas Stage 5 | Now (§13.8) |
| Move-in, possession walk and warranty walks | canvas Stage 6, Site Walks | Now (§14.6, §15.11) |
| Furniture placement: Pascal scene with Furnish2 parts (was: export each level from Pascal to Furnish) | chat-D17 (build base) | Now (changed by chat-D17) |
| Lego rules proposed, not decided: wet rooms together, hallways about 12%, simple outer shape, each room marked now or later | handoff 2026-10-29 (chat-D5 proposal) | Now as soft checks (§15.12, chat-D49) |

## 13. Batch A: stages, decisions and build records (chat-D46, chat-D47)

Built together, in one PR. Two new tabs: **Stages** (13.1, 13.7, 13.8) and **Decide** (13.4–13.6); the Budget tab gets 13.3 and the Plan intake tab 13.2. Saved as two fields of the project document: `plan` (schedule, likedPlans, checklist, cheapWins, ideas, decisions, hiddenWorks, build) and `versions`. Same Firestore rules. Tests use made-up items only.

### 13.1 Schedule view, stage by stage

- The 7 stages and their gates exactly as section 1 lists them: Stage 0 (no gate), 1 D1, 2 D4 D5, 3 D7 D8 D9 D6, 4 D18 D19 D10 D11 D12, 5 D13 D14 D15 D16 D17 D21, 6 D20: 19 gates. Section 1 names no D2 or D3; they are left out until written (owner, 2026-11-06).
- Each gate: open, passed or not needed, with the date, who and a note. A stage is done when every gate in it is passed or not needed.
- D5 shows the budget meter's verdict (within the goal at the high total, only at the low total, over, no goal). D21 shows the rooms photographed before drywall and the hidden works not yet photographed. The owner still ticks the gate.
- K1 the schedule shows the 7 stages with the 19 gates in section 1 order. K2 passing a gate saves date and who and survives a reload; a stage with every gate passed or not needed shows done. K3 D5 shows the budget verdict (made-up B4 numbers: within the goal).

### 13.2 Liked floor plans with "why I like it"

- A liked plan: name, where it came from, reasons ("why I like it"). A picture of it stays on the device that holds it, as chat-D27.
- A reason can go to the **plan checklist**: open, met or dropped, with an optional room. Stage 2 shows how many are met.
- K4 a plan with 2 reasons, one sent to the checklist: it shows open, then met; a reload keeps both.

### 13.3 Cheap wins, kept when the budget is tight

- A cheap win: name, rough cost, note, status idea, keep or done. When the budget meter is over the goal, the Budget tab shows the kept ones at the top.
- K5 two cheap wins (one keep, one idea): with the goal under the total only the kept one shows; a reload keeps them.

### 13.4 Plan versions

- Save a version: name, date, who and a copy of rooms, answers, lot, clusters and budget (not the 3D scene, which is rebuilt from them, and not the plan picture). At most 20 versions, so the project document stays well under Firestore's 1 MiB limit (assumed, not checked); nothing is removed without asking.
- Compare two versions: rooms added, removed and resized (old to new size). Restore a version: the current design is saved as a version first.
- "A decision re-opens only the rooms its impact chain names" waits for design item cards (the impact chain is defined there).
- K6 save v1, resize a room, save v2: compare lists that room old to new. K7 restoring v1 brings the old size back and keeps the replaced design as a version. K8 versions survive a reload; a 21st is refused and nothing is removed.

### 13.5 Idea loop inbox

- An idea: text, who, date, room or topic, and its status, one step at a time: captured, sorted, analysed, shown, decided (keep, drop or later), applied. Only a kept idea goes on to applied. Each step keeps its date and who.
- K9 an idea moves through the statuses in order and cannot skip one. K10 the filter shows one status with a count per status; a reload keeps ideas and their history.

### 13.6 Decision cards with "+ New comparison"

- A card: question, 2–5 options, criteria (cost, effort, how hard to undo, plus typed ones), a note per option per criterion, the pick, why, date, status open or decided, and an optional link to a version. "+ New comparison" starts blank or copies another card's criteria.
- K11 a card with 3 options and 3 criteria saves the pick and why; a new comparison copied from it has the same criteria and no options. K12 a reload keeps cards.

### 13.7 Hidden works through every stage

- An item behind walls or floors (plumbing, wiring, ducts, insulation, blocking, other) with a room, the stage it is decided in, the stage it is built in, and "photographed before drywall". It shows under both stages.
- K13 an item shows under its decide stage and its build stage. K14 the D21 gate lists items not yet photographed.

### 13.8 Build tracking

- Change orders: what changes, cost change (+ or −), date, approved. Approved ones are their own line on the budget meter, so the goal is checked again.
- Stage cost: planned and actual per stage, with the difference.
- Photo and video record before drywall: per room a tick, its date and where the files are kept (typed; the app does not store photos).
- K15 an approved +5,000 change order raises the B4 total by 5,000 and re-checks the goal; a not-approved one changes nothing. K16 planned 100,000 and actual 112,000 shows +12,000; photo ticks survive a reload.

## 14. Batch C: Alberta rules and Red Deer steps (chat-D48)

Every fact here was opened on its official page and checked on 2026-11-06. Each panel links its page. The facts live in `src/plan/alberta.js`; the ticks and amounts are saved in the project's `plan` field.

### 14.1 Final rules checklist (Stage 3, gate D7)

- National Building Code – 2023 Alberta Edition (in force in Alberta since May 1, 2024), 2nd printing (August 2026), Part 9, free from NRC:
  - 9.9.10.1 bedroom egress window: opening at least 0.35 m², no side under 380 mm, 760 mm clear in front in a window well;
  - 9.10.19 smoke alarms: every storey, each bedroom, between bedrooms and the rest of the storey, hard-wired with a 7-day battery and interconnected;
  - 9.32.3.9 CO alarms where there is a fuel-burning appliance or an attached garage, in each bedroom or within 5 m of its door;
  - 9.32.3 mechanical ventilation: principal fan by bedrooms (Table 9.32.3.3), kitchen fan at least 50 L/s; an HRV is one way to meet it;
  - 9.8.4 stairs in a house: rise 125–200 mm, run 255–355 mm;
  - 9.13.4 radon rough-in.
- Each item is not yet, met or not needed. The egress item names the rooms that need it: bedrooms, and offices with a sofa bed or bedroom-ready (R15).

### 14.2 Red Deer permits (Stage 4, gates D10–D12)

- A development permit, a building permit, and electrical, gas (licensed gasfitter only), heating (licensed heating contractor only) and plumbing permits; MyPermits and ProjectDox.
- The building permit is issued only after the development permit is issued and the other permits are applied for.
- Document checklists from the City's lists. Development permit: site plan with setbacks, elevations, floor plan, letter of authorization, letter of intent, certificate of title within 30 days, signed building grade certificate. Building permit: site plan, CSA F280 heat loss, new home warranty registration, soils report (City lots), plans 11×17 or larger with the radon rough-in, truss and floor designs, 9.36 energy summary.
- Review takes 7–10 business days; fees change each May 1 (fee schedule linked).

### 14.3 Zoning (Lot board site review)

- Red Deer Zoning Bylaw 3357/2024 (amended June 9, 2026) and the City's interactive zoning map are linked.
- "Fill from R-L" (R-L Residential Low-Density, sections 6.10.5 and 6.10.8) sets the front setback to 3.0 m, the rear to 7.5 m, both sides to 1.5 m, the height to 15 m (3 storeys) and the coverage to 45%. The note gives the attached-garage rule (front 6.0 m; rear 6.0 m with a rear attached garage) and says infill lots follow section 3.190. Whether R-L is the most common house zone is not checked: the user checks the lot's own zone on the map.

### 14.4 Rates

- Rules rows: Red Deer electricity, Rate of Last Resort (ENMAX), 12.06 ¢/kWh and $0.2498/day, January 2025 to December 2026 (E2, City of Red Deer page). The gas default rate changes every month; its page is linked for the later energy model.

### 14.5 Money (Stage 4, gate D19)

- The mortgage pre-approval amount, typed, can be used as the budget goal.
- Construction loan and the advance at each stage (2 to 6); the app flags advances that do not add up to the loan.
- CMHC Improvement notes: up to 95% of the as-improved value for an owner-occupied home, approved before or early in construction, no advance on vacant land, a new home warranty required.

### 14.6 Warranty walks (Stage 6)

- From the possession date: walks at 1 year (labour and materials), 2 years (delivery and distribution systems), 5 years (building envelope) and 10 years (major structure), Alberta's minimum new home warranty; the registry is linked.

Tests (done when):

- M1 the checklist shows the 6 code items with their clauses.
- M2 a bedroom-ready office and the bedrooms are named for the egress item; a plain office is not.
- M3 the building permit shows its rule until the development permit is issued and the 4 other permits are applied for.
- M4 "Fill from R-L" sets the setbacks (3.0, 7.5, 1.5, 1.5 m), the height (15 m = 49.2 ft) and the coverage (45%).
- M5 the rate rows show their source and date.
- M6 a 600,000 pre-approval, used as the goal, shows 600,000 on the Budget tab.
- M7 advances that do not add up to the loan are flagged.
- M8 a possession date of 2028-06-01 gives walks on 2029-06-01, 2030-06-01, 2033-06-01 and 2038-06-01.

## 15. Batch D: structures the family fills in (chat-D49)

The owner types the content; the app keeps it, adds it up and links it. Nothing here invents a number or a rule. Saved in the project's `plan` field (and `phase` on each room).

- 15.1 Step owners: on every gate, who leads (a household person or typed), which AI (typed), time in hours and cost; each stage shows the sums.
- 15.2 Pain points (Stage 1): room, what bothers us, how often (daily, weekly, rarely), who. One can be sent to the idea inbox, once, as captured. The video-tour instructions wait for the canvas text.
- 15.3 Pictures we like (Stage 1): a link or "on this device", a room, tags. The style profile is the tags counted, highest first. No Pinterest or Houzz scanning (no AI or outside service in the app).
- 15.4 Lot checklist (Stage 0): starts with the checked Red Deer items (the lot's zone on the City map, certificate of title within 30 days, soils report for City lots, the zone's setbacks, height and coverage, building grade certificate) plus the owner's own; each open, done or not needed with a note.
- 15.5 Design sprints D4a–D4g (Stage 2): layout and daily paths, kitchen and mudroom, hidden works, exterior, windows and energy, finishes, furniture fit. Each picks its rooms and shows their Check my size status (fit check) and the 14.1 code items still open (live rules check), and saves a version named after the sprint.
- 15.6 Design item cards (Decide): item, rules limits (with a code item), physical limits, verdict (fits, does not fit, unknown), the rooms it touches (impact chain), proposals (typed), keep or delete.
- 15.7 Review criteria sheets (Decide): context, criteria with weights, gates, 0–10 scores per option, conditions and value engineering, cost score. Total = sum of weight × score ÷ sum of weights, to 1 decimal; an option that fails a gate shows "fails gate".
- 15.8 Systems fine-tune checklist (Stage 2): smart home; HVAC and HRV (code 9.32.3); air quality: radon (9.13.4), filters, humidity; efficiency; EV ready (no rule found for houses); solar ready (Red Deer: building and electrical permits for panels); sound. Each line holds the decision.
- 15.9 Work packages (Stage 4): trade, scope, allowance, who supplies (builder, owner, trade), DIY; allowances totalled.
- 15.10 Builder price (Stage 4): price and date against the budget's build range and goal; above the high estimate, or over the goal, is flagged.
- 15.11 Possession walk (Stage 6): per room, items to fix, each fixed with its date; open items counted.
- 15.12 Lego soft checks (Lot board; warnings only, each can be turned off): wet rooms together (a kitchen or back kitchen touches another wet room on its level or sits over or under one; bathroom and laundry join when those types exist); hallway share and simple outer shape shown as numbers (the share of the rooms' outline that is not rooms, next to the 12% target; the share the rooms fill, 100% = a rectangle), with no pass or fail; each room marked now or later, unmarked rooms listed.

Tests (done when): W1 a gate's time and cost add up in its stage. W2 a pain point goes to the idea inbox once, as captured. W3 three tagged pictures give the profile in count order. W4 the lot checklist starts with the 5 checked items. W5 7 sprints in order; a sprint shows its rooms' fit and the open code items. W6 a design item card lists the rooms in its impact chain. W7 weights 2 and 1 with scores 8 and 5 give 7.0; a failed gate shows instead. W8 the systems checklist has 9 lines. W9 work packages total their allowances. W10 a builder price above the high build total is flagged. W11 possession walk items count open per room. W12 a kitchen alone warns; touching a back kitchen clears it. W13 fill and hallway share for 2 made-up rooms. W14 an unmarked room is listed; marking it clears it.

## 16. Batch E, reduced: energy tiers and 30-year cost (chat-D50)

- 16.1 Energy tier target (Stage 2): NBC(AE) 2023 section 9.36, 2nd printing (NRC), checked 2026-11-06. Performance path, Table 9.36.7.2 (houses over 300 m³): tier 1 no heat-loss reduction, improvement ≥0% or energy target ≤100%; tier 2 ≥5%, ≥10% or ≤90%; tier 3 ≥10%, ≥20% or ≤80%; tier 4 ≥20%, ≥40% or ≤60%; tier 5 ≥40%, ≥70% or ≤30%. Houses of 300 m³ or less: heat loss n/a, 0, 5, 15, 25%; improvement 0, 0, 10, 30, 60%; target ≤100, 100, 90, 70, 40%. Prescriptive path, Table 9.36.8.2: tier 1 is the baseline, tier 2 needs 10 energy conservation points, tiers 3–5 reserved. The owner picks a target tier. Which tier Alberta requires is not stated in these sections: confirm with the City at the building permit.
- 16.2 30-year cost (Decide tab): energy each year (kWh × the Rules table's electricity rate + GJ × the chosen gas rate row) plus each part replaced every "life" years, all rising by the price-rise % typed. No life span or price rise is built in; a part without cost or life is listed, not counted; no price rise typed means prices are held flat (and the panel says so). Gas rate rows: ATCO Gas area 1.893 and Apex Utilities area 1.993 $/GJ for November 2026 (UCA, excluding delivery); which utility serves the lot is not checked.

Tests (done when): Y1 the tier tables are as the code states (tier 3 over 300 m³: 10, 20, 80) and the gas rows carry their source and date. Y2 the target tier and the calculator inputs survive a reload. Y3 10,000 kWh at 12.06 ¢ for 30 years plus an 8,000 furnace lasting 20 years, no price rise, totals 44,180; at 2% the furnace at year 20 costs 8,000 × 1.02^20. Y4 a part without a life span is listed as missing and not counted.

## 17. Batch B: the method text from canvas v54 — PROPOSED, waiting for the owner (DN13–DN23)

**Status: proposed. Not approved. Nothing in this section is built.** When the owner approves a DN, it gets the next chat-D number in section 3 and its "Proposed" marks go.

- Source: the batch B source text the owner gave on 2026-11-06 (canvas v54, frozen, and the 2026-10-29 handoff). Labels are the owner's, so each line can be checked against that text.
- No family or project data. Every example here is made up.
- The app makes no AI calls (section 4). "The AI tool" means an AI chat the family uses outside the app. The family pastes or types its result into the app.
- **OPEN (OBn)** = not decided anywhere in the records. Each one has a proposed answer, marked "Proposed". It is not built until the owner approves that answer.
- **Chinese to check by owner**: the questionnaire questions and the headings are the canvas Chinese. All other Chinese in this section is written by Claude.
- Saved: questionnaire answers in `answers` (chat-D40). Everything else in the project's `plan` field, under the new keys each part names. No new collection, so the Firestore rules do not change.

### 17.0 Labels (DN20)

- The owner's labels stay: parts B1–B7; questions q0.1–q10.6; feng shui lines FS1–FS8 and FD1–FD5; site-walk lines LA1–LE8; myths M1–M16.
- Two of them clash with older test labels: budget tests B1–B7 (section 8) and Red Deer tests M1–M8 (section 14). Proposed: outside section 17, write "part B4" or "myth M6". A bare B1 or M1 outside section 17 keeps its old meaning.
- Batch B tests are H1–H47 (H is not used anywhere else). Open items are OB1–OB9.
- Wording fix, same meaning: the source says "chat-D21" for the kitchen room type. That is the v1.3 draft number of chat-D37, so this section writes chat-D37.

### 17.1 Part B1. Wish-list questionnaire (Stage 1b) · 愿望清单问卷 (DN13)

Purpose: 11 sections that walk the family from today's house to the future house. Small questions with choices first, short notes after. Never one big answer box. 11 个小节，从现在的家想到未来的家。先做选择，再写简短说明，不用一个大空框。

Rules:

- One section per sitting, 15–20 minutes (a guide on screen, not a timer). Every answer is saved at once to `answers/{questionId}` (value, answeredBy, answeredAt; section 4). Stop any time; next time the section opens at the first question that person has not answered. 每次一节，15–20 分钟。每个回答都存到 Firestore，随时可停，下次从停下的地方继续。
- One question at a time, choices first. An optional "Add a note" box follows the choices. 一次只显示一个问题，先做选择。
- Who answers 由谁回答: each section shows All, Each person, Whoever cooks or Parents. 每人回答自己的部分，小节注明由谁回答。
  - Proposed: **All**, **Whoever cooks** and **Parents** give one answer for the household. **Each person** gives one answer per household person, keyed by the person's id from setup (the q5.1 shape that is built). "Parents" and "Whoever cooks" are a guide only; the app does not check who taps. Each answer also saves `person` (the household person who answered).
- Play back, then approve: each section ends with "What did we miss?" (a short note) and a playback list of every question and answer. The family types or pastes a short summary and taps Approve; the app saves who and when. If an answer in that section changes later, the summary shows "Changed since approval · 批准后已更改". 每节结束问“还漏了什么？”，再确认摘要。
- Ideas you may not know: after each section the family pastes ideas from the AI tool, one per line, each with a short why. Each idea is Keep or Delete. A kept idea can go to the idea inbox (section 13.5) once, as captured. 每节结束给出建议并说明原因，由你保留或删除。
- Export: "Copy answers for the AI tool · 复制答案给 AI 工具" puts the section's questions and answers on the clipboard as plain text, in the screen language, one "question: answer" per line, "not answered · 未回答" for blanks. The AI tool reads it and asks a follow-up "why?"; the family puts the reply in the question's note or in "What did we miss?".
- Answer types 答题方式: Pick 选择 (one, or several where marked "multi") · Rank 排序 (order a list) · Scale 1–5 打分 (1 to 5 only) · Timeline 时间线 (steps, each with what and a start time HH:MM; saved in time order) · Short note 简短说明 (Proposed: up to 500 characters) · Sort 分类 (each item into exactly one of must-have, nice-to-have, no-go). Proposed new type for q10.5 only: **Weights 权重** (numbers), because its answer is numbers, not an order.
- Pasted text (ideas, summaries): Proposed limit 20,000 characters per paste, so the project document stays well under Firestore's 1 MiB limit (assumed, as in section 13.4).
- Result 结果 — the **Living Brief** 生活需求摘要 (new `plan.brief`: summaries, missed notes, ideas, lines):
  - **Brief lines**: text, kind (Must-have 必须 · Nice-to-have 想要 · No-go 不要), from (a question id, a feng shui line or a sound target), rooms (optional).
  - q10.1's sort makes the lines. A feng shui flag marked "follow" (17.4) and a Must-have sound target (17.2) each add a Must-have line.
  - Each line is one row of the **Fit check at Gate D4** 适配检查（关卡 D4）: met · not met · n.a. Gate D4 shows "Must-haves met: n of m". The owner still ticks the gate (as section 13.1).
  - Cheap wins picked in q10.3 go to the section 13.3 list with status keep, once each. 小投入高满意清单单独保留。

Questions. Sections 4–6 keep their ids and the choices that are built (section 6.5 and `src/rooms/answers.js`). **OB1** (choices for sections 0–3 and 7–10 are not in the canvas): every choice list below marked "Proposed" is Claude's proposal.

SECTION 0 · All · after the video tour · Our home today · 现在的家

- q0.1 From the pain-point list, which 5 pain points bother you most? 最困扰的 5 个痛点？ Pick, up to 5. Choices: the project's pain points (section 15.2, filled from the tour in part B7). With fewer than 5 pain points, pick from those there are.
- q0.2 Which 3 things must the new house keep? 新家必须保留的 3 样？ Rank, top 3. Proposed choices: the "what we love" lines the family typed from the tour (part B7, point 2), plus lines added here.
- q0.3 Where do things pile up? 东西堆在哪里？ Pick, multi. Proposed: entry and mudroom 门口和玄关 · kitchen counter 厨房台面 · dining table 餐桌 · stairs 楼梯 · bedroom floors 卧室地上 · garage 车库 · basement 地下室 · other (note) 其他（说明）.
- q0.4 Which room do you never use, and why? 从不用的房间？ Short note.

SECTION 1 · Each person · A day in our life · 一天的生活

- q1.1 Weekday morning: wake, bathroom, breakfast, leave. 工作日早上 Timeline. Starting steps: wake 起床 · bathroom 卫生间 · breakfast 早饭 · leave 出门 (each with a time; steps can be added).
- q1.2 Where does everyone meet in a rush? 早上哪里最挤？ Pick, multi. Proposed: bathroom 卫生间 · kitchen 厨房 · entry and mudroom 门口和玄关 · stairs 楼梯 · laundry 洗衣房 · nowhere 没有.
- q1.3 After school or work until bed. 放学/下班到睡觉 Timeline. Proposed starting steps: home 到家 · snack 点心 · homework or work 作业或工作 · dinner 晚饭 · free time 自由时间 · bath 洗澡 · bed 睡觉.
- q1.4 A typical Saturday. 一个普通的周六 Short note.

SECTION 2 · Each person · My own space · 我的空间

- q2.1 What do you do in your room besides sleep? 除了睡觉还做什么？ Pick, multi. Proposed: homework or study 作业或学习 · work 工作 · hobbies 爱好 · TV or games 看电视或玩游戏 · reading 看书 · exercise 运动 · getting dressed 换衣服 · nothing else 别的不做.
- q2.2 How much do light and quiet matter? 光线和安静有多重要？ Scale 1–5 (1 = not at all 不重要, 5 = very much 非常重要).
- q2.3 Bathroom: own or shared? 独立还是共用卫生间？ Pick. Proposed: own 独立 · shared is fine 共用也可以 · no preference 无所谓.
- q2.4 In 5–10 years, how will you use this room? 5–10 年后怎么用？ Short note.

SECTION 3 · Whoever cooks · Cooking + eating · 做饭与吃饭 (saved now; sizes the kitchen when the kitchen room type comes, chat-D37)

- q3.1 How often do you stir-fry with high heat? 多常大火爆炒？ Pick. Proposed: most days 几乎每天 · weekly 每周 · rarely 很少 · never 从不.
- q3.2 How many people cook at the same time? 几个人同时做饭？ Pick. Proposed: 1 · 2 · 3 or more 3 人以上.
- q3.3 How much bulk food do you store? 囤货多少？ Scale 1–5 (1 = a few days of food 几天的量, 5 = a full pantry and a freezer 满储藏室加冰柜).
- q3.4 Which appliances must have a home on the counter? 哪些电器要常放台面？ Pick, multi. Proposed: kettle 电水壶 · rice cooker 电饭煲 · coffee maker 咖啡机 · toaster 烤面包机 · air fryer 空气炸锅 · microwave 微波炉 · stand mixer 厨师机 · blender 搅拌机 · pressure cooker 电压力锅 · other (note) 其他（说明）.
- q3.5 Where do we eat most meals? 平时在哪吃饭？ Pick. Proposed: kitchen island 厨房岛台 · dining table 餐桌 · eat-in nook 早餐角 · living room 客厅 · it varies 不一定.

SECTION 4 · All · Coming in + storage · 进门与收纳 — as built (section 6.5): q4.1 Pick light · normal · heavy sports gear; q4.2 Pick multi boots · skates · swim bags · none; q4.3 Rank cars · bikes · tools · sports gear · storage; q4.4 Pick a little · some · a lot. (SPEC fix: section 6.5 did not list the q4.3 and q4.4 choices that are built.)

SECTION 5 · All · Work, study + hobbies · 工作、学习与爱好 — as built (section 6.5): q5.1 per person 0 · 1–2 · 3–5 days; q5.2 yes · no; q5.3 near parents · own room; q5.4 Short note.

SECTION 6 · Parents · Guests + family · 客人与家人 — as built (section 6.5): q6.1 never · a few nights a year · weeks at a time; q6.2 yes · no; q6.3 up to 6 · 8 · 10+; q6.4 yes · no.

SECTION 7 · All · feeds Hidden works · Comfort + hidden works · 舒适与隐藏工程

- q7.1 Which rooms feel too hot or too cold now? 哪些房间太热或太冷？ Pick, multi. Proposed: each room typed in the tour (part B7) or the current plan, each as too hot 太热 or too cold 太冷, plus none 没有.
- q7.2 Where do you want floor heating? 哪里要地暖？ Pick, multi. Proposed: basement 地下室 · bathrooms 卫生间 · entry and mudroom 门口和玄关 · kitchen 厨房 · garage 车库 · whole main floor 整个一楼 · none 不要.
- q7.3 Which noises do you want blocked? 要隔哪些噪音？ Pick, multi (feeds the sound targets, 17.2). Proposed: traffic 交通 · neighbours 邻居 · TV and music 电视和音乐 · plumbing and drains 水管和下水 · furnace and fans 炉子和风机 · kitchen hood 抽油烟机 · kids playing 孩子玩闹 · washer and dryer 洗衣机和烘干机 · garage and tools 车库和工具.
- q7.4 Smells and sounds: like, neutral or dislike? Wood smoke, cooking, a crackling fire, rain on the roof. 气味与声音：喜欢、无所谓、不喜欢？ Pick, one per item: wood smoke 木柴烟味 · cooking 做饭的味道 · a crackling fire 壁炉噼啪声 · rain on the roof 雨打屋顶 → like 喜欢 · neutral 无所谓 · dislike 不喜欢.
- q7.5 How much do cooking and garage smells bother you? 油烟和车库气味 Scale 1–5 (1 = not at all 不在意, 5 = a lot 很在意).
- q7.6 Where do you miss outlets, chargers or Wi-Fi? 哪里缺插座、充电或 Wi-Fi？ Pick, multi. Proposed: the same room list as q7.1, plus garage 车库 · outside 室外 · none 没有.
- q7.7 Which home automation do you want? 想要哪些智能家居？ Pick, multi: climate control 温控 · auto doors 自动门 · auto windows or blinds 自动窗或窗帘 · smart locks 智能锁 · lighting scenes 灯光场景 · solar 太阳能 · heat pump 热泵 · EV charging 电动车充电 · none 不要. Proposed: the picks show on the section 15.8 systems checklist lines (smart home, efficiency, EV ready, solar ready).

SECTION 8 · All · Outdoor · 户外

- q8.1 How will we use the yard? 院子怎么用？ Pick, multi. Proposed: kids play 孩子玩 · flower garden 花园 · vegetables 种菜 · barbecue and outdoor meals 烧烤和户外用餐 · lawn 草坪 · pets 宠物 · sport court or rink 运动场或冰场 · quiet sitting 安静坐坐.
- q8.2 Hours per week for garden and lawn. 每周花多少时间打理？ Scale 1–5. Proposed labels: 1 = under 1 h · 2 = 1–2 h · 3 = 2–4 h · 4 = 4–6 h · 5 = over 6 h (1 小时以内 · 1–2 小时 · 2–4 小时 · 4–6 小时 · 6 小时以上).
- q8.3 What outdoor gear needs storage? 户外装备收纳 Pick, multi. Proposed: bikes 自行车 · lawn mower 割草机 · snow blower 吹雪机 · patio furniture 户外家具 · barbecue 烧烤炉 · boats or kayaks 船或皮划艇 · sports gear 运动装备 · garden tools 园艺工具 · none 没有.
- q8.4 Where do you want sun or shade? 哪里要阳光、哪里要阴凉？ Short note.

SECTION 9 · Parents · The future · 未来

- q9.1 How long will we live here? 打算住多久？ Pick. Proposed: under 5 years 5 年以内 · 5–10 years 5–10 年 · 10–20 years 10–20 年 · over 20 years 20 年以上.
- q9.2 When the kids leave, what happens to their rooms? 孩子离家后房间怎么用？ Short note.
- q9.3 Living on one floor when we are older? 老了能否只住一层？ Pick. Proposed: yes 要 · maybe 可能 · no 不要.
- q9.4 Will an older relative live with us, now or later? 将来会有长辈同住吗？ Pick. Proposed: no 不会 · maybe later 以后可能 · yes, later 以后会 · yes, now 现在就会.
- q9.5 Does anyone need step-free or walker access (no-step entry, wider doors, main-floor bath)? 需要无障碍设计吗？ Pick. Proposed: no 不需要 · maybe later 以后可能 · yes, now 现在需要.
- q9.6 How much does resale value matter? 转售价值有多重要？ Scale 1–5 (1 = not at all 不重要, 5 = very much 非常重要).

SECTION 10 · Parents (cheap wins: all) · Priorities + cheap wins · 优先级与小确幸

- q10.1 Sort every wish: must-have, nice-to-have, no-go. 必须 / 想要 / 不要 Sort. Proposed list to sort: each "one wish for the new house" from the tour (part B7, point 9), each kept idea (17.1), each liked-plan reason (section 13.2), and wishes the family adds here.
- q10.2 Where to spend more, where to save. 哪里多花、哪里省 Rank (top = spend more 多花, bottom = save 省). Proposed list: kitchen 厨房 · mudroom and entry 玄关 · primary suite 主卧套间 · living and dining 客餐厅 · bathrooms 卫生间 · office 书房 · basement 地下室 · garage 车库 · outdoor 户外 · energy and systems 节能与设备 · finishes 饰面.
- q10.3 Cheap wins: pick from the list and add your own. 小投入高满意：选择并补充 Pick, multi (All). Proposed list: the canvas examples (a boot drying spot 烘靴处 · an outlet inside a drawer 抽屉里的插座 · a hallway night light 走廊夜灯), the cheap fixes from the tour (part B7) and the section 13.3 cheap wins already saved.
- q10.4 Feng shui: must follow · nice to have · ignore? 风水：必须遵循 · 有更好 · 不考虑 Pick (sets how strictly part B4 is applied, 17.4).
- q10.5 Set your weights for the 7 review weights (Use, Cost, Comfort, Durability, Future, Look, Risk) for each decision type. 分别调整布局类、产品类、系统类与饰面类决定的 7 个权重 Weights. Whole numbers 0–100; each profile adds to 100, or Save is refused and the sum shows. Starting weights:
  - Layout 布局类: Use 35 · Cost 15 · Comfort 15 · Durability 10 · Future 10 · Look 10 · Risk 5.
  - Product 产品类: Cost 35 · Use 15 · Comfort 15 · Durability 10 · Future 10 · Look 10 · Risk 5.
  - Systems 系统类: Durability 30 · Cost 25 · Comfort 20 · Use 10 · Future 10 · Look 0 · Risk 5.
  - Finish 饰面类: Cost 25 · Look 20 · Use 15 · Comfort 15 · Durability 10 · Future 10 · Risk 5.
  - Each adds to 100 (checked: 35+15+15+10+10+10+5; 35+15+15+10+10+10+5; 30+25+20+10+10+0+5; 25+20+15+15+10+10+5). The 7 names in Chinese: Use 实用 · Cost 成本 · Comfort 舒适 · Durability 耐久 · Future 未来 · Look 外观 · Risk 风险.
  - Proposed link to section 15.7: a review criteria sheet gets "Start from a profile · 从权重方案开始", which adds the 7 criteria with that profile's current weights. A weight of 0 is kept but adds nothing to the total (section 15.7 formula).
- q10.6 Our budget comfort range. 预算舒适区间 Short note.

Counts: 52 questions (sections 0 to 10: 4, 4, 4, 5, 4, 4, 4, 7, 4, 6, 6).

Tests (done when):

- H1 The questionnaire has 11 sections, 0 to 10, with 52 questions q0.1 to q10.6 in the counts above; each has English, Chinese, an answer type and who answers; q4.1–q6.4 keep the built ids and choices.
- H2 One person answers q1.1 and q1.2; after a reload, section 1 opens at q1.3 for that person and at q1.1 for a second person.
- H3 In a made-up 2-person household, both answer q2.2 (4 and 2): `answers/q2.2` holds both values keyed by person; after the first answer section 2 shows "1 of 2 people done".
- H4 Answer types: Scale refuses 0 and 6; Rank saves the order; Timeline steps typed 07:30 then 06:45 are saved as 06:45, 07:30; a Short note over 500 characters is refused; Sort puts each item in exactly one group.
- H5 A section's summary is approved (who and when saved); changing one answer in that section then shows "Changed since approval".
- H6 Two pasted ideas, one kept and one deleted: after a reload only the kept one shows; sending it to the idea inbox twice adds it once.
- H7 Section 4's export has one line per question (q4.1 to q4.4), each with the question text and its answer, and "not answered" for a blank.
- H8 The 4 starting profiles each add to 100; changing Layout Use to 40 alone refuses Save and shows 105.
- H9 q10.3 picks "a boot drying spot" and adds "an outlet in the bench": both are section 13.3 cheap wins with status keep; picking again adds no copy.
- H10 q10.1 sorts 3 made-up wishes (must-have, nice-to-have, no-go): the D4 Fit check shows 3 rows with those kinds and "Must-haves met: 0 of 1"; marking the must-have met shows "1 of 1".
- H11 A review sheet started from the Systems profile has the 7 criteria with weights 30, 25, 20, 10, 10, 0, 5; scores Durability 10, Cost 6 and all others 0 give 4.5.

### 17.2 Part B2. Room review path (Stage 2) · 平面审核路径与房间审核 (DN14)

Review the plan from the outside in. 由外到内审核：场地 → 整体 → 逐个房间 → 系统 → 外观 → 饰面 → 最后漫游。

7 levels, outside in · 七个层级:

| Level | What | Why | Sprint |
|---|---|---|---|
| 1 Site 场地 | lot, zone, sun, driveway, garage, yard, views | locked first; a change here moves everything | site review (2a) |
| 2 Whole house 整体 | zones (public, private, service), entries, daily paths 动线, indoor-outdoor | sets which room sits next to which | D4a |
| 3 Room by room 逐个房间 | one Room Review card per room, with the 3D view | fit, use and style per room | D4b + D4g |
| 4 Systems 系统 | HVAC, water, power, windows, energy | they cross every room; check after rooms settle | D4c, D4e |
| 5 Outside + roof 外观与屋顶 | look, roof, chimney | follows the layout | D4d |
| 6 Finishes by zone 饰面 | walls, floors, ceilings | last, easiest to change | D4f |
| 7 Walk-through 漫游 | walk each daily path in the 3D model, room to room | catches gaps between rooms | D4g → Gate D4 |

- The sprints are the section 15.5 sprints; each level shows its sprint and links to it. Level 3's 3D view and level 7's walk-through use the 3D piece, which comes last (chat-D46); until then those parts say "3D view not built yet · 3D 视图尚未完成" and the family checks on the plan drawing.
- Why both lenses: picture boards are by room, so each board feeds one room card (level 3). The questionnaire is by daily life, so it feeds the whole house (level 2) and the walk-through (level 7).
- Each level: not started · in progress · done, with who and when (new `plan.review.levels`).

Room order + progress (new `plan.review`):

- The room list comes from the plan, not a fixed list. Proposed: the owner picks which design is reviewed: the room blocks (default) or one traced plan marked test fit. One card per room of that design.
- **OB9** "Start where the most daily paths meet" has no method in the records. Proposed: the default order puts the daily core route first, in section 7 order (garage, mudroom, back kitchen, kitchen, dining), then the other rooms in plan order. The owner can move any card up or down.
- Gate D4 room progress: "n of m rooms approved · 已批准 n / m 个房间".
- Area program: target ft² per room (typed from the Living Brief and the sizes measured in the current house, which are E1 sizes from part B6) and plan ft² (from the plan). Proposed: the total target ft² × the build rate range shows beside the budget meter as a "target estimate · 目标估算"; the Gate D5 verdict stays the budget meter's verdict (section 13.1), so nothing that passes now changes. The areas go to the Energy model when one exists (section 16 has none yet).
- Table per room: # · room · status (Not started 未开始 / Draft 草稿 / Approved 已批准) · target ft² · plan ft².

Room Review card · 房间审核卡 (the same 11 parts for every room):

1. Who uses it and when 谁用、什么时候用 · from questionnaire sections 1–2 (the card lists those answers).
2. Must-haves and wishes 必须项与愿望 · the Living Brief lines for this room.
3. Style 风格 · that room's style profile (the section 15.3 tags of pictures for this room, highest count first).
4. Size and furniture fit 尺寸与家具 · Check my size (section 6) now; the 3D view later. E1 sizes for this room type show first (part B6).
5. Light, windows and sound 采光、窗与声音 · daylight, glare, the room's sound target.
6. Storage 收纳.
7. Hidden works in this room 本房间的隐藏工程 · outlets, data, vents, plumbing, gas. "Send to hidden works · 送到隐藏工程" adds each line to section 13.7 with this room, decided in Stage 2 (sprint D4c), once.
8. Finishes 饰面.
9. Open cards for this room 本房间未决卡片 · design item cards (15.6) and decision cards (13.6) that name this room.
10. Verdict 结论 · fits the brief? Keep or change · approved by whom, when.
11. Feng shui detail 风水细节 · pass / flag per line of the detail check (17.4).

- Card header: verdict · open cards · rooms it touches · decide-by date · status.
- When something changes later: a decided design item card is applied to the plan and saved as a new version (section 13.4, named after the card). Its impact chain names the rooms it touches; only those room cards go back to Draft. The others stay Approved. If 20 versions exist, the apply is refused with the section 13.4 message and nothing changes.

Worked example: the kitchen card prompts (generic; all sizes E3, common guidelines, not code). Proposed: these lines show as prompts in a kitchen or back kitchen card. 厨房卡提示（通用；尺寸为 E3 常用参考，不是规范）。

- Part 1: whoever cooks (q3.x) · people cooking at once (q3.2) · weekday morning rush (q1.1) · homework or laptop at the island? (q5.3)
- Part 2: high-heat cooking → hood size · bulk food → pantry size · counter appliances → counter length and outlets.
- Part 4: work aisle about 42–48 in (1.07–1.22 m) E3 · island seats at about 24 in (0.6 m) each E3.
- Part 5: a window over the sink needs its sill above counter + backsplash · hood noise and cooking smells into an open plan (myths M6, M7) · low-angle light shows wall flaws, so choose the wall finish with it.
- Part 6: pantry size against bulk food · tall cabinets against windows · recycling and compost.
- Part 7 (5 lines for "Send to hidden works"): hood duct route to outside, and make-up air if the hood is large (myth M6; threshold: confirm with the HVAC designer) · gas line to the range · counter and island circuits · sink, dishwasher and fridge water line · floor level under cabinets (找平).
- Part 8: walls in a washable sheen · countertop · backsplash · floor.
- Part 11: cook faces the room entrance (an island cooktop passes) · water kept away from the stove · stove not visible from the front door · each flag: follow / ignore.

Chinese for these prompts: 第 1 部分：谁做饭（q3.x）· 几人同时做饭（q3.2）· 工作日早高峰（q1.1）· 孩子在岛台写作业或用电脑？（q5.3）。第 2 部分：大火爆炒 → 油烟机尺寸 · 囤货 → 储藏室大小 · 台面电器 → 台面长度和插座。第 4 部分：操作通道约 42–48 英寸（1.07–1.22 米）E3 · 岛台每个座位约 24 英寸（0.6 米）E3。第 5 部分：水槽上方的窗台要高于台面加挡水板 · 开放式布局中油烟机噪音和油烟扩散（误区 M6、M7）· 低角度光线会显出墙面瑕疵，墙面饰面要一起选。第 6 部分：储藏室大小与囤货量 · 高柜与窗户 · 垃圾分类和厨余。第 7 部分：油烟机排风管通到室外，大功率油烟机要补风（误区 M6；门槛值请与暖通设计师确认）· 灶台燃气管 · 台面和岛台电路 · 水槽、洗碗机和冰箱进水 · 橱柜下地面找平。第 8 部分：墙面用可擦洗的光泽度 · 台面 · 挡水板 · 地面。第 11 部分：做饭的人面向房间入口（岛台灶台算通过）· 水远离灶台 · 从前门看不到灶台 · 每个标记：遵循 / 不考虑。

Sound targets · 隔音目标 (Must-have). Quiet is a requirement, so each room gets a target before the plan locks. Answers come from q7.3 and the video tour. Higher numbers are quieter. STC = sound between rooms 房间之间的隔声; OITC = sound from outside 室外传入的噪音. Targets are E3 starting points; confirm with the builder. 目标为 E3 起点，请与建筑商确认。

| Room | Noise to block | Target | How |
|---|---|---|---|
| Bedrooms 卧室 | traffic, TV, plumbing, furnace | walls STC 50+; road-side windows OITC 30+ | laminated or mismatched glass on the road side (myth M1); insulated, staggered or channel walls; solid-core doors; quiet drain pipes away from beds |
| Office / flex 书房/多用途 | kitchen, TV, kids | walls STC 50+ | same wall build; solid-core door with seals |
| Rooms facing a road or lane 临街或临巷房间 | traffic | windows OITC 30+ | window OITC rating, airtight install |
| Mechanical room, laundry 设备间、洗衣房 | furnace, HRV, washer | keep away from bedrooms | plan location (D4a); insulated walls; vibration pads |
| Kitchen + open plan 厨房与开放空间 | hood fan, wok, dishwasher | quiet hood (sones) | hood choice (myth M6); layout choice (myth M7) |
| Garage / shop 车库/工坊 | tools, car doors | wall to house STC 50+ | a detached shop avoids it |

- Impact chain: windows · inside walls and doors (D4c, before drywall) · ducts and drain pipes · mechanical room location (D4a) · open plan.
- Saved per room (new `plan.review.sound`): noises, target text, Must-have yes/no, status (not yet · met · not met).
- Proposed defaults: the target text comes from the row for the room type (bedrooms = primary and kid bedrooms; office/flex = office; kitchen + open plan = kitchen, back kitchen and an open living room; garage = garage). A room card has a "faces a road or lane · 临街或临巷" tick, which adds that row's window target. Mechanical room and laundry are not room types yet; their row shows as a note on the level 2 check until they are. Must-have is on by default for bedrooms and the office, off for the others; the family can change it.
- A Must-have target adds a Must-have brief line (17.1), checked at Gate D4.
- q7.3 picks tick the matching noises on rooms whose row lists them (traffic → bedrooms and road-facing rooms; TV and music → bedrooms and office; plumbing and drains, furnace and fans → bedrooms; kitchen hood → kitchen; kids playing → office; garage and tools → garage).

Tests (done when):

- H12 A made-up project with 3 room blocks gives 3 room cards; switching the review to a traced plan with 2 rooms gives 2 cards.
- H13 Default order: a kitchen comes before an office; moving the office up saves the new order after a reload.
- H14 Every card has the 11 parts in order and the header shows verdict, open cards, rooms it touches, decide-by date and status.
- H15 3 rooms with 1 approved: Gate D4 shows "1 of 3 rooms approved".
- H16 The T1 living room (15 x 13.5) with target 200 ft² shows plan 202.5 ft², +2.5; with the T3 office (9 x 9.5, target 80) the totals are plan 288 and target 280; the target estimate is 49,000 to 77,000 at 175 and 275 per ft²; the D5 verdict does not change.
- H17 Rooms A, B and C approved; a decided design item card that touches B is applied: a version named after the card is saved, B is Draft, A and C stay Approved.
- H18 A kid bedroom gets the target "walls STC 50+; road-side windows OITC 30+" with Must-have on; Gate D4 lists it as an open Must-have until it is marked met.
- H19 q7.3 "traffic" ticks traffic on a bedroom and on a room marked "faces a road or lane", and not on an office that is not marked.
- H20 A kitchen card's "Send to hidden works" adds the 5 part-7 lines to section 13.7 with room kitchen, decided in Stage 2; a second tap adds none.

### 17.3 Part B3. 7 plan checks · 7 项平面检查 (DN15)

Source: 2026-10-29 handoff (not on the canvas). Names: Flow 动线 · Storage 收纳 · Housework 家务 · Light & space 采光与空间 · Sound & comfort 隔音与舒适 · Safety & age 安全与适老 · Feel 感受.

- Naming rule (canvas fix L4): call these "7 plan checks · 7 项平面检查". The scoring categories are the "7 review weights · 7 个评审权重" (q10.5). Never the same name.
- Storage by use (kept from the handoff): daily within 3 steps · weekly on the same floor · seasonal in garage or basement by category · archive in the basement or donate. Storage is the last thing to cut. 按使用频率收纳：每天用的 3 步之内 · 每周用的同一层 · 季节性的按类放车库或地下室 · 存档的放地下室或捐掉。收纳最后才砍。
- The owner chose to decide "within 3 steps" later. Until then the Storage check shows the 4 storage-by-use lines as items the family ticks; the app measures no distance.

**OB2** (what each check tests, its pass line, where it runs). Proposed: each check is pass · flag · n.a., with who, when and a note, ticked by the family. Where the app already has the data it shows a hint beside the check; the hint never ticks the check. The pass lines below are Proposed decision rules, not facts or standards.

| Check | What it tests | App hint (data the app has) | Pass line (Proposed) |
|---|---|---|---|
| Flow 动线 | each daily path from q1.1 and q1.3 goes room to room without crossing a bedroom or a work zone | the core route rooms touch (section 7 cluster) | every daily path walked and none marked "crosses" |
| Storage 收纳 | each storage-by-use line has a place; every room's part 6 is filled | rooms whose part 6 is empty | all 4 lines placed and no room with part 6 empty |
| Housework 家务 | laundry route, cleaning, garbage and recycling route, wet gear (q4.2) | the section 15.12 wet-rooms warning | family marks each route ok |
| Light & space 采光与空间 | every room's part 5 (daylight, glare) and no room that feels shut in | rooms whose part 5 is empty | no room with part 5 empty and none marked "dark" |
| Sound & comfort 隔音与舒适 | every Must-have sound target, and q7.1 hot or cold rooms | "n of m Must-have targets met" | all Must-have targets met |
| Safety & age 安全与适老 | the section 14.1 code items, and q9.3, q9.4, q9.5 and q6.4 answers | a "yes" or "maybe" in q9.3, q9.5 or q6.4 with no bedroom on level main | no open code item, and the hint is clear |
| Feel 感受 | the family's own sense of the house, room by room | the room energy score's feeling part (17.4) | family marks pass |

- Proposed where: at level 2 (whole house) and at level 7 (walk-through), saved apart (new `plan.planChecks.level2` and `.level7`). Gate D4 shows both sets. The owner still ticks D4.

Tests (done when):

- H21 The 7 checks show with these names in both languages; no screen text calls them "review weights" (i18n test).
- H22 2 Must-have sound targets, 1 met: the Sound & comfort hint reads "1 of 2 met".
- H23 q9.3 "yes" and no bedroom on level main: the Safety & age hint shows "no main-floor bedroom"; moving a bedroom to level main clears it.
- H24 A room with an empty part 6 is listed in the Storage hint; filling it clears it.
- H25 A check ticked at level 2 and a different result at level 7 both survive a reload, with who and when.

### 17.4 Part B4. Feng shui check and room energy score · 风水检查与房间能量分 (DN16)

Feng shui check: traditional guidance, not code. Each line gets pass · flag · n.a.; the family marks each flag "follow · 遵循" or "ignore · 不考虑". Source: House & Garden, beginner's guide to feng shui layout (tradition, E3). 风水检查：传统做法，不是规范。

- How strictly it is applied comes from q10.4. Proposed:
  - must follow 必须遵循: a new flag starts as "follow" (the family can still change it);
  - nice to have 有更好: a new flag asks follow or ignore;
  - ignore 不考虑: the lines are hidden and the room energy score leaves out its feng shui part.
  - Not answered: as nice to have.
- A flag marked "follow" becomes a Must-have line in the Living Brief (17.1), checked at Gate D4.
- One list of feng shui lines only (canvas fix O2): the FS and FD lines below. Saved in `plan.fengShui`.

Summary · 概要 (whole house, levels 1–2):

- FS1 Lot and orientation: regular lot shape; solid support behind the house (back yard, not a road). 地块与朝向：地块方正；房后有靠（后院，不是马路）。
- FS2 Front door: clear, well lit, not blocked by plants or trees. 前门：通畅明亮，不被植物或树木挡住。
- FS3 Front door not in a straight line with the back door or a large window. 前门不与后门或大窗成一直线。
- FS4 Stairs and long hallways do not split the house or face the front door. 楼梯和长走廊不把房子切开，也不正对前门。
- FS5 Bathrooms not at the centre of the house; toilets not lined up with the front door, beds or the stove. 卫生间不在房子中心；马桶不对前门、床或灶台。
- FS6 Stove not visible from the front door. 从前门看不到灶台。
- FS7 Bedrooms in the quiet back of the house. 卧室在房子安静的后部。
- FS8 Entry free of clutter: storage planned at the door. 入口不杂乱：门口规划好收纳。

Detail · 细节 (each room, Room Review part 11):

- FD1 Bed: sees the door without facing it; solid wall behind the headboard; not under a beam or sloped ceiling; away from the door and windows. 床：能看到门但不正对门；床头靠实墙；不在横梁或斜顶下；远离门和窗。
- FD2 Desk: solid wall behind; out of line with the door. 书桌：背后有实墙；不与门成一直线。
- FD3 Stove: cook faces the room entrance (an island works); water kept away from the stove. 灶台：做饭的人面向房间入口（岛台可以）；水远离灶台。
- FD4 TV hidden in bedrooms; soft, dim lighting. 卧室电视要能遮起来；灯光柔和偏暗。
- FD5 Clutter: storage under beds and in drawers kept clear. 杂物：床下和抽屉里的收纳保持整洁。
- Proposed: which rooms get which FD lines: FD1, FD4 and FD5 bedrooms; FD2 rooms with a desk (office, kid bedroom with desk); FD3 kitchen and back kitchen. FS lines are whole house and are in no room's score.

Room energy score · 房间能量分 (2026-10-29 handoff; canvas fix L3):

- Per room: 40% measurable 可测量 + 30% feng shui form rules (形势派, Form School; a cultural preference, kept apart from facts) + 30% family feeling 家人感受.
- Compass School (理气派: 八宅 Eight Mansions, 飞星 Flying Stars) is optional only: a switch "Show Compass School notes · 显示理气派说明", off by default, never in the score.
- The score diagnoses; design gates use follow / ignore. The old canvas words "advisory, not scored" are removed.
- A gap of 2 or more between the family-feeling part and the measured part flags the room for a closer look · 需要细看.
- **OB3** (the scale). Proposed: 1–5 for every part and for the score (the handoff's worked numbers sit on 1–5), shown to 1 decimal.
- **OB4** (what "measurable" holds and how each part is scored). Proposed: measurable = the average of the room's measurable lines that have a value:
  - size: Check my size fits → 5; too small → 1;
  - sound target: met → 5; not met → 1; no target or not yet → not counted;
  - daylight, temperature and noise now: typed 1–5 by the family, each with its evidence tag (E1 from the tour, E2 from a measurement or spec);
  - a line with no value is not counted.
  - Family feeling = the average of each person's 1–5 for the room (each person · 每人).
- **OB5** (how the feng shui lines become the 30% part). Proposed: the room's FD lines: pass → 5, flag → 1 (follow or ignore does not change it; the score diagnoses), n.a. → not counted; the part is their average.
- Proposed: a part with no value is left out, and the other parts are scaled to add to 100% (for example measurable and feeling only: 40/70 and 30/70). With no part at all the room shows "not scored yet · 尚未评分".
- Saved in `plan.energyScore` per room.

Tests (done when):

- H26 13 feng shui lines (FS1–FS8, FD1–FD5) in both languages; each saves pass, flag or n.a., and each flag saves follow or ignore.
- H27 q10.4 must follow: a new flag starts as follow and the Living Brief gets a Must-have line for it. Nice to have: the flag asks. Ignore: the lines are hidden.
- H28 A bedroom with measurable 4.0 (size fits 5, daylight typed 3), FD lines 3.0 (FD1 pass, FD4 flag, FD5 n.a.) and feeling 2.0 scores 3.1 and is flagged (gap 2.0). With feeling 3.0 it scores 3.4 and is not flagged (gap 1.0).
- H29 With q10.4 ignore, measurable 4.0 and feeling 2.0 score 3.1 ((0.4 × 4 + 0.3 × 2) ÷ 0.7 = 3.14).
- H30 Turning on Compass School notes leaves every score as it was.
- H31 A room with size too small (1), sound not met (1) and daylight 4 has measurable 2.0; a line left blank is not counted.

### 17.5 Part B5. Builder checks and myth library · 建筑商检查与常见误区 (DN17, DN21, DN23)

Five lists from the canvas Site Walks board, checked against free Canadian sources on 2026-10-09 (by the canvas work, not re-opened in this session). Each line names its source. Ticks save in the app (`plan.siteWalks`).

- R12 rule: a row older than 2 years shows "check again" (the section 6 rule, the same date sum as the Rules table).
- The owner's rule: re-check every source before the piece ships. Proposed: the build session re-opens each source. The House-Builder environment allows alberta.ca and cmhc-schl.gc.ca; the CHBA, InterNACHI, Build Show, Tarion, ANHWP, Travelers and myth sources are on other hosts, so the build session asks the owner to allow those hosts first. A row it still cannot open ships with "checked 2026-10-09 (canvas), not re-checked · 未复核" and goes in the PR's Gaps list.
- Each list shows "n of m ticked" on its gate: A on D18; B on D18 and D19; C on D21; D in Stage 6; E with the warranty walks (section 14.6). The owner still ticks the gates.

A · Builder check (Gate D18, builder signed) · 选建筑商

- LA1 The builder holds an active Alberta licence: look it up in the Builder Registry (status, class, directors, enforcement actions, homes built). Source: Alberta (2024–2025). 建筑商持有有效的阿省执照：在建筑商登记处查（状态、类别、董事、执法记录、已建房屋）。
- LA2 Their past homes show a warranty in the Property Registry; know which of the 7 warranty providers they use, and what it covers and leaves out. Alberta (2024–2025). 他们建过的房子在房产登记处有保修记录；知道他们用 7 家保修商中的哪一家、保什么、不保什么。
- LA3 Years in business, homes built per year, builders' association member. CHBA (2026). 经营年数、每年建房数量、是否为建筑商协会会员。
- LA4 Better Business Bureau complaints, and how each ended. CHBA (2026). 商业改进局（BBB）的投诉，以及每件的结果。
- LA5 Call 3 past buyers: quality, problems and how they were fixed, on time, on budget, would they buy again. CHBA (2026) reference worksheet. 给 3 位以前的买家打电话：质量、问题及如何解决、是否按时、是否按预算、会不会再买。
- LA6 Walk at least one home they built. CMHC guide (Jul 2026). 至少实地看一套他们建的房子。
- LA7 Skills you need (energy, sound targets, accessibility): ask for examples they built. CHBA (2026). 你需要的专长（节能、隔音目标、无障碍）：请他们拿出做过的例子。
- LA8 One named contact who replies; site visits allowed; regular progress updates. CHBA (2026). 有一位指定且会回复的联系人；允许去工地；定期汇报进度。
- LA9 Compare builders by scope lists, not price per ft² (myth M8). Myth library. 按工作范围清单比较建筑商，不按每平方英尺价格（误区 M8）。

B · Contract + money (Gates D18 builder signed, D19 money ready) · 合同与资金

- LB1 A detailed written contract, with the drawings and specs attached. CHBA (2026). 详细的书面合同，附图纸和规格。
- LB2 Payment milestones match the bank's draw schedule (Gate D19). CHBA (2026). 付款节点与银行放款计划一致（关卡 D19）。
- LB3 Deposits are held in trust. CMHC guide (Jul 2026). 定金由信托托管。
- LB4 Allowances are listed item by item and checked against the rate table (myth M9). Myth library. 预留款逐项列出，并对照价格表核对（误区 M9）。
- LB5 Change orders: in writing, priced and signed before work starts; each one saved as a new version (Gate D14). House-Designer flow. 变更单：开工前书面写明、报价并签字；每张存为一个新版本（关卡 D14）。
- LB6 Site visits, the pre-drywall walk and the possession walk are written into the contract. CHBA (2026). 合同写明工地参观、封板前检查和交房检查。
- LB7 A late move-in: what it costs you, and what the contract says. CMHC guide (Jul 2026). 延期入住：你要花多少，合同怎么写。
- LB8 The home is enrolled in warranty before the Building permit; you get the Home Registration Certificate. Alberta (2024–2025). 申请建筑许可前房子已登记保修；你拿到房屋登记证书。
- LB9 GST applies to a new home; ask about the GST/HST New Housing Rebate (check eligibility). CMHC guide (Jul 2026). 新房要交 GST；询问 GST/HST 新房退税（核对资格）。
- LB10 If the mortgage is insured: CMHC Eco Plus refunds 25% of the premium for an energy-efficient new home. CMHC guide (Jul 2026). 如果房贷有保险：节能新房可通过 CMHC Eco Plus 退还 25% 的保费。
- LB11 DIY items: materials, labour or design you supply are not under warranty (myth M13). Owner-builder authorization costs C$750. Travelers Canada · Alberta (2024–2025). 自己做的部分：你提供的材料、人工或设计不在保修内（误区 M13）。业主自建授权费 750 加元。
- LB12 Closing costs are about 1.5–4% of the price. CMHC guide (Jul 2026). 过户费用约为房价的 1.5–4%。

C · Pre-drywall walk (Gate D21, photo record before drywall) · 封板前检查. Walk with the builder after the rough-ins pass and before insulation. Bring the plan, the sound targets and the hidden-works list (D4c). 粗装验收通过后、做保温前，与建筑商一起走一遍。带上平面图、隔音目标和隐藏工程清单。

- LC1 Framing: no badly cut, notched or bored joists or studs; no wood touching soil; no signs of movement. InterNACHI pre-drywall SOP (Mar 2025). 框架：搁栅和立柱没有乱切、乱开槽或乱钻孔；木料不接触泥土；没有变形迹象。
- LC2 Outside wall: weather barrier laps shed water downward; window and door flashing in place; every hole through the wall sealed. Build Show video · InterNACHI (Mar 2025). 外墙：防水层上压下搭接，水往下流；门窗泛水板到位；穿墙孔全部密封。
- LC3 Windows and doors: the models chosen (OITC on the road side, myth M1); sealed to the wall. Sound targets. 门窗：是选定的型号（临街一侧看 OITC，误区 M1）；与墙密封。
- LC4 Air sealing: top plates, rim joists, pipe and wire holes, electrical boxes on outside walls (myths M4, M5). Myth library. 气密：顶梁板、边搁栅、管线孔、外墙上的电盒（误区 M4、M5）。
- LC5 Blocking in the walls for cabinets, grab bars, TV mounts, heavy shelves and wall boards. Build Show. 墙内为橱柜、扶手、电视支架、重型搁板和墙板预埋木方。
- LC6 Radon: a pipe from under the slab, capped and marked, ready for a fan later. Build Show · Alberta Performance Guide (2015) 17.22. 氡气：地板下引出一根管，封帽并标记，以后可加风机。
- LC7 Sound: insulation and the wall build for each sound target; drain pipes not beside bedrooms; mechanical room away from bedrooms. Sound targets. 隔音：每个隔音目标对应的保温和墙体做法；下水管不在卧室旁；设备间远离卧室。
- LC8 Electrical: outlets, switches, data and lights match the plan (count them); smoke and CO alarm locations; a spare conduit from attic to basement (E3). InterNACHI (Mar 2025). 电：插座、开关、网线和灯与图纸一致（数一数）；烟雾和一氧化碳报警器位置；从阁楼到地下室留一根备用管（E3）。
- LC9 Plumbing: shutoffs where you can reach them; no leaks; water heater venting and relief valve. InterNACHI (Mar 2025). 水管：阀门在够得着的地方；无渗漏；热水器排气和泄压阀。
- LC10 HVAC: duct runs match the plan; HRV and furnace sized from the heat-loss number (myth M3); hood make-up air if over 300 cfm (myth M6). Energy model · Myth library. 暖通：风管走向与图纸一致；HRV 和炉子按热损失计算选型（误区 M3）；油烟机超过 300 cfm 要补风（误区 M6）。
- LC11 Fireplace (if any): chase framed, clearances kept. InterNACHI (Mar 2025). 壁炉（如有）：烟道框架做好，安全间距保留。
- LC12 Attic: insulation at the depth specified; vents not blocked. InterNACHI (Mar 2025). 阁楼：保温厚度达到规定；通风口没有堵。
- LC13 Photograph and film every wall, floor and ceiling (Gate D21). House-Designer flow. 每面墙、地面和天花板都拍照录像（关卡 D21）。

D · Possession walk (Stage 6) · 交房检查

- LD1 Every finish, fixture and appliance matches what you ordered. Contract mistakes are not under warranty. ANHWP (May 2026). 每项饰面、灯具洁具和电器都与订单一致。合同上的错误不在保修内。
- LD2 Floors: dents, scratches, paint drips. ANHWP (May 2026). 地面：凹痕、划痕、油漆滴落。
- LD3 Appliances: dings and scratches; run each one. ANHWP (May 2026). 电器：磕碰和划痕；每台都开一下。
- LD4 Water: run every tap, fill the tubs, flush the toilets, look for leaks; watch for a tub dribbling while other taps run. ANHWP (May 2026). 水：开每个水龙头、放满浴缸、冲马桶、查渗漏；留意其他水龙头开着时浴缸是否滴水。
- LD5 Windows, screens, doors, locks; garage door and its safety eyes. Tarion PDI form (2021, Ontario) · InterNACHI (Mar 2025). 窗、纱窗、门、锁；车库门及其安全感应器。
- LD6 Outlets, lights, exhaust fans; press the GFCI and AFCI test buttons. InterNACHI (Mar 2025). 插座、灯、排风扇；按 GFCI 和 AFCI 的测试按钮。
- LD7 Furnace, HRV, water heater, fireplace: run each; get the manuals; learn how each works. Tarion PDI form (2021) · CHBA (2026). 炉子、HRV、热水器、壁炉：每样都开一下；拿到说明书；学会怎么用。
- LD8 HRV: flows measured and balanced; get the written report. "It's installed" does not prove it works. Myth M16 (NRCan HRV guide, E3). HRV：风量已测量并平衡；拿到书面报告。“已安装”不等于能用。
- LD9 Outside: siding, driveway, walks, deck, grading and landscaping complete. Tarion PDI form (2021). 室外：外墙板、车道、步道、露台、场地坡度和绿化都已完成。
- LD10 Two lists: items to fix, and items you cannot judge today (for example cooling in winter). Tarion PDI form (2021). 两张清单：要修的，以及今天无法判断的（例如冬天交房时的制冷）。
- LD11 Photos of everything, outside too if neighbours are still building. ANHWP (May 2026). 全部拍照；邻居还在施工的话，室外也拍。
- LD12 Get the warranty certificate, the provider's contact, who to call and the check-up schedule. CHBA (2026) · Alberta (2024–2025). 拿到保修证书、保修商联系方式、找谁、定期检查时间表。
- LD13 Test for radon in the first heating season. CMHC guide (Jul 2026). 第一个供暖季测氡。

DN23 (possession walk, overlap with section 15.11). Proposed: the LD lines show above the section 15.11 per-room items as ticks. Each section 15.11 item gets a kind: "to fix · 要修" (as now) or "can't judge today · 今天无法判断" (LD10); the open count stays the to-fix items, and the can't-judge items are counted apart. Section 15.11 items saved before this keep kind "to fix".

E · Warranty walks + claims · 保修期检查

- LE1 Coverage starts at the earliest of: move-in, occupancy permit, or title transfer. The project saves that date. 保修从入住、入住许可或产权过户中最早的那天开始。项目保存这个日期。
- LE2 Walk before each coverage ends (timing est.): month 11 (finishes, 1 year) · month 23 (systems, 2 years) · year 4½ (envelope, 5 years) · year 9½ (structure, 10 years). Alberta (2024–2025). 在每项保修到期前检查（时间为估计）：第 11 个月（饰面，1 年）· 第 23 个月（系统，2 年）· 第 4 年半（外围护，5 年）· 第 9 年半（结构，10 年）。
- LE3 Judge defects with the Alberta Performance Guide. Look from 1.5 m inside and 6 m outside (pp. 25–26). Alberta Performance Guide (2015). 用阿省施工性能指南判断缺陷。室内站在 1.5 米处、室外站在 6 米处看（第 25–26 页）。
- LE4 Concrete: foundation wall crack wider than 3 mm (p. 48); basement slab crack wider than 3 mm or edges offset more than 3 mm (p. 50); slab heave or sinking over 25 mm in 3 m in year 1 (p. 52); garage slab crack over 3 mm or offset over 6 mm (p. 55). Alberta Performance Guide (2015). 混凝土：基础墙裂缝宽于 3 毫米（第 48 页）；地下室地坪裂缝宽于 3 毫米或两边错位超过 3 毫米（第 50 页）；第一年地坪在 3 米内隆起或下沉超过 25 毫米（第 52 页）；车库地坪裂缝超过 3 毫米或错位超过 6 毫米（第 55 页）。
- LE5 Floors: slope over 25 mm in 3 m (p. 82); dip or hump over 6 mm in 0.8 m (p. 83); squeaks that repeat and are easy to hear (p. 85). Alberta Performance Guide (2015). 地板：3 米内坡度超过 25 毫米（第 82 页）；0.8 米内凹凸超过 6 毫米（第 83 页）；反复出现、容易听到的吱吱声（第 85 页）。
- LE6 Outside: deck pond bigger than 0.37 m², at least 3 mm deep, still there 30 min after rain (p. 39); brick or mortar crack over 3 mm (p. 68); front step pulling away more than 19 mm (p. 61). Alberta Performance Guide (2015). 室外：露台积水大于 0.37 平方米、至少 3 毫米深、雨后 30 分钟仍在（第 39 页）；砖或砂浆裂缝超过 3 毫米（第 68 页）；前门台阶脱开超过 19 毫米（第 61 页）。
- LE7 Drywall, doors, windows, roof, flooring, room temperatures and radon: **OB6** — the guide's pages 129–327 were not read. Proposed: the list shows LE7 as "not read yet · 尚未阅读" with no thresholds. The build session tries to read those pages on alberta.ca; rows it finds go in the build PR as proposed rows with page numbers, for the owner to approve before they count.
- LE8 To claim: file with your warranty provider, not the government, inside the coverage period. Disputes: Alberta guideline 05-2022. Alberta (2024–2025). 索赔：在保修期内向保修商提出，不是向政府。争议：阿省指引 05-2022。

DN21 (warranty walk dates, a conflict with section 14.6 and test M8). LE1 and LE2 change when the walks fall. Before → after, for the owner's decision:

- Before (section 14.6, built): walks on the 1, 2, 5 and 10-year anniversaries of the possession date. M8: possession 2028-06-01 gives 2029-06-01, 2030-06-01, 2033-06-01, 2038-06-01.
- After (Proposed): the project saves move-in (the existing possession date), occupancy permit and title transfer dates. Coverage starts on the earliest one given. Each walk falls at month 11, month 23, month 54 and month 114 from that start; each coverage end (month 12, 24, 60, 120) shows beside it. A day that does not exist in the walk's month becomes that month's last day. M8 then reads: possession 2028-06-01 alone gives walks 2029-05-01, 2030-05-01, 2032-12-01 and 2037-12-01, ending 2029-06-01, 2030-06-01, 2033-06-01 and 2038-06-01.
- Why: LE2 says walk before each coverage ends; a walk on the end day is too late to file.

Myth library · 常见误区: beliefs that sound right but cost money. 听起来对、却会花冤枉钱的想法。

- Every new decision card (section 13.6) and design item card (section 15.6) gets a myth check: tick the myths that apply, or "none apply · 都不适用"; saved with the card.
- A family's own costly mistakes go first, tagged E1. They are stored per project (`plan.myths`), never in the repo.
- Add a row whenever one is found; a row counts only after it is checked against a source. Rows marked "check again" or "not checked yet" show "not counted yet · 暂不计入".

| # | Wrong belief | What is true · evidence | Where it matters |
|---|---|---|---|
| M1 | Triple-pane glass makes a window soundproof. 三层玻璃窗就能隔音。 | Equal panes vibrate together; laminated glass and panes of different thickness cut outside noise; ask for the OITC rating. 厚度相同的玻璃会一起振动；夹胶玻璃和不同厚度的玻璃才能减少室外噪音；要问 OITC 等级。 E2 no date · Andersen Windows (US maker) · checked | windows; sound targets |
| M2 | Insulation in inside walls makes rooms quiet. 内墙加保温棉房间就安静。 | Sound needs mass, a break between layers and sealed gaps; hollow doors, ducts and outlet boxes leak sound. 隔音靠质量、层间断开和密封缝隙；空心门、风管和插座盒都会漏声。 E2 Aug 2026 · HomeStars Canada · checked | sound targets; Room Review part 5 |
| M3 | A bigger furnace is better. 炉子越大越好。 | An oversized furnace cycles often, heats unevenly and fails sooner; size it from a heat-loss calculation (CSA F280). 炉子过大会频繁启停、加热不均、更早坏；要按热损失计算（CSA F280）选型。 E2 no date · BC regional HomeSmart sheet · checked | energy model; heating |
| M4 | A house must breathe through leaks. 房子要靠缝隙“呼吸”。 | "Build tight, ventilate right": leaks bring drafts and push moist air into walls; use an airtight shell plus an HRV. “建得严，通风对”：漏风带来冷风，并把潮气推进墙里；用气密外壳加 HRV。 E2 2015 · BC Housing HRV guide · checked | energy model |
| M5 | More insulation always pays. 保温越多越划算。 | Each extra layer saves less; air sealing pays back faster (about 1 year vs 5–10). 每多一层省得越少；气密回本更快（约 1 年，对比 5–10 年）。 E2 May 2026 · US Dept. of Energy · checked | energy model |
| M6 | A bigger range hood is better for high-heat cooking. 大火爆炒就要更大的油烟机。 | Capture depends on hood design, size and using the back burners, not only fan power. Over 300 cfm needs make-up air (NBC-AE 9.32.3.8; confirm with the project city). 吸烟效果取决于烟机设计、尺寸和用后排灶眼，不只是风量。超过 300 cfm 要补风（NBC-AE 9.32.3.8；与项目所在城市确认）。 E2 Oct 2024 · Rocky View County, AB · checked | kitchen part 7 |
| M7 | Open concept is always better. 开放式总是更好。 | Noise, privacy and cooking smells spread; a closed kitchen can have its own heating zone. 噪音、隐私和油烟都会扩散；封闭厨房可以有自己的供暖分区。 E2 Jul 2019 · Fine Homebuilding · checked | layout; sound targets |
| M8 | Price per ft² compares builders. 每平方英尺价格能比较建筑商。 | Only when drawings, specs, inclusions and allowances are the same. 只有图纸、规格、包含项和预留款都相同时才能比。 E2 Jan 2026 · Builders Ontario · checked | team + permits (stage 4) |
| M9 | Builder allowances cover the finishes. 建筑商的预留款够买饰面。 | Allowances are often set low to make a quote look cheaper; upgrades follow. 预留款常被压低让报价显得便宜，之后就是加价升级。 E2 no date · US source, check again | Gate D5; rate table |
| M10 | A cheap lot saves money. 便宜的地块省钱。 | Expansive clay adds C$5,000–20,000 in Alberta; slope and service hook-ups add more. 在阿省，膨胀土会多花 5,000–20,000 加元；坡地和接通市政管线还要更多。 E2 Aug 2026 · HomeStars Alberta · checked | level 1 site |
| M11 | The basement can be planned later. 地下室以后再规划。 | Bedroom windows need an opening of at least 0.35 m² with no side under 380 mm; the foundation wall is fully insulated. Plan rough-ins and ceiling height now. 卧室窗开口至少 0.35 平方米、任何一边不小于 380 毫米；基础墙要全保温。现在就规划预埋和层高。 E2 May 2017 · Alberta Municipal Affairs · checked | hidden works D4c |
| M12 | A new home needs no upkeep for 10 years. 新房 10 年不用维护。 | Warranty: 1 year finishes, 2 years systems, 5 years envelope, 10 years structure; it covers defects, not upkeep. 保修：饰面 1 年、系统 2 年、外围护 5 年、结构 10 年；保的是缺陷，不是维护。 E2 May 2025 · AREA · checked | lifecycle cost |
| M13 | DIY work is still under the warranty. 自己做的部分也在保修内。 | Materials, labour or design supplied by the owner are excluded; an owner-built home's warranty helps only a later buyer. 业主提供的材料、人工或设计不保；业主自建房的保修只对以后的买家有用。 E2 no date · Travelers Canada (AB warranty provider) · checked · E2 May 2025 · AREA · checked | every DIY condition |
| M14 | Heat pumps don't work in Alberta cold. 热泵在阿省的冷天不管用。 | Cold-climate heat pumps are built for about −30 °C; below −25 to −30 °C they need backup heat. 寒冷气候热泵按约 −30 °C 设计；低于 −25 到 −30 °C 需要辅助供暖。 E2 Mar 2022 · BC Hydro · checked | heating |
| M15 | Big windows are always good. 窗越大越好。 | Overhangs shade high summer sun on south windows but not low west sun; east and west glass lets in the most heat. 挑檐能挡住南窗夏天的高角度阳光，挡不住西边的低角度阳光；东西向玻璃进热最多。 E2 2008 · hobby site, check again | energy model, sun check |
| M16 | If I can't feel air from the HRV, it isn't working. 感觉不到 HRV 出风就是坏了。 | An HRV moves air slowly, all day; you should feel almost nothing at a grille. Whether it works shows in clean filters and core, open outside hoods, and flows measured and balanced at handover. HRV 全天慢慢换气，在风口几乎感觉不到。是否正常看滤网和芯体是否干净、室外风罩是否通畅，以及交房时风量是否测量并平衡。 E3 NRCan HRV guide · not checked yet | energy model; possession walk LD8 |

Sources (read 2026-10-09 by the canvas work): Alberta Builder and Property Registries, new home warranty pages · CHBA Finding a Builder + Know Your Builder and Reference Check worksheets · CMHC Homebuying Step by Step guide (Jul 2026) · InterNACHI Pre-Drywall SOP (Mar 2025) · Build Show pre-drywall page and video · Tarion PDI form (2021) · ANHWP Possession Day checklist (May 2026) · Alberta Construction Performance Guide (Sep 2015). The CMHC workbook could not be read.

Tests (done when):

- H32 The lists have A 9, B 12, C 13, D 13 and E 8 lines, each with its source and checked date, in both languages; LE7 shows "not read yet" with no thresholds.
- H33 Ticks survive a reload; with 3 of the A lines ticked, gate D18 shows "A: 3 of 9".
- H34 A row checked 2026-10-09 shows "check again" on 2028-10-11 and not on 2028-10-08.
- H35 The myth library has 16 rows; M9, M15 and M16 show "not counted yet"; an E1 row added to the project lists before M1, tagged E1, and is not in the repo data.
- H36 A new decision card saves its myth check (M6 ticked) and shows it after a reload; "none apply" saves too.
- H37 (DN21) Move-in 2028-06-01 and occupancy permit 2028-05-20, no title date: coverage starts 2028-05-20; walks 2029-04-20, 2030-04-20, 2032-11-20, 2037-11-20; ends 2029-05-20, 2030-05-20, 2033-05-20, 2038-05-20. A start of 2028-03-31 gives a first walk on 2029-02-28. M8 changes as DN21 says.
- H38 (DN23) A possession walk with 1 item to fix and 1 item "can't judge today" counts 1 open and 1 to judge later.

### 17.6 Part B6. Element library and E1 library · 构件模板库与家庭经验库 (DN18, DN22)

Element library (automatic cards) · 构件模板库: when an element shows up in the plan or an idea, its decision card starts from this template (options, weight profile, known gates, impact chain), then runs the frame check. The family confirms instead of starting from blank. The app holds the library (`src/data/elements.json`); each project copies it at Stage 0 (`plan.elements`).

| Element | Default options | Weight profile | Known gates | Impact chain |
|---|---|---|---|---|
| Windows 窗 | vinyl · fibreglass · aluminium-clad wood; double vs triple pane | Systems | Energy Code 9.36 window values (check) | daylight, heat loss, look, yard |
| Exterior doors 外门 | steel · fibreglass · wood | Product | Energy Code; entry security | entry, winter drafts |
| Interior doors 内门 | hollow core · solid core · pocket · barn | Product | — | sound between rooms, wall space |
| Flooring 地板 | engineered wood · LVP · tile · carpet | Product | floor heating fit; levelling 找平 | comfort, noise, transitions |
| Roofing 屋面 | asphalt shingle · metal | Systems | snow load; hail | look, solar panels |
| Siding 外墙板 | vinyl · fibre cement · engineered wood · stucco | Product | architectural controls (subdivision guideline PDF) | look, upkeep |
| Heating 供暖 | furnace · heat pump · hybrid | Systems | Energy Code 9.36 | running cost, ducts, noise |
| Water heater 热水器 | tank · tankless · heat-pump | Systems | gas venting | space, running cost |
| Garage door 车库门 | insulated steel · wood look · glass | Product | width and height from the garage card | look, heat in a heated garage |
| Lighting 照明 | pot lights · fixtures · smart switches | Product | electrical permit | home automation (q7.7) |

- Wording change for the owner: the source says "home automation (review item 35)". "Review item 35" is not defined anywhere in the records. Proposed: point to q7.7 (home automation) instead.
- Proposed: Windows starts with the 3 frame materials as options and adds "Also compare: double vs triple pane · 另比较：双层还是三层玻璃" as a second card the family can start.
- Proposed "shows up": an idea (section 13.5) or a design item card (section 15.6) whose text holds an element's name, in English or Chinese, any case, shows "Start a card from the element library: Windows · 从构件模板开始：窗". Nothing is made until the family taps it. "+ New comparison" on the Decide tab also offers the library.
- A card from a template: options from the template; criteria = the 7 review weights with the q10.5 weights of the template's profile (the starting weights if q10.5 is not answered); the known gates as rules limits; the impact chain as notes (rooms are added by the family).
- **OB8** "then runs the frame check": the frame check is not defined in the records. Proposed: it is the section 15.7 context step (what this decision is really about, and what is fixed), shown first on the new card.
- Proposed: a project made before this copies the library the first time it opens. Editing the project's copy never changes the app's library.

E1 library · 家庭经验库: what a family knows from its own life. 家庭自己的生活经验。

- Every new card checks this list first: a new decision card or design item card shows the E1 rows above the myth check. E1 beats E2 and E3.
- Kept current by the project owner after each decision.
- Row: what we know (E1) 我们知道的 · first used in (card or room) 首次用于. A size row also has a name, a value, a unit and a room type; sizes the family likes in its current house are measured during the video tour (part B7) and saved here; Room Review part 4 shows the size rows for that room type first.
- It belongs to the household: project data in Firestore (`plan.e1`), never in the repo, and it carries to every project of the same household.
- DN22 (how it carries across projects). The data model has no household record that spans projects (chat-D34: data per project). Proposed: no new collection and no Firestore rules change. On a project's E1 page, "Copy from another of my projects · 从我的其他项目复制" lists the projects this device can open and copies their E1 rows that are not already there (same text, or same name and type for a size). The source project does not change.

Tests (done when):

- H39 The element library has the 10 elements above; a new project holds a copy; an existing project gets one on its first open; editing the project's copy leaves the app's library as it was.
- H40 A card from Windows has the 3 options, the 7 criteria with the Systems weights (30, 25, 20, 10, 10, 0, 5 unless q10.5 changed them), the gate "Energy Code 9.36 window values (check)" and 4 impact notes; it opens on the context step.
- H41 An idea "better 窗 for the yard" shows the Windows suggestion; ignoring it saves nothing new.
- H42 An E1 size row (kitchen aisle 44 in, kitchen) shows first in a kitchen card's part 4; a new decision card lists the E1 rows above the myth check.
- H43 Copying E1 from a second made-up project adds its 2 rows once; copying again adds none; the second project is unchanged.

### 17.7 Part B7. Current-house video tour (Stage 1a) · 现房视频巡查 (DN19)

Film each room for 1–5 minutes, in good light, moving slowly. Say out loud what annoys you and what you love. A video-capable AI tool lists the pain points and cheap fixes. Second opinion: run 1–2 rooms (kitchen, mudroom) through a second AI tool and compare the two lists. While filming, measure what you like (kitchen run, island gap, hallway width, mudroom bench depth): these become E1 sizes in the E1 library. 每个房间拍 1–5 分钟，边拍边说哪里不方便、哪里喜欢。AI 工具列出痛点和低成本改进。

- One copy of the tour steps, with no tool or product names (canvas fix O1). The tour page is the only place they are written. 只有一份巡查步骤，不写工具或产品名称。
- Before 拍之前 (6 items): daylight, all lights on, blinds open 白天，开所有灯，拉开窗帘 · clean lens 擦干净镜头 · phone flat (landscape) 手机横拍 · tape measure in hand 手拿卷尺 · one clip per room, 1–5 min (check the AI tool's video length limit) 每个房间一段 1–5 分钟（查一下 AI 工具的视频长度上限） · name each clip room_date, e.g. kitchen_2026-10-12 每段命名为 房间_日期，例如 kitchen_2026-10-12.
- Order (a daily path) 顺序（按日常动线, 12 stops): car 车 → garage 车库 → mudroom 玄关 → kitchen 厨房 → dining 餐厅 → living 客厅 → sun room 阳光房 → bedrooms 卧室 → bathrooms 卫生间 → laundry 洗衣房 → basement 地下室 → yard 院子. Each stop has a "we don't have this · 我们没有" switch.
- In each room, say out loud 在每个房间说出 (9 points): 1 room name and who uses it most 房间名和谁最常用 · 2 what we love (keep) 喜欢什么（保留）· 3 what annoys us, shown on camera 哪里不方便，对着镜头拍出来 · 4 what piles up here 这里堆什么 · 5 open 2–3 cabinets or closets 打开 2–3 个柜子或衣柜 · 6 light, glare, dark corners, time of day 光线、眩光、暗角、几点钟 · 7 cold, drafts, noise, smells 冷、漏风、噪音、气味 · 8 measure 1–2 sizes you like or dislike, read the tape on camera 量 1–2 个喜欢或不喜欢的尺寸，对着镜头读卷尺 · 9 one wish for the new house 一个对新家的愿望.
- Extra clips 加拍 (4): entry in winter mode (boots, coats, bags) 冬天的入口（靴子、外套、包）· kitchen while cooking (high heat, hood, smoke) 做饭时的厨房（大火、油烟机、油烟）· morning rush spots 早高峰拥挤处 · each person: 2 min "my space" 每人 2 分钟“我的空间”.
- After 拍完后: give the clips and the tour prompt to the AI tool · run the second tool on kitchen + mudroom with the same prompt · paste both answers into the app's tour page; they fill questionnaire section 0 (the pain-point list), the cheap wins and the E1 library sizes. 把视频和巡查提示交给 AI 工具 · 用第二个工具以同样提示看厨房和玄关 · 把两份回答贴到 App 的巡查页；它们填入问卷第 0 节（痛点清单）、小投入高满意清单和家庭经验库尺寸。
- Who: the family · time 1–2 weeks · cost none. 谁：全家 · 时间 1–2 周 · 费用 无。
- On the tour page (`plan.tour`): a clip list per stop (name filled as room_date from the stop and the date typed; a done tick; the length in minutes, with a note outside 1–5 but never refused) and two paste boxes (main answer, second opinion). Each line of a pasted answer has 3 buttons: "pain point · 痛点" (adds a section 15.2 pain point), "cheap win · 小确幸" (adds a section 13.3 cheap win, status idea) and "E1 size · 经验尺寸" (opens a size row to fill in). Each button adds a line once. The app does not read the pasted text by itself (no AI in the app).
- **OB7** (the tour prompt text, the "video-tour-instructions" prompt with the 40/30/30 room analysis, is not on the canvas). Proposed: the app shows the steps above only. If the owner pastes the prompt text, it goes in a later PR as one more box on the tour page with a "Copy prompt · 复制提示" button.

Tests (done when):

- H44 The tour page shows 6 Before items, 12 stops in the order above, 9 say-out-loud points, 4 extra clips and the After steps, in both languages; no tour text names an AI product.
- H45 A clip at stop kitchen dated 2026-10-12 is named kitchen_2026-10-12; a 7-minute clip is saved with a note; a stop switched to "we don't have this" leaves the clip list.
- H46 A pasted answer of 3 lines shows 3 rows; "pain point" on row 1 adds one section 15.2 pain point, and a second tap adds none; the pasted text survives a reload.
- H47 Pain points added from the tour are the choices of q0.1.

### 17.8 Feature audit: what batch B touches in sections 6–16

Marks: Covered (already does it) · Overlap (batch B adds to it) · Conflict (batch B changes what is built; a DN decides) · Untouched.

| Built feature | Section | Mark | What batch B does | Check that guards it |
|---|---|---|---|---|
| Room questions q4.1–q6.4 | 6.5 | Covered | the questionnaire reuses the same ids and choices | T14, H1 |
| Answers saved per id, per person (q5.1) | 4, 6.5 | Overlap | Each-person sections use the q5.1 shape | T14, H3 |
| Cheap wins | 13.3 | Overlap | q10.3 and the tour add cheap wins | K5, H9, H46 |
| Liked plan reasons | 13.2 | Overlap | feed q10.1 | K4 |
| Plan versions, 20 at most | 13.4 | Overlap | an applied card saves a version | K6–K8, H17 |
| Idea inbox | 13.5 | Overlap | kept ideas go there once; element suggestions | K9–K10, H6, H41 |
| Decision cards | 13.6 | Overlap | myth check, E1 rows, element templates | K11–K12, H36, H40 |
| Hidden works | 13.7 | Overlap | Room Review part 7 sends items | K13–K14, H20 |
| Schedule and gates | 13.1 | Overlap | D4, D18, D19, D21 show batch B counts; the owner still ticks | K1–K3, H10, H15, H33 |
| Code checklist | 14.1 | Overlap | Safety & age reads it | M1, M2, H23 |
| Warranty walks | 14.6 | **Conflict** | LE1–LE2 change the dates (DN21) | M8 (changes), H37 |
| Pain points | 15.2 | Overlap | filled from the tour; q0.1 choices | W2, H46, H47 |
| Pictures and style profile | 15.3 | Overlap | Room Review part 3 per room | W3 |
| Design sprints D4a–D4g | 15.5 | Overlap | Room Review levels link to them | W5 |
| Design item cards, impact chain | 15.6 | Overlap | re-open only the named rooms | W6, H17 |
| Review criteria sheets | 15.7 | Overlap | start from a q10.5 profile | W7, H11 |
| Systems checklist | 15.8 | Overlap | shows the q7.7 picks | W8 |
| Possession walk | 15.11 | **Conflict** (small) | LD lines and a "can't judge today" kind (DN23) | W11, H38 |
| Wet rooms soft check | 15.12 | Overlap | Housework hint | W12 |
| Budget meter, Gate D5 verdict | 8, 13.1 | Untouched | the target estimate shows beside it; the verdict stays | B3–B5, K3, H16 |
| Rules table "check again" | 6.1 R12 | Covered | site-walk rows use the same rule | H34 |
| Firestore rules | 9 | Untouched | no new collection (DN22) | S1–S4 |

### 17.9 DN list and open items

| DN | What the owner approves | Section |
|---|---|---|
| DN13 | Part B1, the questionnaire: rules, who answers, answer types (with Weights), the Living Brief, the Fit check at D4, tests H1–H11 | 17.1 |
| DN14 | Part B2, the room review path: 7 levels, room cards, area program, re-open rule, kitchen prompts, sound targets, tests H12–H20 | 17.2 |
| DN15 | Part B3, the 7 plan checks, tests H21–H25 | 17.3 |
| DN16 | Part B4, the feng shui check and the room energy score, tests H26–H31 | 17.4 |
| DN17 | Part B5, the 5 site-walk lists, the myth library and the source re-check at build, tests H32–H36 | 17.5 |
| DN18 | Part B6, the element library and the E1 library, tests H39–H42 | 17.6 |
| DN19 | Part B7, the video tour page, tests H44–H47 | 17.7 |
| DN20 | The labels: "part B4" and "myth M6" outside section 17; tests H; chat-D21 written as chat-D37 | 17.0 |
| DN21 | Warranty walk dates from LE1 and LE2; M8 changes (before → after in 17.5); test H37 | 17.5 |
| DN22 | The E1 library carries across projects by "Copy from another of my projects"; no new collection; test H43 | 17.6 |
| DN23 | The possession walk gets the LD lines and a "can't judge today" kind; test H38 | 17.5 |

| Open | Question | Proposed answer | Section |
|---|---|---|---|
| OB1 | Choices for the Pick, Rank and Sort questions in sections 0–3 and 7–10 | the "Proposed" lists in 17.1 | 17.1 |
| OB2 | What each plan check tests, its pass line, where it runs | the table in 17.3; family ticks, app hints, levels 2 and 7, shown at D4 | 17.3 |
| OB3 | The score scale | 1–5, shown to 1 decimal | 17.4 |
| OB4 | What "measurable" holds and how each part is scored | size and sound from the app; daylight, temperature, noise typed 1–5; feeling = average per person | 17.4 |
| OB5 | How the feng shui lines make the 30% part | the room's FD lines, pass 5, flag 1, n.a. not counted, averaged | 17.4 |
| OB6 | LE7: guide pages 129–327 not read | show "not read yet"; the build session tries to read them; rows need the owner's approval | 17.5 |
| OB7 | The tour prompt text | steps only; a "Copy prompt" box later if the owner pastes it | 17.7 |
| OB8 | What "the frame check" is | the section 15.7 context step | 17.6 |
| OB9 | How to find "where the most daily paths meet" | the core route rooms first, then plan order; the owner can reorder | 17.2 |

Still deferred by the owner (not OPEN): the storage "within 3 steps" distance (17.3).

