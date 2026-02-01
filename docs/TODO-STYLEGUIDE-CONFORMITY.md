# TODO: Conformité au Styleguide

> **Généré:** 2026-02-01 | **Total:** 192 fichiers à corriger

Ce document liste toutes les corrections nécessaires pour rendre le code conforme au styleguide.

---

## Résumé des Priorités

| Priorité | Description                            | Fichiers | Effort  |
|----------|----------------------------------------|----------|---------|
| **P1**   | Corriger imports inventory             | 16       | ~30 min |
| **P2**   | Ajouter `@see` aux Composers           | 68       | ~2h     |
| **P3**   | Ajouter `@see` aux Parsers             | 62       | ~2h     |
| **P4**   | ~~Validation wrapper~~ (SKIPPED)       | 0        | N/A     |
| **P5**   | Ajouter `@see` aux Events              | 62       | ~2h     |

---

## P1: Corriger les imports (16 fichiers) - CRITIQUE

Ces fichiers utilisent `@/core` au lieu de `@core/communication/messages/IMessageComposer`.

### Fichiers à corriger

```
src/habbo/communication/messages/outgoing/inventory/
├── AcceptTradingComposer.ts
├── AddItemToTradeComposer.ts
├── AvatarEffectActivatedComposer.ts
├── AvatarEffectSelectedComposer.ts
├── CloseTradingComposer.ts
├── ConfirmAcceptTradingComposer.ts
├── ConfirmDeclineTradingComposer.ts
├── GetBadgesComposer.ts
├── GetBotInventoryComposer.ts
├── GetPetInventoryComposer.ts
├── OpenTradingComposer.ts
├── RemoveItemFromTradeComposer.ts
├── RequestFurniInventoryComposer.ts
├── ResetUnseenItemsComposer.ts
├── SetActivatedBadgesComposer.ts
└── UnacceptTradingComposer.ts
```

### Correction à appliquer

**Avant:**

```typescript
import type {IMessageComposer} from "@/core";
```

**Après:**

```typescript
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
```

---

## P2: Ajouter `@see` aux Composers (68 fichiers)

Tous les Composers doivent avoir un JSDoc avec référence au fichier AS3.

### Fichiers par dossier

#### handshake/ (9 fichiers)

- [ ] `ClientHelloMessageComposer.ts` →
  `@see source_as/habbo/communication/messages/outgoing/handshake/ClientHelloMessageComposer.as`
- [ ] `CompleteDiffieHandshakeMessageComposer.ts`
- [ ] `DisconnectMessageComposer.ts`
- [ ] `InfoRetrieveMessageComposer.ts`
- [ ] `InitDiffieHandshakeMessageComposer.ts`
- [ ] `PongMessageComposer.ts`
- [ ] `SSOTicketMessageComposer.ts`
- [ ] `UniqueIDMessageComposer.ts`
- [ ] `VersionCheckMessageComposer.ts`

#### navigator/ (37 fichiers)

- [ ] `AddFavouriteRoomMessageComposer.ts`
- [ ] `CancelEventMessageComposer.ts`
- [ ] `CanCreateRoomMessageComposer.ts`
- [ ] `CompetitionRoomsSearchMessageComposer.ts`
- [ ] `ConvertGlobalRoomIdMessageComposer.ts`
- [ ] `CreateFlatMessageComposer.ts`
- [ ] `DeleteFavouriteRoomMessageComposer.ts`
- [ ] `EditEventMessageComposer.ts`
- [ ] `ForwardToSomeRoomMessageComposer.ts`
- [ ] `GetGuestRoomMessageComposer.ts`
- [ ] `GetOfficialRoomsMessageComposer.ts`
- [ ] `GetPopularRoomTagsMessageComposer.ts`
- [ ] `GetUserEventCatsMessageComposer.ts`
- [ ] `GetUserFlatCatsMessageComposer.ts`
- [ ] `GuildBaseSearchMessageComposer.ts`
- [ ] `MyFavouriteRoomsSearchMessageComposer.ts`
- [ ] `MyFrequentRoomHistorySearchMessageComposer.ts`
- [ ] `MyFriendsRoomsSearchMessageComposer.ts`
- [ ] `MyGuildBasesSearchMessageComposer.ts`
- [ ] `MyRecommendedRoomsMessageComposer.ts`
- [ ] `MyRoomHistorySearchMessageComposer.ts`
- [ ] `MyRoomRightsSearchMessageComposer.ts`
- [ ] `MyRoomsSearchMessageComposer.ts`
- [ ] `PopularRoomsSearchMessageComposer.ts`
- [ ] `RateFlatMessageComposer.ts`
- [ ] `RemoveOwnRoomRightsRoomMessageComposer.ts`
- [ ] `RoomAdEventTabAdClickedComposer.ts`
- [ ] `RoomAdEventTabViewedComposer.ts`
- [ ] `RoomAdSearchMessageComposer.ts`
- [ ] `RoomsWhereMyFriendsAreSearchMessageComposer.ts`
- [ ] `RoomsWithHighestScoreSearchMessageComposer.ts`
- [ ] `RoomTextSearchMessageComposer.ts`
- [ ] `SetRoomSessionTagsMessageComposer.ts`
- [ ] `ToggleStaffPickMessageComposer.ts`
- [ ] `UpdateHomeRoomMessageComposer.ts`

#### newnavigator/ (7 fichiers)

- [ ] `NavigatorAddCollapsedCategoryMessageComposer.ts`
- [ ] `NavigatorAddSavedSearchComposer.ts`
- [ ] `NavigatorDeleteSavedSearchComposer.ts`
- [ ] `NavigatorRemoveCollapsedCategoryMessageComposer.ts`
- [ ] `NavigatorSetSearchCodeViewModeMessageComposer.ts`
- [ ] `NewNavigatorInitComposer.ts`
- [ ] `NewNavigatorSearchComposer.ts`

#### inventory/ (16 fichiers) - AUSSI P1

- [ ] `AcceptTradingComposer.ts`
- [ ] `AddItemToTradeComposer.ts`
- [ ] `AvatarEffectActivatedComposer.ts`
- [ ] `AvatarEffectSelectedComposer.ts`
- [ ] `CloseTradingComposer.ts`
- [ ] `ConfirmAcceptTradingComposer.ts`
- [ ] `ConfirmDeclineTradingComposer.ts`
- [ ] `GetBadgesComposer.ts`
- [ ] `GetBotInventoryComposer.ts`
- [ ] `GetPetInventoryComposer.ts`
- [ ] `OpenTradingComposer.ts`
- [ ] `RemoveItemFromTradeComposer.ts`
- [ ] `RequestFurniInventoryComposer.ts`
- [ ] `ResetUnseenItemsComposer.ts`
- [ ] `SetActivatedBadgesComposer.ts`
- [ ] `UnacceptTradingComposer.ts`

#### tracking/ (1 fichier)

- [ ] `EventLogMessageComposer.ts`

### Template JSDoc à ajouter

```typescript
/**
 * [Description existante]
 *
 * @see source_as/habbo/communication/messages/outgoing/{feature}/{ClassName}.as
 */
```

---

## P3: Ajouter `@see` aux Parsers (62 fichiers)

### Fichiers par dossier

#### availability/ (1 fichier)

- [ ] `AvailabilityStatusMessageParser.ts`

#### avatar/ (1 fichier)

- [ ] `FigureUpdateMessageParser.ts`

#### catalog/ (1 fichier)

- [ ] `BuildersClubSubscriptionStatusMessageParser.ts`

#### handshake/ (10 fichiers)

- [ ] `AuthenticationOKMessageParser.ts`
- [ ] `DisconnectReasonMessageParser.ts`
- [ ] `GenerateSecretKeyMessageParser.ts`
- [ ] `GenericErrorMessageParser.ts`
- [ ] `InitCryptoMessageParser.ts`
- [ ] `IsFirstLoginOfDayMessageParser.ts`
- [ ] `NoobnessLevelMessageParser.ts`
- [ ] `PingMessageParser.ts`
- [ ] `UniqueMachineIdMessageParser.ts`
- [ ] `UserObjectMessageParser.ts`
- [ ] `UserRightsMessageParser.ts`

#### inventory/ (19 fichiers)

- [ ] `AchievementsScoreMessageParser.ts`
- [ ] `AvatarEffectsMessageParser.ts`
- [ ] `FigureSetIdsMessageParser.ts`
- [ ] `badges/BadgesMessageParser.ts`
- [ ] `bots/BotInventoryMessageParser.ts`
- [ ] `furni/FurniListAddOrUpdateMessageParser.ts`
- [ ] `furni/FurniListInvalidateMessageParser.ts`
- [ ] `furni/FurniListItemParser.ts`
- [ ] `furni/FurniListMessageParser.ts`
- [ ] `furni/FurniListRemoveMessageParser.ts`
- [ ] `pets/PetInventoryMessageParser.ts`
- [ ] `trading/TradingAcceptMessageParser.ts`
- [ ] `trading/TradingCloseMessageParser.ts`
- [ ] `trading/TradingCompletedMessageParser.ts`
- [ ] `trading/TradingConfirmationMessageParser.ts`
- [ ] `trading/TradingItemListMessageParser.ts`
- [ ] `trading/TradingNotOpenMessageParser.ts`
- [ ] `trading/TradingOpenMessageParser.ts`
- [ ] `unseen/UnseenItemsMessageParser.ts`

#### mysterybox/ (1 fichier)

- [ ] `MysteryBoxKeysMessageParser.ts`

#### navigator/ (18 fichiers)

- [ ] `CanCreateRoomEventMessageParser.ts`
- [ ] `CanCreateRoomMessageParser.ts`
- [ ] `CategoriesWithVisitorCountMessageParser.ts`
- [ ] `CompetitionRoomsDataMessageParser.ts`
- [ ] `ConvertedRoomIdMessageParser.ts`
- [ ] `DoorbellMessageParser.ts`
- [ ] `FavouriteChangedMessageParser.ts`
- [ ] `FavouritesMessageParser.ts`
- [ ] `FlatAccessDeniedMessageParser.ts`
- [ ] `FlatCreatedMessageParser.ts`
- [ ] `GetGuestRoomResultMessageParser.ts`
- [ ] `GuestRoomSearchResultMessageParser.ts`
- [ ] `NavigatorSettingsMessageParser.ts`
- [ ] `OfficialRoomsMessageParser.ts`
- [ ] `PopularRoomTagsResultMessageParser.ts`
- [ ] `RoomEventCancelMessageParser.ts`
- [ ] `RoomEventMessageParser.ts`
- [ ] `RoomInfoUpdatedMessageParser.ts`
- [ ] `RoomRatingMessageParser.ts`
- [ ] `UserEventCatsMessageParser.ts`
- [ ] `UserFlatCatsMessageParser.ts`

#### newnavigator/ (5 fichiers)

- [ ] `NavigatorCollapsedCategoriesMessageParser.ts`
- [ ] `NavigatorLiftedRoomsMessageParser.ts`
- [ ] `NavigatorMetaDataMessageParser.ts`
- [ ] `NavigatorSavedSearchesMessageParser.ts`
- [ ] `NavigatorSearchResultSetMessageParser.ts`
- [ ] `NavigatorWindowSettingsMessageParser.ts`

#### notifications/ (2 fichiers)

- [ ] `ActivityPointsMessageParser.ts`
- [ ] `InfoFeedEnableMessageParser.ts`

---

## P4: Ajouter validation wrapper aux Parsers - **SKIPPED**

~~Ajouter `if (!wrapper) return false;` au début de chaque méthode `parse()`.~~

**Status:** SKIPPED - Vérifié contre AS3 source code.

**Raison:** Le code AS3 original ne contient PAS cette validation. Les parsers AS3 appellent
directement `param1.readInteger()` sans vérifier si `param1` est null. Puisque AS3 est notre
source de vérité (voir CLAUDE.md), nous ne devons pas ajouter cette validation qui n'existe
pas dans l'implémentation originale.

**Référence AS3:**
```actionscript
// source_as/habbo/communication/messages/parser/inventory/furni/FurniListEventParser.as
public function parse(param1: IMessageDataWrapper): Boolean {
    var_875 = param1.readInteger();  // Pas de vérification null
    var_1023 = param1.readInteger();
    // ...
    return true;
}
```

---

## P5: Ajouter `@see` aux Events (62 fichiers)

Même pattern que les Composers et Parsers.

### Fichiers Events (extraire de la liste incoming/)

Tous les fichiers `*MessageEvent.ts` dans:

- `incoming/availability/`
- `incoming/avatar/`
- `incoming/catalog/`
- `incoming/handshake/`
- `incoming/inventory/`
- `incoming/mysterybox/`
- `incoming/navigator/`
- `incoming/newnavigator/`
- `incoming/notifications/`

---

## Script de correction automatique (suggestion)

Pour accélérer les corrections, un script pourrait:

1. Lire chaque fichier
2. Détecter le type (Composer/Parser/Event)
3. Extraire le nom de classe
4. Mapper vers le chemin AS3 correspondant
5. Ajouter le `@see` dans le JSDoc

**Attention:** Les chemins AS3 peuvent varier légèrement. Toujours vérifier manuellement.

---

## Progression

| Priorité  | Statut | Complétés | Restants |
|-----------|--------|-----------|----------|
| P1        | ✅ DONE | 16        | 0        |
| P2        | ✅ DONE | 68        | 0        |
| P3        | ✅ DONE | 59        | 0        |
| P4        | ⏭️ SKIP | 0         | 0        |
| P5        | ✅ DONE | 62        | 0        |
| **TOTAL** | -      | **~205**  | **0**    |

---

## Notes

- Les fichiers `index.ts` (barrel exports) ne nécessitent pas de modifications
- Les Data Classes (GuestRoomData, etc.) sont déjà conformes
- Prioriser P1 car c'est une erreur de build potentielle
- P2-P5 sont de la documentation, moins urgent mais important pour la maintenabilité
