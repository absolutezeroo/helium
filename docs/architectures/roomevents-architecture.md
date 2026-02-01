# Room Events (Wired) Architecture Documentation

This document categorizes all AS3 files in `source_as/habbo/roomevents/` into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth. SolidJS handles UI.

---

## Summary

| Category | Count | Description                                                                                                          |
|----------|-------|----------------------------------------------------------------------------------------------------------------------|
| ENGINE   | 39    | Core room events system, wired furniture logic, message handling, variable synchronization, room object highlighting |
| VIEW     | 204   | Wired setup UI panels, wired menu UI, table views, tab interfaces, UI builders                                       |

---

## ENGINE FILES (We Need These)

### Core Room Events System

| AS3 File                                    | Purpose                                                                                                                                                                                          | Status |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `roomevents/HabboUserDefinedRoomEvents.as`  | Main component - orchestrates wired system, manages room session, communicates with server, handles furniture/user selection, coordinates with WiredMenuController and UserDefinedRoomEventsCtrl | TODO   |
| `roomevents/IHabboUserDefinedRoomEvents.as` | Public interface - stuffSelected, userSelected, showInspectButton, showToolbarMenuButton                                                                                                         | TODO   |
| `roomevents/class_3353.as`                  | Message event handler - registers/handles all wired server messages (triggers, actions, conditions, addons, selectors, variables, validation errors, rewards)                                    | TODO   |
| `roomevents/WiredVariablesSynchronizer.as`  | Variable cache/sync - maintains local cache of room variables with hash-based differential updates, handles polling and listener notifications                                                   | TODO   |
| `roomevents/Util.as`                        | Utility class - window procedures, layout helpers, variable display formatting, integer parsing (supports binary/hex), section enable/disable helpers                                            | TODO   |
| `roomevents/events/WiredMenuEvent.as`       | Event class - WIRED_MENU_BUTTON_PREFERENCE_CHANGED event for preference changes                                                                                                                  | TODO   |

### Wired Setup Logic (Element Types Registry)

| AS3 File                                              | Purpose                                                                                                                                              | Status |
|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `roomevents/wired_setup/UserDefinedRoomEventsCtrl.as` | Central wired editor controller - manages element selection, input sources, validates and sends updates to server, handles all wired furniture types | TODO   |
| `roomevents/wired_setup/DefaultElement.as`            | Base class for all wired element types - defines interface for code, intParams, stringParam, variableIds, input sources, validation, UI building     | TODO   |
| `roomevents/wired_setup/class_3531.as`                | Interface for wired element types (triggers, actions, conditions, addons, selectors, variables)                                                      | TODO   |
| `roomevents/wired_setup/class_3547.as`                | Interface for element type registries - getElementByCode, getKey, acceptTriggerable                                                                  | TODO   |
| `roomevents/wired_setup/RoomObjectHighLighter.as`     | Room object visual highlighting - applies filters to selected wired furniture, manages active wired highlight state                                  | TODO   |

### Action Types (40 files)

| AS3 File                                                             | Purpose                                                                               | Status |
|----------------------------------------------------------------------|---------------------------------------------------------------------------------------|--------|
| `roomevents/wired_setup/actiontypes/ActionTypes.as`                  | Registry of all action types - instantiates and indexes 40+ action handlers           | TODO   |
| `roomevents/wired_setup/actiontypes/ActionType.as`                   | Action type interface - extends class_3531, adds allowDelaying property               | TODO   |
| `roomevents/wired_setup/actiontypes/DefaultActionType.as`            | Base action type implementation                                                       | TODO   |
| `roomevents/wired_setup/actiontypes/GiveScore.as`                    | Give score action logic                                                               | TODO   |
| `roomevents/wired_setup/actiontypes/KickFromRoom.as`                 | Kick from room action logic                                                           | TODO   |
| `roomevents/wired_setup/actiontypes/Reset.as`                        | Reset action logic                                                                    | TODO   |
| `roomevents/wired_setup/actiontypes/class_3664.as` - `class_3849.as` | Various action type implementations (toggle state, move/rotate, teleport, chat, etc.) | TODO   |

### Condition Types (32 files)

| AS3 File                                                            | Purpose                                  | Status |
|---------------------------------------------------------------------|------------------------------------------|--------|
| `roomevents/wired_setup/conditions/ConditionTypes.as`               | Registry of all condition types          | TODO   |
| `roomevents/wired_setup/conditions/DefaultConditionType.as`         | Base condition type implementation       | TODO   |
| `roomevents/wired_setup/conditions/ActorIsPerformingAction.as`      | Actor action condition logic             | TODO   |
| `roomevents/wired_setup/conditions/FurnisHaveAvatars.as`            | Furniture has avatars condition logic    | TODO   |
| `roomevents/wired_setup/conditions/FurnisHaveNoAvatars.as`          | Furniture has no avatars condition logic | TODO   |
| `roomevents/wired_setup/conditions/HasStackedFurnis.as`             | Has stacked furniture condition logic    | TODO   |
| `roomevents/wired_setup/conditions/DontHaveStackedFurnis.as`        | No stacked furniture condition logic     | TODO   |
| `roomevents/wired_setup/conditions/TeamHasScore.as`                 | Team score condition logic               | TODO   |
| `roomevents/wired_setup/conditions/class_3680.as` - `class_3848.as` | Various condition type implementations   | TODO   |

### Trigger Configurations (24 files)

| AS3 File                                                              | Purpose                                | Status |
|-----------------------------------------------------------------------|----------------------------------------|--------|
| `roomevents/wired_setup/triggerconfs/TriggerConfs.as`                 | Registry of all trigger configurations | TODO   |
| `roomevents/wired_setup/triggerconfs/DefaultTriggerConf.as`           | Base trigger configuration             | TODO   |
| `roomevents/wired_setup/triggerconfs/AvatarEntersRoom.as`             | Avatar enters room trigger logic       | TODO   |
| `roomevents/wired_setup/triggerconfs/AvatarLeavesRoom.as`             | Avatar leaves room trigger logic       | TODO   |
| `roomevents/wired_setup/triggerconfs/ClockReachTime.as`               | Clock time trigger logic               | TODO   |
| `roomevents/wired_setup/triggerconfs/PerformAction.as`                | Perform action trigger logic           | TODO   |
| `roomevents/wired_setup/triggerconfs/ScoreAchieved.as`                | Score achieved trigger logic           | TODO   |
| `roomevents/wired_setup/triggerconfs/VariableUpdate.as`               | Variable update trigger logic          | TODO   |
| `roomevents/wired_setup/triggerconfs/class_3611.as` - `class_3823.as` | Various trigger type implementations   | TODO   |

### Selector Types (20 files)

| AS3 File                                                           | Purpose                                | Status |
|--------------------------------------------------------------------|----------------------------------------|--------|
| `roomevents/wired_setup/selectors/SelectorTypes.as`                | Registry of all selector types         | TODO   |
| `roomevents/wired_setup/selectors/SelectorType.as`                 | Selector type interface                | TODO   |
| `roomevents/wired_setup/selectors/DefaultSelectorType.as`          | Base selector type implementation      | TODO   |
| `roomevents/wired_setup/selectors/SelectorCodes.as`                | Selector code constants                | TODO   |
| `roomevents/wired_setup/selectors/FurniInArea.as`                  | Furniture in area selector logic       | TODO   |
| `roomevents/wired_setup/selectors/InArea.as`                       | In area selector logic                 | TODO   |
| `roomevents/wired_setup/selectors/UsersByName.as`                  | Users by name selector logic           | TODO   |
| `roomevents/wired_setup/selectors/UsersInArea.as`                  | Users in area selector logic           | TODO   |
| `roomevents/wired_setup/selectors/UsersInGroup.as`                 | Users in group selector logic          | TODO   |
| `roomevents/wired_setup/selectors/UsersPerformingAction.as`        | Users performing action selector logic | TODO   |
| `roomevents/wired_setup/selectors/WithVariable.as`                 | With variable selector logic           | TODO   |
| `roomevents/wired_setup/selectors/class_3675.as` - `class_3816.as` | Various selector type implementations  | TODO   |

### Addon Types (17 files)

| AS3 File                                                        | Purpose                            | Status |
|-----------------------------------------------------------------|------------------------------------|--------|
| `roomevents/wired_setup/addons/AddonTypes.as`                   | Registry of all addon types        | TODO   |
| `roomevents/wired_setup/addons/DefaultAddonType.as`             | Base addon type implementation     | TODO   |
| `roomevents/wired_setup/addons/AnimationTime.as`                | Animation time addon logic         | TODO   |
| `roomevents/wired_setup/addons/CarryUsers.as`                   | Carry users addon logic            | TODO   |
| `roomevents/wired_setup/addons/NoMoveAnimation.as`              | No move animation addon logic      | TODO   |
| `roomevents/wired_setup/addons/SelectorFilter.as`               | Selector filter addon logic        | TODO   |
| `roomevents/wired_setup/addons/class_3648.as` - `class_3833.as` | Various addon type implementations | TODO   |

### Variable Types (11 files)

| AS3 File                                                           | Purpose                                           | Status |
|--------------------------------------------------------------------|---------------------------------------------------|--------|
| `roomevents/wired_setup/variables/VariableTypes.as`                | Registry of all variable types                    | TODO   |
| `roomevents/wired_setup/variables/DefaultVariableType.as`          | Base variable type implementation                 | TODO   |
| `roomevents/wired_setup/variables/ReferenceVariable.as`            | Reference variable type logic                     | TODO   |
| `roomevents/wired_setup/variables/class_3532.as`                   | Variable type base class with initialVariableName | TODO   |
| `roomevents/wired_setup/variables/class_3662.as` - `class_3838.as` | Various variable type implementations             | TODO   |

### Common Utilities (Non-UI)

| AS3 File                                                        | Purpose                                               | Status |
|-----------------------------------------------------------------|-------------------------------------------------------|--------|
| `roomevents/wired_setup/common/utils/ChronoFieldMaskFilter.as`  | Chrono field mask filtering logic                     | TODO   |
| `roomevents/wired_setup/common/utils/ChronoFieldRangeFilter.as` | Chrono field range filtering logic                    | TODO   |
| `roomevents/wired_setup/common/utils/RelativeMoveAxis.as`       | Relative movement axis calculations                   | TODO   |
| `roomevents/wired_setup/common/utils/SpiralUtils.as`            | Spiral pattern utility calculations                   | TODO   |
| `roomevents/wired_setup/common/utils/WiredUserAction.as`        | Wired user action constants/utilities                 | TODO   |
| `roomevents/wired_setup/common/class_3819.as`                   | Source type constants - GLOBAL_SOURCE, CONTEXT_SOURCE | TODO   |

---

## VIEW FILES (We Ignore These)

### Wired Menu Controller & View

| AS3 File                                       | Purpose                                                                         |
|------------------------------------------------|---------------------------------------------------------------------------------|
| `roomevents/wired_menu/WiredMenuController.as` | Menu controller - manages wired menu visibility, tabs, permissions, preferences |
| `roomevents/wired_menu/WiredMenuView.as`       | Main menu view - tabbed window container with show/hide functionality           |
| `roomevents/wired_menu/class_3352.as`          | WiredMenuController marker interface                                            |

### Wired Menu Tabs

| AS3 File                                                  | Purpose                                                                             |
|-----------------------------------------------------------|-------------------------------------------------------------------------------------|
| `roomevents/wired_menu/tabs/WiredMenuDefaultTab.as`       | Base tab implementation - loading states, message events, update receiver           |
| `roomevents/wired_menu/tabs/WiredMenuTabConfig.as`        | Tab configuration - id, class, enabled, reusable, createImmediately                 |
| `roomevents/wired_menu/tabs/WiredMenuTabConfigs.as`       | Tab configurations registry - monitor, overview, inspection, settings, info         |
| `roomevents/wired_menu/tabs/class_3627.as`                | Tab interface - setTabActive/Inactive, startViewing/stopViewing, permissionsUpdated |
| `roomevents/wired_menu/tabs/common/VariableTypePicker.as` | Variable type picker UI component                                                   |

### Tab: Monitor

| AS3 File                                                         | Purpose                     |
|------------------------------------------------------------------|-----------------------------|
| `roomevents/wired_menu/tabs/tab_monitor/WiredMenuMonitorTab.as`  | Error monitoring tab UI     |
| `roomevents/wired_menu/tabs/tab_monitor/WiredErrorInfoView.as`   | Error info display view     |
| `roomevents/wired_menu/tabs/tab_monitor/ErrorDataTableObject.as` | Error data table row object |

### Tab: Variable Overview

| AS3 File                                                                         | Purpose                                                                         |
|----------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| `roomevents/wired_menu/tabs/tab_variable_overview/WiredMenuOverviewTab.as`       | Variable overview tab - lists all variables with properties and text connectors |
| `roomevents/wired_menu/tabs/tab_variable_overview/VariableTableObject.as`        | Variable list table row object                                                  |
| `roomevents/wired_menu/tabs/tab_variable_overview/PropertyTableObject.as`        | Property table row object                                                       |
| `roomevents/wired_menu/tabs/tab_variable_overview/TextTableObject.as`            | Text connector table row object                                                 |
| `roomevents/wired_menu/tabs/tab_variable_overview/VariableHoldersHighlighter.as` | Highlights furniture/users holding a variable                                   |
| `roomevents/wired_menu/tabs/tab_variable_overview/VariableInfoBubbleView.as`     | Variable info bubble popup                                                      |

### Tab: Variable Inspection

| AS3 File                                                                         | Purpose                                                           |
|----------------------------------------------------------------------------------|-------------------------------------------------------------------|
| `roomevents/wired_menu/tabs/tab_variable_inspection/WiredMenuInspectionTab.as`   | Variable inspection tab - shows variables held by selected object |
| `roomevents/wired_menu/tabs/tab_variable_inspection/VariableHolderPreviewer.as`  | Preview container for inspected object                            |
| `roomevents/wired_menu/tabs/tab_variable_inspection/VariableValueTableObject.as` | Variable value table row object                                   |

### Tab: Settings

| AS3 File                                                          | Purpose                                                               |
|-------------------------------------------------------------------|-----------------------------------------------------------------------|
| `roomevents/wired_menu/tabs/tab_settings/WiredMenuSettingsTab.as` | Settings tab - menu button, inspect button, playtest mode preferences |

### Tab: Info

| AS3 File                                                  | Purpose       |
|-----------------------------------------------------------|---------------|
| `roomevents/wired_menu/tabs/tab_info/WiredMenuInfoTab.as` | Info/help tab |

### Table View Components

| AS3 File                                              | Purpose                                                               |
|-------------------------------------------------------|-----------------------------------------------------------------------|
| `roomevents/wired_menu/views/tables/TableView.as`     | Generic table view component with columns, rows, selection, scrolling |
| `roomevents/wired_menu/views/tables/TableRowView.as`  | Table row view component                                              |
| `roomevents/wired_menu/views/tables/TableCellView.as` | Table cell view component                                             |
| `roomevents/wired_menu/views/tables/TableCell.as`     | Table cell data model                                                 |
| `roomevents/wired_menu/views/tables/TableColumn.as`   | Table column configuration                                            |
| `roomevents/wired_menu/views/tables/ITableObject.as`  | Table object interface                                                |

### Wired Setup UI Components

| AS3 File                                                                      | Purpose                          |
|-------------------------------------------------------------------------------|----------------------------------|
| `roomevents/wired_setup/common/SliderWindowController.as`                     | Slider UI component controller   |
| `roomevents/wired_setup/common/NeighborhoodFloor.as`                          | Neighborhood floor selector UI   |
| `roomevents/wired_setup/common/VariablePicker.as`                             | Variable picker dropdown UI      |
| `roomevents/wired_setup/common/advanced_dropdown/ExpandableDropdown.as`       | Expandable dropdown UI component |
| `roomevents/wired_setup/common/advanced_dropdown/ExpandableDropdownOption.as` | Dropdown option item             |
| `roomevents/wired_setup/help/UserDefinedRoomEventsHelp.as`                    | Help window UI                   |

### Input Source Picker UI

| AS3 File                                                        | Purpose                                                     |
|-----------------------------------------------------------------|-------------------------------------------------------------|
| `roomevents/wired_setup/inputsources/WiredInputSourcePicker.as` | Input source picker UI - furni/user/merged source selection |
| `roomevents/wired_setup/inputsources/SourceTypePicker.as`       | Source type picker dropdown                                 |
| `roomevents/wired_setup/inputsources/SourceTypeOption.as`       | Source type option item                                     |
| `roomevents/wired_setup/inputsources/class_3599.as`             | Input source picker interface                               |

### UI Builder System

| AS3 File                                                           | Purpose                                   |
|--------------------------------------------------------------------|-------------------------------------------|
| `roomevents/wired_setup/uibuilder/WiredUIBuilder.as`               | Programmatic UI builder for wired dialogs |
| `roomevents/wired_setup/uibuilder/PresetManager.as`                | UI preset/template manager                |
| `roomevents/wired_setup/uibuilder/params/CheckboxOptionParam.as`   | Checkbox parameter binding                |
| `roomevents/wired_setup/uibuilder/params/RadioButtonParam.as`      | Radio button parameter binding            |
| `roomevents/wired_setup/uibuilder/params/TextParam.as`             | Text field parameter binding              |
| `roomevents/wired_setup/uibuilder/presets/WiredUIPreset.as`        | Base UI preset class                      |
| `roomevents/wired_setup/uibuilder/presets/CheckboxGroupPreset.as`  | Checkbox group preset                     |
| `roomevents/wired_setup/uibuilder/presets/CheckboxOptionPreset.as` | Single checkbox preset                    |
| `roomevents/wired_setup/uibuilder/presets/RadioButtonPreset.as`    | Radio button preset                       |
| `roomevents/wired_setup/uibuilder/presets/RadioGroupPreset.as`     | Radio group preset                        |
| `roomevents/wired_setup/uibuilder/presets/SectionPreset.as`        | Section container preset                  |
| `roomevents/wired_setup/uibuilder/presets/SplitterPreset.as`       | Visual splitter preset                    |
| `roomevents/wired_setup/uibuilder/presets/TextPreset.as`           | Text/label preset                         |
| `roomevents/wired_setup/uibuilder/styles/WiredStyle.as`            | UI styling interface                      |
| `roomevents/wired_setup/uibuilder/styles/VolterWiredStyle.as`      | Volter font styling implementation        |

---

## Architecture Analysis

### Component Relationships

```
HabboUserDefinedRoomEvents (main component)
    |
    +-- class_3353 (message handler)
    |       |
    |       +-- Handles: Triggers, Actions, Conditions, Addons, Selectors, Variables
    |       +-- Handles: Save success, validation errors, rewards
    |
    +-- UserDefinedRoomEventsCtrl (editor controller)
    |       |
    |       +-- TriggerConfs (trigger registry)
    |       +-- ActionTypes (action registry)
    |       +-- ConditionTypes (condition registry)
    |       +-- AddonTypes (addon registry)
    |       +-- SelectorTypes (selector registry)
    |       +-- VariableTypes (variable registry)
    |       +-- RoomObjectHighLighter (selection visuals)
    |
    +-- WiredVariablesSynchronizer (variable cache)
    |       |
    |       +-- Hash-based differential sync
    |       +-- Listener notification system
    |
    +-- WiredMenuController [VIEW] (menu UI controller)
            |
            +-- WiredMenuView [VIEW]
                    |
                    +-- Tab: Monitor
                    +-- Tab: Variable Overview
                    +-- Tab: Variable Inspection
                    +-- Tab: Settings
                    +-- Tab: Info
```

### Wired Element Type Hierarchy

```
DefaultElement (base class)
    |
    +-- ActionType (actions) - 40+ implementations
    |       - Toggle state, move/rotate, teleport, chat, effects, etc.
    |
    +-- ConditionType (conditions) - 32+ implementations
    |       - Avatar positions, furniture states, scores, variables, etc.
    |
    +-- TriggerConf (triggers) - 24+ implementations
    |       - Timer, user actions, state changes, variable updates, etc.
    |
    +-- SelectorType (selectors) - 20+ implementations
    |       - Area selection, name filters, group filters, variable filters
    |
    +-- AddonType (addons) - 17+ implementations
    |       - Animation options, carry users, selector filters
    |
    +-- VariableType (variables) - 7+ implementations
            - Reference variables, computed values
```

### Message Flow

**Incoming Messages (Server -> Client)**:
- `WiredFurniTriggerEvent` - Trigger configuration opened
- `WiredFurniActionEvent` - Action configuration opened
- `WiredFurniConditionEvent` - Condition configuration opened
- `WiredFurniAddonEvent` - Addon configuration opened
- `WiredFurniSelectorEvent` - Selector configuration opened
- `WiredFurniVariableEvent` - Variable configuration opened
- `WiredSaveSuccessEvent` - Configuration saved successfully
- `WiredValidationErrorEvent` - Validation error on save
- `WiredRewardResultMessageEvent` - Reward result notification
- `WiredPermissionsEvent` - Read/write permission updates
- `WiredAllVariablesHashEvent` - Variable cache hash for sync
- `WiredAllVariablesDiffsEvent` - Variable cache differential update
- `WiredAllVariableHoldersEvent` - Objects holding a variable
- `WiredVariablesForObjectEvent` - Variables held by an object

**Outgoing Messages (Client -> Server)**:
- `UpdateTriggerMessageComposer` - Save trigger configuration
- `UpdateActionMessageComposer` - Save action configuration
- `UpdateConditionMessageComposer` - Save condition configuration
- `UpdateAddonMessageComposer` - Save addon configuration
- `UpdateSelectorMessageComposer` - Save selector configuration
- `UpdateVariableMessageComposer` - Save variable configuration
- `ApplySnapshotMessageComposer` - Apply furniture state snapshot
- `OpenMessageComposer` - Request to open wired configuration
- `WiredGetAllVariablesHashMessageComposer` - Request variable hash
- `WiredGetAllVariablesDiffsMessageComposer` - Request variable diffs
- `WiredGetAllVariableHoldersMessageComposer` - Request variable holders
- `WiredGetVariablesForObjectMessageComposer` - Request object's variables
- `WiredSetObjectVariableValueMessageComposer` - Set variable value on object

### Input Source System

Wired elements can select inputs from multiple sources:
1. **Furni Selection** (type 0) - Manually selected furniture items
2. **User Selection** (type 1) - Users based on various criteria
3. **Merged Selection** (type 2) - Combined furni/user with type switching
4. **Global Source** (type 3) - Room-wide variables
5. **Context Source** (type 4) - Execution context variables

### Variable System

Variables can be:
- **Stored**: Persist on objects (furniture/users)
- **Computed**: Calculated on access
- **Text Connected**: Have value-to-text mappings

Variable properties:
- `hasValue` - Whether variable holds numeric values
- `canWriteValue` - Whether value can be modified
- `canCreateAndDelete` - Whether instances can be created/deleted
- `canInterceptChanges` - Whether changes can be intercepted
- `canReadCreationTime` - Whether creation time is accessible
- `canReadLastUpdateTime` - Whether update time is accessible

---

## Porting Considerations

### Required Subsystems
- Wired element type registries and handlers
- Server message handling for all wired messages
- Variable synchronization with differential updates
- Room object highlighting system

### Complexity Areas
- **Element Type System**: 140+ element types with varied parameter schemas
- **Variable Sync**: Hash-based differential synchronization
- **Input Sources**: Complex source selection with type switching
- **Validation**: Server-side validation with localized error messages

### Simplification Options
- Element types could share more common base functionality
- Variable sync could use simpler full-refresh approach initially
- Input source UI is complex but logic is straightforward

### SolidJS Migration Notes
- All VIEW files (tabs, tables, UI builder) replaced by SolidJS components
- ENGINE files for type registries and handlers remain largely unchanged
- Message handlers need TypeScript adaptation
- Variable sync can use SolidJS reactive stores
