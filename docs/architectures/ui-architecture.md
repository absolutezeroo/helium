# UI Architecture Documentation

This document categorizes all AS3 UI files in `source_as/habbo/ui/` into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                       |
|----------|-------|-------------------------------------------------------------------|
| ENGINE   | 95    | Widget handlers, interfaces, events, messages, enums, data models |
| VIEW     | 274   | Widget UI classes, view components, renderers, dialogs            |

---

## Architecture Overview

The Habbo UI system follows a handler-widget-view architecture:
- **Handlers** (`handler/`): Process events and messages, coordinate between engine and UI
- **Widgets** (`widget/*/`): Main widget classes that combine handlers with views
- **Views**: Pure UI rendering (replaced by SolidJS)
- **Events** (`widget/events/`): Internal UI event types
- **Messages** (`widget/messages/`): Command messages from widgets to handlers

---

## ENGINE FILES (We Need These)

### Core Interfaces

| AS3 File                         | Purpose                                                                                  | Status |
|----------------------------------|------------------------------------------------------------------------------------------|--------|
| `IRoomDesktop.as`                | Interface for room desktop - event dispatch, widget access, canvas info                  | TODO   |
| `IRoomUI.as`                     | Public interface for room UI management - desktop creation, widget hiding, canvas access | TODO   |
| `IRoomWidgetFactory.as`          | Factory interface for creating widgets                                                   | TODO   |
| `IRoomWidgetHandler.as`          | Handler interface - message processing, event handling, lifecycle                        | TODO   |
| `IRoomWidgetHandlerContainer.as` | Container providing access to all engine services (session, inventory, catalog, etc.)    | TODO   |

### Layout Manager

| AS3 File        | Purpose                                                                                 | Status |
|-----------------|-----------------------------------------------------------------------------------------|--------|
| `class_3604.as` | Layout manager for room UI - manages widget positioning, room view rect, chat container | TODO   |

### Widget Handlers (`handler/`)

| AS3 File                                   | Purpose                                                                             | Status |
|--------------------------------------------|-------------------------------------------------------------------------------------|--------|
| `AvatarInfoWidgetHandler.as`               | Handles avatar selection, user data requests, actions (trade, friend, ignore, etc.) | TODO   |
| `CameraWidgetHandler.as`                   | Handles camera/photo capture, room screenshots, image upload                        | TODO   |
| `ChatInputWidgetHandler.as`                | Handles chat input, typing status, flood control                                    | TODO   |
| `ChatWidgetHandler.as`                     | Processes chat events, manages avatar images, position updates                      | TODO   |
| `ConversionPointWidgetHandler.as`          | Handles conversion tracking points                                                  | TODO   |
| `CraftingWidgetHandler.as`                 | Handles crafting system - recipes, ingredients, crafting actions                    | TODO   |
| `CustomUserNotificationWidgetHandler.as`   | Handles custom user notification display                                            | TODO   |
| `DoorbellWidgetHandler.as`                 | Handles doorbell events - user waiting at door                                      | TODO   |
| `ExternalImageWidgetHandler.as`            | Handles external image furniture display                                            | TODO   |
| `FriendRequestWidgetHandler.as`            | Handles friend request notifications                                                | TODO   |
| `FurniChooserWidgetHandler.as`             | Handles furniture chooser list population                                           | TODO   |
| `FurnitureAreaHideWidgetHandler.as`        | Handles area hide furniture toggling                                                | TODO   |
| `FurnitureBackgroundColorWidgetHandler.as` | Handles background color furniture (toner)                                          | TODO   |
| `FurnitureClothingChangeWidgetHandler.as`  | Handles clothing change furniture                                                   | TODO   |
| `FurnitureContextMenuWidgetHandler.as`     | Handles furniture context menu actions (use, pick up, etc.)                         | TODO   |
| `FurnitureCreditWidgetHandler.as`          | Handles credit furniture redemption                                                 | TODO   |
| `FurnitureDimmerWidgetHandler.as`          | Handles room dimmer furniture control                                               | TODO   |
| `FurnitureEcotronBoxWidgetHandler.as`      | Handles ecotron box opening                                                         | TODO   |
| `FurniturePresentWidgetHandler.as`         | Handles present/gift opening                                                        | TODO   |
| `FurnitureRoomLinkHandler.as`              | Handles room link furniture navigation                                              | TODO   |
| `FurnitureStickieWidgetHandler.as`         | Handles sticky note furniture editing                                               | TODO   |
| `FurnitureTrophyWidgetHandler.as`          | Handles trophy furniture display                                                    | TODO   |
| `InfoStandWidgetHandler.as`                | Handles infostand - user/furni/pet info display, actions                            | TODO   |
| `LoadingBarWidgetHandler.as`               | Handles room loading progress                                                       | TODO   |
| `MannequinWidgetHandler.as`                | Handles mannequin furniture (outfit saving/loading)                                 | TODO   |
| `MeMenuWidgetHandler.as`                   | Handles "me" menu - expressions, dance, posture                                     | TODO   |
| `ObjectLocationRequestHandler.as`          | Handles object location queries for positioning                                     | TODO   |
| `PetPackageFurniWidgetHandler.as`          | Handles pet package furniture opening                                               | TODO   |
| `PlaceholderWidgetHandler.as`              | Handles placeholder furniture states                                                | TODO   |
| `PlayListEditorWidgetHandler.as`           | Handles jukebox playlist editing                                                    | TODO   |
| `PollWidgetHandler.as`                     | Handles room poll display and responses                                             | TODO   |
| `RoomQueueWidgetHandler.as`                | Handles room queue status display                                                   | TODO   |
| `RoomThumbnailCameraWidgetHandler.as`      | Handles room thumbnail capture                                                      | TODO   |
| `RoomToolsWidgetHandler.as`                | Handles room tools (like, history, zoom)                                            | TODO   |
| `SpamWallPostItWidgetHandler.as`           | Handles spam wall post-it furniture                                                 | TODO   |
| `UiHelpBubbleWidgetHandler.as`             | Handles UI help bubble display                                                      | TODO   |
| `UserChooserWidgetHandler.as`              | Handles user chooser list population                                                | TODO   |
| `WordQuizWidgetHandler.as`                 | Handles word quiz questions and voting                                              | TODO   |
| `class_3559.as`                            | Rentable space handler                                                              | TODO   |
| `class_3560.as`                            | Friend furniture engraving handler                                                  | TODO   |
| `class_3561.as`                            | YouTube widget handler                                                              | TODO   |
| `class_3569.as`                            | High score display handler                                                          | TODO   |
| `class_3572.as`                            | Achievement resolution trophy handler                                               | TODO   |
| `class_3575.as`                            | Internal link handler                                                               | TODO   |
| `class_3586.as`                            | Custom stack height handler                                                         | TODO   |
| `class_3640.as`                            | Vimeo display handler                                                               | TODO   |
| `class_3642.as`                            | Friend furniture confirm handler                                                    | TODO   |
| `class_3647.as`                            | Effects widget handler                                                              | TODO   |

### Widget Interfaces and Base Classes

| AS3 File                               | Purpose                                                                | Status |
|----------------------------------------|------------------------------------------------------------------------|--------|
| `widget/IRoomWidget.as`                | Interface for room widgets - state, lifecycle, message listener        | TODO   |
| `widget/IRoomWidgetMessageListener.as` | Interface for processing widget messages                               | TODO   |
| `widget/RoomWidgetBase.as`             | Base class for widgets - provides assets, localization, handler access | TODO   |

### Enums (`widget/enums/`)

| AS3 File                                | Purpose                                                    | Status |
|-----------------------------------------|------------------------------------------------------------|--------|
| `AvatarExpressionEnum.as`               | Avatar expression types (wave, blow kiss, laugh, etc.)     | TODO   |
| `RoomWidgetEnum.as`                     | Widget type constants (CHAT_WIDGET, INFOSTAND, etc.)       | TODO   |
| `RoomWidgetFurniInfoUsagePolicyEnum.as` | Furniture usage policy constants                           | TODO   |
| `RoomWidgetInfostandExtraParamEnum.as`  | Infostand extra parameter types (jukebox, crackable, etc.) | TODO   |
| `class_3546.as`                         | Unknown enum                                               | TODO   |
| `class_3621.as`                         | Unknown enum                                               | TODO   |
| `class_3657.as`                         | Unknown enum                                               | TODO   |
| `class_3771.as`                         | Unknown enum                                               | TODO   |
| `class_3813.as`                         | Unknown enum                                               | TODO   |

### Events (`widget/events/`)

| AS3 File                                                  | Purpose                                              | Status |
|-----------------------------------------------------------|------------------------------------------------------|--------|
| `BreedingRarityCategoryData.as`                           | Data for pet breeding rarity                         | TODO   |
| `ChooserItem.as`                                          | Data for chooser list items (furni/user)             | TODO   |
| `ConfirmPetBreedingPetData.as`                            | Pet breeding confirmation data                       | TODO   |
| `HideRoomWidgetEvent.as`                                  | Event to hide a room widget                          | TODO   |
| `PetBreedingResultEventData.as`                           | Pet breeding result data                             | TODO   |
| `RoomDesktopMouseZoomEnableEvent.as`                      | Event to enable/disable mouse zoom                   | TODO   |
| `RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as` | Achievement trophy data update                       | TODO   |
| `RoomWidgetAvatarEditorUpdateEvent.as`                    | Avatar editor state update                           | TODO   |
| `RoomWidgetAvatarInfoEvent.as`                            | Avatar info event                                    | TODO   |
| `RoomWidgetChatInputContentUpdateEvent.as`                | Chat input content update                            | TODO   |
| `RoomWidgetChatUpdateEvent.as`                            | Chat message event with sender info, position, style | TODO   |
| `RoomWidgetChooserContentEvent.as`                        | Chooser content populated event                      | TODO   |
| `RoomWidgetClothingChangeUpdateEvent.as`                  | Clothing change furniture update                     | TODO   |
| `RoomWidgetConfirmPetBreedingEvent.as`                    | Pet breeding confirmation event                      | TODO   |
| `RoomWidgetConfirmPetBreedingResultEvent.as`              | Pet breeding result event                            | TODO   |
| `RoomWidgetCreditFurniUpdateEvent.as`                     | Credit furniture update                              | TODO   |
| `RoomWidgetDanceUpdateEvent.as`                           | Dance state update                                   | TODO   |
| `RoomWidgetDimmerStateUpdateEvent.as`                     | Dimmer on/off state update                           | TODO   |
| `RoomWidgetDimmerUpdateEvent.as`                          | Dimmer settings update                               | TODO   |
| `RoomWidgetDimmerUpdateEventPresetItem.as`                | Dimmer preset data                                   | TODO   |
| `RoomWidgetDoorbellEvent.as`                              | Doorbell ring event                                  | TODO   |
| `RoomWidgetEcotronBoxDataUpdateEvent.as`                  | Ecotron box opening data                             | TODO   |
| `RoomWidgetFloodControlEvent.as`                          | Flood control cooldown event                         | TODO   |
| `RoomWidgetFriendRequestUpdateEvent.as`                   | Friend request notification                          | TODO   |
| `RoomWidgetFurniInfoUpdateEvent.as`                       | Furniture info for infostand                         | TODO   |
| `RoomWidgetHabboClubUpdateEvent.as`                       | Habbo Club status update                             | TODO   |
| `RoomWidgetLoadingBarUpdateEvent.as`                      | Loading bar progress update                          | TODO   |
| `RoomWidgetMiniMailUpdateEvent.as`                        | MiniMail notification update                         | TODO   |
| `RoomWidgetPetBreedingEvent.as`                           | Pet breeding start event                             | TODO   |
| `RoomWidgetPetBreedingResultEvent.as`                     | Pet breeding result                                  | TODO   |
| `RoomWidgetPetCommandsUpdateEvent.as`                     | Pet available commands update                        | TODO   |
| `RoomWidgetPetFigureUpdateEvent.as`                       | Pet figure image update                              | TODO   |
| `RoomWidgetPetInfoUpdateEvent.as`                         | Pet info for infostand                               | TODO   |
| `RoomWidgetPetLevelUpdateEvent.as`                        | Pet level up event                                   | TODO   |
| `RoomWidgetPetPackageUpdateEvent.as`                      | Pet package opening update                           | TODO   |
| `RoomWidgetPetStatusUpdateEvent.as`                       | Pet status (hunger, happiness) update                | TODO   |
| `RoomWidgetPlayListEditorEvent.as`                        | Playlist editor state event                          | TODO   |
| `RoomWidgetPlayListEditorNowPlayingEvent.as`              | Currently playing song event                         | TODO   |
| `RoomWidgetPollUpdateEvent.as`                            | Poll content/status update                           | TODO   |
| `RoomWidgetPresentDataUpdateEvent.as`                     | Present opening data                                 | TODO   |
| `RoomWidgetPurseUpdateEvent.as`                           | Purse/wallet update                                  | TODO   |
| `RoomWidgetRentableBotForceOpenContextMenuEvent.as`       | Force open bot context menu                          | TODO   |
| `RoomWidgetRentableBotInfoUpdateEvent.as`                 | Rentable bot info for infostand                      | TODO   |
| `RoomWidgetRentableBotSkillListUpdateEvent.as`            | Bot skill list update                                | TODO   |
| `RoomWidgetRoomEngineUpdateEvent.as`                      | Room engine state (game mode, normal mode)           | TODO   |
| `RoomWidgetRoomObjectNameEvent.as`                        | Object name display event                            | TODO   |
| `RoomWidgetRoomObjectUpdateEvent.as`                      | Room object add/remove/select events                 | TODO   |
| `RoomWidgetRoomQueueUpdateEvent.as`                       | Room queue status update                             | TODO   |
| `RoomWidgetRoomViewUpdateEvent.as`                        | Room view size/position/scale change                 | TODO   |
| `RoomWidgetSettingsUpdateEvent.as`                        | Settings update event                                | TODO   |
| `RoomWidgetShowPlaceholderEvent.as`                       | Show placeholder event                               | TODO   |
| `RoomWidgetSongUpdateEvent.as`                            | Song playing/data update                             | TODO   |
| `RoomWidgetSpamWallPostItEditEvent.as`                    | Spam wall post-it edit                               | TODO   |
| `RoomWidgetStickieDataUpdateEvent.as`                     | Sticky note content update                           | TODO   |
| `RoomWidgetToolbarClickedUpdateEvent.as`                  | Toolbar button click                                 | TODO   |
| `RoomWidgetTrophyDataUpdateEvent.as`                      | Trophy content update                                | TODO   |
| `RoomWidgetTutorialEvent.as`                              | Tutorial event                                       | TODO   |
| `RoomWidgetUpdateEffectsUpdateEvent.as`                   | Effects list update                                  | TODO   |
| `RoomWidgetUpdateEvent.as`                                | Base event class                                     | TODO   |
| `RoomWidgetUserDataUpdateEvent.as`                        | User data update                                     | TODO   |
| `RoomWidgetUserInfoUpdateEvent.as`                        | User info for infostand                              | TODO   |
| `RoomWidgetUserLocationUpdateEvent.as`                    | User location update                                 | TODO   |
| `RoomWidgetWaveUpdateEvent.as`                            | Wave action update                                   | TODO   |
| `RoomWidgetWordQuizUpdateEvent.as`                        | Word quiz update                                     | TODO   |
| `UseProductItem.as`                                       | Pet product use data                                 | TODO   |

### Messages (`widget/messages/`)

| AS3 File                                          | Purpose                                      | Status |
|---------------------------------------------------|----------------------------------------------|--------|
| `RoomWidgetAvatarEditorMessage.as`                | Open avatar editor                           | TODO   |
| `RoomWidgetAvatarExpressionMessage.as`            | Send avatar expression                       | TODO   |
| `RoomWidgetChangeMottoMessage.as`                 | Change user motto                            | TODO   |
| `RoomWidgetChangePostureMessage.as`               | Change posture (sit, stand, etc.)            | TODO   |
| `RoomWidgetChatMessage.as`                        | Send chat message                            | TODO   |
| `RoomWidgetChatSelectAvatarMessage.as`            | Select avatar from chat bubble               | TODO   |
| `RoomWidgetChatTypingMessage.as`                  | Typing indicator message                     | TODO   |
| `RoomWidgetClothingChangeMessage.as`              | Clothing change action                       | TODO   |
| `RoomWidgetConversionPointMessage.as`             | Conversion tracking                          | TODO   |
| `RoomWidgetCreditFurniRedeemMessage.as`           | Redeem credit furniture                      | TODO   |
| `RoomWidgetDanceMessage.as`                       | Start/stop dance                             | TODO   |
| `RoomWidgetDimmerChangeStateMessage.as`           | Toggle dimmer on/off                         | TODO   |
| `RoomWidgetDimmerPreviewMessage.as`               | Preview dimmer settings                      | TODO   |
| `RoomWidgetDimmerSavePresetMessage.as`            | Save dimmer preset                           | TODO   |
| `RoomWidgetEcotronBoxOpenedMessage.as`            | Ecotron box opened confirmation              | TODO   |
| `RoomWidgetEcotronBoxOpenMessage.as`              | Open ecotron box                             | TODO   |
| `RoomWidgetFriendRequestMessage.as`               | Accept/reject friend request                 | TODO   |
| `RoomWidgetFurniActionMessage.as`                 | Furniture action (use, pickup, move, rotate) | TODO   |
| `RoomWidgetFurniToWidgetMessage.as`               | Request widget for furniture                 | TODO   |
| `RoomWidgetGetBadgeDetailsMessage.as`             | Request badge details                        | TODO   |
| `RoomWidgetGetBadgeImageMessage.as`               | Request badge image                          | TODO   |
| `RoomWidgetGetEffectsMessage.as`                  | Request effects list                         | TODO   |
| `RoomWidgetGetObjectLocationMessage.as`           | Request object location                      | TODO   |
| `RoomWidgetGetSettingsMessage.as`                 | Request settings                             | TODO   |
| `RoomWidgetInventoryUpdatedMessage.as`            | Notify inventory update                      | TODO   |
| `RoomWidgetLetUserInMessage.as`                   | Let user through doorbell                    | TODO   |
| `RoomWidgetMeMenuMessage.as`                      | Me menu action                               | TODO   |
| `RoomWidgetMessage.as`                            | Base message class                           | TODO   |
| `RoomWidgetNavigateToRoomMessage.as`              | Navigate to room                             | TODO   |
| `RoomWidgetOpenCatalogMessage.as`                 | Open catalog                                 | TODO   |
| `RoomWidgetOpenInventoryMessage.as`               | Open inventory                               | TODO   |
| `RoomWidgetOpenPetPackageMessage.as`              | Open pet package                             | TODO   |
| `RoomWidgetOpenProfileMessage.as`                 | Open user profile                            | TODO   |
| `RoomWidgetPetCommandMessage.as`                  | Send pet command                             | TODO   |
| `RoomWidgetPlayListModificationMessage.as`        | Modify playlist                              | TODO   |
| `RoomWidgetPlayListPlayStateMessage.as`           | Play/pause playlist                          | TODO   |
| `RoomWidgetPlayListUserActionMessage.as`          | Playlist user action                         | TODO   |
| `RoomWidgetPollMessage.as`                        | Poll response                                | TODO   |
| `RoomWidgetPresentOpenMessage.as`                 | Open present                                 | TODO   |
| `RoomWidgetRequestWidgetMessage.as`               | Request widget open                          | TODO   |
| `RoomWidgetRoomObjectMessage.as`                  | Room object action (get info, etc.)          | TODO   |
| `RoomWidgetRoomQueueMessage.as`                   | Room queue action                            | TODO   |
| `RoomWidgetRoomTagSearchMessage.as`               | Search rooms by tag                          | TODO   |
| `RoomWidgetScriptProceedMessage.as`               | Continue script                              | TODO   |
| `RoomWidgetSelectEffectMessage.as`                | Select effect                                | TODO   |
| `RoomWidgetSelectOutfitMessage.as`                | Select outfit                                | TODO   |
| `RoomWidgetShowOwnRoomsMessage.as`                | Show own rooms                               | TODO   |
| `RoomWidgetSpamWallPostItFinishEditingMessage.as` | Save spam wall post-it                       | TODO   |
| `RoomWidgetStickieSendUpdateMessage.as`           | Update sticky note                           | TODO   |
| `RoomWidgetStopEffectMessage.as`                  | Stop effect                                  | TODO   |
| `RoomWidgetStoreSettingsMessage.as`               | Store settings                               | TODO   |
| `RoomWidgetUseProductMessage.as`                  | Use product on pet                           | TODO   |
| `RoomWidgetUserActionMessage.as`                  | User action (kick, ban, mute, trade, etc.)   | TODO   |
| `RoomWidgetZoomToggleMessage.as`                  | Toggle zoom                                  | TODO   |

### Data Models

| AS3 File                                                 | Purpose                                | Status |
|----------------------------------------------------------|----------------------------------------|--------|
| `widget/avatarinfo/BreedPetsResultData.as`               | Pet breeding result data model         | TODO   |
| `widget/avatarinfo/PetInfoData.as`                       | Pet info data model                    | TODO   |
| `widget/avatarinfo/class_3630.as`                        | Avatar menu data (permissions, states) | TODO   |
| `widget/camera/CameraEffect.as`                          | Camera effect definition               | TODO   |
| `widget/camera/CameraSlotData.as`                        | Camera slot data                       | TODO   |
| `widget/crafting/utils/CraftingFurnitureItem.as`         | Crafting ingredient data               | TODO   |
| `widget/crafting/utils/class_3624.as`                    | Crafting utility                       | TODO   |
| `widget/furniture/dimmer/DimmerFurniWidgetPresetItem.as` | Dimmer preset data                     | TODO   |
| `widget/infostand/CommandConfiguration.as`               | Pet command configuration              | TODO   |
| `widget/infostand/InfoStandFurniData.as`                 | Furniture data for infostand           | TODO   |
| `widget/infostand/InfoStandPetData.as`                   | Pet data for infostand                 | TODO   |
| `widget/infostand/InfoStandRentableBotData.as`           | Bot data for infostand                 | TODO   |
| `widget/infostand/InfoStandUserData.as`                  | User data for infostand                | TODO   |
| `widget/poll/PollSession.as`                             | Poll session state                     | TODO   |
| `widget/roomchat/style/ChatBubbleStyle.as`               | Chat bubble style data                 | TODO   |
| `widget/uihelpbubbles/HelpBubbleItem.as`                 | Help bubble data                       | TODO   |
| `widget/uihelpbubbles/UiHelpBubbleIconEnum.as`           | Help bubble icon types                 | TODO   |

---

## VIEW FILES (We Ignore These)

### Core UI Classes

| AS3 File                      | Purpose                                                                                                                 |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `RoomDesktop.as`              | Main room UI controller - manages canvases, widgets, handlers, color transitions. HYBRID but primarily UI orchestration |
| `RoomUI.as`                   | Component class - manages desktops, dependencies, events. HYBRID but primarily component/UI management                  |
| `widget/RoomWidgetFactory.as` | Creates widget instances with UI dependencies                                                                           |

### Avatar Info Widget (`widget/avatarinfo/`)

| AS3 File                                     | Purpose                                            |
|----------------------------------------------|----------------------------------------------------|
| `AvatarContextInfoButtonView.as`             | Base context button view                           |
| `AvatarContextInfoView.as`                   | Context info view base                             |
| `AvatarInfoWidget.as`                        | Main avatar info widget                            |
| `AvatarMenuView.as`                          | Avatar context menu (whisper, trade, ignore, etc.) |
| `BreedMonsterPlantsConfirmationView.as`      | Monster plant breeding confirmation                |
| `BreedPetsResultView.as`                     | Pet breeding result view                           |
| `BreedPetView.as`                            | Pet breeding UI                                    |
| `ConfirmPetBreedingView.as`                  | Pet breeding confirmation                          |
| `DecorateModeView.as`                        | Decorate mode indicator                            |
| `NestBreedingSuccessView.as`                 | Nest breeding success view                         |
| `NewUserHelpView.as`                         | New user help view                                 |
| `OwnAvatarMenuView.as`                       | Own avatar menu (expressions, dance)               |
| `OwnPetMenuView.as`                          | Own pet menu                                       |
| `PetMenuView.as`                             | Pet context menu                                   |
| `RentableBotMenuView.as`                     | Bot context menu                                   |
| `UseProductConfirmationView.as`              | Product use confirmation                           |
| `UseProductView.as`                          | Product use view                                   |
| `UserNameView.as`                            | User name display                                  |
| `class_3605.as`                              | Unknown view                                       |
| `class_3818.as`                              | Unknown view                                       |
| `botskills/BotChangeNameConfiguration.as`    | Bot name change dialog                             |
| `botskills/BotChatterMarkovConfiguration.as` | Bot chatter configuration                          |
| `botskills/BotSkillConfigurationViewBase.as` | Bot skill config base                              |
| `botskills/class_3551.as`                    | Bot skill view                                     |
| `botskills/class_3574.as`                    | Bot skill view                                     |

### Camera Widget (`widget/camera/`)

| AS3 File                             | Purpose                     |
|--------------------------------------|-----------------------------|
| `CameraFxPreloader.as`               | Effect preloader UI         |
| `CameraFxStrengthSlider.as`          | Effect strength slider      |
| `CameraPhotoLab.as`                  | Photo lab/editor UI         |
| `CameraViewFinder.as`                | Camera viewfinder UI        |
| `CameraWidget.as`                    | Main camera widget          |
| `PhotoPurchaseConfirmationDialog.as` | Photo purchase confirmation |
| `RoomThumbnailCameraWidget.as`       | Room thumbnail camera       |

### Chat Input Widget (`widget/chatinput/`)

| AS3 File                              | Purpose               |
|---------------------------------------|-----------------------|
| `RoomChatInputView.as`                | Chat input field view |
| `RoomChatInputWidget.as`              | Chat input widget     |
| `styleselector/ChatStyleGridEntry.as` | Style selector entry  |
| `styleselector/ChatStyleGridView.as`  | Style selector grid   |
| `styleselector/ChatStyleSelector.as`  | Chat style selector   |

### Chooser Widget (`widget/chooser/`)

| AS3 File                | Purpose             |
|-------------------------|---------------------|
| `ChooserView.as`        | Chooser list view   |
| `ChooserWidgetBase.as`  | Chooser base widget |
| `FurniChooserWidget.as` | Furniture chooser   |
| `UserChooserWidget.as`  | User chooser        |

### Context Menu (`widget/contextmenu/`)

| AS3 File             | Purpose              |
|----------------------|----------------------|
| `ButtonMenuView.as`  | Button menu view     |
| `ContextInfoView.as` | Context info view    |
| `class_3386.as`      | Unknown context menu |

### Crafting Widget (`widget/crafting/`)

| AS3 File                                        | Purpose                   |
|-------------------------------------------------|---------------------------|
| `CraftingWidget.as`                             | Main crafting widget      |
| `controller/CraftingGridControllerBase.as`      | Grid controller           |
| `controller/CraftingInfoController.as`          | Info panel controller     |
| `controller/CraftingInventoryListController.as` | Inventory list controller |
| `controller/CraftingMixerController.as`         | Mixer controller          |
| `controller/CraftingProgressBarController.as`   | Progress bar controller   |
| `controller/CraftingRecipeListController.as`    | Recipe list controller    |
| `renderer/CraftingInventoryItemRenderer.as`     | Inventory item renderer   |
| `renderer/CraftingMixerItemRenderer.as`         | Mixer item renderer       |
| `renderer/CraftingRecipeItemRenderer.as`        | Recipe item renderer      |
| `renderer/FurniThumbnailRendererBase.as`        | Thumbnail renderer        |

### Doorbell Widget (`widget/doorbell/`)

| AS3 File            | Purpose                    |
|---------------------|----------------------------|
| `DoorbellView.as`   | Doorbell notification view |
| `DoorbellWidget.as` | Doorbell widget            |

### Effects Widget (`widget/effects/`)

| AS3 File           | Purpose             |
|--------------------|---------------------|
| `EffectsWidget.as` | Effects list widget |
| `EffectView.as`    | Single effect view  |

### Friend Request Widget (`widget/friendrequest/`)

| AS3 File                 | Purpose               |
|--------------------------|-----------------------|
| `FriendRequestDialog.as` | Friend request dialog |
| `FriendRequestWidget.as` | Friend request widget |

### Furniture Widgets (`widget/furniture/`)

| AS3 File                                                 | Purpose                       |
|----------------------------------------------------------|-------------------------------|
| `CustomStackHeightWidget.as`                             | Stack height widget           |
| `areahide/AreaHideFurniWidget.as`                        | Area hide toggle              |
| `backgroundcolor/BackgroundColorFurniWidget.as`          | Background color widget       |
| `backgroundcolor/BackgroundColorWidgetSlider.as`         | Color slider                  |
| `clothingchange/ClothingChangeFurnitureWidget.as`        | Clothing change widget        |
| `contextmenu/FurnitureContextInfoView.as`                | Furniture context info        |
| `contextmenu/FurnitureContextMenuWidget.as`              | Furniture context menu        |
| `contextmenu/GenericUsableFurnitureContextMenuView.as`   | Generic usable menu           |
| `contextmenu/MonsterPlantSeedConfirmationView.as`        | Monster plant confirmation    |
| `contextmenu/MonsterPlantSeedContextMenuView.as`         | Monster plant menu            |
| `contextmenu/PurchasableClothingConfirmationView.as`     | Clothing confirmation         |
| `contextmenu/RandomTeleportContextMenuView.as`           | Teleport menu                 |
| `credit/CreditFurniWidget.as`                            | Credit furniture widget       |
| `dimmer/DimmerFurniWidget.as`                            | Dimmer widget                 |
| `dimmer/DimmerView.as`                                   | Dimmer view                   |
| `dimmer/DimmerViewAlphaSlider.as`                        | Dimmer alpha slider           |
| `dimmer/DimmerViewColorGrid.as`                          | Dimmer color grid             |
| `ecotronbox/EcotronBoxFurniWidget.as`                    | Ecotron box widget            |
| `effectbox/EffectBoxOpenDialogView.as`                   | Effect box dialog             |
| `externalimage/ExternalImageWidget.as`                   | External image widget         |
| `friendfurni/FriendFurniConfirmWidget.as`                | Friend furniture confirmation |
| `friendfurni/FriendFurniContextMenuView.as`              | Friend furniture menu         |
| `friendfurni/FriendFurniEngravingView.as`                | Engraving view                |
| `friendfurni/FriendFurniEngravingWidget.as`              | Engraving widget              |
| `friendfurni/HabboweenEngravingView.as`                  | Habboween engraving           |
| `friendfurni/LoveLockEngravingView.as`                   | Love lock engraving           |
| `friendfurni/WildWestEngravingView.as`                   | Wild west engraving           |
| `guildfurnicontextmenu/GuildFurnitureContextMenuView.as` | Guild furniture menu          |
| `highscore/HighScoreDisplayWidget.as`                    | High score display            |
| `mannequin/MannequinWidget.as`                           | Mannequin widget              |
| `mysterybox/MysteryBoxContextMenuView.as`                | Mystery box menu              |
| `mysterybox/MysteryBoxOpenDialogView.as`                 | Mystery box dialog            |
| `mysterybox/MysteryBoxToolbarExtension.as`               | Mystery box toolbar           |
| `mysterytrophy/MysteryTrophyOpenDialogView.as`           | Mystery trophy dialog         |
| `petpackage/PetPackageFurniWidget.as`                    | Pet package widget            |
| `placeholder/PlaceholderView.as`                         | Placeholder view              |
| `placeholder/PlaceholderWidget.as`                       | Placeholder widget            |
| `present/PresentFurniWidget.as`                          | Present widget                |
| `rentablespace/RentableSpaceDisplayWidget.as`            | Rentable space widget         |
| `requirementsmissing/CustomUserNotificationWidget.as`    | Custom notification widget    |
| `roomlink/FurnitureRoomLinkWidget.as`                    | Room link widget              |
| `stickie/SpamWallPostItFurniWidget.as`                   | Spam wall post-it widget      |
| `stickie/StickieFurniWidget.as`                          | Sticky widget                 |
| `trophy/AchievementResolutionTrophyFurniWidget.as`       | Achievement trophy widget     |
| `trophy/ITrophyFurniWidget.as`                           | Trophy widget interface       |
| `trophy/ITrophyView.as`                                  | Trophy view interface         |
| `trophy/NikoTrophyView.as`                               | Niko trophy view              |
| `trophy/TrophyFurniWidget.as`                            | Trophy widget                 |
| `trophy/TrophyView.as`                                   | Trophy view                   |
| `video/class_3548.as`                                    | Video widget base             |
| `video/VimeoDisplayWidget.as`                            | Vimeo widget                  |
| `video/YoutubeDisplayWidget.as`                          | YouTube widget                |

### Infostand Widget (`widget/infostand/`)

| AS3 File                         | Purpose                  |
|----------------------------------|--------------------------|
| `InfoStandBotView.as`            | Bot info view            |
| `InfoStandCrackableFurniView.as` | Crackable furniture view |
| `InfoStandFurniView.as`          | Furniture info view      |
| `InfoStandJukeboxView.as`        | Jukebox info view        |
| `InfoStandPetView.as`            | Pet info view            |
| `InfoStandRentableBotView.as`    | Rentable bot view        |
| `InfoStandSongDiskView.as`       | Song disk view           |
| `InfoStandUserView.as`           | User info view           |
| `InfoStandWidget.as`             | Main infostand widget    |
| `PetCommandTool.as`              | Pet command UI           |
| `TagListRenderer.as`             | Tag list renderer        |
| `class_3786.as`                  | Unknown view             |

### Loading Bar Widget (`widget/loadingbar/`)

| AS3 File              | Purpose            |
|-----------------------|--------------------|
| `LoadingBarWidget.as` | Loading bar widget |

### Me Menu Widget (`widget/memenu/`)

| AS3 File                                     | Purpose                |
|----------------------------------------------|------------------------|
| `IMeMenuView.as`                             | Me menu view interface |
| `MeMenuDanceView.as`                         | Dance selection view   |
| `MeMenuMainView.as`                          | Main me menu view      |
| `MeMenuSettingsMenuView.as`                  | Settings menu view     |
| `MeMenuWidget.as`                            | Me menu widget         |
| `chatsettings/MeMenuChatSettingsView.as`     | Chat settings view     |
| `soundsettings/MeMenuSoundSettingsItem.as`   | Sound settings item    |
| `soundsettings/MeMenuSoundSettingsSlider.as` | Sound slider           |
| `soundsettings/MeMenuSoundSettingsView.as`   | Sound settings view    |
| `class_3522.as`                              | Unknown me menu view   |

### Playlist Editor Widget (`widget/playlisteditor/`)

| AS3 File                        | Purpose                 |
|---------------------------------|-------------------------|
| `MainWindowHandler.as`          | Playlist window handler |
| `MusicInventoryGridItem.as`     | Inventory grid item     |
| `MusicInventoryGridView.as`     | Inventory grid view     |
| `MusicInventoryStatusView.as`   | Inventory status        |
| `PlayListEditorItem.as`         | Playlist item           |
| `PlayListEditorItemListView.as` | Playlist list view      |
| `PlayListEditorWidget.as`       | Playlist editor widget  |
| `PlayListStatusView.as`         | Playlist status view    |
| `class_3793.as`                 | Unknown playlist view   |

### Poll Widget (`widget/poll/`)

| AS3 File               | Purpose             |
|------------------------|---------------------|
| `PollContentDialog.as` | Poll content dialog |
| `PollOfferDialog.as`   | Poll offer dialog   |
| `PollWidget.as`        | Poll widget         |
| `class_3685.as`        | Unknown poll view   |

### Room Chat Widget (`widget/roomchat/`)

| AS3 File                     | Purpose               |
|------------------------------|-----------------------|
| `RoomChatHistoryPulldown.as` | Chat history pulldown |
| `RoomChatHistoryViewer.as`   | Chat history viewer   |
| `RoomChatItem.as`            | Single chat bubble    |
| `RoomChatWidget.as`          | Room chat widget      |
| `style/ChatBubbleFactory.as` | Chat bubble factory   |

### Room Queue Widget (`widget/roomqueue/`)

| AS3 File             | Purpose           |
|----------------------|-------------------|
| `RoomQueueWidget.as` | Room queue widget |

### Room Tools Widget (`widget/roomtools/`)

| AS3 File                  | Purpose               |
|---------------------------|-----------------------|
| `RoomToolsCtrlBase.as`    | Tools controller base |
| `RoomToolsHistory.as`     | Room history          |
| `RoomToolsInfoCtrl.as`    | Room info controller  |
| `RoomToolsToolbarCtrl.as` | Toolbar controller    |
| `RoomToolsWidget.as`      | Room tools widget     |

### UI Help Bubbles (`widget/uihelpbubbles/`)

| AS3 File                 | Purpose             |
|--------------------------|---------------------|
| `UiHelpBubble.as`        | Help bubble view    |
| `UiHelpBubblesWidget.as` | Help bubbles widget |

### Word Quiz Widget (`widget/wordquiz/`)

| AS3 File            | Purpose          |
|---------------------|------------------|
| `WordQuizView.as`   | Word quiz view   |
| `WordQuizWidget.as` | Word quiz widget |

---

## Key Business Logic to Port

### Handler Pattern
Each widget has a corresponding handler that:
1. Implements `IRoomWidgetHandler`
2. Receives events via `processEvent()`
3. Processes messages via `processWidgetMessage()`
4. Has access to `IRoomWidgetHandlerContainer` for engine services

### Message Flow
```
User Action -> Widget -> RoomWidgetMessage -> Handler -> Engine/Server
Server Response -> Handler -> RoomWidgetUpdateEvent -> Widget -> UI
```

### Important Handlers to Port

1. **ChatWidgetHandler**: Chat message processing, avatar images, position tracking
2. **InfoStandWidgetHandler**: User/furni/pet info, badges, relationship status
3. **AvatarInfoWidgetHandler**: Avatar selection, user actions (trade, friend, ignore)
4. **MeMenuWidgetHandler**: Expressions, dance, posture, settings
5. **FurnitureContextMenuWidgetHandler**: Furniture actions, context menus

### Data Models to Port

1. **ChooserItem**: Furniture/user list items
2. **InfoStand*Data**: User, pet, bot, furniture info structures
3. **RoomWidgetChatUpdateEvent**: Chat message with sender, position, style
4. **RoomWidgetUserActionMessage**: User actions enum

---

## Migration Notes

1. **All VIEW files are replaced by SolidJS components**
2. **Handler logic should be extracted to TypeScript services**
3. **Events become SolidJS signals/stores**
4. **Messages become function calls on services**
5. **Widget lifecycle managed by SolidJS components**
