# Localization Architecture Documentation

This document categorizes all AS3 localization files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Done | Description                                                             |
|----------|-------|------|-------------------------------------------------------------------------|
| ENGINE   | 5     | 5    | Localization management, text loading, configuration flags, data models |
| VIEW     | 0     | N/A  | No pure UI/rendering files in this module                               |

**Progress: 100% ENGINE files implemented** ✅

---

## ENGINE FILES (We Need These)

| AS3 File                         | Purpose                                                                                                                                                                                                                                                                                           | Status  |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `HabboLocalizationManager.as`    | Core localization manager extending CoreLocalizationManager. Handles loading localizations from URLs, embedded assets, badge name/description lookups with parameterization, roman numeral conversion, and achievement text retrieval. Dispatches completion events when localizations are ready. | ✅ Done |
| `IHabboLocalizationManager.as`   | Interface defining the public API for the localization manager. Extends ICoreLocalizationManager and IUnknown. Declares methods for loading localizations, retrieving localized strings with parameters, badge/achievement text lookups.                                                          | ✅ Done |
| `BadgeBaseAndLevel.as`           | Data model for parsing badge IDs into base name and level components. Extracts the numeric suffix from badge IDs (e.g., "ACH_Login5" -> base="ACH_Login", level=5). Used for badge localization lookups.                                                                                          | ✅ Done |
| `enum/HabboLocalizationFlags.as` | Enumeration of flags for localization manager initialization. Defines DEFAULT (0) and SKIP_EXTERNAL_LOCALIZATIONS (268435456) flags.                                                                                                                                                              | ✅ Done |
| `enum/class_80.as`               | Event type constants for localization events. Defines HABBO_LOCALIZATION_EVENT_LOCALIZATION_LOADED, LOCALIZATION_EVENT_LOCALIZATION_FAILED, LOCALIZATION_EVENT_LOCALIZATION_OVERRIDE_FAILED.                                                                                                      | ✅ Done (HabboLocalizationEvent.ts) |

## VIEW FILES (We Ignore These)

| AS3 File | Purpose                                         |
|----------|-------------------------------------------------|
| *(none)* | No pure UI/rendering files found in this module |

---

## Detailed Analysis

### HabboLocalizationManager.as
**Category: ENGINE**

This is the main localization manager component extending `CoreLocalizationManager`. Key responsibilities:

- **Localization Loading**: Loads localizations from external URLs via `loadLocalizationFromURL()` and embedded assets via `loadDefaultEmbedLocalizations()`
- **String Interpolation**: Overrides `getLocalization()` to add interpolation support for dynamic values
- **Parameterized Strings**: Provides `getLocalizationWithParams()` and `getLocalizationWithParamMap()` for string parameter substitution
- **Badge/Achievement Text**: Specialized methods for badge name/description lookups:
  - `getAchievementName(badgeId)` - Achievement display name with roman numeral level
  - `getAchievementDesc(badgeId, limit)` - Achievement description with limit parameter
  - `getAchievementInstruction(badgeId)` - Achievement instruction text
  - `getBadgeName(badgeId)` - Badge display name
  - `getBadgeDesc(badgeId)` - Badge description
  - `getBadgeBaseName(badgeId)` - Extract base name from badge ID
  - `getPreviousLevelBadgeId(badgeId)` - Get previous level badge ID
- **Badge Point Limits**: Stores and retrieves badge point limits via `setBadgePointLimit()` and internal `getBadgePointLimit()`
- **Roman Numerals**: Converts level numbers (1-30) to roman numerals for badge display
- **Configuration**: Reads localization URLs from config properties (localization.N, localization.N.code, localization.N.name, localization.N.url)
- **Event Dispatching**: Fires "complete" event when localizations are ready, handles authentication events

Key fields:
- `isLocalizationInitialized: Boolean` - Tracks initialization state
- `skipExternals: Boolean` - Flag to skip external localization loading
- `badgePointLimits: Dictionary` - Maps badge IDs to point limits
- `romanNumerals: Array` - Roman numeral strings I-XXX

### IHabboLocalizationManager.as
**Category: ENGINE**

Interface contract for the Habbo localization manager, enabling dependency injection:

- Extends `ICoreLocalizationManager` (base localization functionality)
- Extends `IUnknown` (reference counting/lifecycle)

Methods declared:
- `loadDefaultEmbedLocalizations(language: String, fallback: Boolean): Boolean`
- `requestLocalizationInit(): void`
- `getActiveEnvironmentId(): String`
- `getExternalVariablesUrl(): String`
- `getExternalVariablesHash(): String`
- `getLocalizationWithParams(key: String, defaultValue: String, ...params): String`
- `getLocalizationWithParamMap(key: String, defaultValue: String, paramMap: Map): String`
- `getAchievementName(badgeId: String): String`
- `getAchievementDesc(badgeId: String, limit: int): String`
- `getAchievementInstruction(badgeId: String): String`
- `getBadgeBaseName(badgeId: String): String`
- `getBadgeName(badgeId: String): String`
- `getBadgeDesc(badgeId: String): String`
- `setBadgePointLimit(badgeId: String, limit: int): void`
- `getPreviousLevelBadgeId(badgeId: String): String`

### BadgeBaseAndLevel.as
**Category: ENGINE**

Simple data model for parsing badge IDs into their constituent parts:

**Purpose**: Badge IDs like "ACH_Login5" or "ADM3" combine a base identifier with a numeric level. This class parses them into separate components for localization lookups.

**Fields**:
- `var_710` (base): String - The base part of the badge ID (e.g., "ACH_Login")
- `var_360` (level): int - The numeric level suffix (defaults to 1)

**Methods**:
- Constructor: Parses badge ID string, extracting trailing digits as level
- `get base(): String` - Returns the base badge identifier
- `get level(): int` - Returns the badge level
- `set level(value: int)` - Sets level (minimum 1)
- `get badgeId(): String` - Reconstructs full badge ID from base + level
- `isNumber(char: String): Boolean` - Helper to check if character is a digit (0-9)

**Example Usage**:
```
new BadgeBaseAndLevel("ACH_Login5")  -> base="ACH_Login", level=5
new BadgeBaseAndLevel("BADGE")       -> base="BADGE", level=1
new BadgeBaseAndLevel("TEST123")     -> base="TEST", level=123
```

### enum/HabboLocalizationFlags.as
**Category: ENGINE**

Flag constants for configuring localization manager behavior:

- `DEFAULT: uint = 0` - Normal operation, load all localizations
- `SKIP_EXTERNAL_LOCALIZATIONS: uint = 268435456` - Skip loading external localization files, only use embedded ones

The `SKIP_EXTERNAL_LOCALIZATIONS` flag (0x10000000) is checked in `HabboLocalizationManager` constructor to set `skipExternals` boolean, which causes immediate "complete" event dispatch in `initComponent()` instead of waiting for authentication and external file loading.

### enum/class_80.as
**Category: ENGINE**

Event type string constants for localization events:

- `const_14 = "HABBO_LOCALIZATION_EVENT_LOCALIZATION_LOADED"` - Fired when localizations are successfully loaded
- `const_371 = "LOCALIZATION_EVENT_LOCALIZATION_FAILED"` - Fired when localization loading fails
- `const_873 = "LOCALIZATION_EVENT_LOCALIZATION_OVERRIDE_FAILED"` - Fired when override localization loading fails

These event strings are used by the localization manager to notify listeners of loading state changes.

---

## TypeScript Implementation

### Implemented Files

| AS3 File                       | TS Equivalent                                      | Status  |
|--------------------------------|----------------------------------------------------|---------|
| `HabboLocalizationManager.as`  | `habbo/localization/HabboLocalizationManager.ts`   | ✅ Done |
| `IHabboLocalizationManager.as` | `habbo/localization/IHabboLocalizationManager.ts`  | ✅ Done |
| `BadgeBaseAndLevel.as`         | `habbo/localization/BadgeBaseAndLevel.ts`          | ✅ Done |
| `CoreLocalizationManager`      | `core/localization/CoreLocalizationManager.ts`     | ✅ Done |
| `GameDataResources`            | `core/localization/GameDataResources.ts`           | ✅ Done |

### Key Implementation Details

1. **Authentication Event Listener** - `setCommunicationManager()` method receives the HabboCommunicationManager and listens for `loginStep` events. When `AUTHENTICATED` is received, it calls `requestLocalizationInit()` automatically.

2. **Hashes Loading** - `requestLocalizationInit()` loads from `gamedata.hashes.url` which returns a JSON with file URLs and hashes. The final URL is constructed as `${url}/${hash}`.

3. **CoreLocalizationManager** - Base class handles:
   - Text storage with `Map<string, Localization>`
   - Parameter substitution with `%param%` syntax
   - Interpolation with `${key}` syntax
   - Loading from URL (key=value or JSON format)

4. **Event Flow**:
   ```
   Authentication → loginStep(AUTHENTICATED) → onAuthenticated()
                                                    ↓
                                           requestLocalizationInit()
                                                    ↓
                                           loadLocalizationFromURL(hashes.url)
                                                    ↓
                                           Parse hashes.json → Load external_texts
                                                    ↓
                                           emit('loaded') → emit('complete')
   ```

---

## Localization Flow

### Initialization Flow
```
1. HabboLocalizationManager created with context and flags
2. initComponent() called
3. configureLocalizationLocations() reads localization URLs from config
4. If skipExternals: dispatch "complete" immediately
5. Otherwise: listen for authentication event
6. On authentication: requestLocalizationInit()
7. Load localizations from URL
8. On success: dispatch "complete"
9. On failure: crash with error code 8
```

### String Retrieval Flow
```
1. Consumer calls getLocalization(key) or getLocalizationWithParams(key, ...)
2. If params provided: registerParameter() called for each
3. Base class retrieves raw string
4. interpolate() replaces ${placeholders} with registered values
5. Return final interpolated string
```

### Badge Localization Flow
```
1. Consumer calls getBadgeName("ACH_Login5")
2. BadgeBaseAndLevel parses: base="ACH_Login", level=5
3. Try keys in order: "badge_name_ACH_Login5", "badge_name_ACH_Login"
4. Register "roman" parameter with "V"
5. Return localized string with roman numeral substituted
```
