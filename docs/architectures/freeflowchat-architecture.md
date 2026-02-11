# FreeFlowChat Architecture Analysis

This document analyzes the ActionScript 3 (AS3) source files in `source_as_win63/habbo/freeflowchat/` to categorize which code contains **ENGINE** logic (positioning, simulation, data flow) that must be ported to TypeScript, versus **VIEW** logic (rendering, visual styling) that SolidJS will handle.

## Summary

- **Total Files Analyzed**: 31
- **ENGINE Files**: 16 (chat flow simulation, positioning, collision detection, data handling)
- **VIEW Files**: 15 (bubble rendering, visual styles, history display components)

---

## ENGINE Files (Code We NEED)

These files contain positioning logic, simulation algorithms, collision detection, and data structures that must be ported to TypeScript.

| File                                        | Path                                                           | Purpose                      | Key Logic to Port                                                                                           |
|---------------------------------------------|----------------------------------------------------------------|------------------------------|-------------------------------------------------------------------------------------------------------------|
| **ChatFlowStage**                           | `viewer/simulation/ChatFlowStage.as`                           | Core simulation orchestrator | Bubble insertion positioning, collision simulation loop, scroll-up timing, attraction forces, cleanup       |
| **ChatBubbleSimulationEntity**              | `viewer/simulation/ChatBubbleSimulationEntity.as`              | Physics entity for bubbles   | Rectangle collision bounds, impulse forces, position synchronization, wide-rect collision zones             |
| **ChatBubbleSimulationWithLimitedWideRect** | `viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as` | Extended collision entity    | Limited 240px wide-rect for narrow bubbles, offset positioning                                              |
| **ChatBubbleCollisionEvent**                | `viewer/simulation/ChatBubbleCollisionEvent.as`                | Collision pair data          | Top/bottom/left/right/older bubble identification for collision resolution                                  |
| **class_3628**                              | `viewer/simulation/class_3628.as`                              | Attraction force calculator  | Gravity coefficient (60), max impulse (40), attraction range (380px), force calculation algorithm           |
| **ChatFlowViewer**                          | `viewer/ChatFlowViewer.as`                                     | Viewer update loop           | Room pan offset tracking, bubble lifecycle management, update tick distribution                             |
| **ChatBubbleFactory**                       | `viewer/ChatBubbleFactory.as`                                  | Bubble instantiation         | Pooling/recycling, avatar image caching, chat type transformations (respect, handitem, mute messages)       |
| **ChatItem**                                | `data/ChatItem.as`                                             | Chat message data model      | userId, roomId, text, chatType, style, timestamp, userLocation (IVector3d), links array                     |
| **ChatEventHandler**                        | `data/ChatEventHandler.as`                                     | Room chat event listener     | RSCE_CHAT_EVENT handling, timestamp collision avoidance, game chat events                                   |
| **RoomSessionEventHandler**                 | `data/RoomSessionEventHandler.as`                              | Room session lifecycle       | RSE_CREATED/RSE_ENDED event handling for room enter/leave                                                   |
| **ChatHistoryBuffer**                       | `history/ChatHistoryBuffer.as`                                 | History data storage         | Max 1000 items buffer, insertion with overflow splice, total height calculation                             |
| **HabboFreeFlowChat**                       | `HabboFreeFlowChat.as`                                         | Main component coordinator   | Room position conversion, chat insertion pipeline, room settings (mode, scrollSpeed), dependency management |
| **ChatViewController**                      | `ChatViewController.as`                                        | View orchestration           | Stage resize propagation, display object hierarchy management                                               |
| **class_1809**                              | `class_1809.as`                                                | Component interface          | isDisabledInPreferences, preferedChatStyle, clear(), toggleVisibility()                                     |
| **ChatBubbleWidth**                         | `viewer/enum/ChatBubbleWidth.as`                               | Width constants              | NORMAL (350), THIN (240), WIDE (2000), room setting mapping                                                 |
| **ChatColours**                             | `viewer/enum/ChatColours.as`                                   | Color tag processing         | @red@, @cyan@, @blue@, @green@, @purple@ prefix parsing and color application                               |

### Critical Engine Constants

From `ChatFlowStage.as`:
```
MOVE_UP_AMOUNT_PIXELS: 19
MAX_ITERATIONS: 20
MAX_COLLISION_SIDEWAYS_IMPULSE: 15
MOVE_UP_IMPULSE_LIMIT: 8
MINIMUM_COLLIDER_WIDTH: 240
MOVE_UP_TIMER: 3000/6000/12000ms (based on scrollSpeed setting)
```

From `ChatBubbleSimulationEntity.as`:
```
VISUALIZATION_OVERLAP_VERTICAL: 10
MOVE_NEGATIVE_FEEDBACK: 0.1
WIDE_RECT_EXTENSION: 2500 (horizontal collision zone)
```

From `class_3628.as` (attraction):
```
INPUT_GRAVITY_COEFFICIENT: 60
INPUT_GRAVITY_USERPOS_MARGIN: 15
INPUT_GRAVITY_MAX_IMPULSE: 40
MAX_ATTRACTION_RANGE: 380
```

---

## VIEW Files (Code We IGNORE - SolidJS Handles UI)

These files handle visual rendering, styling, and Flash-specific display objects that SolidJS components will replace.

| File                             | Path                                                          | Purpose                  | Why Ignore                                                             |
|----------------------------------|---------------------------------------------------------------|--------------------------|------------------------------------------------------------------------|
| **ChatBubble**                   | `viewer/visualization/ChatBubble.as`                          | Bubble Sprite rendering  | Flash Sprite, BitmapData, TextField rendering - SolidJS handles        |
| **PooledChatBubble**             | `viewer/visualization/PooledChatBubble.as`                    | Reusable bubble visual   | Flash display object pooling, bitmap rendering - SolidJS manages DOM   |
| **ChatStyle**                    | `viewer/visualization/style/ChatStyle.as`                     | Style implementation     | 9-slice sprites, BitmapData manipulation, pointer graphics             |
| **ChatStyleLibrary**             | `viewer/visualization/style/ChatStyleLibrary.as`              | Style asset loading      | XML parsing for visual styles, bitmap assets - CSS/Tailwind replaces   |
| **class_3595**                   | `viewer/visualization/style/class_3595.as`                    | Style interface          | Sprite factory, pointer bitmap, text format - CSS replaces             |
| **class_3632**                   | `style/class_3632.as`                                         | Style data interface     | selectorPreview, overlap, textFormat - CSS/design tokens replace       |
| **class_3511**                   | `style/class_3511.as`                                         | Style library interface  | getStyleIds(), getStyle() - style system redesigned for web            |
| **BlankStyle**                   | `viewer/simulation/BlankStyle.as`                             | Empty spacer style       | Transparent Sprite for spacers - CSS handles                           |
| **ChatHistoryScrollView**        | `history/visualization/ChatHistoryScrollView.as`              | History scroll container | Flash Sprite container, masking, mouse drag - SolidJS scroll component |
| **ChatHistoryScrollBar**         | `history/visualization/ChatHistoryScrollBar.as`               | Scrollbar visual         | 9-slice sprite scrollbar, thumb track - CSS scrollbar or custom        |
| **ChatHistoryTray**              | `history/visualization/ChatHistoryTray.as`                    | Pulldown tray visual     | Bitmap tray handle, visibility toggle animation                        |
| **ChatHistoryEntryBitmapBubble** | `history/visualization/entry/ChatHistoryEntryBitmapBubble.as` | History entry bitmap     | BitmapData composition, timestamp rendering                            |
| **ChatHistoryRoomChangeEntry**   | `history/visualization/entry/ChatHistoryRoomChangeEntry.as`   | Room change indicator    | BitmapData with room name text                                         |
| **class_3535**                   | `history/visualization/entry/class_3535.as`                   | History entry interface  | BitmapData, overlap Rectangle - visual data contract                   |
| **class_3536**                   | `history/visualization/entry/class_3536.as`                   | History Bitmap wrapper   | Flash Bitmap extension with metadata                                   |
| **class_3598**                   | `history/visualization/enum/class_3598.as`                    | Layout constants         | TEXT_FORMAT, margins, fixed widths - CSS variables replace             |

---

## Data Flow Architecture

```
[RoomSessionChatEvent]
    |
    v
ChatEventHandler.onRoomChat()
    |
    v
ChatItem (data model)
    |
    v
HabboFreeFlowChat.insertChat()
    |
    +--> ChatHistoryBuffer.insertChat() [stores for history]
    |
    v
ChatBubbleFactory.getNewChatBubble()
    |
    v
ChatFlowStage.insertBubble()
    |
    +--> Calculate initial position (user screen pos - bubble width/2)
    +--> Apply attraction forces (avoid overlap with existing)
    +--> Create ChatBubbleSimulationEntity
    |
    v
ChatFlowViewer.insertBubble()
    |
    +--> Add to display list
    +--> Store for update loop
```

## Simulation Loop (ChatFlowStage.update)

```
Every frame:
1. simulate() - up to 20 iterations:
   - Reset impulse forces
   - Detect all intersecting pairs -> ChatBubbleCollisionEvent
   - For each collision:
     - If mode=bordered: push older up by wideRect height
     - If mode=normal: push sideways (max 15px) OR push up
   - Apply impulse forces (max -8 vertical)

2. If scrollTimer elapsed (3000/6000/12000ms):
   - scrollUp() - all bubbles y -= 19
   - Apply attraction forces between bubbles
   - If bordered mode: insert spacer bubble

3. syncToVisualization() - update visual positions

4. cleanup() - remove bubbles above viewport (y < -10)
```

## Room Chat Modes

The system supports two modes based on `roomChatSettings.mode`:

| Mode          | Value | Behavior                                                                     |
|---------------|-------|------------------------------------------------------------------------------|
| **Free Flow** | 0     | Bubbles can move sideways to avoid overlap, attraction forces active         |
| **Bordered**  | 1     | Bubbles stay at user X, collision pushes up only, spacers inserted on scroll |

---

## TypeScript Migration Notes

### Must Port (Engine Logic)

1. **ChatFlowStage** - Core simulation with collision detection
2. **ChatBubbleSimulationEntity** - Rectangle-based physics
3. **class_3628** - Attraction force algorithm
4. **ChatItem** - Data model (easy conversion)
5. **ChatBubbleWidth** / **ChatColours** - Constants and utilities

### Replace with SolidJS (View Logic)

1. **ChatBubble/PooledChatBubble** -> `<ChatBubble>` SolidJS component
2. **ChatStyle/ChatStyleLibrary** -> CSS classes + design tokens
3. **ChatHistoryScrollView** -> `<ChatHistory>` with CSS scroll
4. **All Bitmap/Sprite classes** -> HTML/CSS elements

### Recommended TypeScript Structure

```typescript
// Engine (port from AS3)
src/engine/chat/
  ChatFlowSimulation.ts      // From ChatFlowStage
  ChatBubbleEntity.ts        // From ChatBubbleSimulationEntity
  AttractionForce.ts         // From class_3628
  CollisionResolver.ts       // From collision logic

// Data (port from AS3)
src/data/chat/
  ChatMessage.ts             // From ChatItem
  ChatHistoryStore.ts        // From ChatHistoryBuffer

// View (new SolidJS)
src/components/chat/
  ChatBubble.tsx
  ChatHistory.tsx
  ChatContainer.tsx
```
