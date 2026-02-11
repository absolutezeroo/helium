# Groups Architecture Documentation

This document categorizes all AS3 groups files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Description                                                        |
|----------|-------|--------------------------------------------------------------------|
| ENGINE   | 6     | Core data models, settings, events, and the main manager component |
| VIEW     | 15    | UI windows, panels, controllers, and badge editor UI components    |

---

## ENGINE FILES (We Need These)

| AS3 File                                             | Purpose                                                                                                                                                        | Status |
|------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `groups/HabboGroupsManager.as`                       | Main groups component - handles message events, group operations (kick/block), communication, link events. Core orchestrator for all group functionality.      | TODO   |
| `groups/GuildSettingsData.as`                        | Data model for guild settings (type, rights level, modification tracking). Pure data holder with getters/setters.                                              | TODO   |
| `groups/GuildKickData.as`                            | Data model for kick/block operations (target ID, guild ID, blocked flag). Simple immutable data transfer object.                                               | TODO   |
| `groups/class_1880.as`                               | Interface defining core group operations: `showGroupBadgeInfo`, `openGroupInfo`, `updateVisibleExtendedProfile`, `showExtendedProfile`, and `events` accessor. | TODO   |
| `groups/events/GuildSettingsChangedInManageEvent.as` | Event dispatched when guild visual settings change. Contains guildId.                                                                                          | TODO   |
| `groups/events/HabboGroupsEditorData.as`             | Event dispatched when guild editor data is loaded. Simple event marker class.                                                                                  | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File                              | Purpose                                                                                                                              |
|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `groups/DetailsWindowCtrl.as`         | UI controller for group details popup window. Manages window display, close button, group info rendering.                            |
| `groups/ExtendedProfileWindowCtrl.as` | UI controller for extended user profile window. Shows user info, groups list, relationships, badges, avatar. Heavy UI orchestration. |
| `groups/GroupCreatedWindowCtrl.as`    | UI controller for "group created" success popup. Simple modal dialog.                                                                |
| `groups/GroupDetailsCtrl.as`          | UI controller for group details panel. Renders group info, badges, buttons (join/leave/manage), forum links.                         |
| `groups/GroupRoomInfoCtrl.as`         | UI controller for group info displayed in room toolbar. Expandable/collapsible group badge panel.                                    |
| `groups/GuildManagementWindowCtrl.as` | UI controller for group creation/editing wizard. Multi-step form with tabs for identity, badge, colors, settings.                    |
| `groups/GuildMembersWindowCtrl.as`    | UI controller for group members list window. Pagination, search, member management UI (admin rights, kick, block).                   |
| `groups/HcRequiredWindowCtrl.as`      | UI controller for "HC/VIP required" popup. Prompts user to purchase club membership.                                                 |
| `groups/ColorGridCtrl.as`             | UI controller for color picker grid. Renders selectable color swatches for group customization.                                      |
| `groups/class_3537.as`                | UI controller for group type/settings selection (radio buttons for regular/exclusive/private, member rights checkbox).               |
| `groups/badge/BadgeEditorCtrl.as`     | UI controller for group badge editor. Manages badge layers, part selection, color selection, preview rendering.                      |
| `groups/badge/BadgeEditorPartItem.as` | UI component for individual badge part item. Handles asset loading, color transforms, composite rendering.                           |
| `groups/badge/BadgeLayerCtrl.as`      | UI controller for single badge layer. Position picker, color selector, part preview button.                                          |
| `groups/badge/BadgeLayerOptions.as`   | Data model for badge layer state (layer index, part index, color index, grid position). Used by badge editor UI.                     |
| `groups/badge/BadgeSelectPartCtrl.as` | UI controller for badge part selection grid. Displays available parts, handles selection/hover states.                               |

---

## Analysis Notes

### ENGINE Components

The **HabboGroupsManager** is the central component that:
- Manages all group-related message events (join, create, edit, kick, etc.)
- Coordinates between server communication and UI controllers
- Handles link events for deep linking to groups
- Provides access to localization, window manager, catalog, navigator, toolbar

Key data models are simple DTOs:
- **GuildSettingsData**: Tracks guild type (0=regular, 1=exclusive, 2=private) and rights level
- **GuildKickData**: Holds kick/block operation parameters

Events are used for internal communication:
- **GuildSettingsChangedInManageEvent**: Notifies when guild visual settings change
- **HabboGroupsEditorData**: Signals that editor data has loaded

### VIEW Components

All `*Ctrl` and `*WindowCtrl` classes are pure UI controllers that:
- Create and manage Flash window components (`IWindowContainer`, `class_3514`, etc.)
- Handle window events (`WME_CLICK`, `WE_SELECT`, etc.)
- Bind data to UI elements (text fields, bitmaps, buttons)
- Manage window lifecycle (prepare, show, close, dispose)

The badge editor subsystem (`groups/badge/`) is entirely UI:
- Manages multi-layer badge composition
- Handles asset loading for badge parts
- Provides color picking and position selection
- Renders preview images using BitmapData operations

### Migration Strategy

For the TypeScript/SolidJS port:
1. Port ENGINE files first - these define the data models and business logic
2. Extract message composer/parser logic from HabboGroupsManager
3. Create SolidJS components to replace VIEW files
4. Use SolidJS signals/stores instead of Flash event dispatching
