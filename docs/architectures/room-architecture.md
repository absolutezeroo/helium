# Room Architecture Documentation

This document categorizes all AS3 room files into **ENGINE** (business logic we need) and **VIEW** (UI dialogs we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Implementation Progress

| Phase | Description | Files | Status |
|-------|-------------|-------|--------|
| Phase 1 | Core Infrastructure (`src/room/`) | ~25 | ✅ DONE |
| Phase 2 | Room Instance & Manager | ~15 | ✅ DONE |
| Phase 3 | Object System & Factories | ~25 | ✅ DONE |
| Phase 4 | Message Handlers | ~40 | ✅ DONE |
| Phase 5 | Furniture Logic | ~25 | ✅ DONE |
| Phase 6 | Avatar & Pet Logic | ~25 | 🔄 TODO |
| Phase 7 | Room Engine Core | ~20 | 🔄 TODO |

**Total Progress: ~130/175 files (~74%)**

### Phase 4 Details - Message Handlers

| Component | Files | Status |
|-----------|-------|--------|
| **Data Classes** | | |
| FurnitureFloorData | 1 | ✅ DONE |
| FurnitureWallData | 1 | ✅ DONE |
| RoomUserData | 1 | ✅ DONE |
| SlideObjectData | 1 | ✅ DONE |
| AreaHideMessageData | 1 | ✅ DONE |
| **Parsers** | | |
| FurnitureDataParser | 1 | ✅ DONE |
| WallDataParser | 1 | ✅ DONE |
| RoomReadyMessageParser | 1 | ✅ DONE |
| HeightMapMessageParser | 1 | ✅ DONE |
| FloorHeightMapMessageParser | 1 | ✅ DONE |
| ObjectsMessageParser | 1 | ✅ DONE |
| ObjectAddMessageParser | 1 | ✅ DONE |
| ObjectRemoveMessageParser | 1 | ✅ DONE |
| ObjectUpdateMessageParser | 1 | ✅ DONE |
| ItemsMessageParser | 1 | ✅ DONE |
| ItemAddMessageParser | 1 | ✅ DONE |
| ItemRemoveMessageParser | 1 | ✅ DONE |
| ItemUpdateMessageParser | 1 | ✅ DONE |
| UsersMessageParser | 1 | ✅ DONE |
| UserUpdateMessageParser | 1 | ✅ DONE |
| UserRemoveMessageParser | 1 | ✅ DONE |
| SlideObjectBundleMessageParser | 1 | ✅ DONE |
| **Message Events** | | |
| RoomReadyMessageEvent | 1 | ✅ DONE |
| HeightMapMessageEvent | 1 | ✅ DONE |
| FloorHeightMapMessageEvent | 1 | ✅ DONE |
| ObjectsMessageEvent | 1 | ✅ DONE |
| ObjectAddMessageEvent | 1 | ✅ DONE |
| ObjectRemoveMessageEvent | 1 | ✅ DONE |
| ObjectUpdateMessageEvent | 1 | ✅ DONE |
| ItemsMessageEvent | 1 | ✅ DONE |
| ItemAddMessageEvent | 1 | ✅ DONE |
| ItemRemoveMessageEvent | 1 | ✅ DONE |
| ItemUpdateMessageEvent | 1 | ✅ DONE |
| UsersMessageEvent | 1 | ✅ DONE |
| UserUpdateMessageEvent | 1 | ✅ DONE |
| UserRemoveMessageEvent | 1 | ✅ DONE |
| SlideObjectBundleMessageEvent | 1 | ✅ DONE |
| ObjectDataUpdateMessageEvent | 1 | ✅ DONE |
| HeightMapUpdateMessageEvent | 1 | ✅ DONE |
| ObjectDataUpdateMessageParser | 1 | ✅ DONE |
| HeightMapUpdateMessageParser | 1 | ✅ DONE |
| **Core Handler** | | |
| RoomMessageHandler | 1 | ✅ DONE |
| IRoomCreator | 1 | ✅ DONE |

---

## Summary

| Category | Count | Description                                                                   |
|----------|-------|-------------------------------------------------------------------------------|
| ENGINE   | 313   | Room engine, objects, logic, visualization, rendering, data, events, messages |
| VIEW     | 0     | No UI dialogs in this folder - all is engine code                             |

**Note**: The entire `habbo/room/` folder is ENGINE code. It contains the core room rendering engine, object management, furniture logic, avatar visualization, and tile/wall rendering. There are no UI dialogs in this folder - those are in `habbo/widget/` instead.

---

## ENGINE FILES (We Need These)

### Root Level Files (7 files)

Core room engine orchestration and interfaces.

| AS3 File                    | Purpose                                                                 | Status |
|-----------------------------|-------------------------------------------------------------------------|--------|
| `RoomEngine.as`             | Main room engine component - manages rooms, objects, rendering, updates | TODO   |
| `IRoomEngine.as`            | Interface defining room engine capabilities                             | ✅ DONE |
| `IRoomEngineServices.as`    | Services interface for room engine                                      | TODO   |
| `RoomMessageHandler.as`     | Handles all incoming server messages for rooms                          | TODO   |
| `RoomObjectEventHandler.as` | Processes room object events (clicks, hover, etc.)                      | TODO   |
| `RoomObjectFactory.as`      | Factory for creating room object logic instances                        | ✅ DONE |
| `RoomContentLoader.as`      | Loads furniture, pet, and room assets dynamically                       | ✅ DONE (stub) |
| `RoomVariableEnum.as`       | Constants for room-level variables                                      | ✅ DONE |
| `AssetCallbackInfo.as`      | Asset loading callback information                                      | TODO   |
| `PetColorResult.as`         | Pet color calculation result data                                       | TODO   |
| `class_3499.as`             | Image result data class                                                 | TODO   |
| `class_3634.as`             | Unknown room utility class                                              | TODO   |

### Interfaces (9 files)

Core abstractions for room system.

| AS3 File                       | Purpose                                | Status |
|--------------------------------|----------------------------------------|--------|
| `IGetImageListener.as`         | Listener for image retrieval callbacks | TODO   |
| `IRoomAreaSelectionManager.as` | Interface for room area selection      | TODO   |
| `IRoomContentListener.as`      | Listener for content loading events    | TODO   |
| `IRoomCreator.as`              | Interface for room creation            | TODO   |
| `IRoomEngine.as`               | Main room engine interface             | ✅ DONE |
| `IRoomEngineServices.as`       | Room engine services interface         | TODO   |
| `IRoomObjectCreator.as`        | Interface for object creation          | TODO   |
| `ISelectedRoomObjectData.as`   | Interface for selected object data     | TODO   |
| `IStuffData.as`                | Interface for furniture data           | ✅ DONE |

### enum/ (1 file)

Enumeration types for room objects.

| AS3 File                       | Purpose                                               | Status |
|--------------------------------|-------------------------------------------------------|--------|
| `RoomObjectPlacementSource.as` | Enum for placement sources (inventory, catalog, etc.) | TODO   |

---

### events/ (31 files)

Room engine events - internal communication between room components.

| AS3 File                                 | Purpose                             | Status |
|------------------------------------------|-------------------------------------|--------|
| `RoomEngineAreaHideStateWidgetEvent.as`  | Area hide state widget event        | TODO   |
| `RoomEngineDimmerStateEvent.as`          | Room dimmer state change event      | TODO   |
| `RoomEngineDragWithMouseEvent.as`        | Mouse drag event in room            | TODO   |
| `RoomEngineEvent.as`                     | Base room engine event class        | TODO   |
| `RoomEngineHSLColorEnableEvent.as`       | HSL color enable event              | TODO   |
| `RoomEngineObjectEvent.as`               | Object-related engine event         | TODO   |
| `RoomEngineObjectPlacedEvent.as`         | Object placement completed event    | TODO   |
| `RoomEngineObjectPlacedOnUserEvent.as`   | Object placed on user event         | TODO   |
| `RoomEngineObjectPlaySoundEvent.as`      | Object sound playback event         | TODO   |
| `RoomEngineObjectSamplePlaybackEvent.as` | Sample playback event               | TODO   |
| `RoomEngineRoomAdEvent.as`               | Room advertisement event            | TODO   |
| `RoomEngineRoomColorEvent.as`            | Room color change event             | TODO   |
| `RoomEngineSoundMachineEvent.as`         | Sound machine event                 | TODO   |
| `RoomEngineToWidgetEvent.as`             | Event from engine to widget         | TODO   |
| `RoomEngineUseProductEvent.as`           | Use product event                   | TODO   |
| `RoomEngineZoomEvent.as`                 | Room zoom event                     | TODO   |
| `RoomObjectBadgeAssetEvent.as`           | Badge asset request event           | TODO   |
| `RoomObjectDataRequestEvent.as`          | Object data request event           | TODO   |
| `RoomObjectDimmerStateUpdateEvent.as`    | Dimmer state update event           | TODO   |
| `RoomObjectFloorHoleEvent.as`            | Floor hole add/remove event         | TODO   |
| `RoomObjectFurnitureActionEvent.as`      | Furniture action event              | TODO   |
| `RoomObjectHSLColorEnableEvent.as`       | HSL color enable for object         | TODO   |
| `RoomObjectMoveEvent.as`                 | Object movement event               | ✅ DONE |
| `RoomObjectPlaySoundIdEvent.as`          | Play sound by ID event              | TODO   |
| `RoomObjectRoomAdEvent.as`               | Room ad interaction event           | TODO   |
| `RoomObjectSamplePlaybackEvent.as`       | Sample playback for object          | TODO   |
| `RoomObjectStateChangeEvent.as`          | Object state change event           | TODO   |
| `RoomObjectTileMouseEvent.as`            | Tile mouse interaction event        | TODO   |
| `RoomObjectWallMouseEvent.as`            | Wall mouse interaction event        | TODO   |
| `RoomObjectWidgetRequestEvent.as`        | Widget request event (open dialogs) | TODO   |
| `RoomToObjectOwnAvatarMoveEvent.as`      | Own avatar movement event           | TODO   |

---

### messages/ (40 files)

Room object update messages - data transfer for object updates.

| AS3 File                                        | Purpose                    | Status |
|-------------------------------------------------|----------------------------|--------|
| `RoomObjectAvatarCarryObjectUpdateMessage.as`   | Avatar carry object update | TODO   |
| `RoomObjectAvatarChatUpdateMessage.as`          | Avatar chat state update   | TODO   |
| `RoomObjectAvatarDanceUpdateMessage.as`         | Avatar dance state update  | TODO   |
| `RoomObjectAvatarDirectionUpdateMessage.as`     | Avatar direction update    | TODO   |
| `RoomObjectAvatarEffectUpdateMessage.as`        | Avatar effect update       | TODO   |
| `RoomObjectAvatarExperienceUpdateMessage.as`    | Avatar experience gain     | TODO   |
| `RoomObjectAvatarExpressionUpdateMessage.as`    | Avatar expression update   | TODO   |
| `RoomObjectAvatarFigureUpdateMessage.as`        | Avatar figure update       | TODO   |
| `RoomObjectAvatarFlatControlUpdateMessage.as`   | Flat control level update  | TODO   |
| `RoomObjectAvatarGestureUpdateMessage.as`       | Avatar gesture update      | TODO   |
| `RoomObjectAvatarGuideStatusUpdateMessage.as`   | Guide status update        | TODO   |
| `RoomObjectAvatarMutedUpdateMessage.as`         | Avatar muted state update  | TODO   |
| `RoomObjectAvatarOwnMessage.as`                 | Own avatar marker          | TODO   |
| `RoomObjectAvatarPetGestureUpdateMessage.as`    | Pet gesture update         | TODO   |
| `RoomObjectAvatarPlayerValueUpdateMessage.as`   | Player value update        | TODO   |
| `RoomObjectAvatarPlayingGameMessage.as`         | Playing game state         | TODO   |
| `RoomObjectAvatarPostureUpdateMessage.as`       | Avatar posture update      | TODO   |
| `RoomObjectAvatarSelectedMessage.as`            | Avatar selection message   | TODO   |
| `RoomObjectAvatarSignUpdateMessage.as`          | Avatar sign update         | TODO   |
| `RoomObjectAvatarSleepUpdateMessage.as`         | Avatar sleep state         | TODO   |
| `RoomObjectAvatarTypingUpdateMessage.as`        | Avatar typing indicator    | TODO   |
| `RoomObjectAvatarUpdateMessage.as`              | General avatar update      | TODO   |
| `RoomObjectAvatarUseObjectUpdateMessage.as`     | Avatar using object        | TODO   |
| `RoomObjectDataUpdateMessage.as`                | Object data update         | ✅ DONE |
| `RoomObjectGroupBadgeUpdateMessage.as`          | Group badge update         | TODO   |
| `RoomObjectHeightUpdateMessage.as`              | Object height update       | ✅ DONE |
| `RoomObjectItemDataUpdateMessage.as`            | Item data update           | TODO   |
| `RoomObjectModelDataUpdateMessage.as`           | Model data update          | TODO   |
| `RoomObjectMoveUpdateMessage.as`                | Object movement update     | ✅ DONE |
| `RoomObjectRoomAdUpdateMessage.as`              | Room ad update             | TODO   |
| `RoomObjectRoomColorUpdateMessage.as`           | Room color update          | TODO   |
| `RoomObjectRoomFloorHoleUpdateMessage.as`       | Floor hole update          | TODO   |
| `RoomObjectRoomMaskUpdateMessage.as`            | Room mask update           | TODO   |
| `RoomObjectRoomPlanePropertyUpdateMessage.as`   | Plane property update      | TODO   |
| `RoomObjectRoomPlaneVisibilityUpdateMessage.as` | Plane visibility update    | TODO   |
| `RoomObjectRoomUpdateMessage.as`                | General room update        | TODO   |
| `RoomObjectSelectedMessage.as`                  | Object selection message   | TODO   |
| `RoomObjectTileCursorUpdateMessage.as`          | Tile cursor update         | TODO   |
| `RoomObjectUpdateStateMessage.as`               | Object state update        | ✅ DONE |
| `RoomObjectVisibilityUpdateMessage.as`          | Object visibility update   | TODO   |

---

### object/ (16 files)

Room object core types, enums, and parsers.

| AS3 File                            | Purpose                                                 | Status |
|-------------------------------------|---------------------------------------------------------|--------|
| `RoomFloorHole.as`                  | Floor hole data structure                               | TODO   |
| `RoomObjectCategoryEnum.as`         | Object category constants (room, furniture, user, etc.) | ✅ DONE |
| `RoomObjectLogicEnum.as`            | Logic type constants                                    | ✅ DONE |
| `RoomObjectOperationEnum.as`        | Operation type constants                                | TODO   |
| `RoomObjectTypeEnum.as`             | Object type constants                                   | ✅ DONE |
| `RoomObjectUserTypes.as`            | User type constants (user, pet, bot)                    | ✅ DONE |
| `RoomObjectVariableEnum.as`         | Object variable name constants                          | ✅ DONE |
| `RoomObjectVisualizationEnum.as`    | Visualization type constants                            | TODO   |
| `RoomObjectVisualizationFactory.as` | Factory for creating visualizations                     | TODO   |
| `RoomPlaneBitmapMaskData.as`        | Plane bitmap mask data                                  | TODO   |
| `RoomPlaneBitmapMaskParser.as`      | Parser for plane bitmap masks                           | TODO   |
| `RoomPlaneData.as`                  | Room plane data structure                               | TODO   |
| `RoomPlaneMaskData.as`              | Plane mask data                                         | TODO   |
| `RoomPlaneParser.as`                | Parser for room planes from XML                         | TODO   |
| `RoomWallData.as`                   | Wall data structure                                     | TODO   |

---

### object/data/ (13 files)

Furniture data types (StuffData variants).

| AS3 File                  | Purpose                            | Status |
|---------------------------|------------------------------------|--------|
| `StuffDataBase.as`        | Base class for furniture data      | ✅ DONE |
| `LegacyStuffData.as`      | Legacy string-based furniture data | ✅ DONE |
| `MapStuffData.as`         | Key-value map furniture data       | ✅ DONE |
| `StringArrayStuffData.as` | String array furniture data        | ✅ DONE |
| `IntArrayStuffData.as`    | Integer array furniture data       | ✅ DONE |
| `HighScoreStuffData.as`   | High score furniture data          | ✅ DONE |
| `HighScoreData.as`        | High score entry data              | ✅ DONE (in HighScoreStuffData) |
| `CrackableStuffData.as`   | Crackable furniture data           | ✅ DONE |
| `EmptyStuffData.as`       | Empty furniture data               | ✅ DONE |
| `VoteResultStuffData.as`  | Vote result furniture data         | ✅ DONE |
| `class_1697.as`           | StuffData factory                  | ✅ DONE (StuffDataFactory) |
| `class_1776.as`           | Unknown data class                 | TODO   |
| `class_1778.as`           | Unknown data class                 | TODO   |

---

### object/logic/ (4 files)

Base object logic classes.

| AS3 File               | Purpose                                       | Status |
|------------------------|-----------------------------------------------|--------|
| `MovingObjectLogic.as` | Base class for moving objects (interpolation) | ✅ DONE |
| `AvatarLogic.as`       | Avatar behavior logic (user/bot/pet base)     | TODO   |
| `PetLogic.as`          | Pet-specific behavior logic                   | TODO   |

---

### object/logic/furniture/ (66 files)

Furniture behavior logic classes.

| AS3 File                                | Purpose                         | Status |
|-----------------------------------------|---------------------------------|--------|
| `FurnitureLogic.as`                     | Base furniture logic            | TODO   |
| `FurnitureMultiStateLogic.as`           | Multi-state furniture           | TODO   |
| `FurnitureMultiHeightLogic.as`          | Multi-height furniture          | TODO   |
| `FurniturePlaceholderLogic.as`          | Placeholder furniture           | TODO   |
| `FurnitureCreditLogic.as`               | Credit furniture                | TODO   |
| `FurnitureStickieLogic.as`              | Sticky note logic               | TODO   |
| `FurniturePresentLogic.as`              | Present/gift logic              | TODO   |
| `FurnitureTrophyLogic.as`               | Trophy logic                    | TODO   |
| `FurnitureEcotronBoxLogic.as`           | Ecotron box logic               | TODO   |
| `FurnitureDiceLogic.as`                 | Dice logic                      | TODO   |
| `FurnitureHockeyScoreLogic.as`          | Hockey score board logic        | TODO   |
| `FurnitureHabboWheelLogic.as`           | Habbo wheel logic               | TODO   |
| `FurnitureOneWayDoorLogic.as`           | One-way door logic              | TODO   |
| `FurniturePlanetSystemLogic.as`         | Planet system logic             | TODO   |
| `FurnitureRoomDimmerLogic.as`           | Room dimmer logic               | TODO   |
| `FurnitureSoundMachineLogic.as`         | Sound machine logic             | TODO   |
| `FurnitureJukeboxLogic.as`              | Jukebox logic                   | TODO   |
| `FurnitureSongDiskLogic.as`             | Song disk logic                 | TODO   |
| `FurniturePushableLogic.as`             | Pushable furniture logic        | TODO   |
| `FurnitureClothingChangeLogic.as`       | Clothing change logic           | TODO   |
| `FurnitureFireworksLogic.as`            | Fireworks logic                 | TODO   |
| `FurnitureRoomBillboardLogic.as`        | Room billboard logic            | TODO   |
| `FurnitureRoomBackgroundLogic.as`       | Room background logic           | TODO   |
| `FurnitureWelcomeGiftLogic.as`          | Welcome gift logic              | TODO   |
| `FurnitureMannequinLogic.as`            | Mannequin logic                 | TODO   |
| `FurnitureGuildCustomizedLogic.as`      | Guild customized furniture      | TODO   |
| `FurniturePetProductLogic.as`           | Pet product logic               | TODO   |
| `FurnitureCuckooClockLogic.as`          | Cuckoo clock logic              | TODO   |
| `FurnitureRandomStateLogic.as`          | Random state furniture          | TODO   |
| `FurnitureExternalImageLogic.as`        | External image furniture        | TODO   |
| `FurnitureRoomBrandingLogic.as`         | Room branding logic             | TODO   |
| `FurnitureAreaHideLogic.as`             | Area hide furniture logic       | TODO   |
| `FurnitureMysteryTrophyLogic.as`        | Mystery trophy logic            | TODO   |
| `FurnitureEditableInternalLinkLogic.as` | Editable internal link          | TODO   |
| `FurnitureEditableRoomLinkLogic.as`     | Editable room link              | TODO   |
| `class_3382.as`                         | Purchasable clothing logic      | TODO   |
| `class_3391.as`                         | Effect box logic                | TODO   |
| `class_3392.as`                         | Mystery box logic               | TODO   |
| `class_3399.as`                         | Crackable furniture logic       | TODO   |
| `class_3406.as`                         | Group forum terminal logic      | TODO   |
| `class_3407.as`                         | Badge display logic             | TODO   |
| `class_3408.as`                         | Achievement resolution logic    | TODO   |
| `class_3415.as`                         | Unknown furniture logic         | TODO   |
| `class_3416.as`                         | Wild west wanted poster logic   | TODO   |
| `class_3432.as`                         | High score display logic        | TODO   |
| `class_3434.as`                         | Custom stack height logic       | TODO   |
| `class_3435.as`                         | Window furniture logic          | TODO   |
| `class_3436.as`                         | Monsterplant seed logic         | TODO   |
| `class_3444.as`                         | Internal link logic             | TODO   |
| `class_3451.as`                         | Sound block logic               | TODO   |
| `class_3454.as`                         | Random teleport logic           | TODO   |
| `class_3457.as`                         | Background color logic          | TODO   |
| `class_3462.as`                         | Vimeo furniture logic           | TODO   |
| `class_3464.as`                         | Lovelock logic                  | TODO   |
| `class_3465.as`                         | Vote majority logic             | TODO   |
| `class_3469.as`                         | Crafting gizmo logic            | TODO   |
| `class_3475.as`                         | ES furniture logic              | TODO   |
| `class_3485.as`                         | Floor hole logic                | TODO   |
| `class_3486.as`                         | Vote counter logic              | TODO   |
| `class_3497.as`                         | Counter clock logic             | TODO   |
| `class_3504.as`                         | Change state when step on logic | TODO   |
| `class_3506.as`                         | Rentable space logic            | TODO   |
| `class_3509.as`                         | Score furniture logic           | TODO   |
| `class_3512.as`                         | YouTube furniture logic         | TODO   |
| `class_3516.as`                         | Halloween lovelock logic        | TODO   |

---

### object/logic/game/ (2 files)

Game-specific object logic.

| AS3 File           | Purpose                   | Status |
|--------------------|---------------------------|--------|
| `SnowballLogic.as` | Snowball projectile logic | TODO   |
| `class_3396.as`    | Snow splash logic         | TODO   |

---

### object/logic/room/ (3 files)

Room-level object logic.

| AS3 File                 | Purpose                                    | Status |
|--------------------------|--------------------------------------------|--------|
| `RoomLogic.as`           | Main room logic (floor/wall planes, masks) | TODO   |
| `RoomTileCursorLogic.as` | Tile cursor logic                          | TODO   |
| `SelectionArrowLogic.as` | Selection arrow logic                      | TODO   |

---

### object/visualization/avatar/ (2 files)

Avatar visualization.

| AS3 File                     | Purpose                   | Status |
|------------------------------|---------------------------|--------|
| `AvatarVisualization.as`     | Avatar sprite rendering   | TODO   |
| `AvatarVisualizationData.as` | Avatar visualization data | TODO   |

---

### object/visualization/avatar/additions/ (12 files)

Avatar visual additions (bubbles, effects).

| AS3 File                 | Purpose                       | Status |
|--------------------------|-------------------------------|--------|
| `ExpressionAddition.as`  | Expression animation addition | TODO   |
| `FloatingHeart.as`       | Floating heart effect         | TODO   |
| `FloatingIdleZ.as`       | Floating Z (sleep) indicator  | TODO   |
| `GameClickTarget.as`     | Game click target indicator   | TODO   |
| `GuideStatusBubble.as`   | Guide status bubble           | TODO   |
| `IExpressionAddition.as` | Expression addition interface | TODO   |
| `MutedBubble.as`         | Muted indicator bubble        | TODO   |
| `NumberBubble.as`        | Number bubble (game values)   | TODO   |
| `TypingBubble.as`        | Typing indicator bubble       | TODO   |
| `class_3545.as`          | Unknown addition              | TODO   |
| `class_3649.as`          | Unknown addition              | TODO   |

---

### object/visualization/data/ (13 files)

Visualization data structures.

| AS3 File                           | Purpose                  | Status |
|------------------------------------|--------------------------|--------|
| `AnimationData.as`                 | Animation data container | TODO   |
| `AnimationFrame.as`                | Single animation frame   | TODO   |
| `AnimationFrameData.as`            | Animation frame data     | TODO   |
| `AnimationFrameDirectionalData.as` | Directional frame data   | TODO   |
| `AnimationFrameSequenceData.as`    | Frame sequence data      | TODO   |
| `AnimationLayerData.as`            | Animation layer data     | TODO   |
| `AnimationSizeData.as`             | Animation size data      | TODO   |
| `AnimationStateData.as`            | Animation state data     | TODO   |
| `ColorData.as`                     | Color data for layers    | TODO   |
| `DirectionData.as`                 | Direction data           | TODO   |
| `ExtraDataManager.as`              | Extra data management    | TODO   |
| `SizeData.as`                      | Size-specific data       | TODO   |
| `class_3534.as`                    | Unknown data class       | TODO   |
| `class_3646.as`                    | Unknown data class       | TODO   |

---

### object/visualization/furniture/ (44 files)

Furniture visualization classes.

| AS3 File                                            | Purpose                          | Status |
|-----------------------------------------------------|----------------------------------|--------|
| `FurnitureVisualization.as`                         | Base furniture visualization     | TODO   |
| `FurnitureVisualizationData.as`                     | Furniture visualization data     | TODO   |
| `AnimatedFurnitureVisualization.as`                 | Animated furniture rendering     | TODO   |
| `AnimatedFurnitureVisualizationData.as`             | Animated furniture data          | TODO   |
| `AvatarFurnitureVisualizationData.as`               | Avatar-based furniture data      | TODO   |
| `FurnitureBottleVisualization.as`                   | Bottle visualization             | TODO   |
| `FurnitureBuilderPlaceholderVisualization.as`       | Builder placeholder              | TODO   |
| `FurnitureCuboidVisualization.as`                   | Cuboid furniture                 | TODO   |
| `FurnitureExternalImageVisualization.as`            | External image furniture         | TODO   |
| `FurnitureFireworksVisualization.as`                | Fireworks visualization          | TODO   |
| `FurnitureGiftWrappedFireworksVisualization.as`     | Gift wrapped fireworks           | TODO   |
| `FurnitureGiftWrappedVisualization.as`              | Gift wrapped visualization       | TODO   |
| `FurnitureHabboWheelVisualization.as`               | Habbo wheel visualization        | TODO   |
| `FurnitureMannequinVisualization.as`                | Mannequin visualization          | TODO   |
| `FurnitureParticleSystem.as`                        | Particle system base             | TODO   |
| `FurnitureParticleSystemEmitter.as`                 | Particle emitter                 | TODO   |
| `FurnitureParticleSystemParticle.as`                | Single particle                  | TODO   |
| `FurniturePartyBeamerVisualization.as`              | Party beamer visualization       | TODO   |
| `FurniturePlane.as`                                 | Furniture plane                  | TODO   |
| `FurniturePlanetSystemVisualization.as`             | Planet system visualization      | TODO   |
| `FurniturePlanetSystemVisualizationPlanetObject.as` | Planet object                    | TODO   |
| `FurniturePosterVisualization.as`                   | Poster visualization             | TODO   |
| `FurnitureQueueTileVisualization.as`                | Queue tile visualization         | TODO   |
| `FurnitureRoomBackgroundVisualization.as`           | Room background visualization    | TODO   |
| `FurnitureRoomBillboardVisualization.as`            | Room billboard visualization     | TODO   |
| `FurnitureRoomBrandingVisualization.as`             | Room branding visualization      | TODO   |
| `FurnitureStickieVisualization.as`                  | Sticky note visualization        | TODO   |
| `FurnitureValRandomizerVisualization.as`            | Valentine randomizer             | TODO   |
| `FurnitureWaterAreaVisualization.as`                | Water area visualization         | TODO   |
| `ShoreMaskCreatorUtility.as`                        | Shore mask utility               | TODO   |
| `class_3379.as`                                     | Soundblock visualization         | TODO   |
| `class_3389.as`                                     | Unknown visualization            | TODO   |
| `class_3390.as`                                     | Guild isometric badge            | TODO   |
| `class_3395.as`                                     | Badge display visualization      | TODO   |
| `class_3426.as`                                     | Vote majority visualization      | TODO   |
| `class_3449.as`                                     | Score board visualization        | TODO   |
| `class_3450.as`                                     | Resetting animated visualization | TODO   |
| `class_3461.as`                                     | Guild customized visualization   | TODO   |
| `class_3470.as`                                     | Vote counter visualization       | TODO   |
| `class_3476.as`                                     | Counter clock visualization      | TODO   |
| `class_3480.as`                                     | Game object visualization data   | TODO   |
| `class_3495.as`                                     | Unknown visualization            | TODO   |
| `class_3496.as`                                     | YouTube visualization            | TODO   |

---

### object/visualization/game/ (2 files)

Game-specific visualizations.

| AS3 File                     | Purpose                   | Status |
|------------------------------|---------------------------|--------|
| `SnowballVisualization.as`   | Snowball visualization    | TODO   |
| `SnowSplashVisualization.as` | Snow splash visualization | TODO   |

---

### object/visualization/pet/ (4 files)

Pet visualization classes.

| AS3 File                          | Purpose                 | Status |
|-----------------------------------|-------------------------|--------|
| `AnimatedPetVisualization.as`     | Pet sprite rendering    | TODO   |
| `AnimatedPetVisualizationData.as` | Pet visualization data  | TODO   |
| `ExperienceData.as`               | Pet experience data     | TODO   |
| `PetAnimationSizeData.as`         | Pet animation size data | TODO   |

---

### object/visualization/room/ (8 files)

Room visualization classes.

| AS3 File                     | Purpose                                         | Status |
|------------------------------|-------------------------------------------------|--------|
| `RoomVisualization.as`       | Main room rendering (floors, walls, landscapes) | TODO   |
| `RoomVisualizationData.as`   | Room visualization data                         | TODO   |
| `RoomPlane.as`               | Room plane rendering                            | TODO   |
| `RoomPlaneBitmapMask.as`     | Plane bitmap mask                               | TODO   |
| `RoomPlaneRectangleMask.as`  | Plane rectangle mask                            | TODO   |
| `PlaneDrawingData.as`        | Plane drawing data                              | TODO   |
| `TileCursorVisualization.as` | Tile cursor visualization                       | TODO   |

---

### object/visualization/room/mask/ (4 files)

Room plane masking system.

| AS3 File                    | Purpose                  | Status |
|-----------------------------|--------------------------|--------|
| `PlaneMask.as`              | Plane mask container     | TODO   |
| `PlaneMaskBitmap.as`        | Plane mask bitmap        | TODO   |
| `PlaneMaskManager.as`       | Plane mask manager       | TODO   |
| `PlaneMaskVisualization.as` | Plane mask visualization | TODO   |

---

### object/visualization/room/rasterizer/basic/ (15 files)

Basic plane rasterization.

| AS3 File                     | Purpose                   | Status |
|------------------------------|---------------------------|--------|
| `Plane.as`                   | Base plane class          | TODO   |
| `FloorPlane.as`              | Floor plane               | TODO   |
| `WallPlane.as`               | Wall plane                | TODO   |
| `FloorRasterizer.as`         | Floor rasterization       | TODO   |
| `WallRasterizer.as`          | Wall rasterization        | TODO   |
| `WallAdRasterizer.as`        | Wall ad rasterization     | TODO   |
| `PlaneRasterizer.as`         | Base plane rasterizer     | TODO   |
| `PlaneMaterial.as`           | Plane material            | TODO   |
| `PlaneMaterialCell.as`       | Material cell             | TODO   |
| `PlaneMaterialCellColumn.as` | Material cell column      | TODO   |
| `PlaneMaterialCellMatrix.as` | Material cell matrix      | TODO   |
| `PlaneTexture.as`            | Plane texture             | TODO   |
| `PlaneTextureBitmap.as`      | Texture bitmap            | TODO   |
| `PlaneVisualization.as`      | Plane visualization       | TODO   |
| `PlaneVisualizationLayer.as` | Plane visualization layer | TODO   |

---

### object/visualization/room/rasterizer/animated/ (4 files)

Animated plane rasterization (landscapes).

| AS3 File                              | Purpose                 | Status |
|---------------------------------------|-------------------------|--------|
| `LandscapeRasterizer.as`              | Landscape rasterization | TODO   |
| `AnimationItem.as`                    | Animation item          | TODO   |
| `PlaneVisualizationAnimationLayer.as` | Animated plane layer    | TODO   |
| `class_3787.as`                       | Unknown animated class  | TODO   |

---

### object/visualization/room/rasterizer/ (1 file)

| AS3 File        | Purpose                  | Status |
|-----------------|--------------------------|--------|
| `class_3625.as` | Unknown rasterizer class | TODO   |

---

### object/visualization/room/utils/ (2 files)

Room visualization utilities.

| AS3 File             | Purpose               | Status |
|----------------------|-----------------------|--------|
| `PlaneBitmapData.as` | Plane bitmap data     | TODO   |
| `Randomizer.as`      | Randomization utility | TODO   |

---

### preview/ (1 file)

Room preview system.

| AS3 File           | Purpose                            | Status |
|--------------------|------------------------------------|--------|
| `RoomPreviewer.as` | Preview room for catalog/inventory | TODO   |

---

### utils/ (11 files)

Room utility classes.

| AS3 File                      | Purpose                            | Status |
|-------------------------------|------------------------------------|--------|
| `RoomAreaSelectionManager.as` | Area selection for wired/area hide | TODO   |
| `class_1769.as`               | Unknown utility                    | TODO   |
| `class_3344.as`               | Room instance data                 | TODO   |
| `class_3355.as`               | Unknown utility                    | TODO   |
| `class_3373.as`               | Legacy geometry                    | TODO   |
| `class_3413.as`               | Unknown utility                    | TODO   |
| `class_3419.as`               | Furniture stacking height map      | TODO   |
| `class_3467.as`               | Unknown utility                    | TODO   |
| `class_3498.as`               | Unknown utility                    | TODO   |
| `class_3500.as`               | Unknown utility                    | TODO   |
| `class_3513.as`               | Unknown utility                    | TODO   |

---

## Core Room Infrastructure (src/room/)

These files are in `src/room/` (not habbo-specific).

| File | Purpose | Status |
|------|---------|--------|
| `IRoomInstance.ts` | Room instance interface | ✅ DONE |
| `RoomInstance.ts` | Room instance implementation | ✅ DONE |
| `IRoomObjectManager.ts` | Object manager interface | ✅ DONE |
| `RoomObjectManager.ts` | Object manager implementation | ✅ DONE |
| `IRoomObjectFactory.ts` | Factory interface | ✅ DONE |
| `IRoomInstanceContainer.ts` | Container interface | ✅ DONE |
| `IRoomContentLoader.ts` | Content loader interface | ✅ DONE |
| **utils/** | | |
| `IVector3d.ts` | 3D vector interface | ✅ DONE |
| `Vector3d.ts` | 3D vector implementation | ✅ DONE |
| `IRoomGeometry.ts` | Geometry interface | ✅ DONE |
| `RoomGeometry.ts` | Isometric projection | ✅ DONE |
| `ColorConverter.ts` | Color utilities | ✅ DONE |
| **object/** | | |
| `IRoomObject.ts` | Room object interface | ✅ DONE |
| `IRoomObjectController.ts` | Controller interface | ✅ DONE |
| `RoomObject.ts` | Room object implementation | ✅ DONE |
| `IRoomObjectModel.ts` | Model interface (read) | ✅ DONE |
| `IRoomObjectModelController.ts` | Model interface (write) | ✅ DONE |
| `RoomObjectModel.ts` | Model implementation | ✅ DONE |
| **object/logic/** | | |
| `IRoomObjectEventHandler.ts` | Event handler interface | ✅ DONE |
| `IRoomObjectMouseHandler.ts` | Mouse handler interface | ✅ DONE |
| `ObjectLogicBase.ts` | Base logic class | ✅ DONE |
| **events/** | | |
| `RoomObjectEvent.ts` | Base object event | ✅ DONE |
| `RoomSpriteMouseEvent.ts` | Mouse event | ✅ DONE |
| **messages/** | | |
| `RoomObjectUpdateMessage.ts` | Base update message | ✅ DONE |

---

## VIEW FILES (We Ignore These)

**None** - All files in `habbo/room/` are ENGINE code.

UI dialogs for room interactions are located in:
- `habbo/widget/` - Room widgets (furniture info, avatar info, etc.)
- `habbo/widget/furniture/` - Furniture-specific dialogs

---

## Architecture Overview

### Core Components

1. **RoomEngine** - Central orchestrator
   - Manages room instances
   - Coordinates rendering
   - Handles object creation/disposal
   - Processes input events

2. **RoomMessageHandler** - Server communication
   - Receives server packets
   - Updates room state
   - Translates to internal messages

3. **RoomObjectEventHandler** - Event processing
   - Handles mouse events
   - Processes object interactions
   - Routes to appropriate handlers

4. **RoomObjectFactory** - Logic creation
   - Creates object logic instances
   - Maps type strings to classes

5. **RoomObjectVisualizationFactory** - Visualization creation
   - Creates visualization instances
   - Manages visualization data cache

6. **RoomContentLoader** - Asset management
   - Loads furniture SWF assets
   - Manages pet assets
   - Handles placeholder content

### Object System

```
IRoomObject
    |
    +-- Logic (behavior)
    |       |-- MovingObjectLogic
    |       |       |-- AvatarLogic
    |       |       |-- FurnitureLogic
    |       |               |-- [Specific furniture logic]
    |       |-- RoomLogic
    |
    +-- Visualization (rendering)
            |-- RoomVisualization
            |-- AvatarVisualization
            |-- FurnitureVisualization
            |       |-- AnimatedFurnitureVisualization
            |-- AnimatedPetVisualization
```

### Data Flow

```
Server Message
    |
    v
RoomMessageHandler
    |
    v
RoomEngine (update objects)
    |
    v
Object Logic (process message)
    |
    v
Object Model (state update)
    |
    v
Visualization (render)
```

### Key Interfaces

- `IRoomEngine` - Main room engine interface
- `IStuffData` - Furniture data interface
- `IRoomContentListener` - Content loading callbacks
- `IRoomAreaSelectionManager` - Area selection interface

---

## Migration Priority

### High Priority (Core)
1. RoomEngine, IRoomEngine
2. RoomPlaneParser, RoomVisualization
3. MovingObjectLogic, FurnitureLogic
4. RoomObjectFactory, RoomObjectVisualizationFactory

### Medium Priority (Objects)
1. All furniture logic classes
2. All furniture visualization classes
3. Avatar/Pet visualization
4. StuffData classes

### Lower Priority (Support)
1. Event classes
2. Message classes
3. Utility classes
