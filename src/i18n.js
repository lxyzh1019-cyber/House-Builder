// English / 简体中文 (SPEC §4 Language rule). Two tables:
//  - UI: every screen string, by key, [English, 简体中文]. {name} marks a value filled in at run time.
//  - DATA: names stored in the project or the code in English (room types, presets, questions, furniture,
//    rules table rows). Projects stay in English in Firestore; only the screen shows Chinese. Text the user
//    typed (a custom room or item name) is not in DATA and shows as typed.
// The chosen language is saved per browser (localStorage 'hd-lang'); with nothing saved, a browser set to
// Chinese starts in Chinese, any other in English.
import { createElement, Fragment, useSyncExternalStore } from 'react'

export const LANGS = [['en', 'English'], ['zh', '中文']]

export const UI = {
  'app.brand': ['House Designer', '房屋设计'],
  'app.sub': ['Rooms and lot', '房间与地块'],
  'app.lang': ['Language', '语言'],
  'app.savedIn': ['Saved in {store}: {state}', '保存位置：{store}，{state}'],
  'store.Firestore': ['Firestore', 'Firestore 云端'],
  'store.browser storage': ['browser storage', '本浏览器'],
  'save.loading': ['loading…', '载入中…'],
  'save.loaded': ['loaded', '已载入'],
  'save.new': ['new project', '新项目'],
  'save.saving': ['saving…', '保存中…'],
  'save.saved': ['saved', '已保存'],
  'save.error': ['error', '出错'],
  'err.scene': ['Could not build the 3D scene: {msg}', '无法生成 3D 场景：{msg}'],
  'err.save': ['Could not save: {msg}', '无法保存：{msg}'],
  'app.loading': ['Loading your project…', '正在载入你的项目…'],
  'app.sections': ['Sections', '栏目'],
  'tab.rooms': ['Rooms', '房间'],
  'tab.lot': ['Lot board', '地块布局'],
  'tab.rules': ['Rules table', '规则表'],
  'tab.tests': ['Spec tests', '规格测试'],
  'tab.3d': ['3D view', '3D 视图'],
  'card.tooSmall': ['Too small', '太小'],
  'card.fits': ['Fits', '够用'],
  'card.min': ['Minimum', '最小尺寸'],
  'card.onLot': ['on the lot', '已在地块上'],
  'card.minSize': ['min {size}', '最小 {size}'],
  'app.addRoom': ['Add a room', '添加房间'],
  'app.addToStart': ['Add a room to start.', '先添加一个房间。'],
  '3d.line': ['Pascal scene · {room} · GPU: {gpu}', 'Pascal 场景 · {room} · GPU：{gpu}'],
  '3d.noRoom': ['no room', '无房间'],
  '3d.fxOff': [' · effects off', ' · 特效已关'],
  '3d.loading': ['Loading the 3D view…', '正在载入 3D 视图…'],
  'gpu.webgpu': ['WebGPU', 'WebGPU'],
  'gpu.webgl': ['WebGL (fallback)', 'WebGL（备用）'],
  'gpu.unknown': ['unknown', '未知'],
  'app.footer': ['Sizes are stored in metres and shown in feet. Furniture sizes from Furnish2 (MIT).', '尺寸以米保存、以英尺显示。家具尺寸来自 Furnish2（MIT）。'],
  'lotNote.shared': ['On the lot its open side touches {names}, so the walkway is shared and the minimum drops.', '在地块上，它的开放边贴着{names}，通道共用，最小尺寸随之变小。'],
  'lotNote.alone': ['On the lot no open room touches an open side, so it keeps its full walkway. (The lot board decides this, not the "Open to the next room" answer.)', '在地块上没有开放的房间贴着它的开放边，所以保留完整通道。（这由地块布局决定，而不是“是否与相邻房间打通”这个回答。）'],
  'list.sep': [', ', '、'],

  'tab.trace': ['Plan intake', '描图'],
  '3d.aim.room': ['This room', '当前房间'],
  '3d.aim.trace': ['Traced plan', '描好的平面图'],
  'tr.title': ['Plan intake', '描图'],
  'tr.help': ['Put a plan under the model and trace it once: set the scale, then walls, doors, windows and rooms. No automatic reading of drawings.', '把平面图垫在模型下面，描一次：先定比例，再描墙、门、窗和房间。不会自动识别图纸。'],
  'tr.sample': ['Use the sample plan', '用示例平面图'],
  'tr.upload': ['Upload a picture or PDF', '上传图片或 PDF'],
  'tr.reading': ['Reading the file…', '正在读取文件…'],
  'tr.privacy': ['Your picture stays in this browser only. The trace is saved with the project.', '你的图片只保存在这个浏览器里。描好的线随项目保存。'],
  'tr.noPicture': ['The picture is on the device that uploaded it. The trace is here; upload the picture again to see it underneath.', '图片在上传它的那台设备上。描好的线在这里；再上传一次图片就能垫在下面看。'],
  'tr.notKept': ['This browser would not keep the picture (private window or storage blocked). It shows until you close the page.', '这个浏览器不能保存图片（隐私窗口或存储被阻止）。关闭页面前仍可看到。'],
  'tr.badFile': ['That file is not a picture or a PDF that can be read.', '这个文件不是能读取的图片或 PDF。'],
  'tr.scaleH': ['1. Scale', '1. 比例'],
  'tr.scaleSet': ['Set: {px} px on the picture = {ft} ft.', '已设定：图上 {px} 像素 = {ft} ft。'],
  'tr.scaleNone': ['Not set. With Scale on, tap both ends of a length you know (a dimension line), then type it.', '还没设定。选“比例”，点一段已知长度（尺寸线）的两端，再输入长度。'],
  'tr.realLength': ['Real length (ft)', '实际长度（ft）'],
  'tr.setScale': ['Set the scale', '设定比例'],
  'tr.toolsH': ['2. Trace', '2. 描图'],
  'tr.tool.scale': ['Scale', '比例'],
  'tr.tool.wall': ['Wall', '墙'],
  'tr.tool.door': ['Door', '门'],
  'tr.tool.window': ['Window', '窗'],
  'tr.tool.room': ['Room', '房间'],
  'tr.tool.check': ['Size check', '尺寸核对'],
  'tr.tool.erase': ['Erase', '擦除'],
  'tr.how.scale': ['Tap both ends of a length you know.', '点一段已知长度的两端。'],
  'tr.how.wall': ['Tap corner after corner; each tap adds a wall. Tap the same point twice, or End line, to stop. Ends snap together and lines square up.', '一个角接一个角地点；每点一下加一面墙。同一点点两下或按“结束这条线”停止。端点会吸附，线会自动横平竖直。'],
  'tr.how.door': ['Tap a wall where the door is.', '在有门的墙上点一下。'],
  'tr.how.window': ['Tap a wall where the window is.', '在有窗的墙上点一下。'],
  'tr.how.room': ['Tap the room corners, then tap the first corner again to close it.', '依次点房间的角，最后再点第一个角把房间围起来。'],
  'tr.how.check': ['Tap a wall, then type its size from the drawing.', '点一面墙，再输入图纸上标的尺寸。'],
  'tr.how.erase': ['Tap a door, window, wall or room to remove it.', '点门、窗、墙或房间把它去掉。'],
  'tr.doorW': ['Door width (ft)', '门宽（ft）'],
  'tr.winW': ['Window width (ft)', '窗宽（ft）'],
  'tr.endLine': ['End line', '结束这条线'],
  'tr.undo': ['Undo', '撤销'],
  'tr.levelsH': ['Levels', '楼层'],
  'tr.addLevel': ['Level', '楼层'],
  'tr.checkH': ['3. Size check', '3. 尺寸核对'],
  'tr.checkHelp': ['Type {n} sizes from the drawing. Each may differ from the trace by {tol} at most; if not, trace again.', '输入图纸上的 {n} 个尺寸。每个和描图的差最多 {tol}；超出就重描。'],
  'tr.drawingSays': ['Drawing says (ft)', '图纸标的（ft）'],
  'tr.addCheck': ['Add size', '加入尺寸'],
  'tr.checkRow': ['Drawing {drawing} · traced {traced} · {diff}', '图纸 {drawing} · 描图 {traced} · {diff}'],
  'tr.ok': ['matches', '相符'],
  'tr.off': ['off', '不符'],
  'tr.match': ['Trace matches the drawing ({n} sizes).', '描图与图纸相符（{n} 个尺寸）。'],
  'tr.again': ['Trace again: {list} does not match.', '请重描：{list} 不相符。'],
  'tr.need': ['{n} of {of} sizes checked.', '已核对 {n}/{of} 个尺寸。'],
  'tr.overlayH': ['4. Overlay', '4. 叠图检查'],
  'tr.opacity': ['Picture under the model: {n}%', '模型下的图片：{n}%'],
  'tr.roomsH': ['Rooms on this level', '本层的房间'],
  'tr.area': ['{a} ft²', '{a} ft²'],
  'tr.startOver': ['Start the trace over', '重新描图'],
  'tr.startOverAsk': ['Remove every traced wall, door, window, room and size on all levels?', '删除所有楼层上描好的墙、门、窗、房间和尺寸吗？'],
  'tr.empty': ['Pick the sample plan or upload a plan to start.', '先选示例平面图或上传一张平面图。'],
  'tr.aria': ['Trace of {name}', '{name}描图'],
  'tr.legend': ['{wall} wall {door} door {win} window {room} room · red: a size that does not match', '{wall} 墙 {door} 门 {win} 窗 {room} 房间 · 红色：尺寸不符'],
  'tr.size': ['The whole picture is {w} x {d} at this scale.', '按这个比例，整张图是 {w} x {d}。'],
  'site.title': ['Site review', '场地审查'],
  'site.help': ['From the land title or the City zoning map. Typed by you; nothing is looked up.', '来自地契或市政分区图，由你输入，不会自动查询。'],
  'site.zone': ['Zone', '分区'],
  'site.height': ['Max height (ft)', '最大高度（ft）'],
  'site.coverage': ['Max lot coverage (%)', '最大建筑覆盖率（%）'],
  'site.used': ['Rooms cover {pct}% of the lot ({area} of {lot} ft²); limit {max}%.', '房间占地块 {pct}%（{lot} ft² 中的 {area}）；上限 {max}%。'],
  'site.over': ['Over the limit: rooms cover {pct}% of the lot ({area} of {lot} ft²); limit {max}%.', '超出上限：房间占地块 {pct}%（{lot} ft² 中的 {area}）；上限 {max}%。'],
  'site.heightNote': ['Height limit {ft} ft saved. It is checked once roofs are designed.', '高度上限 {ft} ft 已保存。设计屋顶后再检查。'],

  'fit.title': ['5. Test fit', '5. 试放'],
  'fit.help': ['Name each traced room and pick its contents. Rooms from contents then checks the room at its traced size.', '给每个描好的房间选类型和内容，系统按描图尺寸检查房间够不够用。'],
  'fit.mark': ['Mark this plan as a test fit', '把这张平面图标为“试放”'],
  'fit.noRooms': ['Trace a room first (Room tool).', '先用“房间”工具描一个房间。'],
  'fit.notRectShort': ['not a rectangle', '不是矩形'],
  'fit.type': ['Room type for {name}', '{name}的房间类型'],
  'fit.pickType': ['Pick a room type…', '选择房间类型…'],
  'fit.contents': ['Change contents', '修改内容'],
  'fit.hideContents': ['Hide contents', '收起内容'],
  'fit.notRect': ['The size check needs a rectangle: trace this room with 4 corners.', '尺寸检查需要矩形：请用 4 个角描这个房间。'],
  'fit.plain': ['A plain room: no contents to check yet.', '简单房间：还没有可以检查的内容。'],
  'fit.fits': ['{b}Fits.{/b} Spare {spare} ft² over the minimum.', '{b}够用。{/b}比最小尺寸多出 {spare} ft²。'],
  'fit.tooSmall': ['{b}Too small.{/b} Short by {w} ft in width and {d} ft in depth; these contents need {min}.', '{b}太小。{/b}宽度差 {w} ft，深度差 {d} ft；这些内容需要 {min}。'],
  'fit.copy': ['Copy into Rooms as a new design', '复制到“房间”作为新设计'],
  'fit.copyHelp': ['The typed rectangular rooms are added to Rooms at their traced sizes. This traced plan does not change.', '已选类型的矩形房间会按描图尺寸加到“房间”里。这张描图不会改变。'],
  'fit.copied': ['{n} room(s) added to Rooms. This traced plan did not change.', '已在“房间”里添加 {n} 个房间。这张描图没有改变。'],
  'ed.known': ['Sizes you know: {list}', '你知道的尺寸：{list}'],
  'ed.knownOne': ['{name} (traced plan) {w} x {d}', '{name}（描图）{w} x {d}'],

  'tab.budget': ['Budget', '预算'],
  'bud.title': ['Budget meter', '预算表'],
  'bud.help': ['Every number is typed by you and shown here; nothing is hidden. Amounts in C$.', '每个数字都由你输入并显示在这里，没有隐藏的数字。金额单位为加元（C$）。'],
  'bud.goal': ['Budget goal (C$)', '预算目标（C$）'],
  'bud.lot': ['Lot price (C$)', '地价（C$）'],
  'bud.lotIn': ['The lot price is inside the goal', '地价包含在预算目标内'],
  'bud.softH': ['Soft costs', '软成本'],
  'bud.softNone': ['None yet. Add a line for each one (design, permits, survey…).', '还没有。每项加一行（设计、许可、测量……）。'],
  'bud.softName': ['Cost name', '费用名称'],
  'bud.softAmount': ['Amount (C$)', '金额（C$）'],
  'bud.softRemove': ['Remove {name}', '移除{name}'],
  'bud.softAdd': ['Soft cost', '软成本'],
  'bud.contH': ['Contingency', '不可预见费'],
  'bud.cont': ['Contingency (%)', '不可预见费（%）'],
  'bud.contHelp': ['A share of the build cost only, not of soft costs or the lot.', '只按建造费计算，不含软成本和地价。'],
  'bud.rateH': ['Build rate', '建造单价'],
  'bud.rateLow': ['Low (C$/ft²)', '低（C$/ft²）'],
  'bud.rateHigh': ['High (C$/ft²)', '高（C$/ft²）'],
  'bud.rateHelp': ['The same two numbers as the Rules table: change them here or there.', '和规则表里是同两个数字：在这里或规则表里改都可以。'],
  'bud.sumH': ['Where the money goes', '钱花在哪里'],
  'bud.area': ['Rooms placed on the lot ({n})', '已放上地块的房间（{n} 个）'],
  'bud.build': ['Build cost at C${lo}–{hi}/ft²', '建造费，按 C${lo}–{hi}/ft²'],
  'bud.contRow': ['Contingency {pct}% of the build cost', '不可预见费，建造费的 {pct}%'],
  'bud.softRow': ['Soft costs ({n} lines)', '软成本（{n} 行）'],
  'bud.lotRow': ['Lot price (inside the goal)', '地价（含在目标内）'],
  'bud.lotOut': ['Lot price (not inside the goal)', '地价（不含在目标内）'],
  'bud.total': ['Total so far', '目前合计'],
  'bud.goalRow': ['Budget goal', '预算目标'],
  'bud.left': ['Left of the goal', '目标剩余'],
  'bud.noGoal': ['type a goal', '请输入目标'],
  'bud.ok': ['Inside the goal: {lo} left at the low rate, {hi} at the high rate.', '在目标之内：按低单价剩 {lo}，按高单价剩 {hi}。'],
  'bud.overHigh': ['Inside the goal at the low rate ({lo} left), over it at the high rate by {shortHi}.', '按低单价在目标之内（剩 {lo}），按高单价超出 {shortHi}。'],
  'bud.overLow': ['Over the goal even at the low rate: by {shortLo} to {shortHi}.', '即使按低单价也超出目标：超出 {shortLo} 到 {shortHi}。'],
  'bud.barAria': ['Goal {goal}; total {lo} to {hi}', '目标 {goal}；合计 {lo} 到 {hi}'],
  'bud.legLo': ['total at the low rate', '按低单价的合计'],
  'bud.legHi': ['up to the high rate', '到高单价为止'],
  'bud.legGoal': ['goal', '目标'],
  'bud.notCounted': ['Not counted yet (not on the lot): {names}.', '还没计入（不在地块上）：{names}。'],
  'bud.privacy': ['Your numbers are saved with your project only, never in the app code.', '你的数字只随你的项目保存，不会写进应用代码。'],

  'ed.roomName': ['Room name', '房间名称'],
  'ed.delete': ['Delete room', '删除房间'],
  'ed.plain': ['A plain room for now: type its size. Its own questions and furniture come in a later piece.', '目前是简单房间：直接输入尺寸。它自己的问题和家具会在以后的版本加入。'],
  'ed.startFrom': ['Start from', '起步方案'],
  'ed.questions': ['Questions', '问题'],
  'ed.section': ['Questionnaire §{n}', '问卷 §{n}'],
  'ed.furniture': ['Furniture in this room', '本房间的家具'],
  'ed.addAnother': ['Add another {name}', '再加一个{name}'],
  'ed.remove': ['Remove', '移除'],
  'ed.removeItem': ['Remove {name}', '移除{name}'],
  'ed.selected': ['Selected: {name}', '已选：{name}'],
  'ed.widthFt': ['Width (ft)', '宽（ft）'],
  'ed.depthFt': ['Depth (ft)', '深（ft）'],
  'ed.rotate': ['Rotate 90°', '旋转 90°'],
  'ed.backToPlace': ['Back to its place', '回到原位'],
  'ed.library': ['Furniture library', '家具库'],
  'ed.addFromLib': ['Add from the library…', '从家具库添加…'],
  'ed.add': ['Add', '添加'],
  'ed.customName': ['Custom item name', '自定义物品名称'],
  'ed.wFt': ['W ft', '宽 ft'],
  'ed.dFt': ['D ft', '深 ft'],
  'ed.addCustom': ['Add custom', '添加自定义'],
  'ed.plainMin': ['No contents to size this room yet: {size} is the size you typed.', '还没有可以决定尺寸的内容：{size} 是你输入的尺寸。'],
  'ed.min': ['Minimum for these contents: {size} {ftin}', '放下这些内容的最小尺寸：{size} {ftin}'],
  'ed.check': ['Check my size', '检查我的尺寸'],
  'ed.yourSize': ['Your size: {size} (saved)', '你的尺寸：{size}（已保存）'],
  'ed.usingMin': ['Using the minimum. Type your own size and press Check my size.', '正在使用最小尺寸。输入你自己的尺寸，再点“检查我的尺寸”。'],
  'ed.legend': ['{walk} walkway or chair space {bad} overlapping or outside the room · tap an item to see its clearances, drag to move it', '{walk} 通道或椅子空间 {bad} 重叠或超出房间 · 点一下家具查看它离墙的距离，拖动可移动'],
  'res.bad': ['Type a width and a depth in feet.', '请输入以英尺计的宽和深。'],
  'res.fits': ['{b}Fits.{/b} {size} holds these contents{turned}.', '{b}够用。{/b}{size} 放得下这些内容{turned}。'],
  'res.turned': [' (turned the other way round)', '（房间转个方向）'],
  'res.spare': ['Spare {area} over the minimum, about {low}–{high} at the build rate.', '比最小尺寸多出 {area}，按建造单价约 {low}–{high}。'],
  'res.isMin': ['It is the minimum.', '正好是最小尺寸。'],
  'res.tooSmall': ['{b}Too small.{/b} Short by {w} in width and {d} in depth.', '{b}太小。{/b}宽度差 {w}，深度差 {d}。'],
  'res.changes': ['Smallest changes that fit:', '能放下的最小改动：'],
  'res.roomTurned': [' (room turned the other way round)', '（房间转个方向）'],
  'res.makeIt': ['or make it {size}', '或者改成 {size}'],
  'chg.remove': ['Remove one {name}', '去掉一个{name}'],
  'chg.tv': ['Smaller TV: {n} in', '换小一号电视：{n} 英寸'],
  'chg.open': ['Open it to the next room (shares the walkway)', '与相邻房间打通（共用通道）'],
  'chg.desk': ['Shorter desk: {n} ft', '换短一点的书桌：{n} ft'],
  'chg.bed': ['Smaller bed: {name}', '换小一号的床：{name}'],
  'chg.table': ['Smaller table: {name}', '换小一号的餐桌：{name}'],
  'note.sofaBed': ['A sofa bed opens to {ft} ft and means an egress window if anyone sleeps here.', '沙发床展开长 {ft} ft；如果有人在这里睡，房间需要一扇逃生窗。'],
  'dr.loading': ['Drawing loads with the 3D scene…', '平面图随 3D 场景一起载入…'],
  'dr.aria': ['Drawing of {name}, {w} by {d}', '{name}平面图，{w} x {d}'],

  'lot.title': ['Lot board', '地块布局'],
  'lot.w': ['Lot width (ft)', '地块宽（ft）'],
  'lot.d': ['Lot depth (ft)', '地块深（ft）'],
  'lot.front': ['Front setback (ft)', '前退线（ft）'],
  'lot.rear': ['Rear setback (ft)', '后退线（ft）'],
  'lot.left': ['Left setback (ft)', '左退线（ft）'],
  'lot.right': ['Right setback (ft)', '右退线（ft）'],
  'lot.setbackHelp': ["Type the setbacks from your zone's rules. Rooms crossing them turn red.", '按你所在分区的规定输入退线。越过退线的房间会变红。'],
  'lot.tray': ['Not on the lot yet', '还没放上地块'],
  'lot.place': ['Place on lot', '放上地块'],
  'lot.turn': ['Turn 90°', '转 90°'],
  'lot.takeOff': ['Take off the lot', '从地块移除'],
  'lot.openRoom': ['Open in Rooms', '在“房间”中打开'],
  'lot.side.n': ['Street side', '临街边'],
  'lot.side.s': ['Rear side', '后边'],
  'lot.side.w': ['Left side', '左边'],
  'lot.side.e': ['Right side', '右边'],
  'port.door': ['Door', '门'],
  'port.open': ['Open', '开放'],
  'port.wall': ['Wall', '墙'],
  'lot.clusters': ['Glued clusters', '已粘合的组'],
  'lot.noClusters': ['None yet. Tick rooms below and glue them, for example garage, mudroom, back kitchen, kitchen and dining (the daily core route).', '还没有。在下面勾选房间再粘合，例如车库、泥鞋间、后厨、厨房和餐厅（每天的核心动线）。'],
  'lot.unglue': ['Unglue', '解除粘合'],
  'lot.glued': [' (glued)', '（已粘合）'],
  'lot.glue': ['Glue as core route', '粘合为核心动线'],
  'lot.street': ['Street (front) · {w} ft', '街道（前）· {w} ft'],
  'lot.aria': ['Lot {w} by {d} ft', '地块 {w} x {d} ft'],
  'lot.legend': ['{door} door {open} open side {wall} wall {bad} overlap or over a setback · dashed teal: buildable area · drag rooms (2 ft snap; edges snap to neighbours)', '{door} 门 {open} 开放边 {wall} 墙 {bad} 重叠或越过退线 · 青色虚线：可建范围 · 拖动房间（2 ft 对齐；边会吸附到相邻房间）'],
  'lot.shared': ['Walkway shared with {names}', '与{names}共用通道'],
  'lot.overlaps': ['Overlaps {name}', '与{name}重叠'],
  'lot.crosses': ['Crosses the {what}', '越过{what}'],
  'lot.fitsContents': ['Fits its contents', '放得下内容'],
  'lot.tooSmallContents': ['Too small for its contents', '放不下内容'],

  'rules.title': ['Rules table', '规则表'],
  'rules.help': ['The size engine uses only these numbers. E1 own experience · E2 a quote or spec sheet with its source · E3 general knowledge (a starting value). Change a value for this project; clear it to go back to the default.', '尺寸引擎只用这些数字。E1 自己的经验 · E2 有出处的报价或规格表 · E3 常识（起始值）。可以为本项目修改数值；清空即恢复默认值。'],
  'rules.rule': ['Rule', '规则'],
  'rules.value': ['Value', '数值'],
  'rules.unit': ['Unit', '单位'],
  'rules.tag': ['Tag', '标签'],
  'rules.source': ['Source', '来源'],
  'rules.date': ['Date', '日期'],
  'rules.valueOf': ['{label} value', '{label}数值'],
  'rules.default': ['Default', '默认'],
  'rules.refresh': ['refresh', '需更新'],

  'tests.title': ['Spec tests', '规格测试'],
  'tests.summary': ['{p} of {n} pass', '通过 {p}/{n}'],
  'tests.help': [' in this browser, with the default rules table. T7 is the owner\'s phone test; L7 (lot saved and reloaded) runs in CI.', '，在本浏览器中用默认规则表运行。T7 是业主的手机测试；L7（地块保存后重新载入）在 CI 中运行。'],
  'tests.test': ['Test', '测试'],
  'tests.what': ['What', '内容'],
  'tests.expected': ['Expected', '预期'],
  'tests.got': ['Got', '实际'],
  'tests.result': ['Result', '判定'],
  'tests.pass': ['Pass', '通过'],
  'tests.fail': ['Fail', '未通过'],
  'st.fits': ['fits', '够用'],
  'st.too-small': ['too small', '太小'],
  'T1.what': ['Living room, 6–8 seats, 75-in TV, separate room', '客厅，6–8 个座位，75 英寸电视，独立房间'],
  'T2.what': ['Same room, open to dining', '同一客厅，与餐厅打通'],
  'T3.what': ['Office, 1 person, 6 ft desk, shelf wall', '书房，1 人，6 ft 书桌，整墙书架'],
  'T4.what': ['T1 room set to 20 x 20 ft (save and reload checked in CI and in Rooms)', 'T1 的客厅设为 20 x 20 ft（保存和重新载入在 CI 和“房间”里检查）'],
  'T4.expected': ['fits, spare 197.5 ft²', '够用，多出 197.5 ft²'],
  'T4.got': ['{status}, spare {spare} ft²', '{status}，多出 {spare} ft²'],
  'T5.what': ['T1 room set to 14 x 13 ft', 'T1 的客厅设为 14 x 13 ft'],
  'T5.expected': ['too small, width short 1.0, depth short 0.5, changes listed', '太小，宽差 1.0，深差 0.5，列出改动'],
  'T5.got': ['{status}, short {w} / {d}, {n} change(s)', '{status}，差 {w} / {d}，{n} 个改动'],
  'T6.what': ['Round trip: each minimum passes its own check; 0.5 ft smaller fails', '往返检查：每个最小尺寸都通过自己的检查；小 0.5 ft 就不通过'],
  'T6.pass': ['{n} rooms pass', '{n} 个房间通过'],
  'T6.fail': ['a room failed', '有房间未通过'],
  'L1.what': ['New lot is 60 x 100 ft; a drag to 13.3, 24.9 ft snaps to 2 ft', '新地块 60 x 100 ft；拖到 13.3, 24.9 ft 时按 2 ft 对齐'],
  'L1.expected': ['60 x 100, at 14, 24', '60 x 100，位于 14, 24'],
  'L1.got': ['{w} x {d}, at {pos}', '{w} x {d}，位于 {pos}'],
  'L2.what': ['A room turns 90°', '房间转 90°'],
  'L2.expected': ['15 x 13.5 becomes 13.5 x 15', '15 x 13.5 变成 13.5 x 15'],
  'L3.what': ['Two overlapping rooms are flagged', '两个重叠的房间被标出'],
  'L3.both': ['both flagged', '两个都标出'],
  'L3.none': ['not flagged', '没有标出'],
  'L4.what': ['A room crossing a 20 ft front setback is flagged', '越过 20 ft 前退线的房间被标出'],
  'L4.none': ['none', '无'],
  'L5.what': ['T1 living room (open) against an open dining room, then moved away', 'T1 客厅（开放）贴着开放的餐厅，然后移开'],
  'L5.expected': ['15 x 11, then 15 x 13.5', '15 x 11，然后 15 x 13.5'],
  'L5.got': ['{a}, then {b}', '{a}，然后 {b}'],
  'L6.what': ['A glued core route moves as one', '粘合的核心动线整体移动'],
  'L6.expected': ['both moved 4, 6 ft', '两个都移动 4, 6 ft'],
  'L6.got': ['{a} and {b}', '{a} 和 {b}'],
}

// Names kept in English in the data and the code, shown in Chinese on a Chinese screen.
export const DATA = {
  // Room types and presets (R1, R2)
  'Living room': '客厅', 'Office': '书房', 'Dining room': '餐厅', 'Primary bedroom': '主卧', 'Kid bedroom': '儿童房',
  'Mudroom': '泥鞋间', 'Garage': '车库', 'Kitchen': '厨房', 'Back kitchen': '后厨',
  'Family TV room': '家庭影音客厅', 'Small den': '小起居室', 'Conversation room': '会客室', 'Home office': '家庭书房',
  'Shared office': '共用书房', 'Family dining': '家庭餐厅', 'Family mudroom': '家庭泥鞋间',
  'Double garage': '双车库', 'Single garage': '单车库',
  // Questions and answers (R3)
  'How many seats?': '几个座位？', 'TV size?': '电视多大？', 'Open to the next room (dining or kitchen)?': '是否与相邻房间（餐厅或厨房）打通？',
  'Storage in this room?': '这个房间要储物吗？', 'Will a guest sleep on the sofa?': '会有客人睡沙发吗？',
  'How many people work here?': '几个人在这里工作？', 'Desk length?': '书桌多长？', 'Storage?': '储物？', 'Will a guest sleep here?': '会有客人在这里睡吗？',
  'How many people eat together?': '几个人一起吃饭？', 'A sideboard?': '要餐边柜吗？', 'Bed size?': '床多大？', 'A dresser?': '要斗柜吗？',
  'A desk for homework?': '要写作业的书桌吗？', 'How many people come in this way?': '几个人从这里进出？', 'A bench to sit on?': '要坐的长凳吗？',
  'No TV': '不要电视', '55 in': '55 英寸', '65 in': '65 英寸', '75 in': '75 英寸', '85 in': '85 英寸',
  'No, a separate room': '不，独立房间', 'Yes, open': '是，打通', 'None': '不要', 'A shelf wall': '一面整墙书架', 'No': '不', 'Yes': '是',
  'Yes, a sofa bed': '是，放沙发床', 'Queen': 'Queen 大床', 'King': 'King 特大床', 'Twin': 'Twin 单人床', 'Full': 'Full 双人床',
  // Furniture library categories and names (Furnish2 74 items + app items)
  'Bedroom': '卧室', 'Living Room': '客厅', 'Dining & Kitchen': '餐厨', 'Bathroom': '卫浴', 'Appliances': '电器',
  'Study & Leisure': '书房与休闲', 'Lighting & Textile': '灯具与布艺', 'Entry': '玄关',
  'Double Bed 2.0m': '双人床 2.0m', 'Double Bed 1.8m': '双人床 1.8m', 'Double Bed 1.5m': '双人床 1.5m', 'Single Bed': '单人床', 'Crib': '婴儿床',
  'Nightstand': '床头柜', 'Wardrobe': '衣柜', 'Wardrobe 2.4m': '衣柜 2.4m', 'Small Wardrobe': '小衣柜', 'Dresser': '斗柜', 'Desk': '书桌',
  'Chest of Drawers': '抽屉柜', 'Chair': '椅子', 'Bookshelf': '书架', 'Bay Cushion': '飘窗垫', '3-Seat Sofa': '三人沙发', 'Loveseat': '双人沙发',
  'Corner Sofa': '转角沙发', 'Armchair': '单人扶手椅', 'Beanbag': '懒人沙发', 'Coffee Table': '茶几', 'Round Coffee Table': '圆茶几',
  'Side Table': '边几', 'TV Stand': '电视柜', 'Rug': '地毯', 'Shoe Cabinet': '鞋柜', 'Entry Cabinet': '玄关柜', 'Floor Lamp': '落地灯',
  'Plant': '绿植', 'Large Plant': '大型绿植', 'Drying Rack': '晾衣架', 'Dining Table': '餐桌', '6-Seat Dining Table': '六人餐桌',
  'Round Table': '圆桌', 'Dining Chair': '餐椅', 'Kitchen Island': '厨房岛台', 'Large Island': '大岛台', 'Bar Stool': '吧凳',
  'Kitchen Counter': '厨房台面', 'Gas Stove': '燃气灶', 'Sink': '水槽', 'Fridge': '冰箱', 'Sideboard': '餐边柜', 'Toilet': '马桶',
  'Vanity': '洗手台', 'Double Vanity': '双盆洗手台', 'Shower': '淋浴间', 'Bathtub': '浴缸', 'Washer': '洗衣机', 'Water Heater': '热水器',
  'Storage Cabinet': '储物柜', '55" TV': '55 英寸电视', '65" TV': '65 英寸电视', '75" TV': '75 英寸电视', '85" TV': '85 英寸电视',
  'French-door Fridge': '法式对开门冰箱', 'Floor AC': '立式空调', 'Wall AC': '壁挂空调', 'Dishwasher': '洗碗机', 'Oven Tower': '烤箱高柜',
  'Dryer': '烘干机', 'Air Purifier': '空气净化器', 'Long Desk': '长书桌', 'Office Chair': '办公椅', 'Large Bookshelf': '大书架',
  'Upright Piano': '立式钢琴', 'Treadmill': '跑步机', 'Reading Chair': '阅读椅', 'Pendant Lamp': '吊灯', 'Dining Pendant': '餐厅吊灯',
  'Curtains 2.4m': '窗帘 2.4m', 'Curtains 3m': '窗帘 3m', 'Wall Art': '挂画', 'Small Wall Art': '小挂画', 'Mirror': '镜子', 'Bench': '长凳',
  'Queen Bed': 'Queen 大床', 'King Bed': 'King 特大床', 'Twin Bed': 'Twin 单人床', 'Full Bed': 'Full 双人床',
  'Desk 4 ft': '书桌 4 ft', 'Desk 5 ft': '书桌 5 ft', 'Desk 6 ft': '书桌 6 ft', 'Shelf Wall': '整墙书架', '8-Seat Dining Table': '八人餐桌',
  'Locker (per person)': '储物格（每人一个）', '3-Seat Sofa Bed': '三人沙发床', 'Sofa Bed (2-seat)': '双人沙发床',
  // Plan intake
  'Sample plan': '示例平面图', 'Plan trace: a size may differ from the drawing by': '描图：尺寸与图纸的差最多',
  'Assumed starting value (Claude, 2026-11-05), plan approved by the owner; replace with a sourced row': '假设的起始值（Claude，2026-11-05），业主已批准计划；以后换成有出处的数值',
  // Drawing, lot board and cluster names made by the code
  'walkway': '通道', 'chair space': '椅子空间', 'Core route': '核心动线',
  'front setback': '前退线', 'rear setback': '后退线', 'left setback': '左退线', 'right setback': '右退线',
  // Rules table rows (R12): labels, units, sources
  'Main walkway': '主通道', 'Seat to TV screen (x screen diagonal)': '座位到电视屏幕（x 屏幕对角线）', 'Seats facing each other, no TV': '座位面对面（无电视）',
  'Desk chair space behind each desk': '每张书桌后的椅子空间', 'Shelf wall depth': '整墙书架深度', 'Dining chair space on every side of the table': '餐桌每边的椅子空间',
  'Sofa bed open length': '沙发床展开长度', 'Walkway strip saved when open to a neighbour': '与相邻房间打通时省下的通道宽度',
  'Build rate, low': '建造单价（低）', 'Build rate, high': '建造单价（高）', 'TV stand zone depth': '电视柜区域深度',
  'Gap between seat pieces at a corner': '转角处座椅之间的空隙', 'Room sizes round up to': '房间尺寸向上取整到',
  'Office: every side at least (bedroom-ready)': '书房：每边至少（可改作卧室）', 'Lot width (new project)': '地块宽（新项目）',
  'Lot depth (new project)': '地块深（新项目）', 'Lot board snap': '地块布局对齐步长', 'Snap to a neighbour room edge within': '距相邻房间边在此范围内时吸附',
  'Walking space beside a bed': '床边的走动空间',
  '× diagonal': '× 对角线', 'ft apart': 'ft 间距',
  'SPEC v1 §6 starting value': 'SPEC v1 §6 起始值', 'THX 40°, SMPTE 30° (range 1.2–1.6); SPEC v1 §6': 'THX 40°、SMPTE 30°（范围 1.2–1.6）；SPEC v1 §6',
  'SPEC v1 §6 R10 and §7': 'SPEC v1 §6 R10 和 §7', 'SPEC v1 §6 R7 default': 'SPEC v1 §6 R7 默认值',
  'chat-D21 (size model, owner approved 2026-11-05)': 'chat-D21（尺寸模型，业主 2026-11-05 批准）',
  'chat-D22 (office side, owner approved 2026-11-05); see open item L5': 'chat-D22（书房边长，业主 2026-11-05 批准）；见未结项 L5',
  'SPEC v1 §7 default': 'SPEC v1 §7 默认值', 'SPEC v1 §7': 'SPEC v1 §7',
  'Assumed starting value (Claude, 2026-11-05) so rooms can touch when sizes are not whole 2 ft steps': '假设的起始值（Claude，2026-11-05），让尺寸不是 2 ft 整数倍的房间也能贴在一起',
  'Assumed starting value (Claude, 2026-11-05); replace with a sourced row': '假设的起始值（Claude，2026-11-05）；以后换成有出处的数值',
}

// --- the current language, saved per browser ---
const KEY = 'hd-lang'
const listeners = new Set()
function first() {
  try { const v = localStorage.getItem(KEY); if (v === 'en' || v === 'zh') return v } catch { /* storage blocked */ }
  return typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '') ? 'zh' : 'en'
}
let lang = first()
function apply() {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en'
  document.title = t('app.brand')
}
export const getLang = () => lang
export function setLang(l) {
  if (l !== 'en' && l !== 'zh') return
  lang = l
  try { localStorage.setItem(KEY, l) } catch { /* storage blocked: the choice lasts until reload */ }
  apply()
  listeners.forEach((f) => f())
}
export const useLang = () => useSyncExternalStore((f) => { listeners.add(f); return () => listeners.delete(f) }, getLang, getLang)

// A data name (room type, furniture, rule row…) on screen; text not in DATA shows as is.
const NUMBERED = [[/^Room (\d+)$/, '房间 $1'], [/^Level (\d+)$/, '第 $1 层']]
export const tx = (s) => {
  if (lang !== 'zh' || typeof s !== 'string') return s
  if (DATA[s]) return DATA[s]
  for (const [re, zh] of NUMBERED) if (re.test(s)) return s.replace(re, zh)
  return s
}

const fill = (key) => {
  const row = UI[key]
  if (!row) { console.warn('i18n: missing key', key); return key }
  return row[lang === 'zh' ? 1 : 0]
}
// A UI string with its {values}; string values that are data names are shown translated too.
export function t(key, params = {}) {
  return fill(key).replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(tx(params[k])) : m))
}
// Same, for values that are React elements ({b}…{/b} wraps a part in <b>). Returns one fragment.
export function tn(key, params = {}) {
  const parts = fill(key).split(/(\{\/?\w+\})/)
  const out = []
  let bold = null
  for (const p of parts) {
    if (p === '{b}') { bold = []; continue }
    if (p === '{/b}') { out.push(createElement('b', null, ...bold)); bold = null; continue }
    const m = p.match(/^\{(\w+)\}$/)
    const v = m && m[1] in params ? tx(params[m[1]]) : p
    if (v === '' || v === null || v === undefined || v === false) continue
    ;(bold || out).push(v)
  }
  return createElement(Fragment, null, ...out)
}
// [key, params] messages from the engine.
export const tm = (msg) => (Array.isArray(msg) ? t(msg[0], msg[1]) : String(msg))
// Names joined for a sentence ("A, B" / "A、B").
export const tlist = (names) => names.map(tx).join(t('list.sep'))

apply() // last, once t() and its helpers exist
