# Navigator Architecture Documentation

This document categorizes all AS3 navigator files into **ENGINE** (business logic we need to implement) and **VIEW** (UI code we ignore since SolidJS handles our UI).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth. Follow it exactly.

---

## Summary

| Category          | Count | Done | Description                                            |
|-------------------|-------|------|--------------------------------------------------------|
| ENGINE (Required) | 25    | 20   | Business logic, data models, message handlers, caching |
| VIEW (Ignore)     | 45+   | N/A  | UI components, rendering, display controllers          |

**Progress: ~80% ENGINE files implemented**

---

## ENGINE FILES (We Need These)

### Core Navigator Components

| AS3 File                         | Purpose                                               | TS Equivalent            | Status  |
|----------------------------------|-------------------------------------------------------|--------------------------|---------|
| `HabboNavigator.as`              | Legacy navigator, handles old messages                | `HabboNavigator.ts`      | ✅ Done |
| `HabboNewNavigator.as`           | New navigator, modern search system                   | `HabboNewNavigator.ts`   | ✅ Done |
| `IHabboNavigator.as`             | Interface for legacy navigator                        | `IHabboNavigator.ts`     | ✅ Done |
| `IHabboNewNavigator.as`          | Interface for new navigator                           | `IHabboNewNavigator.ts`  | ✅ Done |
| `IHabboTransitionalNavigator.as` | Bridge interface                                      | Not needed               | ⏭️ Skip |
| `IncomingMessages.as`            | Legacy message handlers (room info, favourites, etc.) | `IncomingMessages.ts`    | ✅ Done |
| `NewIncomingMessages.as`         | New navigator message handlers                        | `NewIncomingMessages.ts` | ✅ Done |

### Domain (Data Models)

| AS3 File                    | Purpose                                    | TS Equivalent               | Status  |
|-----------------------------|--------------------------------------------|-----------------------------|---------|
| `domain/NavigatorData.as`   | Central data store for all navigator state | `domain/NavigatorData.ts`   | ✅ Done |
| `domain/RoomSessionTags.as` | Room tag session data                      | `domain/RoomSessionTags.ts` | TODO    |

### Cache

| AS3 File                       | Purpose               | TS Equivalent                  | Status  |
|--------------------------------|-----------------------|--------------------------------|---------|
| `cache/NavigatorCache.as`      | Caches search results | `cache/NavigatorCache.ts`      | ✅ Done |
| `cache/NavigatorCacheEntry.as` | Cache entry with TTL  | `cache/NavigatorCacheEntry.ts` | ✅ Done |

### Context (Search State Management)

| AS3 File                                 | Purpose                         | TS Equivalent                            | Status  |
|------------------------------------------|---------------------------------|------------------------------------------|---------|
| `context/ContextContainer.as`            | Holds top-level contexts (tabs) | `context/ContextContainer.ts`            | ✅ Done |
| `context/SearchContext.as`               | Search state (code + filtering) | `context/SearchContext.ts`               | ✅ Done |
| `context/SearchContextHistoryManager.as` | Back/forward navigation history | `context/SearchContextHistoryManager.ts` | ✅ Done |

### Lift (Promoted/Lifted Rooms)

| AS3 File                    | Purpose                          | TS Equivalent               | Status  |
|-----------------------------|----------------------------------|-----------------------------|---------|
| `lift/LiftDataContainer.as` | Container for promoted room data | `lift/LiftDataContainer.ts` | ✅ Done |

### Events (Tracking)

| AS3 File                                   | Purpose                  | TS Equivalent                             | Status  |
|--------------------------------------------|--------------------------|-------------------------------------------|---------|
| `events/HabboNavigatorTrackingEvent.as`    | Tracking event constants | `events/HabboNavigatorTrackingEvent.ts`   | ✅ Done |
| `events/HabboRoomSettingsTrackingEvent.as` | Room settings tracking   | `events/HabboRoomSettingsTrackingEvent.ts`| ✅ Done |

### View Utilities (Used by Engine Logic)

| AS3 File                                 | Purpose                                | TS Equivalent             | Status  |
|------------------------------------------|----------------------------------------|---------------------------|---------|
| `view/search/ViewMode.as`                | VIEW_MODE constants (LIST, THUMBNAILS) | `view/ViewMode.ts`        | ✅ Done |
| `view/search/results/ResultsModeEnum.as` | Results mode enumeration               | `view/ResultsModeEnum.ts` | ✅ Done |
| `view/search/results/RoomEntryUtils.as`  | Room entry utility functions           | `view/RoomEntryUtils.ts`  | TODO    |

### Transitional (Legacy Bridge)

| AS3 File                           | Purpose                    | TS Equivalent                       | Status  |
|------------------------------------|----------------------------|-------------------------------------|---------|
| `transitional/LegacyNavigator.as`  | Bridges new->old navigator | Not needed (different architecture) | ⏭️ Skip |
| `transitional/FakeMainViewCtrl.as` | Fake controller for legacy | Not needed                          | ⏭️ Skip |

### Room Settings (Engine Parts Only)

| AS3 File                          | Purpose                      | TS Equivalent                      | Status |
|-----------------------------------|------------------------------|------------------------------------|--------|
| `roomsettings/FriendEntryData.as` | Friend data structure        | `roomsettings/FriendEntryData.ts`  | TODO   |
| `roomsettings/class_3637.as`      | Room settings data structure | `roomsettings/RoomSettingsData.ts` | TODO   |

### Utility

| AS3 File  | Purpose           | TS Equivalent | Status  |
|-----------|-------------------|---------------|---------|
| `Util.as` | Utility functions | `utils.ts`    | Partial |

---

## VIEW FILES (We Ignore These)

SolidJS handles our UI. These are only for reference if UI behavior is unclear.

### Alert Views
- `AlertView.as` - Alert dialog base
- `SimpleAlertView.as` - Simple alert
- `ClubPromoAlertView.as` - Club promotion alert

### Main Navigator Views
- `view/NavigatorView.as` - Main navigator window
- `view/LiftView.as` - Promoted rooms view
- `view/QuickLinksView.as` - Quick links
- `view/RoomInfoPopup.as` - Room info popup
- `view/TopViewSelector.as` - Tab selector
- `view/search/SearchView.as` - Search view container
- `view/search/results/BlockResultsView.as` - Results block view
- `view/search/results/CategoryElementFactory.as` - Category UI factory
- `view/search/results/RoomEntryElementFactory.as` - Room entry UI factory
- `view/search/class_3756.as` - Search UI helper

### Main View Controllers
- `mainview/MainViewCtrl.as` - Main view controller
- `mainview/CategoryListCtrl.as` - Category list UI
- `mainview/GuestRoomListCtrl.as` - Guest room list UI
- `mainview/OfficialRoomListCtrl.as` - Official room list UI
- `mainview/OfficialRoomEntryManager.as` - Official room UI manager
- `mainview/OfficialRoomImageLoader.as` - Image loading
- `mainview/PopularTagsListCtrl.as` - Tags list UI
- `mainview/PromotedRoomsGuestRoomListCtrl.as` - Promoted rooms UI
- `mainview/PromotedRoomsListCtrl.as` - Promoted list UI
- `mainview/RoomAdListCtrl.as` - Room ads UI
- `mainview/ITransitionalMainViewCtrl.as` - Interface for legacy

### Tab Page Decorators
- `mainview/tabpagedecorators/ITabPageDecorator.as`
- `mainview/tabpagedecorators/CategoriesTabPageDecorator.as`
- `mainview/tabpagedecorators/EventsTabPageDecorator.as`
- `mainview/tabpagedecorators/MyRoomsTabPageDecorator.as`
- `mainview/tabpagedecorators/OfficialTabPageDecorator.as`
- `mainview/tabpagedecorators/RoomsTabPageDecorator.as`
- `mainview/tabpagedecorators/SearchTabPageDecorator.as`

### In-Room Views
- `inroom/RoomInfoViewCtrl.as` - Room info panel
- `inroom/RoomEventViewCtrl.as` - Room event UI
- `inroom/RoomEventInfoCtrl.as` - Event info UI

### Room Settings Views
- `roomsettings/RoomSettingsCtrl.as` - Settings panel
- `roomsettings/RoomCreateViewCtrl.as` - Create room UI
- `roomsettings/RoomFilterCtrl.as` - Filter UI
- `roomsettings/BanListCtrl.as` - Ban list UI
- `roomsettings/UserListCtrl.as` - User list UI
- `roomsettings/EnforceCategoryCtrl.as` - Category enforcement UI
- `roomsettings/ConfirmDialogView.as` - Confirmation dialog

### Popup Controllers
- `PopupCtrl.as` - Popup base
- `RoomPopupCtrl.as` - Room popup

### Guest Room Entry
- `GuestRoomDoorbell.as` - Doorbell UI
- `GuestRoomPasswordInput.as` - Password input UI
- `GuildInfoCtrl.as` - Guild info UI

### Toolbar
- `toolbar/ToolbarHoverCtrl.as` - Toolbar hover UI

### Miscellaneous View Utils
- `IViewCtrl.as` - View controller interface
- `TagRenderer.as` - Tag rendering
- `UserCountRenderer.as` - User count rendering
- `TextFieldManager.as` - Text field management
- `TextSearchInputs.as` - Search input UI
- `CutToHeight.as` - Height clipping
- `CutToWidth.as` - Width clipping
- `BinarySearchTest.as` - Test utility

### Domain (View-only)
- `domain/Tab.as` - Tab UI representation
- `domain/Tabs.as` - Tabs collection for UI
- `domain/RoomLayout.as` - Room layout for UI display

---

## Architecture Pattern

### AS3 Architecture
```
HabboNewNavigator (Component)
    ├── NavigatorData (shared data model)
    ├── NewIncomingMessages (handles server messages)
    ├── NavigatorCache (caches search results)
    ├── ContextContainer (manages top-level contexts/tabs)
    ├── SearchContextHistoryManager (back/forward)
    ├── NavigatorView (VIEW - displays UI)
    └── LegacyNavigator (bridge to HabboNavigator)
```

### Our TypeScript Architecture
```
HabboNewNavigator (injectable singleton)
    ├── NavigatorData (shared data, emits events)
    ├── NewIncomingMessages (handles server messages)
    ├── NavigatorCache (caches search results)
    ├── ContextContainer (manages top-level contexts)
    └── SearchContextHistoryManager (back/forward)

navigatorStore (SolidJS reactive store)
    └── Listens to HabboNewNavigator events
    └── Exposes reactive signals to UI components
```

### Key Difference
AS3 calls view methods directly:
```actionscript
_navigatorView.showSearchResults(results);
```

We emit events and the store listens:
```typescript
this.emit('searchResults', results);
// Store listens and updates signals
```

---

## Message Flow

### Initialization Flow
```
1. User clicks Navigator button
2. navigatorStore.openNavigator()
3. HabboNewNavigator.open()
4. If first open: HabboNewNavigator.init()
5. Sends NewNavigatorInitComposer
6. Server responds with NavigatorMetaDataEvent
7. NewIncomingMessages handles it
8. HabboNewNavigator.initialize(contexts)
9. Emits 'initialized' event
10. navigatorStore receives contexts
11. UI renders tabs
```

### Search Flow
```
1. User clicks tab or searches
2. navigatorStore.performSearch(code, filter)
3. HabboNewNavigator.performSearch()
4. Check cache first
5. If not cached: send NewNavigatorSearchComposer
6. Server responds with NavigatorSearchResultSetEvent
7. NewIncomingMessages handles it
8. HabboNewNavigator.onSearchResult()
9. Updates cache, history
10. Emits 'searchResults' event
11. navigatorStore updates signal
12. UI re-renders with results
```

---

## Next Implementation Steps

1. ~~**Complete NewIncomingMessages** - Handle all new navigator messages~~ ✅
2. ~~**Complete NavigatorData** - All data properties and events~~ ✅
3. **Implement lift/LiftDataContainer** - Promoted rooms support
4. **Room settings data structures** - FriendEntryData, RoomSettingsData
5. **View utilities** - ViewMode, ResultsModeEnum, RoomEntryUtils
6. **Domain extras** - RoomSessionTags

---

## Communication Messages

### New Navigator (what we use)

**Outgoing:**
- `NewNavigatorInitComposer` - Initialize navigator
- `NewNavigatorSearchComposer` - Search rooms
- `NavigatorAddSavedSearchComposer` - Save search
- `NavigatorDeleteSavedSearchComposer` - Delete saved search
- `NavigatorAddCollapsedCategoryMessageComposer` - Collapse category
- `NavigatorRemoveCollapsedCategoryMessageComposer` - Expand category
- `NavigatorSetSearchCodeViewModeMessageComposer` - Set view mode

**Incoming:**
- `NavigatorMetaDataEvent` - Top-level contexts
- `NavigatorSearchResultSetEvent` - Search results
- `NavigatorLiftedRoomsEvent` - Promoted rooms
- `NavigatorSavedSearchesEvent` - Saved searches
- `NavigatorCollapsedCategoriesEvent` - Collapsed state

### Legacy Navigator (shared)

**Outgoing:**
- `GetGuestRoomMessageComposer` - Get room info
- `AddFavouriteRoomMessageComposer` - Add favourite
- `DeleteFavouriteRoomMessageComposer` - Remove favourite
- `UpdateHomeRoomMessageComposer` - Set home room
- `CreateFlatMessageComposer` - Create room
- `RateFlatMessageComposer` - Rate room

**Incoming:**
- `GetGuestRoomResultEvent` - Room info
- `FavouritesEvent` - Favourites list
- `FavouriteChangedEvent` - Favourite changed
- `NavigatorSettingsEvent` - Settings
- `FlatCreatedEvent` - Room created
- `RoomRatingEvent` - Room rating
