# Helium Code Violations Audit

> **Audit date**: 2026-02-17
> **Scope**: All `.ts` files in `packages/helium-engine/src/` except `messages/outgoing/`, `messages/incoming/`, `messages/parser/`
> **Reference**: `docs/PATTERNS.md`, `docs/STYLEGUIDE.md`

## Summary

| # | Category                                                  | Count   | Severity |
|---|-----------------------------------------------------------|---------|----------|
| 1 | [Performance anti-patterns](#1-performance-anti-patterns) | 57      | HIGH     |
| 2 | [Null Safety (`\| undefined`)](#2-null-safety)            | 40      | MEDIUM   |
| 3 | [import type missing](#3-import-type)                     | 5       | LOW      |
| 4 | [Component Lifecycle & DI](#4-component-lifecycle--di)    | 3       | HIGH     |
| 5 | [EventEmitter conventions](#5-eventemitter-conventions)   | 3       | HIGH     |
| 6 | [Disposed Guard order](#6-disposed-guard)                 | 2       | HIGH     |
| 7 | [Guarded Getter (`!` assertion)](#7-guarded-getter)       | 1       | MEDIUM   |
|   | **TOTAL**                                                 | **111** |          |

---

## 1. Performance Anti-Patterns

### 1a. Array.includes / indexOf for frequent lookups → use Set (40+ instances)

**Rule**: If a collection is queried via `includes()`, `indexOf()`, or `find()` and can exceed 10 elements, replace with `Set` or `Map`.

#### RoomManager.ts

| Line | Code                                        | Fix                                                |
|------|---------------------------------------------|----------------------------------------------------|
| 96   | `this._pendingTypes.includes(type)`         | `_pendingTypes: Set<string>` → `.has()` / `.add()` |
| 137  | `this._updateCategories.includes(category)` | `_updateCategories: Set<number>` → `.has()`        |
| 156  | `this._updateCategories.indexOf(category)`  | Use `Set.delete()`                                 |

#### IgnoredUsersManager.ts

| Line | Code                                     | Fix                                       |
|------|------------------------------------------|-------------------------------------------|
| 60   | `this._ignoredUserIds.includes(userId)`  | `_ignoredUserIds: Set<number>` → `.has()` |
| 115  | `!this._ignoredUserIds.includes(userId)` | `.has()`                                  |
| 123  | `this._ignoredUserIds.indexOf(userId)`   | `.delete()`                               |

#### HabboNewNavigator.ts

| Line | Code                                            | Fix                                            |
|------|-------------------------------------------------|------------------------------------------------|
| 375  | `!this._collapsedCategories.includes(category)` | `_collapsedCategories: Set<string>` → `.has()` |
| 385  | `this._collapsedCategories.indexOf(category)`   | `.delete()`                                    |
| 395  | `this._collapsedCategories.includes(category)`  | `.has()`                                       |

#### Juggler.ts

| Line | Code                                           | Fix                            |
|------|------------------------------------------------|--------------------------------|
| 36   | `this._animatables.indexOf(animatable) === -1` | `_animatables: Set` → `.has()` |
| 55   | `this._animatables.indexOf(animatable) !== -1` | `.has()`                       |
| 75   | `this._animatables.indexOf(animatable)`        | `.delete()`                    |

#### BadgesModel.ts

| Line | Code                                  | Fix                      |
|------|---------------------------------------|--------------------------|
| 348  | `!this._activeBadges.includes(badge)` | `Set<string>` → `.has()` |
| 358  | `this._activeBadges.indexOf(badge)`   | `.delete()`              |

#### RoomObjectSpriteVisualization.ts

| Line | Code                                                | Fix                         |
|------|-----------------------------------------------------|-----------------------------|
| 175  | `this._sprites.indexOf(sprite as RoomObjectSprite)` | Use `Set` or `Map` for O(1) |

#### SessionDataManager.ts

| Line | Code                                                  | Fix                 |
|------|-------------------------------------------------------|---------------------|
| 888  | `this._productDataListeners.indexOf(listener) === -1` | `Set` → `.has()`    |
| 909  | `this._furniDataListeners.indexOf(listener) === -1`   | `Set` → `.has()`    |
| 944  | `this._productDataListeners.indexOf(listener) === -1` | `Set` → `.has()`    |
| 957  | `this._furniDataListeners.indexOf(listener)`          | `Set` → `.delete()` |
| 1076 | `this._nftChatStyleIds.indexOf(styleId) !== -1`       | `Set` → `.has()`    |

#### FurniModel.ts

| Line | Code                                           | Fix                |
|------|------------------------------------------------|--------------------|
| 547  | `this._furniData.indexOf(groupItem)`           | Use `Map` or `Set` |
| 567  | `this._furniData.indexOf(savedSelection) > -1` | Use `Set`          |

#### AvatarAssetDownloadManager.ts

| Line | Code                            | Fix                            |
|------|---------------------------------|--------------------------------|
| 311  | `.indexOf()` on download queue  | Use `Set` for library tracking |
| 333  | `.indexOf()` on download queue  | Use `Set`                      |
| 380  | `.includes()` on download queue | Use `Set`                      |
| 400  | `.indexOf()` on download queue  | Use `Set`                      |

#### EffectAssetDownloadManager.ts

| Line | Code                          | Fix       |
|------|-------------------------------|-----------|
| 195  | `.indexOf()` on library queue | Use `Set` |
| 253  | `.indexOf()` on library queue | Use `Set` |
| 275  | `.indexOf()` on library queue | Use `Set` |

#### AvatarActionManager.ts

| Line | Code                           | Fix       |
|------|--------------------------------|-----------|
| 182  | `prevents.indexOf(key) === -1` | Use `Set` |

#### Localization.ts

| Line | Code                                       | Fix       |
|------|--------------------------------------------|-----------|
| 60   | `this._listeners.indexOf(listener) === -1` | Use `Set` |

#### NavigatorData.ts

| Line | Code                                                                    | Fix                         |
|------|-------------------------------------------------------------------------|-----------------------------|
| 442  | `this._allCategories.find((cat) => cat.nodeId === nodeId)`              | Use `Map<number, Category>` |
| 447  | `this._allEventCategories.find((cat) => cat.categoryId === categoryId)` | Use `Map`                   |

---

### 1b. Array replacement `= []` instead of `.length = 0` (11 instances)

**Rule**: Clear an existing collection instead of replacing the reference. Avoids GC garbage.

| File                          | Line(s)           | Code                                                   | Fix                              |
|-------------------------------|-------------------|--------------------------------------------------------|----------------------------------|
| `LatencyTracker.ts`           | 66, 132, 182, 204 | `this._latencies = []`                                 | `this._latencies.length = 0`     |
| `HabboTracking.ts`            | 325               | `this._messageEvents = []`                             | `.length = 0`                    |
| `RoomManager.ts`              | 402-403           | `this._updateCategories = []; this._pendingTypes = []` | `.length = 0` (or `Set.clear()`) |
| `RoomInstance.ts`             | 47                | `this._updateCategories = []`                          | `.length = 0`                    |
| `IgnoredUsersManager.ts`      | 108               | `this._messageEvents = []`                             | `.length = 0`                    |
| `CoreCommunicationManager.ts` | 97                | `this._connections = []`                               | `.length = 0`                    |

---

### 1c. Array.concat() instead of push() (8 instances)

**Rule**: `concat()` creates a new array. Use `push(...items)` to append in place.

| File                     | Line | Code                                                                           | Fix                                     |
|--------------------------|------|--------------------------------------------------------------------------------|-----------------------------------------|
| `AvatarImage.ts`         | 1043 | `this._animationSpriteData = this._animationSpriteData.concat(spriteData)`     | `.push(...spriteData)`                  |
| `IssueManager.ts`        | 260  | `this._pendingPickIssueIds = this._pendingPickIssueIds.concat(issueIds)`       | `.push(...issueIds)`                    |
| `IssueManager.ts`        | 310  | `issueIds = issueIds.concat(bundle.getIssueIds())`                             | `.push(...bundle.getIssueIds())`        |
| `IssueManager.ts`        | 666  | `this._pendingReleaseIssueIds = this._pendingReleaseIssueIds.concat(issueIds)` | `.push(...issueIds)`                    |
| `AvatarStructure.ts`     | 406  | `hiddenLayers = hiddenLayers.concat(partSet.hiddenLayers)`                     | `.push(...partSet.hiddenLayers)`        |
| `AvatarSet.ts`           | 51   | `all = all.concat(subSet.getBodyParts())`                                      | `.push(...subSet.getBodyParts())`       |
| `ActionDefinition.ts`    | 173  | `return this._prevents.concat(this._getTypePrevents(id))`                      | Pre-compute or `.push()`                |
| `AvatarActionManager.ts` | 167  | `prevents = prevents.concat(definition.getPrevents(...))`                      | `.push(...definition.getPrevents(...))` |

---

### 1d. Texture.from() in render paths (4 instances)

**Rule**: Cache textures by content key. Never create `Texture.from()` every frame.

| File                              | Line     | Code                                         | Fix                       |
|-----------------------------------|----------|----------------------------------------------|---------------------------|
| `AvatarImage.ts`                  | 704      | `Texture.from({ resource: offscreen, ... })` | Cache by avatar state key |
| `AvatarImage.ts`                  | 781      | Same pattern                                 | Cache                     |
| `RoomPlane.ts`                    | 708, 760 | `Texture.from(this._outputCanvas)`           | Cache texture reference   |
| `FurnitureCuboidVisualization.ts` | 132      | `Texture.from(bitmap)` in render loop        | Cache by bitmap key       |

---

## 2. Null Safety

### 2a. `| undefined` instead of `| null` (40 instances)

**Rule**: Always use `| null`, never `| undefined`. Use `?? null` for `Map.get()`.

#### ICoreLocalizationManager.ts / CoreLocalizationManager.ts

| File                          | Line             | Code                                                                      | Fix              |
|-------------------------------|------------------|---------------------------------------------------------------------------|------------------|
| `ICoreLocalizationManager.ts` | 77               | `getLocalizationRaw(): ILocalization \| undefined`                        | `\| null`        |
| `ICoreLocalizationManager.ts` | 102              | `getLocalizationDefinition(): ILocalizationDefinition \| undefined`       | `\| null`        |
| `ICoreLocalizationManager.ts` | 107              | `getActiveLocalizationDefinition(): ILocalizationDefinition \| undefined` | `\| null`        |
| `ICoreLocalizationManager.ts` | 117              | `getGameDataResources(): IGameDataResources \| undefined`                 | `\| null`        |
| `CoreLocalizationManager.ts`  | 34               | `_gameDataResources: GameDataResources \| undefined`                      | `\| null = null` |
| `CoreLocalizationManager.ts`  | 72, 77, 302, 325 | Return types use `\| undefined`                                           | `\| null`        |

#### Data access patterns

| File                      | Line     | Code                                                    | Fix       |
|---------------------------|----------|---------------------------------------------------------|-----------|
| `NitroAsset.ts`           | 115, 123 | `get name(): string \| undefined`                       | `\| null` |
| `IntArrayStuffData.ts`    | 37       | `getValue(): number \| undefined`                       | `\| null` |
| `MapStuffData.ts`         | 49       | `getValue(): string \| undefined`                       | `\| null` |
| `StringArrayStuffData.ts` | 37       | `getValue(): string \| undefined`                       | `\| null` |
| `MapStuffData.ts` (room)  | 93       | `getValue(): string \| undefined`                       | `\| null` |
| `MessageRegistry.ts`      | 128      | `getMessageEventsForId(): IMessageEvent[] \| undefined` | `\| null` |
| `HabboToolbarIconEnum.ts` | 71       | `getIconName(): string \| undefined`                    | `\| null` |
| `Transitions.ts`          | 38       | `getTransition(): ((ratio) => number) \| undefined`     | `\| null` |

#### Map.get() without `?? null`

| File                   | Line     | Code                                                  | Fix       |
|------------------------|----------|-------------------------------------------------------|-----------|
| `RoomObjectManager.ts` | 99       | `this._objects.get(idKey) as RoomObject \| undefined` | `?? null` |
| `ComponentContext.ts`  | 411, 450 | `this._interfaceQueues.get(iid) as ... \| undefined`  | `?? null` |
| `GeometryBodyPart.ts`  | 109      | `this._items.get(id)` typed as `\| undefined`         | `?? null` |

#### JSON `as X | undefined` casts (should use `?? null`)

| File                            | Line(s)                                     |
|---------------------------------|---------------------------------------------|
| `AnimationSizeData.ts`          | 75, 83, 99                                  |
| `SizeData.ts`                   | 123, 161, 340, 347, 377, 384, 391, 398, 405 |
| `AnimationData.ts`              | 94, 173, 185, 225                           |
| `FurnitureVisualizationData.ts` | 268, 376                                    |
| `GraphicAssetCollection.ts`     | 111, 118, 359                               |
| `FurnitureDataParser.ts`        | 105, 106                                    |
| `ProductDataParser.ts`          | 92                                          |
| `RoomContentLoader.ts`          | 557                                         |
| `RoomEngine.ts`                 | 1923                                        |

#### Parameters accepting `undefined`

| File                 | Line          | Code                               | Fix                   |
|----------------------|---------------|------------------------------------|-----------------------|
| `StringUtil.ts`      | 78, 89, 100   | `str: string \| null \| undefined` | Remove `\| undefined` |
| `PlaneRasterizer.ts` | 387, 406, 425 | `mode: string \| undefined`        | `\| null`             |

---

## 3. import type

**Rule**: Use `import type` for type-only imports (interfaces, type aliases used only in annotations).

| File                                                  | Line | Import                                                        | Fix                               |
|-------------------------------------------------------|------|---------------------------------------------------------------|-----------------------------------|
| `habbo/navigator/IHabboNewNavigator.ts`               | 6    | `import {IDisposable} from "@core"`                           | `import type`                     |
| `habbo/help/HabboHelp.ts`                             | 20   | `import {IMessageComposer} from "@core"`                      | `import type`                     |
| `habbo/friendlist/HabboFriendList.ts`                 | 110  | `import {IMessageComposer} from "@core"`                      | `import type`                     |
| `habbo/communication/demo/IHabboCommunicationDemo.ts` | 1-2  | `import {IHabboCommunicationManager}`, `import {IConnection}` | `import type`                     |
| `habbo/communication/demo/HabboCommunicationDemo.ts`  | 1    | `import {IContext} from '@core/runtime'`                      | Separate `import type {IContext}` |

---

## 4. Component Lifecycle & DI

### 4a. IID pattern violation

| File                                       | Line | Violation                                                                                     | Fix                                                                                 |
|--------------------------------------------|------|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `iid/IIDRoomObjectVisualizationFactory.ts` | 1    | `export const IID_RoomObjectVisualizationFactory = Symbol('IRoomObjectVisualizationFactory')` | Use `createIID<IRoomObjectVisualizationFactory>('IRoomObjectVisualizationFactory')` |

### 4b. Singleton pattern on a manager

| File                              | Line      | Violation                                                | Fix                                |
|-----------------------------------|-----------|----------------------------------------------------------|------------------------------------|
| `habbo/tracking/HabboTracking.ts` | 48, 73-75 | `private static _instance` + singleton constructor logic | Remove singleton, use Component DI |

### 4c. Constructor initialization work

| File                              | Line    | Violation                                                  | Fix                                       |
|-----------------------------------|---------|------------------------------------------------------------|-------------------------------------------|
| `habbo/tracking/HabboTracking.ts` | 69-80   | Array initialization + singleton assignment in constructor | Move to `initComponent()`                 |
| `habbo/room/RoomEngine.ts`        | 119-137 | Event listener setup + factory creation in constructor     | Move event listeners to `initComponent()` |

---

## 5. EventEmitter Conventions

### 5a. Arrow functions in `.on()` — prevents cleanup

| File                                             | Line    | Code                                                                    | Fix                                                                         |
|--------------------------------------------------|---------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `habbo/localization/HabboLocalizationManager.ts` | 63-69   | `this._communicationManager.events.on('loginStep', (step) => { ... })`  | Use `this.onLoginStep.bind(this)`, store reference, clean up in `dispose()` |
| `habbo/room/RoomEngine.ts`                       | 133-136 | `this._contentLoaderEvents.on(CONTENT_LOADER_READY, (type) => { ... })` | Use `.bind(this)`, store reference, clean up in `dispose()`                 |

### 5b. `.off()` without callback reference

| File                               | Line | Code                                                           | Fix                                                |
|------------------------------------|------|----------------------------------------------------------------|----------------------------------------------------|
| `core/runtime/ComponentContext.ts` | 206  | `component.events.off(ComponentEvents.UNLOCKED)` (no callback) | Store bound handler reference, pass it to `.off()` |

---

## 6. Disposed Guard

**Rule**: `_disposed = true` must be set BEFORE cleanup, not after. Guard check `if(this._disposed) return` must be first line.

| File                                   | Line    | Violation                                                   | Fix                                                              |
|----------------------------------------|---------|-------------------------------------------------------------|------------------------------------------------------------------|
| `habbo/session/handler/BaseHandler.ts` | 47-52   | `_disposed = true` on line 52 (AFTER nullifying fields)     | Move `_disposed = true` to first line after guard check          |
| `habbo/room/RoomContentLoader.ts`      | 173-197 | `_disposed = true` on line 196 (AFTER all `.clear()` calls) | Move `_disposed = true` right after `if (this._disposed) return` |

---

## 7. Guarded Getter

**Rule**: Use throw-if-null guard, never `!` non-null assertion.

| File                                   | Line  | Code                            | Fix                                                                                            |
|----------------------------------------|-------|---------------------------------|------------------------------------------------------------------------------------------------|
| `habbo/navigator/HabboNewNavigator.ts` | 78-81 | `return this._legacyNavigator!` | `if (this._legacyNavigator === null) throw new Error(...)` then `return this._legacyNavigator` |

---

## How to fix

Priority order:
1. **HIGH — Disposed Guard** (2 fixes): Quick, prevents double-dispose bugs
2. **HIGH — EventEmitter** (3 fixes): Prevents memory leaks
3. **HIGH — Component DI** (3 fixes): Architecture correctness
4. **MEDIUM — Guarded Getter** (1 fix): Runtime safety
5. **MEDIUM — Null Safety** (40 fixes): Consistency, can be batched
6. **HIGH — Performance** (57 fixes): Critical for render loop performance
7. **LOW — import type** (5 fixes): Style compliance

All file paths are relative to `packages/helium-engine/src/`.