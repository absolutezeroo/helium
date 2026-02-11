# Inventory System Architecture

## Summary

| Category     | Count  |
|--------------|--------|
| ENGINE Files | 33     |
| VIEW Files   | 18     |
| **Total**    | **51** |

---

## ENGINE FILES
> Inventory data, item management, trading logic - code we NEED

| AS3 File                                  | Purpose                                                                                                                     | Status |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|--------|
| `HabboInventory.as`                       | Main inventory controller; initializes all models, handles communication events, manages inventory state and navigation     | TODO   |
| `class_1814.as`                           | Interface for HabboInventory external API; defines furniture placement, trading, catalog integration                        | TODO   |
| `class_3353.as`                           | Message handler/event dispatcher; registers all inventory-related server message handlers                                   | TODO   |
| `class_3425.as`                           | Interface for UnseenItemTracker; defines unseen item tracking contract                                                      | TODO   |
| `class_3579.as`                           | Simple enum constants for inventory states                                                                                  | TODO   |
| `IInventoryModel.as`                      | Base interface for all inventory models; defines initialization and view update contracts                                   | TODO   |
| `UnseenItemTracker.as`                    | Tracks newly received items not yet viewed by user; manages unseen counts per category, syncs with server                   | TODO   |
| `badges/Badge.as`                         | Badge data model with code, slot, isSelected properties                                                                     | TODO   |
| `badges/BadgesModel.as`                   | Badge inventory management; wearing badges, selecting active badges, server communication                                   | TODO   |
| `bots/BotsModel.as`                       | Bot inventory management; bot data storage, placement requests, room integration                                            | TODO   |
| `common/IThumbListDataProvider.as`        | Interface for thumbnail list data sources; defines drawable item collection contract                                        | TODO   |
| `effects/Effect.as`                       | Effect data model; stores effect type, duration, activation state, quantity                                                 | TODO   |
| `effects/EffectListProxy.as`              | Proxy wrapper for effect lists; provides filtered/sorted access to effects                                                  | TODO   |
| `effects/EffectsModel.as`                 | Effect inventory management; effect activation, expiration tracking, selection logic                                        | TODO   |
| `enum/class_3364.as`                      | Unseen category constants (OWNED_FURNI=1, RENTED_FURNI=2, PET=3, BADGE=4, BOT=5)                                            | TODO   |
| `enum/class_3443.as`                      | Inventory state constants (EMPTY, TRADING)                                                                                  | TODO   |
| `enum/class_3494.as`                      | Category name string constants for inventory tabs                                                                           | TODO   |
| `enum/class_3518.as`                      | Furniture category type constants (wallpaper, floor, landscape, poster, etc.)                                               | TODO   |
| `events/HabboInventoryEffectsEvent.as`    | Effect-related inventory event                                                                                              | TODO   |
| `events/HabboInventoryHabboClubEvent.as`  | Club membership inventory event                                                                                             | TODO   |
| `events/HabboInventoryItemAddedEvent.as`  | Item added to inventory event                                                                                               | TODO   |
| `events/HabboInventoryTrackingEvent.as`   | Inventory tracking/analytics event                                                                                          | TODO   |
| `events/HabboUnseenItemsUpdatedEvent.as`  | Unseen items count updated event                                                                                            | TODO   |
| `events/InventoryEffectActivatedEvent.as` | Effect activation event                                                                                                     | TODO   |
| `furni/FurniModel.as`                     | Core furniture inventory management; item grouping, placement, trading integration, marketplace offers                      | TODO   |
| `items/class_3393.as`                     | Interface for furniture items; defines id, ref, type, stuffData, category, tradeable, recyclable, sellable                  | TODO   |
| `items/CreditTradingItem.as`              | Special GroupItem extension for credit furniture; handles credit value display in trading                                   | TODO   |
| `items/FurnitureItem.as`                  | Core furniture item data model; stores all item properties (id, type, category, stuffData, trading flags, rental info)      | TODO   |
| `items/GroupItem.as`                      | Item grouping logic; groups identical items, tracks counts, manages locks for trading/recycling (mixed: has UI window refs) | TODO   |
| `items/IThumbListDrawableItem.as`         | Interface for drawable inventory items; iconImage and isSelected properties                                                 | TODO   |
| `marketplace/MarketplaceModel.as`         | Marketplace offer management; creating/canceling offers, price calculations                                                 | TODO   |
| `pets/PetsModel.as`                       | Pet inventory management; pet data storage, placement, breeding integration                                                 | TODO   |
| `purse/Purse.as`                          | Currency/membership data model; club days, VIP status, expiration tracking                                                  | TODO   |
| `trading/TradingModel.as`                 | Core trading logic; item exchange state machine, add/remove items, accept/confirm flow, silver fee handling                 | TODO   |

---

## VIEW FILES
> UI rendering, window layouts - code we IGNORE (SolidJS handles UI)

| AS3 File                         | Purpose                                                                                               |
|----------------------------------|-------------------------------------------------------------------------------------------------------|
| `IInventoryView.as`              | View interface for inventory display                                                                  |
| `InventoryMainView.as`           | Main inventory window container; tab switching, minimize/maximize, resize                             |
| `ItemPopupCtrl.as`               | Item tooltip/popup controller; shows item details on hover                                            |
| `Util.as`                        | UI utility functions; button enable/disable, layout helpers (moveAllChildrenToColumn, getLowestPoint) |
| `badges/BadgeGridView.as`        | Badge grid display component                                                                          |
| `badges/BadgesView.as`           | Badge inventory tab UI; badge slots, wearing interface                                                |
| `bots/BotGridItem.as`            | Individual bot grid item display                                                                      |
| `bots/BotsView.as`               | Bot inventory tab UI                                                                                  |
| `common/ThumbListManager.as`     | Thumbnail list rendering; handles grid display, scrolling, pagination                                 |
| `effects/EffectsView.as`         | Effects inventory tab UI; effect list, activation buttons                                             |
| `furni/FurniGridView.as`         | Furniture grid display; filtering, paging, search integration                                         |
| `furni/FurniView.as`             | Furniture inventory tab UI; item selection, action buttons                                            |
| `marketplace/MarketplaceView.as` | Marketplace UI dialogs; offer creation, confirmation popups                                           |
| `pets/PetsGridItem.as`           | Individual pet grid item display                                                                      |
| `pets/PetsView.as`               | Pet inventory tab UI                                                                                  |
| `trading/TradingView.as`         | Trading window UI; own/other user grids, accept/cancel buttons, countdown timer                       |

---

## Detailed File Analysis

### Root Level Files

#### HabboInventory.as (ENGINE)
Main inventory controller that orchestrates all sub-models:
- Initializes FurniModel, BadgesModel, BotsModel, EffectsModel, PetsModel, TradingModel, MarketplaceModel
- Registers server message handlers via class_3353
- Manages inventory window visibility and tab navigation
- Integrates with catalog, room engine, and communication manager
- Handles unseen item tracking

#### UnseenItemTracker.as (ENGINE)
Tracks items the user hasn't viewed yet:
- Maintains Dictionary of unseen item IDs by category
- Categories: OWNED_FURNI(1), RENTED_FURNI(2), PET(3), BADGE(4), BOT(5)
- Syncs with server via ResetUnseenItemsComposer/ResetUnseenItemIdsComposer
- Dispatches HabboUnseenItemsUpdatedEvent when counts change

#### Util.as (VIEW)
UI helper utilities:
- `disableButton()` - Enable/disable window buttons
- `moveAllChildrenToColumn()` - Layout children in vertical column with spacing
- `getLowestPoint()` - Calculate container height based on children

### Badges Module

#### Badge.as (ENGINE - with minor UI refs)
Badge data model:
- Properties: code (String), slot (int), isSelected (Boolean)
- Has window reference but primarily data container

#### BadgesModel.as (ENGINE)
Badge inventory logic:
- Stores badge collection
- Manages which badges are worn (slots 1-5)
- Handles badge selection and wearing requests
- Communicates with server for badge updates

### Bots Module

#### BotsModel.as (ENGINE)
Bot inventory management:
- Stores bot data
- Handles bot placement in rooms
- Manages bot selection

### Effects Module

#### Effect.as (ENGINE)
Effect data model:
- Properties: type, duration, quantity, isActive, activationTimestamp
- Calculates remaining time for active effects

#### EffectsModel.as (ENGINE)
Effect inventory logic:
- Activates/deactivates effects
- Tracks effect expiration
- Manages effect selection

### Furni Module

#### FurniModel.as (ENGINE)
Core furniture management - the most complex model:
- Groups identical items using GroupItem
- Handles item placement in rooms
- Integrates with trading system (locks items being traded)
- Manages recycler integration
- Marketplace offer creation
- Category filtering and search

### Items Module

#### FurnitureItem.as (ENGINE)
Core item data class:
- Properties: id, type, category, stuffData, extra
- Trading flags: tradeable, recyclable, sellable, groupable
- Rental info: isRented, secondsToExpiration, hasRentPeriodStarted
- Creation date tracking

#### GroupItem.as (ENGINE - mixed with UI)
Groups identical furniture items:
- Stack management: push, pop, peek, getAt
- Lock management for trading/recycling
- Count tracking (total, unlocked, tradeable, recyclable)
- Trade item selection logic
- **Note**: Contains window/UI references for thumbnail display - UI portions can be ignored

#### class_3393.as (ENGINE)
Interface defining furniture item contract:
- id, ref, type, stuffData, extra, category
- Trading properties: recyclable, tradeable, groupable, sellable
- Lock state and wall item flag

### Trading Module

#### TradingModel.as (ENGINE)
Complete trading state machine:
- States: READY(0), RUNNING(1), COUNTDOWN(2), CONFIRMING(3), CONFIRMED(4), COMPLETED(5), CANCELLED(6)
- Manages own user and other user item collections
- Add/remove items from trade
- Accept/unaccept/confirm/cancel flow
- Silver fee handling for web3 trades
- Credit furniture detection

Key methods:
- `startTrading()` - Initialize trade session
- `requestAddItemsToTrading()` - Add items to offer
- `requestRemoveItemFromTrading()` - Remove item from offer
- `requestAcceptTrading()` / `requestUnacceptTrading()` - Accept/modify offer
- `requestConfirmAcceptTrading()` - Final confirmation
- `getOwnItemIdsInTrade()` - Get all item refs in current offer

### Marketplace Module

#### MarketplaceModel.as (ENGINE)
Marketplace offer management:
- Create sale offers
- Cancel existing offers
- Price validation and calculations

### Pets Module

#### PetsModel.as (ENGINE)
Pet inventory management:
- Pet data storage
- Pet placement in rooms
- Pet selection and details display

### Purse Module

#### Purse.as (ENGINE)
Currency and membership data:
- Club membership: days, periods, VIP status
- Expiration tracking with real-time countdown
- Modified timestamp tracking

---

## Key Data Flows

### Item Addition Flow
1. Server sends item added message
2. class_3353 routes to appropriate model (FurniModel, etc.)
3. Model creates FurnitureItem from message parser
4. Model groups item into existing GroupItem or creates new one
5. UnseenItemTracker marks item as unseen
6. View updates to show new item with unseen highlight

### Trading Flow
1. User initiates trade via room context menu
2. TradingModel.startTrading() initializes session
3. User adds items -> requestAddItemsToTrading() locks items in FurniModel
4. Both users accept -> state transitions to COUNTDOWN
5. After countdown -> state transitions to CONFIRMING
6. Both confirm -> state transitions to COMPLETED
7. Server confirms trade -> items transferred

### Item Placement Flow
1. User drags item from inventory
2. FurniModel.requestSelectedFurniPlacement() called
3. Item locked to prevent trading during placement
4. Room engine handles placement visualization
5. Server confirms placement -> item removed from inventory

---

## Dependencies

### External Interfaces Used
- `IRoomEngine` - Room rendering and item visualization
- `IHabboCommunicationManager` - Server communication
- `IHabboLocalizationManager` - Text localization
- `IHabboWindowManager` - Window/UI creation (VIEW layer)
- `IHabboNotifications` - User notifications
- `class_2240` - Sound manager for music/trax

### Key Message Composers (Outgoing)
- `OpenTradingComposer` - Start trade
- `AddItemToTradeComposer` / `AddItemsToTradeComposer` - Add to trade
- `RemoveItemFromTradeComposer` - Remove from trade
- `AcceptTradingComposer` / `UnacceptTradingComposer` - Accept/modify
- `ConfirmAcceptTradingComposer` / `ConfirmDeclineTradingComposer` - Final confirm
- `CloseTradingComposer` - Cancel trade
- `ResetUnseenItemsComposer` / `ResetUnseenItemIdsComposer` - Clear unseen markers

### Key Message Events (Incoming)
- `TradingItemListEvent` - Trade items updated
- `TradingAcceptEvent` - User accepted
- `TradingConfirmationEvent` - Ready to confirm
- `TradingCompletedEvent` - Trade successful
- `TradingCloseEvent` - Trade cancelled
- `UnseenItemsEvent` - New unseen items received
