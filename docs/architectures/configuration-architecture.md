# Configuration Architecture Documentation

This document categorizes all AS3 configuration files into **ENGINE** (business logic we need to implement) and **VIEW** (UI code we ignore since SolidJS handles our UI).

> **Rule**: AS3 source in `source_as/` is the source of truth. Follow it exactly.

---

## Summary

| Category          | Count | Done | Description                                           |
|-------------------|-------|------|-------------------------------------------------------|
| ENGINE (Required) | 6     | 2    | Configuration management, settings, property storage  |
| VIEW (Ignore)     | 0     | N/A  | No UI components in this module                       |

**Progress: ~33% ENGINE files implemented**

---

## ENGINE FILES (We Need These)

### Core Configuration Manager

| AS3 File                        | Purpose                                             | TS Equivalent                   | Status  |
|---------------------------------|-----------------------------------------------------|---------------------------------|---------|
| `HabboConfigurationManager.as`  | Main configuration manager, loads/stores properties | `ConfigurationManager.ts`       | ✅ Done (merged with Core) |
| `IHabboConfigurationManager.as` | Interface for configuration manager                 | `IConfigurationManager.ts`      | ✅ Done |

### Enumerations

| AS3 File                              | Purpose                                     | TS Equivalent                     | Status |
|---------------------------------------|---------------------------------------------|-----------------------------------|--------|
| `enum/HabboComponentFlags.as`         | Component mode flags (e.g., ROOM_VIEWER)    | `enum/HabboComponentFlags.ts`     | TODO   |
| `enum/HabboConfigurationEvent.as`     | Configuration event constants               | `enum/HabboConfigurationEvent.ts` | TODO   |
| `enum/HabboConfigurationFlags.as`     | Configuration flags (skip external vars)    | `enum/HabboConfigurationFlags.ts` | TODO   |
| `enum/HabboProperty.as`               | Property key constants for configuration    | `enum/HabboProperty.ts`           | TODO   |

---

## VIEW FILES (We Ignore These)

**None** - The configuration module is purely engine/data layer with no UI components.

---

## Detailed File Analysis

### HabboConfigurationManager.as

**Category**: ENGINE

**Purpose**: Central configuration management component that handles:
- Loading external configuration variables from server
- Storing and retrieving configuration properties
- Property interpolation with `${variable}` syntax
- Environment-specific configuration overrides
- URL protocol handling (HTTP/HTTPS)
- Cross-domain policy file loading

**Key Methods**:
- `getProperty(key, params)` - Get configuration value with optional parameter substitution
- `setProperty(key, value, persistent, log)` - Set configuration value
- `getBoolean(key)` - Get boolean property
- `getInteger(key, defaultValue)` - Get integer property with default
- `propertyExists(key)` - Check if property exists
- `interpolate(value)` - Resolve `${var}` placeholders
- `updateUrlProtocol(url)` - Convert HTTP to HTTPS if needed
- `initConfigurationDownload()` - Load external variables from server
- `updateEnvironmentId(envId)` - Switch environment configuration
- `resetAll()` - Reset all configuration to defaults

**Dependencies**:
- `IHabboLocalizationManager` - For localized external variables URL
- `Component` - Base component class
- `ICoreConfiguration` - Core configuration interface

**Configuration Sources** (in order):
1. Development variables (embedded)
2. Common variables (embedded asset)
3. Localization variables (embedded asset)
4. Flash client URL default
5. Command-line arguments
6. Environment-specific overrides
7. External variables (downloaded from server)

---

### IHabboConfigurationManager.as

**Category**: ENGINE

**Purpose**: Public interface for the configuration manager. Extends `ICoreConfiguration`.

**Key Methods**:
- `isInitialized()` - Check if configuration is loaded
- `updateEnvironmentId(envId)` - Change environment
- `resetAll()` - Reset configuration
- `initConfigurationDownload()` - Start loading external config
- `events` - Event dispatcher for configuration events

---

### enum/HabboComponentFlags.as

**Category**: ENGINE

**Purpose**: Bit flags for component modes.

**Constants**:
- `ROOM_VIEWER_MODE = 1` - Flag indicating room viewer mode

**Utility Methods**:
- `isRoomViewerMode(flags)` - Check if room viewer mode is enabled

---

### enum/HabboConfigurationEvent.as

**Category**: ENGINE

**Purpose**: Event type constants for configuration events.

**Constants**:
- `CONFIGURATION_LOADED = "HCE_CONFIGURATION_LOADED"` - Configuration loaded successfully
- `CONFIGURATION_ERROR = "HCE_CONFIGURATION_ERROR"` - Configuration load error

---

### enum/HabboConfigurationFlags.as

**Category**: ENGINE

**Purpose**: Bit flags for configuration initialization options.

**Constants**:
- `DEFAULT = 0` - Normal operation
- `SKIP_EXTERNAL_VARIABLES = 268435456 (0x10000000)` - Skip downloading external variables
- `SKIP_LOCALIZATIONS = 16777216 (0x01000000)` - Skip localization initialization

---

### enum/HabboProperty.as

**Category**: ENGINE

**Purpose**: String constants for configuration property keys. Provides type-safe access to configuration values.

**Constants**:

| Constant                            | Property Key                                  | Description                    |
|-------------------------------------|-----------------------------------------------|--------------------------------|
| `const_378`                         | `environment.id`                              | Current environment identifier |
| `SSO_TOKEN`                         | `sso.token`                                   | Single sign-on token           |
| `USE_SSO`                           | `use.sso`                                     | Whether SSO is enabled         |
| `CONNECTION_INFO_HOST`              | `connection.info.host`                        | Server host address            |
| `CONNECTION_INFO_PORT`              | `connection.info.port`                        | Server port                    |
| `URL_PREFIX`                        | `url.prefix`                                  | Base URL prefix                |
| `SITE_URL`                          | `site.url`                                    | Main site URL                  |
| `CLIENT_URL`                        | `flash.client.url`                            | Flash client URL               |
| `CLIENT_ORIGIN`                     | `flash.client.origin`                         | Client origin                  |
| `EXTERNAL_VARIABLES`                | `external.variables.txt`                      | External variables file URL    |
| `CLIENT_STARTING`                   | `client.starting`                             | Client starting state          |
| `CLIENT_STARTING_LOADING`           | `client.starting.revolving`                   | Loading animation state        |
| `PROCESSLOG_ENABLED_KEY`            | `processlog.enabled`                          | Process logging enabled        |
| `const_187`                         | `new.user.flow.enabled`                       | New user flow enabled          |
| `const_269`                         | `new.user.onboarding.hc.flow.enabled`         | HC onboarding flow enabled     |
| `NEW_USER_ONBOARDING_SHOW_HC_ITEMS` | `new.user.onboarding.show.hc.items`           | Show HC items in onboarding    |
| `const_147`                         | `new.user.flow.page`                          | New user flow page             |
| `const_61`                          | `flash.dynamic.download.url`                  | Dynamic asset download URL     |
| `const_334`                         | `flash.dynamic.download.name.template`        | Download name template         |
| `const_379`                         | `flash.dynamic.avatar.download.configuration` | Avatar download config         |
| `const_246`                         | `flash.dynamic.avatar.download.url`           | Avatar download URL            |
| `const_81`                          | `pocket.api`                                  | Pocket API URL                 |
| `const_114`                         | `web.api`                                     | Web API URL                    |
| `const_122`                         | `facebook.application.id`                     | Facebook app ID                |
| `const_205`                         | `web.terms_of_service.link`                   | Terms of service URL           |
| `DISABLE_CRYPTO`                    | `disable.crypto`                              | Disable encryption             |
| `LIVE_ENVIRONMENTS`                 | `live.environment.list`                       | List of live environments      |
| `const_206`                         | `logout.url`                                  | Logout URL                     |
| `const_221`                         | `logout.disconnect.url`                       | Disconnect logout URL          |

---

## Architecture Pattern

### AS3 Architecture
```
HabboConfigurationManager (Component)
    ├── configurationData (Dictionary - key/value store)
    ├── configurationKeys (Array - persistent keys)
    ├── environmentId (current environment)
    ├── IHabboLocalizationManager (dependency)
    └── ICoreConfiguration (implements)
```

### Our TypeScript Architecture
```
HabboConfigurationManager (injectable singleton)
    ├── configurationData (Map<string, string>)
    ├── persistentKeys (Set<string>)
    ├── environmentId (current environment)
    └── IHabboConfigurationManager (implements)

configurationStore (SolidJS reactive store) [if UI needs config values]
    └── Listens to HabboConfigurationManager events
    └── Exposes reactive signals to UI components
```

---

## Configuration Flow

### Initialization Flow
```
1. HabboConfigurationManager constructed
2. context.configuration = this (registers with context)
3. Check flags for read-only/skip modes
4. resetAll() called:
   a. Parse development variables
   b. Parse common_configuration asset
   c. Parse localization_configuration asset
   d. Set flash.client.url default
   e. Parse command-line arguments
   f. Set defaults
   g. Update environment variables
5. If environment.id exists in SOL, load embedded configs
6. If not read-only, wait for localization complete
7. initConfigurationDownload() - fetch external variables
8. parseConfiguration() - parse key=value format
9. Dispatch CONFIGURATION_LOADED event
10. Dispatch "complete" event, unlock component
```

### Property Resolution Flow
```
1. getProperty(key) called
2. Get raw value from configurationData
3. interpolate() - resolve ${var} placeholders (up to 3 levels)
4. Handle protocol-relative URLs (//)
5. updateUrlProtocol() - HTTP to HTTPS if needed
6. fillParams() - replace %param% with values
7. Return final value
```

---

## Key Implementation Notes

1. **Property Interpolation**: The `${variable}` syntax allows nested property references with a depth limit of 3 to prevent infinite recursion.

2. **Environment Overrides**: Properties can have environment-specific variants (e.g., `connection.info.host.production`). When switching environments, these override the base property.

3. **Persistent Properties**: Some properties are marked as persistent and cannot be overwritten by later configuration sources.

4. **URL Protocol Handling**: The manager automatically handles protocol-relative URLs (`//`) and can upgrade HTTP to HTTPS based on the `useHttps` flag.

5. **Cross-Domain Policy**: The manager loads Flash cross-domain policy files from the `flashclient.crossdomain.policy.files` configuration.

6. **Error Handling**: Configuration load failures are reported via `HabboWebTools.logEventLog` and displayed via error dialogs.

---

## Next Implementation Steps

1. **Create IHabboConfigurationManager interface** - Define the public API
2. **Implement HabboConfigurationManager** - Core configuration logic
3. **Port HabboProperty constants** - Type-safe property keys
4. **Port configuration flags** - HabboConfigurationFlags, HabboComponentFlags
5. **Implement configuration events** - HabboConfigurationEvent
6. **Add to dependency injection** - Register with core
7. **Test property interpolation** - Verify ${} syntax works correctly
