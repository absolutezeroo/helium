# Window Architecture Documentation

This document categorizes all AS3 window files into **ENGINE** (window manager logic we might need) and **VIEW** (UI rendering code we ignore since SolidJS handles UI).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                    |
|----------|-------|--------------------------------------------------------------------------------|
| ENGINE   | 14    | Window manager interfaces, hint system logic, link handlers, element pointers  |
| VIEW     | 78    | UI widgets, dialogs, themes, bitmap rendering, floor plan editor UI, chat UI   |

**Note**: This folder is predominantly VIEW code since it implements Habbo's Flash-based window system. SolidJS will replace all of this rendering. We only need to understand certain ENGINE patterns for hint management and link handling.

---

## ENGINE FILES (We Might Need These)

### Core Window Manager

| AS3 File                         | Purpose                                                                                       | Status |
|----------------------------------|-----------------------------------------------------------------------------------------------|--------|
| `IHabboWindowManager.as`         | Interface defining window manager API - window creation, alerts, hints, modal dialogs         | REVIEW |
| `HabboWindowManagerComponent.as` | Main window manager component - context layers, event handling, widget creation (mostly VIEW) | REVIEW |

### Hint System (Pointer Arrows)

| AS3 File         | Purpose                                                                          | Status |
|------------------|----------------------------------------------------------------------------------|--------|
| `HintManager.as` | Manages hint arrows pointing to UI elements - registration, show/hide, animation | REVIEW |
| `HintTarget.as`  | Hint target data model - window reference, key identifier, style direction       | REVIEW |

### Link Handlers

| AS3 File                          | Purpose                                                     | Status |
|-----------------------------------|-------------------------------------------------------------|--------|
| `handlers/HabbletLinkHandler.as`  | Handles "habblet/" links - opens web pages, shop, habblets  | REVIEW |

### Element Pointer Handler

| AS3 File                         | Purpose                                                          | Status |
|----------------------------------|------------------------------------------------------------------|--------|
| `utils/ElementPointerHandler.as` | Handles server-sent element pointer messages - shows/hides hints | REVIEW |

### Enumerations & Constants (Shared)

| AS3 File                           | Purpose                                                         | Status |
|------------------------------------|-----------------------------------------------------------------|--------|
| `enum/HabboWindowParam.as`         | Window parameter flags - input handling, scaling, dragging      | REVIEW |
| `enum/HabboWindowType.as`          | Window type constants - frame, label, button, list, input, etc. | REVIEW |
| `enum/HabboWindowStyle.as`         | Window style constants - NULL, DEFAULT, BLACK, SHINY            | REVIEW |
| `enum/HabboWindowTrackingEvent.as` | Tracking event types - INPUT, RENDER, SLEEP                     | REVIEW |
| `enum/HabboAlertDialogFlag.as`     | Alert dialog flags - title, text, buttons, icons                | REVIEW |
| `enum/HabboIconType.as`            | Icon type constants - arrows, triangles, symbols, club icons    | REVIEW |

---

## VIEW FILES (SolidJS Handles These)

### Theme Management

| AS3 File                | Purpose                                                       | Status |
|-------------------------|---------------------------------------------------------------|--------|
| `theme/Theme.as`        | Theme data model - name, style range, property defaults       | IGNORE |
| `theme/ThemeManager.as` | Manages UI themes - Illumina Light/Dark, Volter, Ubuntu, etc. | IGNORE |

### Resource Management

| AS3 File             | Purpose                                                       | Status |
|----------------------|---------------------------------------------------------------|--------|
| `ResourceManager.as` | Asset loading and caching for window elements - bitmaps, URLs | IGNORE |

### Dialog Components

| AS3 File                       | Purpose                                                 | Status |
|--------------------------------|---------------------------------------------------------|--------|
| `utils/AlertDialog.as`         | Alert dialog rendering - title, message, buttons, modal | IGNORE |
| `utils/AlertDialogCaption.as`  | Alert dialog button caption data model                  | IGNORE |
| `utils/AlertDialogWithLink.as` | Alert with clickable link button                        | IGNORE |
| `utils/ConfirmDialog.as`       | Confirmation dialog with OK/Cancel buttons              | IGNORE |
| `utils/SimpleAlertDialog.as`   | Simple alert with illustration and link support         | IGNORE |
| `utils/ModalDialog.as`         | Modal overlay dialog - background dimming, layering     | IGNORE |
| `utils/IModalDialog.as`        | Modal dialog interface                                  | IGNORE |
| `utils/ILimitedItemOverlay.as` | Limited item overlay interface                          | IGNORE |

### Skin/Renderer Parsing

| AS3 File              | Purpose                                               | Status |
|-----------------------|-------------------------------------------------------|--------|
| `utils/class_3503.as` | Skin XML parser - bitmap, fill, text, shape renderers | IGNORE |
| `utils/class_3723.as` | Unique item number glyph bitmap creator               | IGNORE |
| `utils/class_3822.as` | Room user count color calculator                      | IGNORE |

### Floor Plan Editor UI

| AS3 File                                      | Purpose                                                  | Status |
|-----------------------------------------------|----------------------------------------------------------|--------|
| `utils/floorplaneditor/BCFloorPlanEditor.as`  | Floor plan editor main UI - BC subscription, save/reload | IGNORE |
| `utils/floorplaneditor/FloorPlanCache.as`     | Floor plan data caching and tile manipulation            | IGNORE |
| `utils/floorplaneditor/FloorPlanPreviewer.as` | Isometric floor plan preview rendering                   | IGNORE |
| `utils/floorplaneditor/HeightMapEditor.as`    | Height map drawing/editing UI with color picker          | IGNORE |
| `utils/floorplaneditor/ImportExportDialog.as` | Floor plan import/export text dialog                     | IGNORE |

### Habbopedia/Help Pages

| AS3 File                                  | Purpose                                              | Status |
|-------------------------------------------|------------------------------------------------------|--------|
| `utils/habbopedia/HabboPagesViewer.as`    | In-client help page viewer with CSS styling          | IGNORE |

### View Enumerations

| AS3 File             | Purpose                                              | Status |
|----------------------|------------------------------------------------------|--------|
| `enum/class_3417.as` | Arrow direction enum - HORIZONTAL, VERTICAL          | IGNORE |
| `enum/class_3550.as` | Badge type enum - NORMAL, GROUP, PERK                | IGNORE |
| `enum/class_3582.as` | Alert illustration asset names (Frank mascot)        | IGNORE |
| `enum/class_3684.as` | Direction enum - compass directions (N, NE, E, etc.) | IGNORE |
| `enum/class_3719.as` | Progress indicator mode - POSITION, PROGRESS         | IGNORE |
| `enum/class_3759.as` | Value element name constant                          | IGNORE |
| `enum/class_3821.as` | Balloon arrow pivot positions - up/down/left/right   | IGNORE |
| `enum/class_3827.as` | Style enum - FLAT, ETCHED                            | IGNORE |

---

## WIDGET FILES (All VIEW - SolidJS Handles These)

### Widget Registry

| AS3 File                | Purpose                                                    | Status |
|-------------------------|------------------------------------------------------------|--------|
| `widgets/class_3474.as` | Widget type registry - maps type strings to widget classes | IGNORE |

### Avatar/Badge/Pet Image Widgets

| AS3 File                          | Purpose                                                 | Status |
|-----------------------------------|---------------------------------------------------------|--------|
| `widgets/AvatarImageWidget.as`    | Avatar image rendering - figure, scale, direction, head | IGNORE |
| `widgets/IAvatarImageWidget.as`   | Avatar image widget interface                           | IGNORE |
| `widgets/BadgeImageWidget.as`     | Badge image rendering - normal, group, perk badges      | IGNORE |
| `widgets/IBadgeImageWidget.as`    | Badge image widget interface                            | IGNORE |
| `widgets/PetImageWidget.as`       | Pet image rendering with zoom and overflow handling     | IGNORE |
| `widgets/class_3654.as`           | IPetImageWidget interface                               | IGNORE |
| `widgets/FurnitureImageWidget.as` | Furniture image rendering from room engine              | IGNORE |
| `widgets/class_3618.as`           | IFurnitureImageWidget interface                         | IGNORE |

### Illumina Border/UI Widgets

| AS3 File                               | Purpose                                           | Status |
|----------------------------------------|---------------------------------------------------|--------|
| `widgets/IlluminaBorderWidget.as`      | Illumina theme border rendering with child layout | IGNORE |
| `widgets/IIlluminaBorderWidget.as`     | Illumina border widget interface                  | IGNORE |
| `widgets/IlluminaChatBubbleWidget.as`  | Chat bubble with avatar, messages, timestamps     | IGNORE |
| `widgets/IIlluminaChatBubbleWidget.as` | Illumina chat bubble interface                    | IGNORE |
| `widgets/IlluminaInputWidget.as`       | Text input with submit button and placeholder     | IGNORE |
| `widgets/IIlluminaInputWidget.as`      | Illumina input widget interface                   | IGNORE |
| `widgets/IIlluminaInputHandler.as`     | Input submission handler interface                | IGNORE |

### Limited/Rarity Item Overlays

| AS3 File                                         | Purpose                                           | Status |
|--------------------------------------------------|---------------------------------------------------|--------|
| `widgets/LimitedItemGridOverlayWidget.as`        | Limited item overlay for grid view with animation | IGNORE |
| `widgets/LimitedItemPreviewOverlayWidget.as`     | Limited item overlay for preview view             | IGNORE |
| `widgets/LimitedItemSupplyLeftOverlayWidget.as`  | Limited item supply counter overlay               | IGNORE |
| `widgets/ILimitedItemGridOverlayWidget.as`       | Grid overlay interface                            | IGNORE |
| `widgets/ILimitedItemOverlayWidget.as`           | Base overlay interface                            | IGNORE |
| `widgets/ILimitedItemPreviewOverlayWidget.as`    | Preview overlay interface                         | IGNORE |
| `widgets/ILimitedItemSupplyLeftOverlayWidget.as` | Supply overlay interface                          | IGNORE |
| `widgets/RarityItemGridOverlayWidget.as`         | Rarity item grid overlay                          | IGNORE |
| `widgets/RarityItemPreviewOverlayWidget.as`      | Rarity item preview overlay                       | IGNORE |
| `widgets/IRarityItemGridOverlayWidget.as`        | Rarity grid overlay interface                     | IGNORE |
| `widgets/IRarityItemOverlayWidget.as`            | Rarity base overlay interface                     | IGNORE |
| `widgets/IRarityItemPreviewOverlayWidget.as`     | Rarity preview overlay interface                  | IGNORE |

### Room Preview Widgets

| AS3 File                          | Purpose                                   | Status |
|-----------------------------------|-------------------------------------------|--------|
| `widgets/RoomPreviewerWidget.as`  | Room previewer embedding                  | IGNORE |
| `widgets/RoomThumbnailWidget.as`  | Room thumbnail image display              | IGNORE |
| `widgets/RoomUserCountWidget.as`  | Room user count display with color coding | IGNORE |
| `widgets/IRoomPreviewerWidget.as` | Room previewer interface                  | IGNORE |
| `widgets/IRoomThumbnailWidget.as` | Room thumbnail interface                  | IGNORE |
| `widgets/IRoomUserCountWidget.as` | Room user count interface                 | IGNORE |

### Utility Widgets

| AS3 File                             | Purpose                                             | Status |
|--------------------------------------|-----------------------------------------------------|--------|
| `widgets/BalloonWidget.as`           | Speech balloon with arrow positioning               | IGNORE |
| `widgets/class_3583.as`              | IBalloonWidget interface                            | IGNORE |
| `widgets/CountdownWidget.as`         | Countdown timer with weeks/days/hours/minutes/secs  | IGNORE |
| `widgets/class_3570.as`              | ICountdownWidget interface                          | IGNORE |
| `widgets/HoverBitmapWidget.as`       | Bitmap with hover state asset swap                  | IGNORE |
| `widgets/class_3563.as`              | IHoverBitmapWidget interface                        | IGNORE |
| `widgets/PixelLimitWidget.as`        | Pixel limit display widget                          | IGNORE |
| `widgets/class_3530.as`              | IPixelLimitWidget interface                         | IGNORE |
| `widgets/ProgressIndicatorWidget.as` | Progress dots indicator - position or progress mode | IGNORE |
| `widgets/class_3528.as`              | IProgressIndicatorWidget interface                  | IGNORE |
| `widgets/RunningNumberWidget.as`     | Animated number counter                             | IGNORE |
| `widgets/IRunningNumberWidget.as`    | Running number interface                            | IGNORE |
| `widgets/SeparatorWidget.as`         | UI separator/divider line                           | IGNORE |
| `widgets/ISeparatorWidget.as`        | Separator interface                                 | IGNORE |
| `widgets/UpdatingTimeStampWidget.as` | Auto-updating "time ago" timestamp                  | IGNORE |
| `widgets/class_3614.as`              | IUpdatingTimeStampWidget interface                  | IGNORE |

---

## Key Patterns to Note

### 1. Hint System Pattern
The hint system shows animated arrows pointing to UI elements. Servers can trigger hints via `ElementPointerMessageEvent`. Our SolidJS implementation should:
- Track registered hint targets by key name
- Show/hide CSS-animated arrows based on server messages
- Support directional positioning (vertical/horizontal arrows)

### 2. Link Handler Pattern
Links prefixed with "habblet/" are intercepted and handled specially:
- "habblet/open/credits" -> Opens shop
- "habblet/open/{name}" -> Opens specific habblet web page

### 3. Widget Type System
Widgets are registered by type string in `class_3474.as`. Types include:
- `avatar_image`, `badge_image`, `pet_image`, `furniture_image`
- `illumina_border`, `illumina_chat_bubble`, `illumina_input`
- `limited_item_overlay_grid`, `limited_item_overlay_preview`
- `countdown`, `progress_indicator`, `running_number`, etc.

### 4. Theme System
Themes define visual styles:
- **Illumina Light** (style 100-199)
- **Illumina Dark** (style 200-299)
- **Volter** (style 0-2)
- **Ubuntu** (style 3-7)

Our CSS theming should map to these conceptual themes.

---

## Migration Notes

1. **Window Manager**: Not directly needed - SolidJS component tree replaces Flash display list
2. **Hint System**: Re-implement in TypeScript with CSS animations
3. **Dialogs**: Use SolidJS modal components
4. **Widgets**: Build as SolidJS components with similar APIs
5. **Floor Plan Editor**: Complete rewrite with HTML5 canvas or WebGL
6. **Theme Manager**: CSS custom properties + theme context in SolidJS
