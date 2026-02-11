# Catalog Architecture Documentation

This document categorizes all AS3 catalog files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Description                                                             |
|----------|-------|-------------------------------------------------------------------------|
| ENGINE   | 62    | Business logic, data models, purchase logic, offer handling, interfaces |
| VIEW     | 43    | UI rendering, window components, visual layouts, widgets                |

---

## ENGINE FILES (We Need These)

### Core Catalog Engine

| AS3 File               | Purpose                                                                                     | Status |
|------------------------|---------------------------------------------------------------------------------------------|--------|
| `HabboCatalog.as`      | Main catalog component - handles all catalog operations, messaging, page loading, purchases | TODO   |
| `IHabboCatalog.as`     | Interface defining catalog public API - page loading, marketplace, club offers              | TODO   |
| `HabboCatalogUtils.as` | Utility functions for price formatting, image handling, builders club detection             | TODO   |
| `class_3377.as`        | IOffer interface - defines offer properties (price, product, giftable, etc.)                | TODO   |

### Enumerations & Constants

| AS3 File                              | Purpose                                                      | Status |
|---------------------------------------|--------------------------------------------------------------|--------|
| `enum/CatalogType.as`                 | Catalog type constants (NORMAL, BUILDERS_CLUB)               | TODO   |
| `enum/CatalogPageName.as`             | Page name constants (credits, club, pets, marketplace, etc.) | TODO   |
| `enum/BuilderFurniPlaceableStatus.as` | Builder furniture placement status enum                      | TODO   |
| `enum/HabboCatalogTrackingEvent.as`   | Tracking event type constants                                | TODO   |
| `enum/VideoOfferTypeEnum.as`          | Video offer type constants                                   | TODO   |
| `enum/class_3345.as`                  | Obfuscated enum (needs analysis)                             | TODO   |
| `enum/class_3481.as`                  | Obfuscated enum (needs analysis)                             | TODO   |
| `enum/class_3591.as`                  | Obfuscated enum (needs analysis)                             | TODO   |

### Events

| AS3 File                                         | Purpose                                                               | Status |
|--------------------------------------------------|-----------------------------------------------------------------------|--------|
| `event/CatalogEvent.as`                          | Catalog lifecycle events (initialized, new items, collectibles, etc.) | TODO   |
| `event/CatalogUserEvent.as`                      | User-related catalog events                                           | TODO   |
| `navigation/events/CatalogFurniPurchaseEvent.as` | Furniture purchase event with localization ID                         | TODO   |
| `navigation/events/CatalogPageOpenedEvent.as`    | Page opened event                                                     | TODO   |
| `purse/PurseEvent.as`                            | Purse balance change events (credits, activity points, silver)        | TODO   |
| `purse/PurseUpdateEvent.as`                      | General purse update notification event                               | TODO   |

### Navigation & Page Data

| AS3 File                              | Purpose                                                        | Status |
|---------------------------------------|----------------------------------------------------------------|--------|
| `navigation/CatalogNavigator.as`      | Catalog navigation tree management, page search, offer mapping | TODO   |
| `navigation/CatalogNode.as`           | Tree node data model - page ID, name, children, offer IDs      | TODO   |
| `navigation/CatalogNodeRenderable.as` | Renderable node extension                                      | TODO   |
| `navigation/RequestedPage.as`         | Page request data (by ID or name)                              | TODO   |
| `navigation/class_3341.as`            | ICatalogNavigator interface                                    | TODO   |
| `navigation/class_3411.as`            | ICatalogNode interface                                         | TODO   |

### Product & Offer Data Models

| AS3 File                           | Purpose                                                      | Status |
|------------------------------------|--------------------------------------------------------------|--------|
| `viewer/Offer.as`                  | Offer data model - pricing, products, localization, bundling | TODO   |
| `viewer/Product.as`                | Product data model - type, class ID, count, furniture data   | TODO   |
| `viewer/FurnitureOffer.as`         | Furniture-specific offer wrapper                             | TODO   |
| `viewer/GameTokensOffer.as`        | Game tokens offer data                                       | TODO   |
| `viewer/PageLocalization.as`       | Page text/image localization mapping                         | TODO   |
| `viewer/ProductContainer.as`       | Base product container                                       | TODO   |
| `viewer/SingleProductContainer.as` | Single product container                                     | TODO   |
| `viewer/MultiProductContainer.as`  | Multi-product container                                      | TODO   |
| `viewer/BundleProductContainer.as` | Bundle product container                                     | TODO   |
| `viewer/FurniProductContainer.as`  | Furniture product container                                  | TODO   |
| `viewer/class_3388.as`             | IProduct interface                                           | TODO   |
| `viewer/class_3440.as`             | IPageLocalization interface                                  | TODO   |
| `viewer/class_3455.as`             | ICatalogPage interface                                       | TODO   |
| `viewer/class_3477.as`             | ICatalogViewer interface                                     | TODO   |
| `viewer/class_3517.as`             | IProductGridItem interface                                   | TODO   |
| `viewer/class_3553.as`             | IProductContainer interface                                  | TODO   |
| `viewer/class_3623.as`             | Obfuscated class (needs analysis)                            | TODO   |

### Purchase Logic

| AS3 File                                | Purpose                                    | Status |
|-----------------------------------------|--------------------------------------------|--------|
| `purchase/GiftWrappingConfiguration.as` | Gift wrap settings - enabled, price, types | TODO   |
| `purchase/PlacedObjectPurchaseData.as`  | Placed object purchase tracking data       | TODO   |
| `purchase/RoomAdPurchaseData.as`        | Room ad purchase data model                | TODO   |

### Purse (Currency)

| AS3 File              | Purpose                                                                    | Status |
|-----------------------|----------------------------------------------------------------------------|--------|
| `purse/Purse.as`      | User currency data - credits, club days, activity points, emeralds, silver | TODO   |
| `purse/class_3378.as` | IPurse interface                                                           | TODO   |
| `purse/class_3473.as` | Obfuscated purse class (needs analysis)                                    | TODO   |

### Club (VIP/HC)

| AS3 File                       | Purpose                                                 | Status |
|--------------------------------|---------------------------------------------------------|--------|
| `club/ClubBuyController.as`    | Club purchase controller - handles offers and purchases | TODO   |
| `club/ClubBuyOfferData.as`     | Club offer data model - pricing, months, VIP status     | TODO   |
| `club/ClubBuyItem.as`          | Club buy item data                                      | TODO   |
| `club/ClubExtendController.as` | Club extension purchase controller                      | TODO   |
| `club/ClubGiftController.as`   | Club gift purchase controller                           | TODO   |
| `club/VipBuyItem.as`           | VIP purchase item data                                  | TODO   |

### Club Center

| AS3 File                           | Purpose                                          | Status |
|------------------------------------|--------------------------------------------------|--------|
| `clubcenter/HabboClubCenter.as`    | Club center component - kickback, badges, offers | TODO   |
| `clubcenter/util/BadgeResolver.as` | Badge resolution utility                         | TODO   |
| `clubcenter/util/ClubStatus.as`    | Club status data/constants                       | TODO   |

### Marketplace

| AS3 File                               | Purpose                                                | Status |
|----------------------------------------|--------------------------------------------------------|--------|
| `marketplace/MarketPlaceLogic.as`      | Marketplace business logic - offers, buying, canceling | TODO   |
| `marketplace/MarketPlaceOfferData.as`  | Marketplace offer data model                           | TODO   |
| `marketplace/IMarketPlace.as`          | Marketplace interface                                  | TODO   |
| `marketplace/IMarketPlaceOfferData.as` | Marketplace offer data interface                       | TODO   |
| `marketplace/class_3453.as`            | Marketplace item stats class                           | TODO   |
| `marketplace/class_3834.as`            | Obfuscated marketplace class                           | TODO   |

### Offers System

| AS3 File                       | Purpose                                          | Status |
|--------------------------------|--------------------------------------------------|--------|
| `offers/OfferCenter.as`        | Offer center - video offers, provider management | TODO   |
| `offers/OfferReward.as`        | Offer reward data model                          | TODO   |
| `offers/IOfferCenter.as`       | Offer center interface                           | TODO   |
| `offers/IOfferExtension.as`    | Offer extension interface                        | TODO   |
| `offers/IOfferProvider.as`     | Offer provider interface                         | TODO   |
| `offers/SponsorPayProvider.as` | SponsorPay offer provider                        | TODO   |
| `offers/SupersonicProvider.as` | Supersonic offer provider                        | TODO   |

### Targeted Offers

| AS3 File                                                  | Purpose                                        | Status |
|-----------------------------------------------------------|------------------------------------------------|--------|
| `targetedoffers/OfferController.as`                       | Targeted offer controller - purchase, tracking | TODO   |
| `targetedoffers/data/TargetedOffer.as`                    | Targeted offer data model                      | TODO   |
| `targetedoffers/data/HabboMallOffer.as`                   | Mall offer data model                          | TODO   |
| `targetedoffers/util/class_3626.as`                       | Obfuscated utility class                       | TODO   |
| `targetedoffers/util/class_3667.as`                       | Obfuscated utility class                       | TODO   |
| `targetedoffers/util/MallOfferExternalInterfaceHelper.as` | External interface for mall offers             | TODO   |

### Collectibles (NFT)

| AS3 File                                                    | Purpose                          | Status |
|-------------------------------------------------------------|----------------------------------|--------|
| `collectibles/CollectiblesController.as`                    | NFT collectibles controller      | TODO   |
| `collectibles/class_3479.as`                                | ICollectorHub interface          | TODO   |
| `collectibles/class_3573.as`                                | Obfuscated collectibles class    | TODO   |
| `collectibles/renderer/model/CollectionItemWrapper.as`      | Collection item data wrapper     | TODO   |
| `collectibles/renderer/model/MintableItemWrapper.as`        | Mintable item data wrapper       | TODO   |
| `collectibles/renderer/model/IRenderableCollectibleItem.as` | Renderable collectible interface | TODO   |
| `collectibles/widget/MintTokenPurchaseOffer.as`             | Mint token purchase offer data   | TODO   |

### Vault

| AS3 File                   | Purpose                                         | Status |
|----------------------------|-------------------------------------------------|--------|
| `vault/VaultController.as` | Vault controller - credit vault, income rewards | TODO   |

### Guilds

| AS3 File                               | Purpose                                 | Status |
|----------------------------------------|-----------------------------------------|--------|
| `guilds/GuildMembershipsController.as` | Guild membership controller for catalog | TODO   |

### Video Offers

| AS3 File                 | Purpose                        | Status |
|--------------------------|--------------------------------|--------|
| `VideoOfferManager.as`   | Video offer management         | TODO   |
| `IVideoOfferLauncher.as` | Video offer launcher interface | TODO   |
| `IVideoOfferManager.as`  | Video offer manager interface  | TODO   |

---

## VIEW FILES (We Ignore These)

### Core View Components

| AS3 File                    | Purpose                                    |
|-----------------------------|--------------------------------------------|
| `viewer/CatalogViewer.as`   | Catalog page display/rendering             |
| `viewer/CatalogPage.as`     | Page window creation and widget management |
| `viewer/ProductGridItem.as` | Grid item visual representation            |
| `viewer/IItemGrid.as`       | Item grid interface                        |
| `TopViewSelector.as`        | Tab selector UI component                  |

### Viewer Obfuscated Classes

| AS3 File               | Purpose                       |
|------------------------|-------------------------------|
| `viewer/class_3458.as` | View-related obfuscated class |

### Confirmation Dialogs

| AS3 File                                       | Purpose                               |
|------------------------------------------------|---------------------------------------|
| `purchase/PurchaseConfirmationDialog.as`       | Purchase confirmation UI              |
| `purchase/RentConfirmationWindow.as`           | Rent confirmation window              |
| `club/ClubBuyConfirmationDialog.as`            | Club purchase confirmation dialog     |
| `club/ClubExtendConfirmationDialog.as`         | Club extension confirmation dialog    |
| `club/ClubGiftConfirmationDialog.as`           | Club gift confirmation dialog         |
| `club/VipBenefitsWindow.as`                    | VIP benefits display window           |
| `marketplace/MarketplaceConfirmationDialog.as` | Marketplace confirmation dialog       |
| `marketplace/MarketplaceChart.as`              | Marketplace price chart visualization |
| `marketplace/IMarketPlaceVisualization.as`     | Marketplace visualization interface   |

### Targeted Offer Views

| AS3 File                                                  | Purpose                    |
|-----------------------------------------------------------|----------------------------|
| `targetedoffers/OfferView.as`                             | Base offer view            |
| `targetedoffers/TargetedOfferDialogView.as`               | Targeted offer dialog UI   |
| `targetedoffers/TargetedOfferMinimizedView.as`            | Minimized offer view       |
| `targetedoffers/TargetedOfferPurchaseConfirmationView.as` | Purchase confirmation view |
| `targetedoffers/MallOfferDialogView.as`                   | Mall offer dialog UI       |
| `targetedoffers/MallOfferMinimizedView.as`                | Minimized mall offer view  |

### Club Center Views

| AS3 File                                  | Purpose               |
|-------------------------------------------|-----------------------|
| `clubcenter/ClubCenterView.as`            | Club center main view |
| `clubcenter/ClubSpecialInfoBubbleView.as` | Club info bubble UI   |

### Collectibles Views & Renderers

| AS3 File                                                                 | Purpose                         |
|--------------------------------------------------------------------------|---------------------------------|
| `collectibles/CollectiblesView.as`                                       | Collectibles main view          |
| `collectibles/renderer/AbstractCollectibleItemRenderer.as`               | Base collectible renderer       |
| `collectibles/renderer/MintInventoryItemRenderer.as`                     | Mint inventory item renderer    |
| `collectibles/renderer/collections/CollectibleItemRenderer.as`           | Collection item renderer        |
| `collectibles/renderer/collections/CollectionsNavigationNodeRenderer.as` | Collections navigation renderer |
| `collectibles/renderer/collections/class_3861.as`                        | Obfuscated renderer class       |
| `collectibles/widget/CollectionsWidget.as`                               | Collections widget UI           |
| `collectibles/widget/MintInventoryListWidget.as`                         | Mint inventory list widget      |
| `collectibles/widget/TransferNftsWidget.as`                              | NFT transfer widget             |
| `collectibles/widget/subviews/CollectibleProductPreviewer.as`            | Product preview view            |
| `collectibles/widget/subviews/CollectionView.as`                         | Collection display view         |
| `collectibles/widget/subviews/EffectPreviewer.as`                        | Effect preview view             |

### Vault View

| AS3 File             | Purpose         |
|----------------------|-----------------|
| `vault/VaultView.as` | Vault main view |

### Catalog Page Widgets

| AS3 File                                              | Purpose                      |
|-------------------------------------------------------|------------------------------|
| `viewer/widgets/CatalogWidget.as`                     | Base widget class            |
| `viewer/widgets/CatalogWidgetEnum.as`                 | Widget type enumeration      |
| `viewer/widgets/class_3558.as`                        | ICatalogWidget interface     |
| `viewer/widgets/ActivityPointDisplayCatalogWidget.as` | Activity points display      |
| `viewer/widgets/AddOnBadgeViewCatalogWidget.as`       | Add-on badge view            |
| `viewer/widgets/BuilderAddonsCatalogWidget.as`        | Builder add-ons widget       |
| `viewer/widgets/BuilderCatalogWidget.as`              | Builder catalog widget       |
| `viewer/widgets/BuilderLoyaltyCatalogWidget.as`       | Builder loyalty widget       |
| `viewer/widgets/BuilderSubscriptionCatalogWidget.as`  | Builder subscription widget  |
| `viewer/widgets/BundleGridViewCatalogWidget.as`       | Bundle grid view             |
| `viewer/widgets/BundlePurchaseExtraInfoWidget.as`     | Bundle extra info widget     |
| `viewer/widgets/BuyGuildWidget.as`                    | Guild purchase widget        |
| `viewer/widgets/ClubBuyCatalogWidget.as`              | Club buy widget              |
| `viewer/widgets/ClubGiftWidget.as`                    | Club gift widget             |
| `viewer/widgets/ColourGridCatalogWidget.as`           | Color selection grid         |
| `viewer/widgets/FeaturedItemsCatalogWidget.as`        | Featured items widget        |
| `viewer/widgets/FirstProductSelectorCatalogWidget.as` | Auto-select first product    |
| `viewer/widgets/GuildBadgeViewCatalogWidget.as`       | Guild badge view             |
| `viewer/widgets/GuildForumSelectorCatalogWidget.as`   | Guild forum selector         |
| `viewer/widgets/GuildSelectorCatalogWidget.as`        | Guild selector widget        |
| `viewer/widgets/ItemGridCatalogWidget.as`             | Item grid display            |
| `viewer/widgets/IVipBuyCatalogWidget.as`              | VIP buy widget interface     |
| `viewer/widgets/LocalizationCatalogWidget.as`         | Localization widget          |
| `viewer/widgets/LoyaltyVipBuyCatalogWidget.as`        | Loyalty VIP buy widget       |
| `viewer/widgets/MadMoneyCatalogWidget.as`             | Mad money widget             |
| `viewer/widgets/MarketPlaceCatalogWidget.as`          | Marketplace widget           |
| `viewer/widgets/MarketPlaceOwnItemsCatalogWidget.as`  | Own marketplace items widget |
| `viewer/widgets/NewPetsCatalogWidget.as`              | New pets widget              |
| `viewer/widgets/PetPreviewCatalogWidget.as`           | Pet preview widget           |
| `viewer/widgets/PetsCatalogWidget.as`                 | Pets catalog widget          |
| `viewer/widgets/ProductViewCatalogWidget.as`          | Product view widget          |
| `viewer/widgets/PurchaseCatalogWidget.as`             | Purchase button widget       |
| `viewer/widgets/RedeemItemCodeCatalogWidget.as`       | Redeem code widget           |
| `viewer/widgets/RoomAdsCatalogWidget.as`              | Room ads widget              |
| `viewer/widgets/RoomPreviewCatalogWidget.as`          | Room preview widget          |
| `viewer/widgets/SimplePriceCatalogWidget.as`          | Simple price display         |
| `viewer/widgets/SingleViewCatalogWidget.as`           | Single item view             |
| `viewer/widgets/SoldLtdItemsCatalogWidget.as`         | Sold limited items widget    |
| `viewer/widgets/SongDiskProductViewCatalogWidget.as`  | Song disk view widget        |
| `viewer/widgets/SpacesNewCatalogWidget.as`            | Spaces/rooms widget          |
| `viewer/widgets/SpecialInfoWidget.as`                 | Special info widget          |
| `viewer/widgets/SpinnerCatalogWidget.as`              | Quantity spinner widget      |
| `viewer/widgets/TextInputCatalogWidget.as`            | Text input widget            |
| `viewer/widgets/TotalPriceWidget.as`                  | Total price display          |
| `viewer/widgets/TraxPreviewCatalogWidget.as`          | Trax preview widget          |
| `viewer/widgets/TrophyCatalogWidget.as`               | Trophy widget                |
| `viewer/widgets/UniqueLimitedItemWidget.as`           | Unique/limited item widget   |
| `viewer/widgets/UserBadgeSelectorCatalogWidget.as`    | User badge selector          |
| `viewer/widgets/VipBuyCatalogWidget.as`               | VIP buy widget               |
| `viewer/widgets/WarningCatalogWidget.as`              | Warning display widget       |

### Widget Events

| AS3 File                                                                | Purpose                    |
|-------------------------------------------------------------------------|----------------------------|
| `viewer/widgets/events/CatalogWidgetEvent.as`                           | Base widget event          |
| `viewer/widgets/events/CatalogWidgetEventEnum.as`                       | Widget event types         |
| `viewer/widgets/events/CatalogWidgetApproveNameResultEvent.as`          | Name approval event        |
| `viewer/widgets/events/CatalogWidgetBuilderSubscriptionUpdatedEvent.as` | Builder subscription event |
| `viewer/widgets/events/CatalogWidgetBundleDisplayExtraInfoEvent.as`     | Bundle info event          |
| `viewer/widgets/events/CatalogWidgetColourIndexEvent.as`                | Color index event          |
| `viewer/widgets/events/CatalogWidgetColoursEvent.as`                    | Colors event               |
| `viewer/widgets/events/CatalogWidgetGuildSelectedEvent.as`              | Guild selection event      |
| `viewer/widgets/events/CatalogWidgetInitPurchaseEvent.as`               | Init purchase event        |
| `viewer/widgets/events/CatalogWidgetMultiColoursEvent.as`               | Multi-color event          |
| `viewer/widgets/events/CatalogWidgetPurchaseOverrideEvent.as`           | Purchase override event    |
| `viewer/widgets/events/CatalogWidgetRoomChangedEvent.as`                | Room changed event         |
| `viewer/widgets/events/CatalogWidgetSellablePetPalettesEvent.as`        | Pet palettes event         |
| `viewer/widgets/events/CatalogWidgetShowWarningTextEvent.as`            | Warning text event         |
| `viewer/widgets/events/CatalogWidgetSpinnerEvent.as`                    | Spinner event              |
| `viewer/widgets/events/CatalogWidgetToggleEvent.as`                     | Toggle event               |
| `viewer/widgets/events/CatalogWidgetUpdateRoomPreviewEvent.as`          | Room preview update event  |
| `viewer/widgets/events/ProductOfferUpdatedEvent.as`                     | Product offer update event |
| `viewer/widgets/events/SelectProductEvent.as`                           | Product selection event    |
| `viewer/widgets/events/SetExtraPurchaseParameterEvent.as`               | Extra parameter event      |
| `viewer/widgets/events/SetRoomPreviewerStuffDataEvent.as`               | Room previewer data event  |
| `viewer/widgets/events/TextInputEvent.as`                               | Text input event           |

### Bundle Purchase Info Display

| AS3 File                                                                             | Purpose                    |
|--------------------------------------------------------------------------------------|----------------------------|
| `viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as`                      | Extra info item data       |
| `viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoListItem.as`                      | Extra info list item       |
| `viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoViewManager.as`                   | Extra info view manager    |
| `viewer/widgets/bundlepurchaseinfodisplay/UpdateableExtraInfoListItem.as`            | Updateable extra info item |
| `viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoBonusAchievementItem.as` | Bonus achievement item     |
| `viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoBonusBadgeItem.as`       | Bonus badge item           |
| `viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoBundlesInfoItem.as`      | Bundles info item          |
| `viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoDiscountValueItem.as`    | Discount value item        |
| `viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoPromoItem.as`            | Promo item                 |

---

## Key Architecture Insights

### Data Flow
1. **Navigation**: `CatalogNavigator` builds tree from server data using `CatalogNode`
2. **Pages**: `CatalogPage` contains `Offer` objects with `Product` data
3. **Products**: `Product` references `ProductData` and `FurnitureData` from session
4. **Purchase**: Controllers handle purchase flow, confirmation, and server communication

### Key Interfaces (class_XXXX mapping)
| Obfuscated   | Likely Name         | Purpose                                            |
|--------------|---------------------|----------------------------------------------------|
| `class_3377` | `IOffer`            | Offer contract with pricing, products, gift status |
| `class_3378` | `IPurse`            | Currency balance interface                         |
| `class_3388` | `IProduct`          | Product type, class ID, count                      |
| `class_3341` | `ICatalogNavigator` | Navigation tree interface                          |
| `class_3411` | `ICatalogNode`      | Navigation node interface                          |
| `class_3455` | `ICatalogPage`      | Page with offers and localization                  |
| `class_3477` | `ICatalogViewer`    | Page viewer interface                              |
| `class_3479` | `ICollectorHub`     | Collectibles hub interface                         |
| `class_3553` | `IProductContainer` | Product container interface                        |

### Subsystems
1. **Club System**: VIP/HC subscription purchasing and benefits
2. **Marketplace**: User-to-user trading with price history
3. **Targeted Offers**: Time-limited promotional offers
4. **Collectibles**: NFT minting and collections (newer feature)
5. **Vault**: Credit savings and income rewards
6. **Video Offers**: Ad-based reward system

### Migration Notes
- All VIEW files can be fully replaced with SolidJS components
- ENGINE files contain essential data models and business logic
- Event types are needed for state management coordination
- Interfaces define contracts between catalog subsystems
