# Audit de Conformité AS3 ↔ TypeScript — Rapport Final

**Date:** 2026-02-18
**Scope:** Tous les fichiers TypeScript du projet Helium (hors `outgoing/`, `incoming/`, `parsers/`)
**Référence:** `sources/win63_version/` (AS3 primaire)

---

## Vue d'ensemble

| #  | Module                                  | Couverture | Sévérité     |
|----|-----------------------------------------|------------|--------------|
| 1  | `core/` (sans window)                   | ~75%       | CRITIQUE     |
| 2  | `core/window`                           | ~70%       | CRITIQUE     |
| 3  | `habbo/avatar`                          | ~65%       | CRITIQUE     |
| 4  | `habbo/catalog`                         | **0%**     | CRITIQUE     |
| 5  | `habbo/communication` + `configuration` | ~80%       | CRITIQUE     |
| 6  | `habbo/freeflowchat`                    | ~80%       | MINEUR       |
| 7  | `habbo/friendbar`                       | ~30%       | MINEUR       |
| 8  | `habbo/friendlist`                      | ~60%       | CRITIQUE     |
| 9  | `habbo/game`                            | **0%**     | CRITIQUE     |
| 10 | `habbo/groups`                          | ~5%        | CRITIQUE     |
| 11 | `habbo/help`                            | ~40%       | CRITIQUE     |
| 12 | `habbo/inventory`                       | ~40%       | CRITIQUE     |
| 13 | `habbo/localization`                    | ~85%       | MINEUR       |
| 14 | `habbo/messenger`                       | ~80%       | MINEUR       |
| 15 | `habbo/moderation`                      | ~50%       | CRITIQUE     |
| 16 | `habbo/navigator`                       | ~60%       | CRITIQUE     |
| 17 | `habbo/notifications`                   | ~70%       | MINEUR       |
| 18 | `habbo/nux`                             | **0%**     | CRITIQUE     |
| 19 | `habbo/phonenumber`                     | **0%**     | CRITIQUE     |
| 20 | `habbo/quest`                           | ~40%       | CRITIQUE     |
| 21 | `habbo/room`                            | ~90%       | MINEUR       |
| 22 | `habbo/roomevents`                      | **0%**     | CRITIQUE     |
| 23 | `habbo/session`                         | ~85%       | CRITIQUE     |
| 24 | `habbo/sound`                           | **0%**     | CRITIQUE     |
| 25 | `habbo/toolbar`                         | ~95%       | MINEUR       |
| 26 | `habbo/tracking`                        | ~90%       | MINEUR       |
| 27 | `habbo/ui`                              | ~20%       | CRITIQUE     |
| 28 | `habbo/userclassification`              | **0%**     | CRITIQUE     |
| 29 | `habbo/utils`                           | ~80%       | MINEUR       |
| 30 | `habbo/window`                          | ~85%       | MINEUR       |
| 31 | `room/` (engine)                        | ~67%       | CRITIQUE     |
| 32 | `iid/`                                  | **44%**    | CRITIQUE     |
| 33 | `habbo/advertisement`                   | ~85%       | MINEUR       |
| 34 | `habbo/campaign`                        | ~70%       | MINEUR       |
| 35 | **BinaryData/XML → JSON**               | **100%**   | **CONFORME** |

---

## Modules 100% manquants (0 fichiers TS)

| Module                       | Fichiers AS3 | Impact                                  |
|------------------------------|--------------|-----------------------------------------|
| **habbo/catalog**            | 50+ classes  | Boutique/magasin entièrement absent     |
| **habbo/game**               | 30+ classes  | Snowwar et mini-jeux impossibles        |
| **habbo/roomevents**         | 70+ classes  | Wired (menu + setup) entièrement absent |
| **habbo/sound**              | 29 classes   | Aucun son/musique/trax possible         |
| **habbo/nux**                | 4+ classes   | Tutoriel nouveaux utilisateurs absent   |
| **habbo/phonenumber**        | 7 classes    | Vérification téléphone absente          |
| **habbo/userclassification** | 1 classe     | Classification utilisateur absente      |

---

## Problèmes critiques transversaux

### 1. IID Symbols — 27/48 manquants (44% couverture)

Symbols manquants dans `packages/helium-engine/src/iid/` :

- `IIDCollectiblesController`
- `IIDCoreLocalizationManager`
- `IIDCoreWindowManager`
- `IIDHabboAdManager`
- `IIDHabboAvatarEditor`
- `IIDHabboCampaigns`
- `IIDHabboCatalog`
- `IIDHabboClubCenter`
- `IIDHabboEpicPopupView`
- `IIDHabboFreeFlowChat`
- `IIDHabboFriendBarData`
- `IIDHabboFriendBarView`
- `IIDHabboGameManager`
- `IIDHabboGroupForumController`
- `IIDHabboGroupsManager`
- `IIDHabboHelp`
- `IIDHabboMessenger`
- `IIDHabboModeration`
- `IIDHabboNotifications`
- `IIDHabboNuxDialogs`
- `IIDHabboPhoneNumber`
- `IIDHabboQuestEngine`
- `IIDHabboSoundManager`
- `IIDHabboTalent`
- `IIDHabboUserDefinedRoomEvents`
- `IIDRoomObjectFactory`
- `IIDRoomRendererFactory`
- `IIDVaultController`
- `IIDWiredMenuController`

### 2. IRoomHandlerListener — contrat d'interface cassé

```
AS3 : listener.events        (IEventDispatcher)
TS  : listener.sessionEvents  (EventEmitter)
```

Impact : divergence structurelle dans tout le système de session. Tous les handlers utilisent le nom TS, mais le contrat AS3 est brisé.

### 3. Dépendances DI massivement manquantes

Presque tous les managers n'injectent que 1-3 dépendances alors que l'AS3 en déclare 6-12 :

| Manager            | Deps TS | Deps AS3 | Manquantes                                                                            |
|--------------------|---------|----------|---------------------------------------------------------------------------------------|
| HabboGroupsManager | 1       | 10       | WindowManager, Localization, Navigator, Catalog, Toolbar, SessionData, Tracking, etc. |
| HabboQuestEngine   | 1       | 8        | Catalog, Notifications, SessionData, RoomEngine, Navigator, Help, Config              |
| HabboHelp          | 1       | 4        | WindowManager, Localization, Toolbar, SoundManager                                    |
| RoomSessionManager | 2       | 6        | HabboTracking, HabboFreeFlowChat, HabboConfig, AvatarRenderManager                    |
| HabboNavigator     | partiel | 8+       | AvatarRenderManager, HabboHelp, Catalog                                               |
| HabboNotifications | partiel | 6+       | Inventory, FriendList, RoomEngine, Catalog, Toolbar                                   |

### 4. Room Engine — Renderer layer 100% absent

Fichiers AS3 non portés dans `room/renderer/` :

- `IRoomRenderer.as`
- `IRoomRendererBase.as`
- `IRoomRendererFactory.as`
- `IRoomRenderingCanvas.as`
- `IRoomRenderingCanvasMouseListener.as`
- `class_2015.as`, `class_3446.as`, `class_3447.as`, `class_3650.as`, `class_3656.as`
- Tous les fichiers `cache/` et `utils/`

Méthodes manquantes dans `RoomInstance.ts` :
- `setRenderer()` / `getRenderer()`
- `feedRoomObject()` / `removeRoomObject()`

### 5. core/window — Services critiques manquants

| Service manquant      | Rôle                               | Sévérité |
|-----------------------|------------------------------------|----------|
| `FocusManager`        | Gestion du focus entre fenêtres    | CRITIQUE |
| `WindowMouseListener` | Événements souris sur les fenêtres | CRITIQUE |
| `WindowToolTipAgent`  | Affichage des tooltips             | CRITIQUE |
| `BitmapDataRenderer`  | Rendu bitmap                       | CRITIQUE |
| `LabelRenderer`       | Rendu texte/labels                 | CRITIQUE |
| `ShapeSkinRenderer`   | Rendu formes/shapes                | CRITIQUE |
| `TextSkinRenderer`    | Rendu texte avancé                 | CRITIQUE |
| `TextFieldCache`      | Cache de TextFields                | CRITIQUE |
| Dossier `tablet/`     | Support tactile/mobile             | CRITIQUE |
| Dossier `tools/`      | Profiling/debug                    | MINEUR   |

---

## Bugs détectés

| Fichier                    | Ligne           | Bug                                                                                  | Sévérité |
|----------------------------|-----------------|--------------------------------------------------------------------------------------|----------|
| `RoomGeometry.ts`          | ~201            | `Vector3d.sum()` résultat non assigné (orphelin) — la rotation Z ne fonctionne pas   | CRITIQUE |
| `RoomSession.ts`           | dimmer          | Couleur passée comme nombre au lieu de hex string (`"#RRGGBB"`)                      | CRITIQUE |
| `RoomSessionManager.ts`    | deps            | `_habboTracking` toujours `null` (dépendance jamais injectée)                        | CRITIQUE |
| `AvatarFigureContainer.ts` | getPartColorIds | Retourne `[]` au lieu de `null` quand le type n'existe pas                           | MINEUR   |

---

## Méthodes / propriétés inventées (absentes de l'AS3)

| Fichier                  | Élément inventé                                    |
|--------------------------|----------------------------------------------------|
| `AvatarRenderManager.ts` | Méthode `onGameDataReady()`                        |
| `MessageRegistry.ts`     | Classe entière (pas de correspondance AS3 claire)  |

---

## Détails par module

### core/ (sans window)

**Fichiers analysés :** ~87 TS vs ~358 AS3

**Écarts critiques :**

- **AssetLibrary.ts** :
  - Manque `extends EventDispatcherWrapper` (AS3 ligne 17)
  - Méthode `getClass()` absente
  - Constructeur différent : AS3 `(String, XML)` vs TS `(IContext, string?)`
  - `loadFromFile()` remplacé par pattern async (signature différente)

- **CoreCommunicationManager.ts** :
  - Manque `IUpdateReceiver` implémentation
  - AS3 appelle `registerUpdateReceiver(this, 0)` — absent en TS

- **CoreLocalizationManager.ts** :
  - Utilise `fetch()` au lieu du système d'assets AS3
  - Dépendance `IIDHabboLocalizationManager` manquante
  - Constructeur simplifié (manque flags + assetLibrary)
  - Méthodes manquantes : `getRawValue()`, `applyLocalizationData()`

- **Component.ts** :
  - Méthodes manquantes : `toXMLString()`, `updateUrlProtocol()`, `interpolate()`, `assetLoadFromFile()`

### core/window

**3 services critiques manquants :** FocusManager, WindowMouseListener, WindowToolTipAgent

**4 renderers graphiques manquants :** BitmapDataRenderer, LabelRenderer, ShapeSkinRenderer, TextSkinRenderer

**Dossier tablet/ entièrement absent :** ITouchAwareWindow, TabletEventProcessor, TabletEventQueue

**~30+ contrôleurs** sans implémentation d'interfaces tactiles (ITouchAwareWindow)

**10+ utilitaires/interfaces manquants :** GenericEventQueue, IChildEntityArray, IEventProcessor, IEventQueue, IInputProcessorRoot, INotify, ITextFieldContainer, TextFieldCache, XMLPropertyArrayParser

### habbo/avatar

**Fichiers analysés :** 83 TS vs 135 AS3

**Écarts critiques :**

- **AvatarRenderManager.ts** :
  - 7+ méthodes manquantes : `getAssetByName()`, `getAnimationManager()`, `resolveClubLevel()`, `getItemIds()`, `purgeAssets()`, `resetAssetManager()`, mode getter/setter
  - Méthode `onGameDataReady()` INVENTÉE (absente de l'AS3)

- **AvatarStructure.ts** :
  - N'hérite PAS de `EventDispatcherWrapper` (AS3 oui)
  - `initActions()` : 1 paramètre (TS) vs 2 (AS3: IAssetLibrary + XML)
  - `dispose()` manquant

- **IAvatarRenderManager.ts** :
  - 8 méthodes d'interface manquantes : `assets`, `getAssetByName()`, `mode`, `getAnimationManager()`, `resetAssetManager()`, `resolveClubLevel()`, `getItemIds()`, `purgeAssets()`

- **AvatarImage.ts** :
  - Constantes CHANNELS_* manquantes (EQUAL, UNIQUE, RED, GREEN, BLUE, SATURATED)
  - `IDisposable` non implémenté
  - Ordre des paramètres du constructeur différent

**40+ fichiers AS3 sans correspondant TS** (principalement Avatar Editor UI — intentionnel)

### habbo/catalog

**MODULE 100% VIDE** — 14 sous-dossiers avec `.gitkeep` uniquement.

AS3 contient 50+ classes : HabboCatalog, HabboCatalogUtils, ClubBuyController, CollectiblesController, GuildMembershipsController, MarketplaceModel, etc.

### habbo/communication + configuration

- **IncomingMessages.ts** :
  - `onIdentityAccounts()` ne peuple PAS la liste d'avatars login
  - `handleWebLogout()` manquant (redirection URL)
  - `onConnectionDisconnected()` incomplet

- **HabboConfigurationManager.ts** :
  - Dépendance localization manquante
  - `resetAll()` absent

- **HabboProperty enum** :
  - Propriétés manquantes : `flash.dynamic.download.url`, `flash.dynamic.download.name.template`, `flash.dynamic.avatar.download.configuration`, `flash.dynamic.avatar.download.url`, `pocket.api`, `web.api`, `facebook.application.id`, `logout.url`, `logout.disconnect.url`

- **AuthenticationOKMessageParser** :
  - `suggestedLoginActions` non extrait

### habbo/freeflowchat

- **ChatEventHandler.ts** : game chat event handling absent (snowwar)
- **HabboFreeFlowChat.ts** : seulement 3/12 dépendances injectées
- **ChatHistoryBuffer.ts** : manque `insertRoomChange()`, `totalHeight`

### habbo/friendbar

Seul `HabboLandingView` est implémenté. Tous les sous-composants sont stubs.

`IHabboFriendBarData` : 13 méthodes définies mais non implémentées (`numFriends`, `getFriendAt()`, `getFriendByID()`, `acceptFriendRequest()`, `followToRoom()`, etc.)

### habbo/friendlist

- **ILinkEventTracker** non implémenté (deeplink handling perdu)
- **Quest completion** : `FriendRequestQuestCompleteMessageComposer` non envoyé après accept
- **IAvatarImageListener** manquant

### habbo/game

**MODULE 100% MANQUANT** — 0/30+ fichiers portés. Snowwar entièrement absent.

### habbo/groups

**95% incomplet** — squelette seulement.

- 0 message event handlers (AS3 en enregistre 22)
- Méthode `send()` absente
- 20+ getters publics manquants
- User kick/block handling absent

### habbo/help

**60% incomplet.**

- 5 UI controllers manquants : WelcomeScreenController, HabboWayController, HabboWayQuizController, SafetyBookletController, TopicsFlowHelpController
- 10 message events non enregistrés
- CFH topics handler manquant
- Toolbar event handling absent

### habbo/inventory

**Conformité ~40%.**

- **IHabboInventory** : ~20 méthodes publiques manquantes
- **Marketplace** : module entier manquant
- **Common** (ThumbListManager) : module entier manquant
- **UnseenItemTracker** : constructeur manque 2 paramètres (events dispatcher, HabboInventory ref)
- **Badge** : constructeur manque le paramètre `BadgesModel`
- **Effect** : n'implémente aucune interface, propriétés d'icônes manquantes
- **TradingModel** : devrait implémenter `IInventoryModel` + `IGetImageListener`

### habbo/navigator

- **HabboNavigator** : manque `IHabboTransitionalNavigator`, `ILinkEventTracker`
- Dépendances manquantes : AvatarRenderManager, HabboHelp, Catalog
- 17+ propriétés de classe manquantes (controllers, views, managers)
- 8+ méthodes manquantes (enterRoomWebRequest, showToolbarHover, getButton, etc.)
- **NavigatorData** : manque le modèle `Tabs`, `hasSecurity()` check dans `canEditRoomSettings()`

### habbo/notifications

- feedController manquant
- 5+ listeners catalog manquants (builder membership, collectibles)
- Dépendances manquantes : inventory, friendList, roomEngine

### habbo/nux + habbo/phonenumber

**MODULES 100% VIDES.** Répertoires existent mais 0 fichiers TS.

### habbo/quest

- **HabboQuestEngine** : manque `IUpdateReceiver`, 8+ dépendances, 25+ méthodes utilitaires
- Toolbar click handler absent
- `onPerksUpdated()` listener manquant

### habbo/room

**~90% conforme.** Bon alignement structurel.

Architecture correcte, `createObjectInternal` pattern respecté.

### habbo/roomevents

**MODULE 100% ABSENT.** Seulement `.gitkeep`.

AS3 contient : `HabboUserDefinedRoomEvents.as`, `WiredVariablesSynchronizer.as`, 30+ fichiers wired_menu, 40+ fichiers wired_setup.

### habbo/session

**~85% conforme.**

- **RoomSession.ts** :
  - Composers pet divergents : `PickUpPetComposer` vs AS3 `RemovePetFromFlatMessageComposer`
  - mount/dismount : 2 composers séparés vs AS3 1 avec booléen
  - Dimmer color : nombre vs hex string

- **RoomSessionManager.ts** :
  - `_habboTracking` jamais injecté (toujours null)
  - 4 dépendances AS3 manquantes

- **RoomSessionHandler.ts** :
  - 2 message events TODO : `RoomQueueStatusMessageEvent`, `YouAreSpectatorMessageEvent`

### habbo/sound

**MODULE 100% ABSENT.** 0/29 fichiers.

Manquent : HabboSoundManagerFlash10, HabboMusicController, JukeboxPlayListController, TraxSequencer, TraxChannel, TraxData, FurniSamplePlaybackManager, 6 fichiers d'événements.

### habbo/toolbar

**~95% conforme.** Très bon alignement. Quelques stubs UI acceptables.

### habbo/tracking

**~90% conforme.** Logique métier principale conservée. 10+ event handlers omis (navigator, catalog, inventory events — non-bloquant).

### habbo/ui

**~20% conforme.**

- 46 handlers AS3 ignorés comme VIEW (correct)
- MAIS interfaces support manquantes : `IRoomWidgetHandler`, `IRoomWidgetHandlerContainer`, `IRoomWidgetMessageListener`

### habbo/userclassification

**MODULE 100% VIDE.** `UserClassificationData.ts` manquant.

### habbo/utils

**~80% conforme.** `Tween.as` manquant dans `animation/`.

### habbo/window

**~85% conforme.** Très bon alignement. Widgets, enums, managers, thèmes bien portés.

### room/ (Room Engine)

**~67% conforme.**

- **Renderer layer 100% absent** (~10+ fichiers)
- **RoomManager.ts** : state machine oversimplifiée, event listeners manquants, `processLoadedContentTypes()` absent, pas de throttling (frame budget 40ms)
- **RoomInstance.ts** : `setRenderer()`/`getRenderer()` absents
- **RoomGeometry.ts** : bug `setDepthVector()` — `Vector3d.sum()` orphelin
- 17+ fichiers AS3 non portés (renderer, visualization interfaces, utils : NumberBank, PointMath, RoomEnterEffect, RoomRotatingEffect, RoomShakingEffect)

### iid/

**44% couverture** (21/48 symbols exportés). 27 IID symbols manquants.

`IIDRoomUI.ts` utilise une syntaxe non-standard (`Symbol()` direct au lieu de `createIID()`).

### habbo/advertisement

**~85% conforme.** AdImageRequest et InterstitialEvent conformes. AdManager manque 3 dépendances et méthodes d'image processing (intentionnel pour web).

### habbo/campaign

**~70% conforme.** Logique core préservée (openPackage, linkReceived). 5 dépendances UI manquantes (intentionnel — SolidJS).

---

## BinaryData / XML → JSON

**STATUT : CONFORME (100%)**

La conversion est complète et correcte :

| Catégorie             | Nombre | Statut                     |
|-----------------------|--------|----------------------------|
| Window layouts        | 900+   | COMPLET                    |
| Window skins          | 180+   | COMPLET                    |
| Chat styles           | 120+   | COMPLET                    |
| Element description   | 1      | COMPLET                    |
| Avatar editor layouts | 11     | COMPLET                    |
| Navigator layouts     | 50+    | COMPLET                    |
| Catalog layouts       | 100+   | COMPLET                    |
| Avatar render data    | 4      | RUNTIME (gamedata server)  |
| Manifestes            | 35     | Exclus (métadonnées Flash) |

Aucune donnée critique manquante.

---

## Priorités de correction

### URGENT (bloquant fonctionnellement)

1. Porter **habbo/catalog** (boutique — 50+ classes)
2. Porter **habbo/sound** (audio — 29 classes)
3. Porter **room/renderer/** (rendu des objets — 10+ fichiers)
4. Fixer **RoomGeometry.setDepthVector()** (bug d'assignation Vector3d)
5. Créer les **27 IID symbols manquants**
6. Fixer **RoomSessionManager._habboTracking** injection de dépendance
7. Fixer **RoomSession.ts** couleur dimmer (nombre → hex string)

### HAUTE PRIORITÉ

8. Porter **habbo/roomevents** (wired system — 70+ classes)
9. Porter **habbo/game** (snowwar — 30+ classes)
10. Compléter **core/window services** (FocusManager, 4 renderers, mouse listener, tooltips)
11. Compléter **habbo/groups** (message handlers, opérations, 22 events)
12. Compléter **habbo/help** (5 controllers, 10 message events)
13. Aligner **IRoomHandlerListener** (events vs sessionEvents)
14. Implémenter **RoomInstance.setRenderer()** / `getRenderer()`
15. Implémenter **RoomManager** state machine + content processing + throttling

### MOYENNE PRIORITÉ

16. Compléter **habbo/inventory** (marketplace, interfaces, 20 méthodes IHabboInventory)
17. Compléter **habbo/navigator** (IHabboTransitionalNavigator, Tabs, controllers)
18. Compléter **habbo/quest** (25+ méthodes utilitaires, IUpdateReceiver, 8 dépendances)
19. Porter **habbo/nux** + **habbo/phonenumber** + **habbo/userclassification**
20. Compléter **AvatarRenderManager** (7+ méthodes manquantes)
21. Ajouter **IRoomWidgetHandler** interfaces dans `habbo/ui/`
22. Compléter **habbo/friendlist** (ILinkEventTracker, quest completion)
23. Compléter **habbo/moderation** (dépendances UI, window tracking)
24. Compléter **habbo/freeflowchat** (game chat events, dépendances)

### BASSE PRIORITÉ

25. Compléter **habbo/tracking** (10+ event handlers supplémentaires)
26. Porter **habbo/friendbar** sous-composants
27. Ajouter support **tablet/tactile** dans core/window
28. Aligner **AvatarFigureContainer.getPartColorIds()** retour `null` vs `[]`
29. Refactorer **IIDRoomUI.ts** vers `createIID()` pattern
30. Documenter les cuts intentionnels (advertisement, campaign)
