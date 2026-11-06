# House-Designer — SPEC v1.3 (2026-11-06)

This file is the one spec for the app (decision chat-D14: the spec lives in the repo).
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
| L3 feng shui roles | The room energy score diagnoses; design gates use follow or ignore; remove the text "advisory, not scored". | Later: room energy score piece. |
| O1 tour copy | One copy of the video-tour instructions; no tool names ("the pain-point list", not a product's list). | Later: video tour piece. |
| C3 back-kitchen make-up air | A strong back-kitchen hood comes with make-up air. | Later: kitchen type. |
| O2 feng shui list | One feng shui list, not two. | Later: room energy score piece. |
| L4 rename the two 7 lists | "7 plan checks" and "7 review weights" keep different names. | Later: review criteria piece. |

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
| Wish-list questionnaire: 11 sections, 6 answer types, each person answers, ideas you may not know, play back and approve | canvas Questionnaire | Later (sections 4–6 feed Rooms from contents now, R11; section 3 with the kitchen type) |
| Pictures we like: Pinterest and Houzz scan, house style profile | canvas 1c | Later |
| Liked floor plans with "why I like it", turned into a plan checklist | handoff 7-step process | Later |
| Cheap wins list, kept when the budget is tight | canvas 1c | Later |
| Lot checklist for buying the lot | handoff 7-step process | Later |
| Mortgage pre-approval sets the budget | handoff 7-step process | Later (budget meter input) |
| Plan intake: trace once, 3 sizes match, overlay check, sample plan | canvas 2a, technical flow | Now (parallel method, chat-D18) |
| Test fit and new-design branch | handoff (G1 fix) | Now (after both methods' pieces) |
| Rooms from contents, Check my size, smallest changes, spare cost | chat | Now |
| Room level (basement, main, upper), one level at a time on the lot board | chat-D38 (room level) | Now |
| Bedroom-ready flag: closet band and egress window | handoff (L5 fix) | Now (R15) |
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
| Systems fine-tune checklist: smart home, HVAC and HRV, air quality (radon, filters, humidity), efficiency, EV and solar ready, sound | handoff 7-step process (step 6) | Later |
| Furniture fit and 3D walk-through | canvas 2b D4g | Later (3D view from the spike) |
| Rate table v0 with sources, estimate classes | canvas Rate Table | Later |
| Energy model | canvas Energy Model | Later |
| Lifecycle cost, 30 years | canvas Lifecycle Cost | Later |
| Final rules gate with code clause links | canvas Stage 3 | Later |
| Work packages: scope per trade, allowances, who supplies, DIY flags | handoff 7-step process | Later |
| Builder price and mortgage draw schedule | handoff 7-step process (step 7) | Later |
| Permit checklist and City steps | canvas Stage 4 | Later |
| Builder checks, contract and money checks, myth library | canvas Site Walks | Later |
| Build tracking: change orders re-checked, stage cost against budget, photo and video record before drywall | canvas Stage 5 | Later |
| Move-in, possession walk and warranty walks | canvas Stage 6, Site Walks | Later |
| Furniture placement: Pascal scene with Furnish2 parts (was: export each level from Pascal to Furnish) | chat-D17 (build base) | Now (changed by chat-D17) |
| Lego rules proposed, not decided: wet rooms together, hallways about 12%, simple outer shape, each room marked now or later | handoff 2026-10-29 (chat-D5 proposal) | Later (decision open) |
