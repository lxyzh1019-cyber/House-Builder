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

## Piece 4: English / 简体中文 (2026-11-05)

- A switch in the header (English | 中文) changes every screen. It is saved per browser; with nothing saved, a browser set to Chinese starts in Chinese. Projects stay in English in Firestore (room, furniture and rule names are translated only on screen), so the same project reads in both languages; names the user types show as typed.
- Strings live in `src/i18n.js`. `test/i18n.test.js` checks that every key has both languages with the same {values}, that every room, question, furniture and rules-table name has Chinese, and that every key the screens ask for exists.
- Tests: `npm run test:rules` 30 of 30 pass locally.
- Headless Chromium (local store, WebGL path), PC 1280 px and phone 390 px, both languages, tabs Rooms (with a "Too small" result), Lot board, Rules table, Spec tests and 3D view: no sideways scroll, 0 console errors, Spec tests 12 of 12 in both. Chinese screens show no English except units (ft, in), fixed names (Pascal, WebGL, Furnish2, SPEC, test IDs) and "Claude" as the author of two rules-table rows. A reload kept Chinese.
- Owner check on the Pages link (PC and phone): to do.

## Piece 5: Plan intake (2026-11-05)

- Owner decisions: the uploaded picture stays in this browser only (DN6 A, chat-D27); one project on every device waits for family sharing (DN7 "Not now", chat-D28); data stays in Firestore, nothing goes to GitHub (chat-D29); done-when I1–I8 (chat-D30).
- Step 1 check (headless, WebGL path): Pascal drew a guide picture under a wall, a door (closed panel) and windows on two walls, all created from our code. So the trace is built on Pascal's own guide, wall, door, window, zone and level nodes.
- New tab "Plan intake / 描图":
  - a made-up sample plan (40 x 30 ft, 20 px per ft), or an upload of a picture or a PDF (first page drawn by pdf.js);
  - scale from two taps and a typed length;
  - walls (ends snap together, lines square up), doors and windows on a wall, rooms, levels, undo and erase;
  - size check of 3 sizes against the drawing (tolerance 3 in, a new rules-table row);
  - a see-through slider for the picture under the model, in 2D and in the 3D view ("Traced plan").
  The traced plan is its own building in the Pascal scene, rebuilt from the saved trace, so room blocks never erase it. The saved scene leaves the picture out.
- Lot board: site review (zone, max height, max lot coverage %), with coverage of the placed rooms flagged when over the limit. Height is saved and checked once roofs exist.
- Tests: `npm run test:rules` 37 of 37 pass locally (I1–I5 and I7 in `test/trace.test.js`, I6 in the Firestore emulator, everything earlier still green).
- Headless Chromium (local store, WebGL path), PC 1280 px and phone 390 px:
  - sample plan: scale set from its 40'-0" dimension line;
  - 5 walls, a door, a window and a room traced;
  - 3 sizes checked, "Trace matches the drawing";
  - a reload kept the trace;
  - Chinese screens fully Chinese;
  - site coverage turned red over a 1% limit;
  - 3D view showed the traced walls and window on the picture;
  - no sideways scroll and 0 console errors.
  An uploaded PNG and a PDF both showed as the plan picture, and the picture came back after a reload in the same browser.
- Not checked: a real phone or PC by the owner (I8), and a real plan.

## Piece 6: Test fit (2026-11-05)

- Owner: "continue the work, i will check later"; plan and tests F1–F7 approved (chat-D31). Built on the same branch, so PR #7 holds Plan intake and Test fit.
- Plan intake tab, new section "5. Test fit":
  - mark the traced plan as a test fit;
  - per traced room, pick a room type, a preset and (if wanted) the type's questions;
  - each room gets Check my size at its traced size: fits with spare, or too small by how much, with the smallest changes;
  - room shapes on the plan turn green or red;
  - "Copy into Rooms as a new design" adds the typed rectangular rooms to Rooms at their traced sizes, and the traced plan does not change.
- Rooms (R13): "Sizes you know" lists traced rooms of the same type with their sizes, under the minimum.
- Only a room traced with 4 square corners gets a verdict (the size check is a plain rectangle, chat-D16).
- Tests: `npm run test:rules` 43 of 43 pass locally (F1–F5 in `test/fit.test.js`, F6 in the emulator).
- Headless Chromium (local store, WebGL path), PC 1280 px and phone 390 px:
  - sample plan scaled, two rooms traced;
  - Living as a Family TV room "Fits, spare 157.7 ft²" (F1's 157.5 plus about a pixel of tapping); Bath as a home office "Too small, short 4.0 ft in width" (3.9 on the phone);
  - green and red room shapes;
  - fewer seats raised the spare;
  - copying added 2 rooms to Rooms, where the living room showed "Sizes you know: Room 1 (traced plan) 20′ 0″ x 18′ 0″";
  - a reload kept the choices;
  - Chinese fully Chinese, no sideways scroll, 0 console errors.
- Seen: tracing on a phone is less precise (20′ 1″ instead of 20′ 0″ for the same room). This fits the PC-first plan.
- Not checked: the owner's F7 and I8.

## Piece 7: Budget meter (2026-11-05)

- Owner picked the Budget meter next ("A"), then approved the plan, tests B1–B7 and DN8 = A (contingency on the build cost only), recorded as chat-D32. Built on the same branch, so PR #7 holds Plan intake, Test fit and the Budget meter.
- New tab "Budget / 预算":
  - lines typed by the user: goal, lot price (inside the goal by default, chat-D7), soft costs line by line, contingency %, build rate low and high (the Rules table rows, one home);
  - shows: area of the rooms placed on the Lot board, build cost range, contingency, soft costs, lot, total, what is left of the goal (low and high rate), a bar, and the rooms not counted yet;
  - the verdict says inside the goal, over at the high rate only, or over even at the low rate.
- Tests: `npm run test:rules` 48 of 48 pass locally (B2–B5 in `test/budget.test.js`, B1 + B6 in the emulator).
- Headless Chromium (local store, WebGL path), PC 1280 px and phone 390 px, with the two starting rooms placed and a dining room left off the lot:
  - 302.5 ft², build C$52,938 – C$83,188 (B3);
  - with C$12,000 + C$18,000 soft costs and 10% contingency: total C$288,231 – C$321,506, left C$511,769 – C$478,494 (B4);
  - with the lot out of the goal: left C$711,769 – C$678,494 (B5);
  - a C$300,000 goal turned the verdict red;
  - a low rate of 180 changed the Rules table row too;
  - a soft line was added, renamed and removed, and a reload kept everything;
  - the dining room was listed as not counted;
  - Chinese fully Chinese, no sideways scroll, 0 console errors.
- Fixed during the check: soft-cost inputs overlapped their Remove button; the goal mark sat on the bar's edge.
- Not checked: the owner's B7, with real numbers (those stay in Firestore only).

## Bug found and fixed (2026-11-06)

- Opening a saved project that had rooms but no trace or no budget replaced its rooms with the two starting rooms, which were then saved over its own. Cause: when trace and budget loading were added (commits daeddf4 and f662dae), the "starting rooms" line ended up attached to the wrong `if`. It was on the working branch and its Pages deploys from 2026-11-05 21:30 UTC, not on main.
- Fix (c42b1ac): opening goes through one tested function (`src/load.js`, `test/load.test.js`). Browser check: a saved garage + kitchen project opened as living room + office on the old build, and keeps its rooms on the fixed build, also after a reload.
- The owner's own project on that device may have been reset to the two starting rooms if it was opened in that window. This was not checked; it cannot be seen from here.

## Piece 8: Projects and sharing without sign-in (2026-11-06)

- Owner: "All three, one PR" (chat-D33 device codes, chat-D34 projects and setup).
- New first tab "Project / 项目":
  - setup: name, new build or renovation, city, household;
  - your projects (mine and shared with me): open, new, delete;
  - sharing: this device's code, and the owner adds or removes members by device code with a label.
  The header shows the project name. The browser remembers which project it opened last.
- Firestore rules: owner or member reads and updates; a member cannot change owner or members; only the owner deletes. Saves now write the design fields only, so a member's save keeps the owner and the members list.
- Under the old owner-only rules, the new app still lists, opens and saves its own projects (tested). Sharing starts working once the owner publishes the new `firestore.rules` in the Firebase console.
- Tests: `npm run test:rules` 61 of 61 pass locally (S1–S6 and the old-rules case in the emulator).
- Two-device run (S7, Firebase Auth + Firestore emulators, PC 1280 px and phone 390 px browsers):
  - the PC added the phone's device code;
  - the phone found "Test house · shared with you", opened it, saw the setup and renamed a room;
  - the PC saw the rename after a reload;
  - after the PC removed the phone, the phone no longer found it;
  - a second PC project kept its own data when switching back;
  - Chinese fully Chinese, no sideways scroll, 0 console errors.
- All tabs (7 + 3D), PC and phone, both languages: no sideways scroll, 0 console errors.
- Owner, 2026-11-06, after publishing the new rules: the phone listed the PC's project as "Untitled project · shared with you" (no name typed yet). The owner opened it, and the rooms matched the PC: "Pass". **S7 passes** on real devices against the real Firestore. Device and browser not reported.

## SPEC v1.3 and Rooms from contents rework (2026-11-06)

- SPEC v1.3 merged onto v1.2 (chat-D39): its new decisions are chat-D35 to chat-D38. The owner also chose:
  - chat-D40: rooms and answers are saved inside the project document;
  - chat-D41: a room saved before v1.3 keeps its size and gets its contents reset;
  - chat-D42: a moved item carries its clearance.
  `src/data/presets.json` is a verbatim copy of SPEC §6.4.
- Owner: "approve the room do not ask me for merge". Built on the same branch, so PR #8 grows. I read the message as "keep going without waiting for a merge"; I did not merge.
- **Engine.** `src/rooms/bands.js` builds the band minimum from presets.json (chat-D36), with no 0.5 ft rounding.
  - After you move, add or resize an item, the minimum is the bounding box of what is placed (chat-D42).
  - Smallest changes are worked out per side, in the SPEC §6.2 order, and each has a "Use this" button.
  - The rules table rows come from presets.json. Old rule ids carry over (`migrateRules`). The TV stand, seat gap, size step and 10 ft office side rows are gone.
- **Rooms.**
  - Living room and office questions use the SPEC §6.5 ids and text in both languages; each answer is also saved under answers/{id}.
  - The other four types show their §6.4 options as chips. The labels are my wording.
  - Every room has a level (R14).
  - Bedroom-ready adds a closet and turns on the egress flag (R15).
  - Each room card says "Code minimum not checked yet".
  - Sizes show in feet and inches.
- **Household questions (sections 4–6).** Each answer is saved with who answered and when. Effects:
  - q4.1 sets the locker width and the locker count from the household size;
  - q4.2 adds a boot tray;
  - q5.1 sets the office desks;
  - q5.2 makes the office a closed room;
  - q5.3 sets the kid bedroom desk, or a homework spot in the dining room (the office when there is no dining room);
  - q6.1 offers a sofa bed;
  - q6.3 sets the dining table and the living room seats;
  - q6.4 suggests a main-floor bedroom.
- **My guesses, stated to the owner:**
  - "light" gear keeps the 1.5 ft locker;
  - q6.3 "up to 6" or "8" sets 6–8 living room seats;
  - the wording of q4.3, q4.4 and q5.4 is mine (SPEC gives only their ids and answer types).
- **Lot board.** A level switch shows one level at a time (chat-D38). Overlap, touching and walkway sharing only count rooms on the same level.
- **3D.** Each room level is its own Pascal level (basement −1, main 0, upper 1).
- **Tests.**
  - `npm run test:rules`: 74 of 74 pass locally.
  - New: T1–T3, T8–T12 and T15 read from presets.json; T4–T6; T12 and T15's egress flag; a moved desk; T13 and T14 in the emulator; the chat-D41 migration.
  - Updated to the SPEC numbers: F2, B3–B5 and I7.
- **Headless Chromium (browser storage, WebGL path), PC 1280 px and phone 390 px:**
  - Rooms: living room 15′ 0″ x 13′ 6″; office 9′ 0″ x 9′ 6″, bedroom-ready 9′ 0″ x 11′ 6″ with the egress flag; mudroom 9′ 0″ x 4′ 8″ with 4 lockers.
  - T5 at 14 x 13 lists "Width: 4-seat group (13.50 ft wide)" and "Depth: 65-in TV (12.33 ft deep) or sit at 1.2x the screen diagonal (12.25 ft deep)".
  - A reload kept the basement level, the bedroom-ready office and the q4.1 answer.
  - Lot board shows "Basement (1) Main (2) Upper (0)".
  - Spec tests tab: 18 of 18 pass.
  - No sideways scroll in either language (fixed during the check: the Rooms column and the library dropdown were too wide in Chinese on a phone).
  - 0 console errors.
  - 3D draws an upper-level office raised above the main floor. Its height was not measured.
- **Not checked:** the owner's T7 on a phone with the new questions, and how saved real projects migrate (seen only with made-up rooms).

## Plan intake step strip and PC first (2026-11-06)

- Owner, after trying Plan intake on a PC: "on scale is clickable, I click on trace, no status showing up, no idea which step this is and where to find the result." Also: "for now, i do not think i will use this on the phone, as the phone screen is too small."
- Cause (from the code; I did not watch the owner's screen):
  - every tool but Scale was greyed out until the scale was set, with no reason given;
  - after the first scale tap only a small dot appeared;
  - the length box appeared only after the second tap;
  - nothing said which step you were on or where its result showed.
  My headless checks knew the steps, and I8 was not run before the merge, so this gap was not seen.
- **DN12 → chat-D43, the owner's pick "Step strip".** A live line above the picture (`src/trace/guide.js`):
  - "Step N of 5 · Scale / Walls / Doors and windows / Rooms / Size check", then what to tap next and where the result shows;
  - tapping a greyed-out tool says "Set the scale first (Step 1)".
- **DN11 → chat-D44, the owner's pick "T7 on a PC".** T7 is now a PC test. The phone layout stays readable but is not a done-when gate. Spike DONE WHEN 6 (the phone GPU line) is closed as not needed.
- **Tests:** N1 and N2 in `test/guide.test.js`. `npm run test:rules`: 78 of 78 pass locally.
- **Headless Chromium (browser storage), PC 1280 px, English and Chinese, on the sample plan:**
  - the strip walks: Step 1 "0 of 2 points" → "1 of 2" → "type its real length on the left" → Step 2 "tap a corner…" → "2 walls, last 30′ 0″" → Step 5 "0 of 3 sizes typed";
  - back on Scale it says "scale set";
  - tapping Wall before the scale is set gives the "Set the scale first" note;
  - no sideways scroll, 0 console errors.
- **Not checked:**
  - the phone walk: the script's taps landed off-screen, and the phone is no longer a gate;
  - N3, the owner's I8 on a PC.
- Owner, 2026-11-06: "please include the instructions for the trace, especially on wall (do i trace a wall with windows, doors) why the room is separate with wall?"
  - Added a "How to trace" box at the top of Plan intake (chat-D45). It opens until the first wall is traced.
  - It says: trace one straight line per wall, straight through doors and windows; place doors and windows on the wall afterwards; rooms are traced on their own because walls make the building and rooms are the named spaces.
  - The Wall, Door, Window and Room hints say the same.
  - Headless check, PC, both languages: the box shows, no sideways scroll, 0 errors.
- Owner, same message: no more small PRs; build the rest and leave 3D to the end (chat-D46). This work rides on PR #9 instead of a new one.

## Batch A: stages, decisions and build records (2026-11-06)

- Owner: "All 8, one PR"; D2 and D3 left out; batch C drafted from search snippets later. Sections and tests are in SPEC §13 (chat-D47).
- Built:
  - **Stages tab:** the 19 gates, D5 budget verdict, D21 photo record, hidden works under their two stages, change orders, stage cost, photo record.
  - **Decide tab:** versions (save, compare, restore), idea inbox, decision cards.
  - **Budget tab:** cheap wins, plus a change-order line.
  - **Plan intake tab:** liked floor plans and the plan checklist.
  - **Saved as:** two project fields, `plan` and `versions`.
- **Tests:**
  - `npm run test:rules`: 94 of 94 pass locally.
  - K1–K16 are in `test/plan.test.js` (15 tests).
  - The save and reload of every new field is one emulator test in `test/rules.test.js`.
- **Headless Chromium (browser storage), PC 1280 px, English, made-up data:**
  - a gate ticked "passed" kept its date and who;
  - D5 read "within the goal at the high total";
  - a hidden-works item showed under Stage 2 and Stage 5, and D21 listed it as not photographed;
  - an approved 5,000 change order showed as its own budget line;
  - a version was saved;
  - an idea moved to "sorted";
  - a card with 2 options was decided;
  - a liked plan's reason went to the checklist;
  - with the goal under the total, the kept cheap win showed at the top of the Budget tab;
  - after a reload all of it was still there.
  Stages, Decide, Budget and Plan intake have no sideways scroll in either language (only Stages and Decide checked in Chinese). 0 console errors.
- **Not checked:** the owner's own use on a PC.
