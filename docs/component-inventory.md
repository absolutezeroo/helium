# Component Inventory

> Generated: 2026-01-31 | Scan Level: Exhaustive

## UI Components (SolidJS)

### Root Components

| Component | File             | Description                |
|-----------|------------------|----------------------------|
| `App`     | `src/ui/App.tsx` | Root application component |

### Common Components

| Component       | File                                  | Description                  |
|-----------------|---------------------------------------|------------------------------|
| `LoadingScreen` | `components/common/LoadingScreen.tsx` | Loading/connecting indicator |
| `Text`          | `components/common/Text.tsx`          | Localized text component     |

### Landing Components

| Component     | File                                 | Description            |
|---------------|--------------------------------------|------------------------|
| `LandingView` | `components/landing/LandingView.tsx` | Main landing page view |

### Toolbar Components

| Component | File                             | Description              |
|-----------|----------------------------------|--------------------------|
| `Toolbar` | `components/toolbar/Toolbar.tsx` | Main application toolbar |

### Navigator Components

| Component         | File                                       | Description                |
|-------------------|--------------------------------------------|----------------------------|
| `Navigator`       | `components/navigator/Navigator.tsx`       | Navigator main component   |
| `NavigatorWindow` | `components/navigator/NavigatorWindow.tsx` | Navigator window container |

#### Navigator - Tabs

| Component       | File                     | Description    |
|-----------------|--------------------------|----------------|
| `NavigatorTabs` | `tabs/NavigatorTabs.tsx` | Tab container  |
| `NavigatorTab`  | `tabs/NavigatorTab.tsx`  | Individual tab |

#### Navigator - Rooms

| Component         | File                        | Description        |
|-------------------|-----------------------------|--------------------|
| `RoomList`        | `rooms/RoomList.tsx`        | List of room cards |
| `RoomCard`        | `rooms/RoomCard.tsx`        | Room card display  |
| `RoomCardCompact` | `rooms/RoomCardCompact.tsx` | Compact room card  |

#### Navigator - Room Info

| Component         | File                           | Description          |
|-------------------|--------------------------------|----------------------|
| `RoomInfoPanel`   | `roominfo/RoomInfoPanel.tsx`   | Room info container  |
| `RoomInfoHeader`  | `roominfo/RoomInfoHeader.tsx`  | Room info header     |
| `RoomInfoDetails` | `roominfo/RoomInfoDetails.tsx` | Room details section |
| `RoomInfoActions` | `roominfo/RoomInfoActions.tsx` | Room action buttons  |

#### Navigator - Search

| Component         | File                         | Description          |
|-------------------|------------------------------|----------------------|
| `NavigatorSearch` | `search/NavigatorSearch.tsx` | Search input         |
| `PopularTags`     | `search/PopularTags.tsx`     | Popular tags display |
| `SearchResults`   | `search/SearchResults.tsx`   | Search results list  |

#### Navigator - Categories

| Component      | File                          | Description             |
|----------------|-------------------------------|-------------------------|
| `CategoryList` | `categories/CategoryList.tsx` | Category list container |
| `CategoryItem` | `categories/CategoryItem.tsx` | Individual category     |

#### Navigator - Create Room

| Component         | File                         | Description         |
|-------------------|------------------------------|---------------------|
| `RoomCreateModal` | `create/RoomCreateModal.tsx` | Room creation modal |
| `RoomCreateForm`  | `create/RoomCreateForm.tsx`  | Room creation form  |

#### Navigator - Common

| Component         | File                         | Description             |
|-------------------|------------------------------|-------------------------|
| `NavigatorHeader` | `common/NavigatorHeader.tsx` | Navigator header        |
| `NavigatorButton` | `common/NavigatorButton.tsx` | Navigator action button |
| `NavigatorIcon`   | `common/NavigatorIcon.tsx`   | Navigator icon          |

## State Management (Stores)

| Store               | File                          | Purpose                |
|---------------------|-------------------------------|------------------------|
| `connectionStore`   | `stores/connectionStore.ts`   | Connection state       |
| `sessionStore`      | `stores/sessionStore.ts`      | User session data      |
| `configStore`       | `stores/configStore.ts`       | Configuration settings |
| `navigatorStore`    | `stores/navigatorStore.ts`    | Navigator state        |
| `localizationStore` | `stores/localizationStore.ts` | Localization strings   |

## Core Services (Managers)

### Implemented

| Service              | Interface                    | Implementation              | Purpose             |
|----------------------|------------------------------|-----------------------------|---------------------|
| Configuration        | `IConfigurationManager`      | `ConfigurationManager`      | External variables  |
| Core Communication   | `ICoreCommunicationManager`  | `CoreCommunicationManager`  | Connection pooling  |
| Habbo Communication  | `IHabboCommunicationManager` | `HabboCommunicationManager` | Habbo protocol      |
| Session Data         | `ISessionDataManager`        | `SessionDataManager`        | User session        |
| Navigator            | `IHabboNavigator`            | `HabboNavigator`            | Room navigation     |
| Localization (Core)  | `ILocalizationManager`       | `CoreLocalizationManager`   | Base i18n           |
| Localization (Habbo) | `IHabboLocalizationManager`  | `HabboLocalizationManager`  | Habbo-specific i18n |

### Defined but Not Implemented (Stubs)

| Service               | Status         |
|-----------------------|----------------|
| `AvatarRenderManager` | Symbol defined |
| `CatalogManager`      | Symbol defined |
| `InventoryManager`    | Symbol defined |
| `SoundManager`        | Symbol defined |
| `UIManager`           | Symbol defined |
| `RoomEngine`          | Symbol defined |
| `RoomManager`         | Symbol defined |
| `RoomRenderer`        | Symbol defined |

## Communication Components

### Connection Layer

| Component             | File                             | Purpose              |
|-----------------------|----------------------------------|----------------------|
| `SocketConnection`    | `core/communication/connection/` | WebSocket wrapper    |
| `IConnection`         | `core/communication/connection/` | Connection interface |
| `IConnectionCallback` | `core/communication/connection/` | Callback interface   |

### Message Infrastructure

| Component            | File                           | Purpose             |
|----------------------|--------------------------------|---------------------|
| `MessageDataWrapper` | `core/communication/messages/` | Binary data reader  |
| `MessageRegistry`    | `core/communication/messages/` | Message ID registry |
| `IMessageEvent`      | `core/communication/messages/` | Event interface     |
| `IMessageParser`     | `core/communication/messages/` | Parser interface    |
| `IMessageComposer`   | `core/communication/messages/` | Composer interface  |

### Encryption

| Component       | File                             | Purpose          |
|-----------------|----------------------------------|------------------|
| `DiffieHellman` | `core/communication/encryption/` | Key exchange     |
| `ArcFour`       | `core/communication/encryption/` | Stream cipher    |
| `CryptoTools`   | `core/communication/encryption/` | Crypto utilities |

### Binary Utilities

| Component   | File                       | Purpose                  |
|-------------|----------------------------|--------------------------|
| `ByteArray` | `core/communication/util/` | Flash-like binary buffer |
| `Byte`      | `core/communication/util/` | Byte operations          |
| `Short`     | `core/communication/util/` | Short operations         |
| `Long`      | `core/communication/util/` | Long operations          |

## Navigator Data Classes

| Class                  | File                | Purpose                   |
|------------------------|---------------------|---------------------------|
| `NavigatorData`        | `navigator/domain/` | Navigator state container |
| `GuestRoomData`        | `navigator/data/`   | Room data                 |
| `FlatCategory`         | `navigator/data/`   | Room category             |
| `EventCategory`        | `navigator/data/`   | Event category            |
| `RoomEventData`        | `navigator/data/`   | Room event                |
| `OfficialRoomEntry`    | `navigator/data/`   | Official room entry       |
| `CompetitionRoomsData` | `navigator/data/`   | Competition data          |

## Component Status Summary

| Category          | Implemented | Stub/Planned |
|-------------------|-------------|--------------|
| UI Components     | 27          | -            |
| Stores            | 5           | -            |
| Core Services     | 7           | -            |
| Planned Services  | -           | 8            |
| Message Events    | 40+         | Many more    |
| Message Composers | 40+         | Many more    |
