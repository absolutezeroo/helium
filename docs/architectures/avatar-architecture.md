# Avatar System Architecture

This document analyzes all files in `source_as/habbo/avatar/` and categorizes them as ENGINE (core rendering/data logic) or VIEW (UI components for the Avatar Editor).

## Overview

The Avatar system is unique - most of its code is ENGINE because it handles avatar rendering, 3D geometry, animation data, and figure composition. The VIEW components are specifically the Avatar Editor UI dialogs and controls.

**Key Distinction:**
- **ENGINE**: Avatar rendering, 3D transformations, figure data, animation system, asset management, pet data
- **VIEW**: Avatar Editor UI - windows, dialogs, tabs, grids for customizing avatars

---

## ENGINE Files (Core Avatar Rendering System)

These files contain the business logic, data models, and rendering systems needed for avatar display.

### Root Level - Core Components

| File                              | Class/Purpose                                                                                 |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| `AvatarImage.as`                  | Core avatar image rendering - handles actions, directions, frame rendering, bitmap generation |
| `AvatarStructure.as`              | Main coordinator - initializes geometry, actions, animations, figure data from XML            |
| `AvatarFigureContainer.as`        | Parses figure strings (e.g., "hr-893-45.hd-180-2") into part/color data                       |
| `AvatarImageBodyPartContainer.as` | Stores body part rendering data with position offsets and assets                              |
| `AvatarImagePartContainer.as`     | Individual part container with sprite/color data                                              |
| `class_1808.as`                   | IAvatarRenderManager implementation - main render manager component                           |
| `class_3374.as`                   | IAvatarImage interface - defines avatar image API                                             |
| `class_3375.as`                   | IAvatarEffect interface                                                                       |
| `class_3405.as`                   | IFigureContainer interface                                                                    |
| `class_3468.as`                   | IAvatarFigureContainer interface                                                              |
| `class_1881.as`                   | IAvatarEffectListener interface                                                               |
| `IAvatarImageListener.as`         | Callback interface for avatar image loading                                                   |
| `IAvatarRenderManager.as`         | Main render manager interface                                                                 |
| `IOutfit.as`                      | Outfit data interface (figure, gender)                                                        |
| `PlaceholderAvatarImage.as`       | Placeholder while avatar assets load                                                          |
| `AvatarAssetDownloadLibrary.as`   | Manages downloading of avatar asset libraries                                                 |
| `AvatarAssetDownloadManager.as`   | Coordinates avatar asset downloading                                                          |
| `EffectAssetDownloadLibrary.as`   | Manages effect asset library downloads                                                        |
| `EffectAssetDownloadManager.as`   | Coordinates effect asset downloading                                                          |

### /actions - Action System

| File                     | Class/Purpose                                             |
|--------------------------|-----------------------------------------------------------|
| `ActionDefinition.as`    | Defines avatar actions with parameters, geometry, offsets |
| `ActionType.as`          | Action type enumeration (stand, walk, gesture, etc.)      |
| `ActiveActionData.as`    | Currently active action state data                        |
| `AvatarActionManager.as` | Manages action definitions, parses action XML             |
| `class_3544.as`          | IActiveActionData interface                               |
| `class_3576.as`          | IActionDefinition interface                               |

### /alias - Asset Aliasing

| File                      | Class/Purpose                                               |
|---------------------------|-------------------------------------------------------------|
| `AssetAlias.as`           | Maps alias names to actual asset names with flip/color info |
| `AssetAliasCollection.as` | Collection of asset aliases, parses manifest XML            |

### /animation - Animation System

| File                        | Class/Purpose                                      |
|-----------------------------|----------------------------------------------------|
| `Animation.as`              | Animation data with layers and frame sequences     |
| `AnimationLayerData.as`     | Layer data within animations (body parts, offsets) |
| `AnimationManager.as`       | Manages avatar animations from XML                 |
| `AvatarDataContainer.as`    | Avatar animation data container                    |
| `SpriteDataContainer.as`    | Sprite data with ink/color info                    |
| `AddDataContainer.as`       | Additional animation data container                |
| `DirectionDataContainer.as` | Direction-specific animation data                  |
| `ISpriteDataContainer.as`   | Sprite data interface                              |
| `class_3372.as`             | IAnimationLayerData interface                      |
| `class_3526.as`             | IAnimation interface                               |
| `class_3557.as`             | ISpriteDirection interface                         |
| `class_3581.as`             | IPartData interface                                |

### /cache - Image Caching

| File                           | Class/Purpose                     |
|--------------------------------|-----------------------------------|
| `AvatarImageCache.as`          | Main avatar image cache           |
| `AvatarImageActionCache.as`    | Caches rendered action images     |
| `AvatarImageBodyPartCache.as`  | Caches body part images           |
| `AvatarImageDirectionCache.as` | Caches direction-specific renders |
| `ImageData.as`                 | Cached image data with offset     |

### /geometry - 3D Mathematics

| File                     | Class/Purpose                                                 |
|--------------------------|---------------------------------------------------------------|
| `AvatarModelGeometry.as` | Main geometry model - body parts, canvas sizes, 3D transforms |
| `AvatarSet.as`           | Defines avatar sets (body part groupings)                     |
| `GeometryBodyPart.as`    | Body part geometry with items and transforms                  |
| `GeometryItem.as`        | Individual geometry item (position, normal, radius)           |
| `Matrix4x4.as`           | 4x4 transformation matrix for 3D rotations                    |
| `Node3D.as`              | 3D node base class with location/transform                    |
| `Vector3D.as`            | 3D vector class for positions/directions                      |

### /structure - Avatar Structure Data

| File                         | Class/Purpose                             |
|------------------------------|-------------------------------------------|
| `AnimationData.as`           | Animation action data, frame counts       |
| `AvatarCanvas.as`            | Canvas size/offset for avatar rendering   |
| `AvatarStructureDownload.as` | Downloads structure XML data              |
| `FigureSetData.as`           | Figure set types and palettes             |
| `PartSetsData.as`            | Part set definitions and active part sets |
| `IStructureData.as`          | Interface for structure data parsing      |
| `class_3360.as`              | IFigureSetData interface                  |

### /structure/animation - Animation Structures

| File                     | Class/Purpose                           |
|--------------------------|-----------------------------------------|
| `AnimationAction.as`     | Animation action with parts and offsets |
| `AnimationActionPart.as` | Part-specific animation frames          |
| `AnimationFrame.as`      | Single animation frame data             |

### /structure/figure - Figure Data Structures

| File               | Class/Purpose                                      |
|--------------------|----------------------------------------------------|
| `FigurePart.as`    | Individual figure part (id, type, color index)     |
| `FigurePartSet.as` | Set of figure parts with gender/club level         |
| `SetType.as`       | Figure set type (hair, shirt, etc.) with part sets |
| `Palette.as`       | Color palette for figure parts                     |
| `PartColor.as`     | Individual color with RGB and color transform      |
| `ISetType.as`      | Set type interface                                 |
| `IPartColor.as`    | Part color interface                               |
| `class_3418.as`    | IFigurePartSet interface                           |
| `class_3445.as`    | IPalette interface                                 |
| `class_3617.as`    | IFigurePart interface                              |

### /structure/parts - Part Definitions

| File                | Class/Purpose                          |
|---------------------|----------------------------------------|
| `ActivePartSet.as`  | Active part set definition             |
| `PartDefinition.as` | Part definition with flip/remove types |

### /pets - Pet Figure Data

| File               | Class/Purpose                               |
|--------------------|---------------------------------------------|
| `PetFigureData.as` | Pet figure string parsing and customization |
| `PetCustomPart.as` | Custom pet part (layer, part, palette IDs)  |
| `class_3580.as`    | Pet type constants (DOG, CAT, LION, etc.)   |

### /enum - Constants and Events

| File                      | Class/Purpose                        |
|---------------------------|--------------------------------------|
| `AvatarDirectionAngle.as` | Direction to angle mapping constants |
| `AvatarFigurePartType.as` | Figure part type constants           |
| `AvatarRenderEvent.as`    | Render ready event constant          |
| `AvatarGuideStatus.as`    | Guide status constants               |

---

## VIEW Files (Avatar Editor UI)

These files contain window/dialog UI components for the Avatar Editor - code to IGNORE for core engine.

### Root Level - Editor Components

| File                            | Class/Purpose                                               |
|---------------------------------|-------------------------------------------------------------|
| `AvatarEditorView.as`           | Main editor window with tabs, save/cancel buttons           |
| `HabboAvatarEditor.as`          | Editor controller - figure data management, UI coordination |
| `HabboAvatarEditorManager.as`   | Editor manager component                                    |
| `AvatarEditorMessageHandler.as` | Network message handling for editor                         |

### /common - Shared Editor UI

| File                           | Class/Purpose                                        |
|--------------------------------|------------------------------------------------------|
| `AvatarEditorGridView.as`      | Grid view for part/color selection                   |
| `AvatarEditorGridPartItem.as`  | Grid item for part selection                         |
| `AvatarEditorGridColorItem.as` | Grid item for color selection                        |
| `CategoryBaseView.as`          | Base view class for category tabs                    |
| `CategoryBaseModel.as`         | Base model for editor categories (mixed ENGINE/VIEW) |
| `CategoryData.as`              | Category data with parts and colors                  |
| `class_3554.as`                | ICategoryModel interface                             |
| `class_3643.as`                | IGridView interface                                  |
| `class_3676.as`                | ICategoryView interface                              |
| `ISideContentModel.as`         | Side content model interface                         |
| `ISideContentView.as`          | Side content view interface                          |
| `TabUtils.as`                  | Tab utility functions                                |

### /effects - Effects Editor

| File                             | Class/Purpose                               |
|----------------------------------|---------------------------------------------|
| `EffectsModel.as`                | Effects selection model                     |
| `EffectsView.as`                 | Effects category view                       |
| `EffectsParamView.as`            | Effects parameter display (duration, timer) |
| `AvatarEditorGridItemEffect.as`  | Effect grid item UI                         |
| `AvatarEditorGridViewEffects.as` | Effects grid view                           |

### /figuredata - Figure Data Editor

| File                | Class/Purpose                                     |
|---------------------|---------------------------------------------------|
| `FigureData.as`     | Editor figure data management (mixed ENGINE/VIEW) |
| `FigureDataView.as` | Figure preview in editor using RoomPreviewer      |

### /generic - Body/Gender Selection

| File           | Class/Purpose                        |
|----------------|--------------------------------------|
| `BodyModel.as` | Body category model (face selection) |
| `BodyView.as`  | Body view with gender tabs           |

### /head - Head Customization

| File           | Class/Purpose                                  |
|----------------|------------------------------------------------|
| `HeadModel.as` | Head category model (hair, hats, accessories)  |
| `HeadView.as`  | Head view with tabs (hair, hat, eyewear, etc.) |

### /torso - Torso Customization

| File            | Class/Purpose                                |
|-----------------|----------------------------------------------|
| `TorsoModel.as` | Torso category model (shirt, jacket, prints) |
| `TorsoView.as`  | Torso view with tabs                         |

### /legs - Legs Customization

| File           | Class/Purpose                             |
|----------------|-------------------------------------------|
| `LegsModel.as` | Legs category model (pants, shoes, belts) |
| `LegsView.as`  | Legs view with tabs                       |

### /hotlooks - Hot Looks Selection

| File               | Class/Purpose                    |
|--------------------|----------------------------------|
| `HotLooksModel.as` | Hot looks outfit selection model |
| `HotLooksView.as`  | Hot looks grid view              |

### /nft - NFT Avatar Selection

| File                 | Class/Purpose             |
|----------------------|---------------------------|
| `NftAvatarsModel.as` | NFT avatar wardrobe model |
| `NftAvatarsView.as`  | NFT avatars grid view     |

### /wardrobe - Wardrobe System

| File               | Class/Purpose                           |
|--------------------|-----------------------------------------|
| `WardrobeModel.as` | Wardrobe slot management model          |
| `WardrobeView.as`  | Wardrobe slots view                     |
| `WardrobeSlot.as`  | Individual wardrobe slot with save/load |
| `Outfit.as`        | Outfit data with preview rendering      |
| `OutfitView.as`    | Outfit preview UI                       |
| `NftOutfit.as`     | NFT outfit with token ID                |

### /view - Additional Views

| File                                        | Class/Purpose                |
|---------------------------------------------|------------------------------|
| `AvatarEditorNameChangeView.as`             | Name change dialog in editor |
| `AvatarEditorNameSuggestionListRenderer.as` | Name suggestion list UI      |

### /enum - Editor Events

| File                   | Class/Purpose          |
|------------------------|------------------------|
| `AvatarEditorEvent.as` | Editor event constants |

---

## Summary Statistics

| Category | File Count | Purpose                                                     |
|----------|------------|-------------------------------------------------------------|
| ENGINE   | ~70 files  | Core avatar rendering, geometry, animation, figure data     |
| VIEW     | ~50 files  | Avatar Editor UI dialogs, grids, tabs, customization panels |

### ENGINE Subdirectories
- `/actions/` - 6 files (action system)
- `/alias/` - 2 files (asset aliasing)
- `/animation/` - 11 files (animation data)
- `/cache/` - 5 files (image caching)
- `/geometry/` - 7 files (3D math)
- `/structure/` - 22 files (figure/animation structures)
- `/pets/` - 3 files (pet data)
- Root ENGINE files - ~15 files

### VIEW Subdirectories
- `/common/` - 11 files (shared editor UI)
- `/effects/` - 5 files (effects editor)
- `/figuredata/` - 2 files (figure editor)
- `/generic/` - 2 files (body editor)
- `/head/` - 2 files (head editor)
- `/torso/` - 2 files (torso editor)
- `/legs/` - 2 files (legs editor)
- `/hotlooks/` - 2 files (hot looks)
- `/nft/` - 2 files (NFT avatars)
- `/wardrobe/` - 6 files (wardrobe)
- `/view/` - 2 files (name change)
- Root VIEW files - 4 files
