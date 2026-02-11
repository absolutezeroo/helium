# Session Architecture Documentation

This document categorizes all AS3 session files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Done     | Partial | Description                                                                                         |
|----------|-------|----------|---------|-----------------------------------------------------------------------------------------------------|
| ENGINE   | 77    | 10       | 8       | Session management, user data, room sessions, permissions, handlers, events, furniture/product data |
| VIEW     | 0     | N/A      | N/A     | No UI components found in session module                                                            |

**Progress: ~19% ENGINE files implemented**
- ⚠️ SessionDataManager + ISessionDataManager (partial - user data, respect, UI flags, sub-managers; **missing**: FurnitureData, ProductData, BadgeImageManager, vault/rewards, NFT styles)
- ✅ UserData + IUserData + UserDataManager + IUserDataManager
- ⚠️ PerkManager + IPerkManager (partial - structure done, messages TODO)
- ⚠️ IgnoredUsersManager + IIgnoredUsersManager (partial - structure done, messages TODO)
- ⚠️ HabboGroupInfoManager + IHabboGroupInfoManager (partial - structure done, messages TODO)
- ✅ 6 Enums (HabboClubLevel, UIFlags, RoomControllerLevel, RoomTradingLevel, GenericError, Talent)

---

## ENGINE FILES (We Need These)

### Core Session Management

| AS3 File                        | Purpose                                                                                                        | Status                                                                                                    |
|---------------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `session/SessionDataManager.as` | Main session data manager - user info, badges, furniture data, product data, club level, perks, respect system | ⚠️ Partial (user data, respect, UI flags, sub-managers done; FurnitureData, ProductData, badges TODO)     |
| `session/RoomSessionManager.as` | Manages room sessions lifecycle - create, start, dispose sessions, handles room navigation                     | TODO                                                                                                      |
| `session/RoomSession.as`        | Individual room session - chat, actions, permissions, pets, polls, user data manager                           | TODO                                                                                                      |
| `session/UserDataManager.as`    | Manages user data within a room - lookup by ID/index/name, badges, figure updates                              | ✅ Done                                                                                                    |
| `session/UserData.as`           | User data model - name, figure, type, group info, pet properties, bot skills                                   | ✅ Done                                                                                                    |

### Interfaces

| AS3 File                          | Purpose                                                                            | Status  |
|-----------------------------------|------------------------------------------------------------------------------------|---------|
| `session/ISessionDataManager.as`  | Interface for session data manager - user info, badges, furniture, products, perks | ✅ Done  |
| `session/IRoomSessionManager.as`  | Interface for room session manager - gotoRoom, start/dispose sessions              | TODO    |
| `session/IRoomSession.as`         | Interface for room session - chat, actions, permissions, pet controls              | TODO    |
| `session/IRoomHandlerListener.as` | Interface for room handler callbacks - session updates, events                     | TODO    |
| `session/IPetInfo.as`             | Interface for pet information - stats, breeding, ownership                         | TODO    |
| `session/class_3490.as`           | Interface for user data (IUserData) - room object properties, figure, group        | ✅ Done  |
| `session/class_3525.as`           | Interface for user data manager (IUserDataManager) - user lookup and updates       | ✅ Done  |

### Sub-Managers

| AS3 File                           | Purpose                                            | Status                                            |
|------------------------------------|----------------------------------------------------|---------------------------------------------------|
| `session/BadgeImageManager.as`     | Loads and caches badge images from server          | TODO                                              |
| `session/BadgeInfo.as`             | Badge image data wrapper with placeholder flag     | TODO                                              |
| `session/HabboGroupInfoManager.as` | Manages group badge information for rooms          | ⚠️ Partial (structure done, messages TODO)        |
| `session/IgnoredUsersManager.as`   | Manages user ignore list - ignore/unignore users   | ⚠️ Partial (structure done, messages TODO)        |
| `session/PerkManager.as`           | Manages user perks and permissions                 | ⚠️ Partial (structure done, messages TODO)        |
| `session/PetInfo.as`               | Pet information model - stats, breeding, wellbeing | TODO                                              |

### Enums and Constants

| AS3 File                                  | Purpose                                                           | Status  |
|-------------------------------------------|-------------------------------------------------------------------|---------|
| `session/HabboClubLevelEnum.as`           | Club membership levels: NO_CLUB, CLUB, VIP                        | ✅ Done  |
| `session/class_3428.as`                   | UI flags enum: FRIEND_BAR_OPEN, ROOM_TOOLS_OPEN                   | ✅ Done  |
| `session/class_3430.as`                   | Security level enum: NONE to SUPER_USER (0-9)                     | TODO    |
| `session/enum/GenericErrorEnum.as`        | Error codes: KICKED_BY_OWNER, STRIP_LOCKED_FOR_TRADING            | ✅ Done  |
| `session/enum/RoomControllerLevelEnum.as` | Room permission levels: NOT_CONTROLLER to MODERATOR               | ✅ Done  |
| `session/enum/RoomTradingLevelEnum.as`    | Trading modes: NO_TRADING, ROOM_CONTROLLER_REQUIRED, FREE_TRADING | ✅ Done  |
| `session/talent/TalentEnum.as`            | Talent tracks: HELPER, CITIZENSHIP                                | ✅ Done  |

### Message Handlers

| AS3 File                                      | Purpose                                                                            | Status |
|-----------------------------------------------|------------------------------------------------------------------------------------|--------|
| `session/handler/BaseHandler.as`              | Base class for all handlers - connection, listener, room ID                        | TODO   |
| `session/handler/RoomSessionHandler.as`       | Handles room connection lifecycle - connect, ready, disconnect, queue, spectator   | TODO   |
| `session/handler/RoomUsersHandler.as`         | Handles user events - join/leave, badges, doorbell, figure changes, pets, breeding | TODO   |
| `session/handler/RoomChatHandler.as`          | Handles chat messages - speak, whisper, shout, respect, flood control              | TODO   |
| `session/handler/RoomPermissionsHandler.as`   | Handles permission updates - controller level, room owner                          | TODO   |
| `session/handler/RoomDataHandler.as`          | Handles room data updates - trade mode, guild room, pets allowed                   | TODO   |
| `session/handler/AvatarEffectsHandler.as`     | Handles avatar effect messages                                                     | TODO   |
| `session/handler/GenericErrorHandler.as`      | Handles generic errors - kicked by owner                                           | TODO   |
| `session/handler/PetPackageHandler.as`        | Handles pet package open requests/results                                          | TODO   |
| `session/handler/PollHandler.as`              | Handles poll events - offer, content, error                                        | TODO   |
| `session/handler/PresentHandler.as`           | Handles present/gift opening                                                       | TODO   |
| `session/handler/RoomDimmerPresetsHandler.as` | Handles room dimmer/mood light presets                                             | TODO   |
| `session/handler/WordQuizHandler.as`          | Handles word quiz/poll events                                                      | TODO   |

### Events

| AS3 File                                                     | Purpose                                                      | Status |
|--------------------------------------------------------------|--------------------------------------------------------------|--------|
| `session/events/RoomSessionEvent.as`                         | Base room session event - CREATED, STARTED, ENDED, ROOM_DATA | TODO   |
| `session/events/RoomSessionChatEvent.as`                     | Chat event - speak, whisper, shout, respect types            | TODO   |
| `session/events/RoomSessionUserDataUpdateEvent.as`           | Users added to room event                                    | TODO   |
| `session/events/RoomSessionUserFigureUpdateEvent.as`         | User figure/appearance changed                               | TODO   |
| `session/events/RoomSessionUserBadgesEvent.as`               | User badges received                                         | TODO   |
| `session/events/RoomSessionDoorbellEvent.as`                 | Doorbell - ringing, accepted, rejected                       | TODO   |
| `session/events/RoomSessionQueueEvent.as`                    | Room queue status                                            | TODO   |
| `session/events/RoomSessionDanceEvent.as`                    | User dance style changed                                     | TODO   |
| `session/events/RoomSessionErrorMessageEvent.as`             | Error messages - kicked, pet/bot errors                      | TODO   |
| `session/events/RoomSessionPropertyUpdateEvent.as`           | Room property changed (pets allowed)                         | TODO   |
| `session/events/RoomSessionFriendRequestEvent.as`            | Friend request received in room                              | TODO   |
| `session/events/RoomSessionFavouriteGroupUpdateEvent.as`     | User's favourite group updated                               | TODO   |
| `session/events/RoomSessionPollEvent.as`                     | Poll offer/content/error                                     | TODO   |
| `session/events/RoomSessionWordQuizEvent.as`                 | Word quiz question/answer events                             | TODO   |
| `session/events/RoomSessionPresentEvent.as`                  | Present opened event                                         | TODO   |
| `session/events/RoomSessionDimmerPresetsEvent.as`            | Dimmer presets received                                      | TODO   |
| `session/events/RoomSessionDimmerPresetsEventPresetItem.as`  | Individual dimmer preset data                                | TODO   |
| `session/events/RoomSessionPetInfoUpdateEvent.as`            | Pet info received                                            | TODO   |
| `session/events/RoomSessionPetCommandsUpdateEvent.as`        | Pet commands available                                       | TODO   |
| `session/events/RoomSessionPetFigureUpdateEvent.as`          | Pet figure changed                                           | TODO   |
| `session/events/RoomSessionPetLevelUpdateEvent.as`           | Pet level changed                                            | TODO   |
| `session/events/RoomSessionPetStatusUpdateEvent.as`          | Pet breeding/harvest status                                  | TODO   |
| `session/events/RoomSessionPetBreedingEvent.as`              | Pet breeding started                                         | TODO   |
| `session/events/RoomSessionPetBreedingResultEvent.as`        | Pet breeding result                                          | TODO   |
| `session/events/RoomSessionConfirmPetBreedingEvent.as`       | Confirm pet breeding dialog                                  | TODO   |
| `session/events/RoomSessionConfirmPetBreedingResultEvent.as` | Breeding confirmation result                                 | TODO   |
| `session/events/RoomSessionNestBreedingSuccessEvent.as`      | Nest breeding successful                                     | TODO   |
| `session/events/RoomSessionPetPackageEvent.as`               | Pet package open request/result                              | TODO   |
| `session/events/BadgeImageReadyEvent.as`                     | Badge image loaded                                           | TODO   |
| `session/events/PerksUpdatedEvent.as`                        | Perks updated                                                | TODO   |
| `session/events/MysteryBoxKeysUpdateEvent.as`                | Mystery box keys colors updated                              | TODO   |
| `session/events/SessionDataPreferencesEvent.as`              | Account preferences updated (UI flags)                       | TODO   |
| `session/events/UserNameUpdateEvent.as`                      | User name changed                                            | TODO   |

### Furniture Data

| AS3 File                                   | Purpose                                                    | Status |
|--------------------------------------------|------------------------------------------------------------|--------|
| `session/furniture/FurnitureDataParser.as` | Parses furniture data XML/Lingo format                     | TODO   |
| `session/furniture/FurnitureData.as`       | Furniture item data model - dimensions, colors, category   | TODO   |
| `session/furniture/class_1813.as`          | Interface for furniture data listener (IFurniDataListener) | TODO   |
| `session/furniture/class_3365.as`          | Interface for furniture data (IFurnitureData)              | TODO   |

### Product Data

| AS3 File                               | Purpose                                                    | Status |
|----------------------------------------|------------------------------------------------------------|--------|
| `session/product/ProductDataParser.as` | Parses product data XML/Lingo format                       | TODO   |
| `session/product/ProductData.as`       | Product data model - type, name, description               | TODO   |
| `session/product/class_1812.as`        | Interface for product data listener (IProductDataListener) | TODO   |
| `session/product/class_3423.as`        | Interface for product data (IProductData)                  | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File | Purpose                                  |
|----------|------------------------------------------|
| *(none)* | No UI components found in session module |

---

## Architecture Overview

### Session Hierarchy

```
SessionDataManager (global user session)                    ⚠️ PARTIAL
    |-- UserDataManager (users in room)                     ✅ DONE
    |-- PerkManager (user perks)                            ⚠️ PARTIAL (no messages)
    |-- IgnoredUsersManager (ignore list)                   ⚠️ PARTIAL (no messages)
    |-- HabboGroupInfoManager (group badges)                ⚠️ PARTIAL (no messages)
    |-- BadgeImageManager (badge loading)                   ❌ TODO
    |-- FurnitureDataParser (furniture definitions)         ❌ TODO
    |-- ProductDataParser (product definitions)             ❌ TODO

RoomSessionManager (room session lifecycle)                 ❌ TODO
    |-- RoomSession (active room)                           ❌ TODO
    |   |-- Message Handlers (12 handlers)                  ❌ TODO
    |
    |-- Event Dispatcher (34 event types)                   ❌ TODO
```

**Legend:** ✅ Done | ⚠️ Partial | ❌ TODO

### Key Data Flows

1. **User Login**: `SessionDataManager` receives user data, initializes sub-managers
2. **Enter Room**: `RoomSessionManager.gotoRoom()` creates `RoomSession`, starts handlers
3. **Room Events**: Handlers process incoming messages, dispatch session events
4. **User Actions**: `RoomSession` sends composer messages to server
5. **Leave Room**: `RoomSessionManager.disposeSession()` cleans up

### Handler Responsibilities

| Handler                  | Incoming Messages                                                 |
|--------------------------|-------------------------------------------------------------------|
| RoomSessionHandler       | Connection open/close, room ready, queue status, spectator        |
| RoomUsersHandler         | Users add/remove, badges, doorbell, figure change, pets, breeding |
| RoomChatHandler          | Chat, whisper, shout, respect, flood control, mute                |
| RoomPermissionsHandler   | Controller level, room owner                                      |
| RoomDataHandler          | Room info (trade mode, guild, pets allowed)                       |
| PollHandler              | Poll offer, content, error                                        |
| WordQuizHandler          | Quiz question, answer, finished                                   |
| PresentHandler           | Gift opened                                                       |
| PetPackageHandler        | Pet package open request/result                                   |
| RoomDimmerPresetsHandler | Mood light presets                                                |
| GenericErrorHandler      | Kicked by owner                                                   |
| AvatarEffectsHandler     | Active effects                                                    |

### Critical Classes for Port

1. **SessionDataManager** - Central hub for user data ⚠️ PARTIAL (basic user data done, FurniData/ProductData/Badges TODO)
2. **UserDataManager** - User lookup in rooms ✅ DONE
3. **PerkManager** - User permissions ⚠️ PARTIAL (structure done, messages TODO)
4. **IgnoredUsersManager** - Ignore list ⚠️ PARTIAL (structure done, messages TODO)
5. **HabboGroupInfoManager** - Group badges ⚠️ PARTIAL (structure done, messages TODO)
6. **FurnitureDataParser** - Furniture definitions - TODO (required by SessionDataManager)
7. **ProductDataParser** - Product definitions - TODO (required by SessionDataManager)
8. **BadgeImageManager** - Badge images - TODO (required by SessionDataManager)
9. **RoomSessionManager** - Room lifecycle, depends on handlers - TODO
10. **RoomSession** - Room actions/state, used by all room features - TODO
11. **All Handlers** - Process server messages, emit events - TODO
12. **All Events** - Data transfer objects for UI layer - TODO

---

## TypeScript Implementation Mapping

| AS3 File                           | TypeScript File                                         | Notes                                        |
|------------------------------------|---------------------------------------------------------|----------------------------------------------|
| `SessionDataManager.as`            | `src/habbo/session/SessionDataManager.ts`               | ⚠️ Partial (see missing features below)      |
| `ISessionDataManager.as`           | `src/habbo/session/ISessionDataManager.ts`              | ⚠️ Partial interface                         |
| `UserData.as`                      | `src/habbo/session/UserData.ts`                         | Full implementation               |
| `class_3490.as` (IUserData)        | `src/habbo/session/IUserData.ts`                        | Full interface                    |
| `UserDataManager.as`               | `src/habbo/session/UserDataManager.ts`                  | Full implementation               |
| `class_3525.as` (IUserDataManager) | `src/habbo/session/IUserDataManager.ts`                 | Full interface                    |
| `PerkManager.as`                   | `src/habbo/session/PerkManager.ts`                      | Structure only, messages TODO     |
| *(no AS3 interface)*               | `src/habbo/session/IPerkManager.ts`                     | Custom interface                  |
| `IgnoredUsersManager.as`           | `src/habbo/session/IgnoredUsersManager.ts`              | Structure only, messages TODO     |
| *(no AS3 interface)*               | `src/habbo/session/IIgnoredUsersManager.ts`             | Custom interface                  |
| `HabboGroupInfoManager.as`         | `src/habbo/session/HabboGroupInfoManager.ts`            | Structure only, messages TODO     |
| *(no AS3 interface)*               | `src/habbo/session/IHabboGroupInfoManager.ts`           | Custom interface                  |
| `HabboClubLevelEnum.as`            | `src/habbo/session/enum/HabboClubLevelEnum.ts`          | Full implementation               |
| `class_3428.as` (UIFlags)          | `src/habbo/session/enum/UIFlagsEnum.ts`                 | Full implementation               |
| `GenericErrorEnum.as`              | `src/habbo/session/enum/GenericErrorEnum.ts`            | Full implementation               |
| `RoomControllerLevelEnum.as`       | `src/habbo/session/enum/RoomControllerLevelEnum.ts`     | Full implementation               |
| `RoomTradingLevelEnum.as`          | `src/habbo/session/enum/RoomTradingLevelEnum.ts`        | Full implementation               |
| `TalentEnum.as`                    | `src/habbo/session/enum/TalentEnum.ts`                  | Full implementation               |

---

## SessionDataManager - Missing Features

The following AS3 features are **NOT YET implemented** in `SessionDataManager.ts`:

### Data Parsers (Major)
- `FurnitureDataParser` - Parsing furniture definitions from server
- `ProductDataParser` - Parsing product data from server
- `BadgeImageManager` - Loading and caching badge images
- `_floorItems`, `_wallItems` Maps - Furniture data storage
- `_furniDataListeners`, `_productDataListeners` - Async data loading callbacks

### Methods Missing
| Method                           | Purpose                                      |
|----------------------------------|----------------------------------------------|
| `getBadgeImage()`                | Get badge bitmap                             |
| `getBadgeSmallImage()`           | Get small badge bitmap                       |
| `getGroupBadgeImage()`           | Get group badge bitmap                       |
| `getProductData()`               | Get product by type                          |
| `getFloorItemData()`             | Get floor item by ID                         |
| `getWallItemData()`              | Get wall item by ID                          |
| `getFloorItemDataByName()`       | Get floor item by classname                  |
| `getWallItemDataByName()`        | Get wall item by classname                   |
| `getFurniData()`                 | Get all furniture data                       |
| `refreshFurniData()`             | Reload furniture data                        |
| `loadProductData()`              | Load product data async                      |
| `getCreditVaultStatus()`         | Request vault status                         |
| `withdrawCreditVault()`          | Withdraw from vault                          |
| `getIncomeRewardStatus()`        | Get income rewards                           |
| `claimReward()`                  | Claim income reward                          |
| `giveStarGem()`                  | Give star gem to user                        |
| `hasNftChatStyle()`              | Check NFT chat style ownership               |
| `pickAllFurniture()`             | Room owner: pick all furniture               |
| `ejectAllFurniture()`            | Room owner: eject all furniture              |
| `ejectPets()`                    | Room owner: eject all pets                   |
| `resetScores()`                  | Room owner: reset scores                     |
| `sendSpecialCommandMessage()`    | Send chat command                            |
| `openHabboHomePage()`            | Open user profile                            |

### Properties Missing
- `roomSessionManager` - Reference to room session manager
- `windowManager` - Reference to window manager
- `localization` - Reference to localization manager
- `perksReady` - Whether perks have loaded
- `currentTalentTrack` - Current talent track (helper/citizenship)
- `nftChatStyles` - User's NFT chat styles

---

## Notes

- All 77 files are ENGINE code - session module has no UI
- Most classes use obfuscated names (class_XXXX, var_XXXX)
- Heavy use of interfaces for loose coupling
- Event-driven architecture with EventDispatcher
- Handlers register message listeners in constructor
- Session events extend base RoomSessionEvent
