# Audit complet AS3 vs TypeScript - Plan de remédiation

> **Date**: 2026-02-09
> **Objectif**: Passer de ~28% à ~85-90% de couverture ENGINE
> **Effort estimé**: ~20-26 semaines, ~716 fichiers
> **Fichier de référence**: Ce fichier est la source de vérité pour le plan de remédiation

---

## Table des matières

1. [État des lieux par module](#état-des-lieux-par-module)
2. [Résultats d'audit détaillés](#résultats-daudit-détaillés)
3. [Phase 0 : Fixes fondation](#phase-0--fixes-fondation-1-2-jours)
4. [Phase 1 : Room Engine complet](#phase-1--room-engine-complet-2-3-semaines)
5. [Phase 2 : Système Avatar](#phase-2--système-avatar-3-4-semaines)
6. [Phase 3 : Messages communication](#phase-3--messages-communication-2-3-semaines)
7. [Phase 4 : Catalog](#phase-4--catalog-2-3-semaines)
8. [Phase 5 : Friendlist + Sound](#phase-5--friendlist--sound-2-semaines)
9. [Phase 6 : Furniture Visualizations](#phase-6--furniture-visualizations-2-3-semaines)
10. [Phase 7 : Help, Modération, Quests](#phase-7--help-modération-quests-2-semaines)
11. [Phase 8 : Systèmes secondaires](#phase-8--systèmes-secondaires-2-3-semaines)
12. [Phase 9 : Intégration et câblage events](#phase-9--intégration-et-câblage-events-1-2-semaines)
13. [Graphe de dépendances](#graphe-de-dépendances)
14. [Instructions de développement](#instructions-de-développement)

---

## État des lieux par module

| Module | AS3 files | TS status | Gaps critiques |
|--------|-----------|-----------|----------------|
| **Session** | ~30 | ~90% | Furniture/product data TODO, badge images manquant, 9 message listeners manquants, events internes non dispatched |
| **Communication** (hors messages/) | ~10 | ~85% | `setAuthenticated()` fix fait, 1 duplicate composer ID |
| **Configuration** | ~6 | ~100% | OK |
| **Localization** | ~5 | ~100% | OK |
| **Room Engine (habbo/room)** | 313 | ~45% | ~22 events manquants, ~40 furniture logics, canvas/mouse/selection system, IRoomEngineServices manquant |
| **Room Core (room/)** | 81 | ~86% | Visualizations furniture 0%, content loading partiel |
| **Navigator** | 87 | ~29% | Views = SolidJS, mais ENGINE data handlers incomplets |
| **Inventory** | 51 | ~100% | OK |
| **Avatar** | 135 | **0%** | Entièrement manquant |
| **Catalog** | 205 | **0%** | Entièrement manquant |
| **Sound** | 29 | **0%** | Entièrement manquant |
| **Friendlist** | 39 | ~8% | Shell existe mais 11 events + 12 composers non registered |
| **Tracking** | 10 | ~90% | OK |
| **Notifications** | 32 | ~50% | Events handlers partiels |
| **Quest** | 31 | ~48% | Partiel |
| **Toolbar** | 37 | ~27% | Core only |
| **Freeflowchat** | 32 | ~41% | Core events OK, rendering manquant |
| **Moderation** | 36 | ~22% | Très partiel |
| **Groups** | 21 | ~38% | Basique |
| **Help** | 33 | ~82% | Quasi complet |
| **Messenger** | 7 | ~86% | OK |
| **Advertisement** | 5 | ~100% | OK |
| **Campaign** | 5 | ~40% | Basique |
| **Game/SnowWar** | 63 | **0%** | Entièrement manquant |
| **Friendbar/Landing** | 143 | **0%** | Entièrement manquant |
| **Roomevents/Wired** | 243 | **0%** | Entièrement manquant |
| **NUX** | 4 | **0%** | Non implémenté |
| **Phone** | 7 | **0%** | Non implémenté |

---

## Résultats d'audit détaillés

### Audit HabboMessages.ts

#### IDs dupliqués (CRITIQUE)

| ID | Type | Usage | Problème |
|---|---|---|---|
| **3698** | Composers | `OpenPetPackageMessageComposer` ET `GetInterstitialMessageComposer` | **CRITIQUE**: Le 2ème écrase le 1er dans le même map |
| 1773 | Cross-type | `RoomInfoUpdatedMessageEvent` (event) vs `PollRejectComposer` (composer) | Pas critique (maps séparés) |
| 657 | Cross-type | `ErrorReportEvent` (event) vs `NewNavigatorSearchComposer` (composer) | Pas critique (maps séparés) |
| 4000 | Cross-type | `DisconnectReasonMessageEvent` (event) vs `ClientHelloMessageComposer` (composer) | Pas critique (maps séparés) |

**Action**: Corriger l'ID de `GetInterstitialMessageComposer` (trouver le bon ID).

#### Friendlist Events non enregistrés (11 sur 17)

| Fichier | Statut | Action |
|---------|--------|--------|
| `AcceptFriendResultMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `FindFriendsProcessResultMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `FollowFriendFailedMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `FriendListFragmentMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `FriendListUpdateMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `FriendNotificationMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `FriendRequestsMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `HabboSearchResultMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `NewFriendRequestMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `RoomInviteErrorMessageEvent.ts` | ❌ Non importé/registré | Ajouter import + `_events.set(ID, ...)` |
| `ConsoleMessageHistoryEvent.ts` | ✅ Registré (1819) | OK |
| `InstantMessageErrorEvent.ts` | ✅ Registré (3498) | OK |
| `MessengerErrorEvent.ts` | ✅ Registré (687) | OK |
| `MessengerInitEvent.ts` | ✅ Registré (1623) | OK |
| `NewConsoleMessageEvent.ts` | ✅ Registré (2935) | OK |
| `RoomInviteEvent.ts` | ✅ Registré (2514) | OK |

#### Friendlist Composers non enregistrés (12 sur 17)

| Fichier | Statut | Action |
|---------|--------|--------|
| `AcceptFriendMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `DeclineFriendMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `FindNewFriendsMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `FriendListUpdateMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `GetFriendRequestsMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `GetRelationshipStatusInfoMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `HabboSearchMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `RemoveFriendMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `RequestFriendMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `SendRoomInviteMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `SetRelationshipStatusMessageComposer.ts` | ❌ Non importé/registré | Ajouter import + `_composers.set(ID, ...)` |
| `FollowFriendMessageComposer.ts` | ✅ Registré (2446) | OK |
| `GetMessengerHistoryComposer.ts` | ✅ Registré (799) | OK |
| `MessengerInitMessageComposer.ts` | ✅ Registré (472) | OK |
| `SendMsgMessageComposer.ts` | ✅ Registré (2800) | OK |
| `VisitUserMessageComposer.ts` | ✅ Registré (2970) | OK |

---

### Audit SessionDataManager.ts

#### TODO comments (30 total)

| Ligne | Description |
|-------|-------------|
| 630 | `// TODO: Implement star gem gifting` |
| 635 | `// TODO: Implement badge image loading` |
| 641 | `// TODO: Implement small badge image loading` |
| 657 | `// TODO: Implement badge image request` |
| 674 | `// TODO: Implement group badge image loading` |
| 680 | `// TODO: Implement small group badge image loading` |
| 696 | `// TODO: Implement product data lookup` |
| 702 | `// TODO: Implement floor item data lookup` |
| 708 | `// TODO: Implement floor item data by category` |
| 714 | `// TODO: Implement wall item data lookup` |
| 720 | `// TODO: Implement floor item data by name lookup` |
| 726 | `// TODO: Implement wall item data by name lookup` |
| 732 | `// TODO: Implement product data loading` |
| 738 | `// TODO: Implement furni data with listener` |
| 744 | `// TODO: Implement product data ready listener` |
| 749 | `// TODO: Implement furni data listener removal` |
| 754 | `// TODO: Implement furni data refresh` |
| 759 | `// TODO: Implement Habbo home page opening` |
| 764 | `// TODO: Send PickAllFurnitureMessageComposer` |
| 770 | `// TODO: Send ResetScoresMessageComposer` |
| 776 | `// TODO: Send EjectAllFurnitureMessageComposer` |
| 783 | `// TODO: Send EjectPetsMessageComposer` |
| 789 | `// TODO: Send PickAllBuilderFurnitureMessageComposer` |
| 794 | `// TODO: Send GetCreditVaultStatusComposer` |
| 799 | `// TODO: Send GetIncomeRewardStatusComposer` |
| 804 | `// TODO: Send WithdrawCreditVaultComposer` |
| 809 | `// TODO: Send ClaimRewardComposer` |
| 814 | `// TODO: Implement NFT chat style check` |
| 579 | Incomplete: `setRoomCameraFollowDisabled()` ne send pas `SetUIFlagsMessageComposer` |
| 889 | Incomplete: `setUIFlag()` ne send pas `SetUIFlagsMessageComposer` |

#### Méthodes stubs retournant des valeurs hardcodées (19)

| Méthode | Retourne | Devrait |
|---------|----------|---------|
| `getBadgeImage()` | `null` | Déléguer à BadgeImageManager |
| `getBadgeSmallImage()` | `null` | Déléguer à BadgeImageManager |
| `requestBadgeImage()` | `null` | Déléguer à BadgeImageManager |
| `getGroupBadgeImage()` | `null` | Déléguer à BadgeImageManager |
| `getGroupBadgeSmallImage()` | `null` | Déléguer à BadgeImageManager |
| `getProductData()` | `null` | Utiliser `_productDictionary[code]` |
| `getFloorItemData()` | `null` | Utiliser `_floorItems.get(id)` |
| `getFloorItemsDataByCategory()` | `[]` | Filtrer `_floorItems` par catégorie |
| `getWallItemData()` | `null` | Utiliser `_wallItems.get(id)` |
| `getFloorItemDataByName()` | `null` | Lookup dans `_floorItemsByName` |
| `getWallItemDataByName()` | `null` | Lookup dans `_wallItemsByName` |
| `loadProductData()` | `false` | Vérifier `_productDataReady`, ajouter listener |
| `getFurniData()` | `[]` | Retourner floor+wall items |
| `addProductsReadyEventListener()` | void stub | Ajouter listener au array |
| `removeFurniDataListener()` | void stub | Retirer listener du array |
| `refreshFurniData()` | void stub | Réinitialiser Maps |
| `openHabboHomePage()` | void stub | Ouvrir URL profil |
| `hasNftChatStyle()` | `false` | Vérifier `_nftChatStyleIds` |

#### Message listeners AS3 manquants (9)

| Event AS3 | Handler | Statut TS |
|-----------|---------|-----------|
| `AccountSafetyLockStatusChangeMessageEvent` | `onAccountSafetyLockStatusChanged()` | Handler existe mais event non registered |
| `ChangeUserNameResultMessageEvent` | `onChangeUserNameResult()` | Manquant |
| `UserNftChatStylesMessageEvent` | `onNftChatStyles()` | Manquant |
| `EmailStatusResultEvent` | `onEmailStatus()` | Manquant |
| `UserNameChangedMessageEvent` | `onUserNameChange()` | Manquant |
| `RoomReadyMessageEvent` | `onRoomReady()` | Manquant |
| `UserChangeMessageEvent` | `onUserChange()` | Manquant |
| `PetRespectFailedEvent` | `onPetRespectFailed()` | Manquant |
| `AccountPreferencesEvent` | `onAccountPreferences()` | Manquant |

#### Events dispatched manquants (3)

| Event | Devrait être émis dans | AS3 ref |
|-------|----------------------|---------|
| `UserNameUpdateEvent` | `onUserNameChange()`, `onChangeUserNameResult()` | AS3 line 452, 476 |
| `SessionDataPreferencesEvent` | `onAccountPreferences()` | AS3 line 498 |
| `MysteryBoxKeysUpdateEvent` | `onMysteryBoxKeys()` | AS3 line 485 |

#### Propriétés internes manquantes (24)

- `_floorItems: Map` - Furniture IDs → FurnitureData (floor)
- `_wallItems: Map` - Furniture IDs → FurnitureData (wall)
- `_floorItemsByName: Map` - Furniture names → IDs
- `_wallItemsByName: Map` - Furniture names → IDs
- `_productDictionary: Map` - Product codes → ProductData
- `_furnitureDataParser: FurnitureDataParser`
- `_furnitureDataParserTemp: FurnitureDataParser`
- `_productDataParser: ProductDataParser`
- `_badgeImageManager: BadgeImageManager`
- `_windowManager: IHabboWindowManager` (manquant en DI)
- `_localization: IHabboLocalizationManager` (manquant en DI)
- `_roomSessionManager: IRoomSessionManager` (manquant en DI)
- `_productDataReady: boolean`
- `_furniDataReady: boolean`
- `_furniDataListeners: Array`
- `_productDataListeners: Array`
- `_nftChatStyleIds: number[]`
- `_allFurniDataReady: boolean`
- `_newFurniDataHash: string`
- Et plus...

#### Getters manquants

- `gender` getter (AS3 retourne `_gender`)
- `communication` getter (expose `_communicationManager`)
- `windowManager` getter
- `roomSessionManager` getter
- `localization` getter

---

## Phase 0 : Fixes fondation (1-2 jours)

Corriger les problèmes cross-cutting qui cassent silencieusement le existant.

### 0.1 Corriger le duplicate ID 3698 dans HabboMessages.ts

**Problème**: `OpenPetPackageMessageComposer` et `GetInterstitialMessageComposer` partagent l'ID 3698.
**Action**: Trouver le bon ID pour `GetInterstitialMessageComposer` dans les sources AS3/Nitro.
**Fichier**: `src/habbo/communication/HabboMessages.ts`

### 0.2 Enregistrer les 11 events friendlist manquants dans HabboMessages.ts

Ajouter les imports et `_events.set(ID, ...)` pour :
- `FriendListFragmentMessageEvent`
- `FriendListUpdateMessageEvent`
- `FriendRequestsMessageEvent`
- `NewFriendRequestMessageEvent`
- `AcceptFriendResultMessageEvent`
- `FriendNotificationMessageEvent`
- `FindFriendsProcessResultMessageEvent`
- `HabboSearchResultMessageEvent`
- `FollowFriendFailedMessageEvent`
- `RoomInviteErrorMessageEvent`

**IDs nécessaires**: Trouver dans `source_as_flash/com/sulake/habbo/communication/messages/incoming/` ou Nitro.
**Fichier**: `src/habbo/communication/HabboMessages.ts`

### 0.3 Enregistrer les 12 composers friendlist manquants dans HabboMessages.ts

Ajouter les imports et `_composers.set(ID, ...)` pour :
- `AcceptFriendMessageComposer`
- `DeclineFriendMessageComposer`
- `FindNewFriendsMessageComposer`
- `FriendListUpdateMessageComposer`
- `GetFriendRequestsMessageComposer`
- `GetRelationshipStatusInfoMessageComposer`
- `HabboSearchMessageComposer`
- `RemoveFriendMessageComposer`
- `RequestFriendMessageComposer`
- `SendRoomInviteMessageComposer`
- `SetRelationshipStatusMessageComposer`

**Fichier**: `src/habbo/communication/HabboMessages.ts`

### 0.4 SessionDataManager : connecter furniture/product data

**Fichier**: `src/habbo/session/SessionDataManager.ts`
**Référence AS3**: `source_as_win63/habbo/session/SessionDataManager.as`

**Actions** :
1. Ajouter dependency injection pour `IID_GameDataManager` (ou accès via `FurnitureDataParser`/`ProductDataParser`)
2. Ajouter les propriétés internes: `_floorItems`, `_wallItems`, `_floorItemsByName`, `_wallItemsByName`, `_productDictionary`, `_productDataReady`, `_furniDataReady`, `_furniDataListeners`, `_productDataListeners`
3. Implémenter toutes les méthodes stub (19 méthodes listées ci-dessus)
4. Connecter au `GameDataManager` existant pour les données furniture/product

### 0.5 SessionDataManager : ajouter les 9 message listeners manquants

**Fichier**: `src/habbo/session/SessionDataManager.ts`

Pour chaque listener manquant :
1. Créer l'event class si elle n'existe pas dans `src/habbo/communication/messages/incoming/`
2. Importer l'event dans SessionDataManager
3. Ajouter `addMessageEvent(new XxxEvent(this.onXxx.bind(this)))` dans `registerMessageEvents()`
4. Implémenter le handler (copier la logique AS3)

Liste:
- `AccountSafetyLockStatusChangeMessageEvent` → `onAccountSafetyLockStatusChanged()`
- `ChangeUserNameResultMessageEvent` → `onChangeUserNameResult()`
- `UserNftChatStylesMessageEvent` → `onNftChatStyles()`
- `EmailStatusResultEvent` → `onEmailStatus()`
- `UserNameChangedMessageEvent` → `onUserNameChange()`
- `RoomReadyMessageEvent` → `onRoomReady()`
- `UserChangeMessageEvent` → `onUserChange()`
- `PetRespectFailedEvent` → `onPetRespectFailed()`
- `AccountPreferencesEvent` → `onAccountPreferences()`

### 0.6 SessionDataManager : ajouter les events dispatched manquants

**Fichier**: `src/habbo/session/SessionDataManager.ts`

1. Émettre `UserNameUpdateEvent` dans `onUserNameChange()` et `onChangeUserNameResult()`
2. Émettre `SessionDataPreferencesEvent` dans `onAccountPreferences()`
3. Émettre `MysteryBoxKeysUpdateEvent` dans `onMysteryBoxKeys()`
4. `setUIFlag()` doit envoyer `SetUIFlagsMessageComposer` au serveur
5. `setRoomCameraFollowDisabled()` doit envoyer `SetUIFlagsMessageComposer`

### 0.7 SessionDataManager : ajouter les getters manquants

- `gender` → retourne `_gender`
- `communication` → expose `_communicationManager`

**Fichiers modifiés Phase 0 :**
- `src/habbo/communication/HabboMessages.ts`
- `src/habbo/session/SessionDataManager.ts`
- Potentiellement nouveaux events/parsers si inexistants

---

## Phase 1 : Room Engine complet (2-3 semaines)

### 1.1 Events manquants (~22 fichiers)

Créer dans `src/habbo/room/events/` :
- `RoomEngineDimmerStateEvent`
- `RoomEngineObjectPlacedEvent`
- `RoomEngineZoomEvent`
- `RoomEngineUseProductEvent`
- `RoomObjectFloorHoleEvent`
- `RoomObjectTileMouseEvent`
- Et ~16 autres

**Référence** : `source_as_win63/habbo/room/events/`
**Méthode** : Lire chaque fichier AS3, créer l'équivalent TS suivant STYLEGUIDE.md

### 1.2 Furniture logic classes (~40 classes)

Créer dans `src/habbo/room/object/logic/furniture/` :
- `FurnitureCreditLogic`
- `FurnitureRoomBrandingLogic`
- `FurnitureSoundMachineLogic`
- `FurniturePushableLogic`
- `FurnitureGuildCustomizedLogic`
- Et ~35 autres

**Enregistrer** dans `RoomObjectFactory.createLogicInstance()`

**Fix critique** : `RoomEngine.addRoomObjectFurniture()` ligne 456 hardcode `FURNITURE_MULTISTATE` → doit résoudre le type depuis furniture data

**Référence** : `source_as_win63/habbo/room/object/logic/furniture/`

### 1.3 Messages room-object manquants (~15)

Créer dans `src/habbo/room/messages/` :
- `RoomObjectGroupBadgeUpdateMessage`
- `RoomObjectModelDataUpdateMessage`
- `RoomObjectRoomColorUpdateMessage`
- Et ~12 autres

**Référence** : `source_as_win63/habbo/room/messages/`

### 1.4 Canvas et système de sélection

- `createRoomCanvas()`, `setRoomCanvasScale()`, `handleRoomCanvasMouseEvent()`
- Système de tile cursor
- Sélection d'objets (`selectRoomObject`, `selectAvatar`, `getSelectedObjectData`)

**Référence** : `source_as_win63/habbo/room/RoomEngine.as` (méthodes canvas/selection)

### 1.5 IRoomEngineServices interface

Créer l'interface manquante qui fournit les services du room engine aux autres modules.

**Fichier** : `src/habbo/room/IRoomEngineServices.ts` (nouveau)
**Référence** : `source_as_win63/habbo/room/IRoomEngineServices.as`

**Fichiers modifiés/créés Phase 1 :**
- `src/habbo/room/events/` (~22 nouveaux)
- `src/habbo/room/object/logic/furniture/` (~40 nouveaux)
- `src/habbo/room/messages/` (~15 nouveaux)
- `src/habbo/room/RoomEngine.ts`
- `src/habbo/room/RoomObjectFactory.ts`
- `src/habbo/room/IRoomEngineServices.ts` (nouveau)

---

## Phase 2 : Système Avatar (3-4 semaines)

Module entièrement à créer dans `src/habbo/avatar/`.

### 2.1 Structures de données core
- `AvatarFigureContainer`, `AvatarStructure`, `AvatarImage`
- `IAvatarRenderManager`, `IAvatarImage`

### 2.2 Géométrie (7 fichiers)
- `AvatarModelGeometry`, `GeometryBodyPart`, `GeometryItem`
- `AvatarSet`, `Matrix4x4`

### 2.3 Actions (6 fichiers)
- `ActionDefinition`, `ActionType`, `ActiveActionData`, `AvatarActionManager`

### 2.4 Animations (12 fichiers)
- `Animation`, `AnimationLayerData`, `AnimationManager`
- `AvatarDataContainer`, `SpriteDataContainer`

### 2.5 Structure/FigureData (~40 fichiers)
- `FigurePart`, `FigurePartSet`, `Palette`, `PartColor`
- `SetType`, `PartDefinition`, `PartSetsData`

### 2.6 Cache (5 fichiers)
- `AvatarImageCache`, `AvatarImageActionCache`, `AvatarImageBodyPartCache`

### 2.7 Asset download
- `AvatarAssetDownloadManager`, `EffectAssetDownloadManager`

### 2.8 IoC registration
- Créer `IID_AvatarRenderManager`, enregistrer dans container.ts

**Référence** : `source_as_win63/habbo/avatar/`

---

## Phase 3 : Messages communication (2-3 semaines)

Atteindre 60%+ de couverture messages pour débloquer les modules restants.

### 3.1 Room messages restants
- ~54 events incoming
- ~47 composers outgoing

### 3.2 Catalog messages
- ~43 events incoming
- ~37 composers outgoing

### 3.3 Users messages
- ~51 events incoming
- ~40 composers outgoing

### 3.4 Help/Moderation messages
- ~57 events incoming
- ~32 composers outgoing

**Pour chaque message** : Lire AS3 source, créer Event/Parser ou Composer, enregistrer dans HabboMessages.ts

---

## Phase 4 : Catalog (2-3 semaines)

Créer dans `src/habbo/catalog/` :

### 4.1 Core
- `HabboCatalog` (manager principal)
- `CatalogNavigator`
- `ICatalogManager` interface

### 4.2 Data model
- `Offer`, `Product`, `CatalogPage`, `CatalogPageOfferData`

### 4.3 Purchase system
- `PurchaseConfirmation`, `PurchaseParameters`
- Gift wrapping support

### 4.4 Marketplace
- `MarketplaceOfferData`, `MarketplaceItemData`

**Référence** : `source_as_win63/habbo/catalog/`

---

## Phase 5 : Friendlist + Sound (2 semaines)

### 5.1 Friendlist
- Compléter `HabboFriendList` (data management, relationships)
- Connecter les 11 events + 12 composers enregistrés en Phase 0
- Implémenter les handlers de données

### 5.2 Sound
- Créer système Sound (Web Audio API adapté du Flash)
- `HabboSoundManager`, `ISoundManager`
- TRAX sequencer basique

**Référence** :
- `source_as_win63/habbo/friendlist/`
- `source_as_win63/habbo/sound/`

---

## Phase 6 : Furniture Visualizations (2-3 semaines)

~43 classes de visualisation dans `src/room/object/visualization/furniture/`.

### 6.1 Base classes
- `FurnitureVisualization`, `FurnitureAnimatedVisualization`
- `FurnitureGuildCustomizedVisualization`

### 6.2 Specialized visualizations
- `FurniturePosterVisualization`, `FurnitureBrandingVisualization`
- `FurnitureQueueTileVisualization`, etc.

**Référence** : `source_as_win63/room/object/visualization/furniture/`

---

## Phase 7 : Help, Modération, Quests (2 semaines)

### 7.1 Help system
- Compléter les handlers manquants (~18% restant)

### 7.2 Moderation
- Compléter depuis ~22% : outils modérateur, reports, sanctions

### 7.3 Quests
- Compléter depuis ~48% : tracking, rewards

**Référence** :
- `source_as_win63/habbo/help/`
- `source_as_win63/habbo/moderation/`
- `source_as_win63/habbo/quest/`

---

## Phase 8 : Systèmes secondaires (2-3 semaines)

### 8.1 Wired/RoomEvents (243 fichiers AS3)
- Système de conditions, effets, triggers
- Engine-side only

### 8.2 Friendbar/Landing (143 fichiers AS3)
- Landing page data
- Promo data, community status

### 8.3 Game/SnowWar (63 fichiers AS3)
- Game engine, arena, projectiles

### 8.4 Groups (21 fichiers AS3)
- Compléter depuis ~38%

### 8.5 NUX (4 fichiers AS3)
- New user experience flow

---

## Phase 9 : Intégration et câblage events (1-2 semaines)

Audit systématique des events émis sans listener :

| Event | Émetteur | Listener attendu |
|-------|----------|------------------|
| `RSE_CREATED` / `RSE_STARTED` | RoomSessionManager | roomStore doit écouter |
| `REE_INITIALIZED` | RoomEngine | RoomSessionManager doit réagir |
| `contentLoaded` | ContentLoader | session creation flow |
| `perksUpdated` | PerkManager | UI stores |
| Events friendlist | HabboFriendList | friendlistStore |
| Events toolbar | Toolbar | toolbarStore |

**Action**: Pour chaque event émis, vérifier qu'un listener existe côté store ou côté engine.

---

## Graphe de dépendances

```
Phase 0 (Foundation) ─────────────────────────────┐
    │                                              │
    v                                              v
Phase 1 (RoomEngine) ──> Phase 6 (Visualizations)  │
    │                                              │
    v                                              v
Phase 2 (Avatar) ─────────────────────────> Phase 9 (Intégration)
    │
    v
Phase 3 (Messages) ──┬──> Phase 4 (Catalog)
                      ├──> Phase 5 (Friendlist+Sound)
                      └──> Phase 7 (Help/Mod/Quest)
                                │
                                v
                           Phase 8 (Secondaire)
```

**Chemin critique** : Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## Instructions de développement

### Avant de coder

1. **Lire `docs/STYLEGUIDE.md`** - Conventions de code strictes
2. **Lire `docs/IMPLEMENTATION_STATUS.md`** - État actuel
3. **Lire le AS3 source** :
   - Primary: `source_as_win63/habbo/<module>/<ClassName>.as`
   - Complementary: `source_as_flash/com/sulake/habbo/<module>/<ClassName>.as`
4. **Lire le fichier TS existant** s'il y en a un avant de modifier

### Règles de code

| Règle | Convention |
|-------|-----------|
| Braces | Allman style (ouverture sur nouvelle ligne) |
| Classes | PascalCase |
| Interfaces | I + PascalCase |
| Champs privés | `_` prefix + camelCase |
| Constantes | UPPER_SNAKE_CASE |
| Méthodes | camelCase |
| Imports | `import type` pour les types |
| Exports | Named exports uniquement |
| JSDoc | Obligatoire sur classes/méthodes publiques avec `@see` AS3 |
| dispose() | Toujours dernière méthode, check `_disposed` flag |

### Templates

**Composer** :
```typescript
export class ExampleComposer extends MessageComposer<[number, string]>
{
    private _data: [number, string];

    constructor(id: number, name: string)
    {
        super();
        this._data = [id, name];
    }

    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
```

**Event** :
```typescript
export class ExampleMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: Function)
    {
        super(callback, ExampleMessageParser);
    }

    get parser(): ExampleMessageParser
    {
        return this._parser as ExampleMessageParser;
    }
}
```

**Parser** :
```typescript
export class ExampleMessageParser implements IMessageParser
{
    private _value: string = '';

    flush(): boolean
    {
        this._value = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;
        this._value = wrapper.readString();
        return true;
    }

    get value(): string
    {
        return this._value;
    }
}
```

### Après chaque phase

1. `npm run dev` - vérifier la compilation
2. Se connecter au serveur Habbo et tester
3. Vérifier les logs console pour erreurs silencieuses
4. **Mettre à jour `docs/IMPLEMENTATION_STATUS.md`** (cocher éléments, mettre à jour %)

### Règles critiques (mémoire projet)

1. **JAMAIS overrider le getter `events` dans les sous-classes de Component** - utiliser un nom différent
2. **Utiliser `createObjectInternal()` PAS `createRoomObject()` depuis le container** - évite la récursion infinie
3. **TOUJOURS lire le AS3 avant d'implémenter** - ne jamais inventer

---

## Effort estimé total

| Phase | Fichiers | Durée | Dépend de |
|-------|----------|-------|-----------|
| Phase 0 | ~20 | 1-2 jours | - |
| Phase 1 | ~80 | 2-3 semaines | Phase 0 |
| Phase 2 | ~70 | 3-4 semaines | Phase 1 |
| Phase 3 | ~300 | 2-3 semaines | Phase 0 |
| Phase 4 | ~62 | 2-3 semaines | Phase 3 |
| Phase 5 | ~46 | 2 semaines | Phase 0, 3 |
| Phase 6 | ~45 | 2-3 semaines | Phase 1 |
| Phase 7 | ~48 | 2 semaines | Phase 3 |
| Phase 8 | ~25 | 2-3 semaines | Phase 3, 7 |
| Phase 9 | ~20 | 1-2 semaines | Toutes |
| **TOTAL** | **~716** | **~20-26 semaines** | |

---

## Vérification finale

- [ ] Phase 0 complète
- [ ] Phase 1 complète
- [ ] Phase 2 complète
- [ ] Phase 3 complète
- [ ] Phase 4 complète
- [ ] Phase 5 complète
- [ ] Phase 6 complète
- [ ] Phase 7 complète
- [ ] Phase 8 complète
- [ ] Phase 9 complète
- [ ] `docs/IMPLEMENTATION_STATUS.md` à jour
- [ ] `npm run dev` compile sans erreur
- [ ] Couverture ENGINE ≥ 85%
