# Quest Architecture Documentation

This document categorizes all AS3 quest files into **ENGINE** (business logic we need to implement) and **VIEW** (UI code we ignore since SolidJS handles our UI).

> **Rule**: AS3 source in `source_as/` is the source of truth. Follow it exactly.

---

## Summary

| Category          | Count | Description                                                              |
|-------------------|-------|--------------------------------------------------------------------------|
| ENGINE (Required) | 15    | Quest data, progress tracking, completion logic, achievement management  |
| VIEW (Ignore)     | 16    | Quest UI windows, calendar views, progress dialogs                       |

---

## ENGINE FILES (We Need These)

### Core Engine & Interface

| AS3 File                  | Purpose                                                  | TS Equivalent            | Status |
|---------------------------|----------------------------------------------------------|--------------------------|--------|
| `HabboQuestEngine.as`     | Main quest engine component, coordinates all subsystems  | `HabboQuestEngine.ts`    | TODO   |
| `class_2197.as`           | Interface for quest engine (IHabboQuestEngine)           | `IHabboQuestEngine.ts`   | TODO   |
| `class_3353.as`           | Message handler/router for quest-related server messages | `QuestMessageHandler.ts` | TODO   |

### Quest Data & Controllers

| AS3 File                              | Purpose                                           | TS Equivalent                         | Status |
|---------------------------------------|---------------------------------------------------|---------------------------------------|--------|
| `QuestController.as`                  | Manages quest lifecycle, trackers, and completion | `QuestController.ts`                  | TODO   |
| `AchievementController.as`            | Manages achievements, categories, badge updates   | `AchievementController.ts`            | TODO   |
| `AchievementsResolutionController.as` | Handles achievement resolution flow               | `AchievementsResolutionController.ts` | TODO   |
| `RoomCompetitionController.as`        | Manages room competition voting/submission        | `RoomCompetitionController.ts`        | TODO   |

### Achievement Data Structures

| AS3 File                   | Purpose                                              | TS Equivalent              | Status |
|----------------------------|------------------------------------------------------|----------------------------|--------|
| `AchievementCategories.as` | Container for achievement categories, progress calc  | `AchievementCategories.ts` | TODO   |
| `AchievementCategory.as`   | Single category with achievements, progress tracking | `AchievementCategory.ts`   | TODO   |

### Events

| AS3 File                                       | Purpose                               | TS Equivalent                                  | Status |
|------------------------------------------------|---------------------------------------|------------------------------------------------|--------|
| `events/QuestCompletedEvent.as`                | Event dispatched when quest completes | `events/QuestCompletedEvent.ts`                | TODO   |
| `events/QuestsListEvent.as`                    | Event dispatched with quest list data | `events/QuestsListEvent.ts`                    | TODO   |
| `events/UnseenAchievementsCountUpdateEvent.as` | Event for unseen achievement count    | `events/UnseenAchievementsCountUpdateEvent.ts` | TODO   |

### Calendar State Enums

| AS3 File                                       | Purpose                               | TS Equivalent                 | Status |
|------------------------------------------------|---------------------------------------|-------------------------------|--------|
| `seasonalcalendar/CalendarEntityStateEnums.as` | State constants for calendar entities | `CalendarEntityStateEnums.ts` | TODO   |

### Utility Classes

| AS3 File                         | Purpose                                    | TS Equivalent                 | Status |
|----------------------------------|--------------------------------------------|-------------------------------|--------|
| `AnimationObject.as`             | Interface for animation frame objects      | `AnimationObject.ts`          | TODO   |

---

## VIEW FILES (We Ignore These)

### Quest UI Windows

| AS3 File                             | Purpose                                          | Reason to Ignore              |
|--------------------------------------|--------------------------------------------------|-------------------------------|
| `QuestsList.as`                      | Quest list window UI                             | SolidJS handles UI            |
| `QuestDetails.as`                    | Quest details popup window                       | SolidJS handles UI            |
| `QuestCompleted.as`                  | Quest completion dialog with animations          | SolidJS handles UI            |
| `QuestTracker.as`                    | In-room quest tracker overlay window             | SolidJS handles UI            |
| `NextQuestTimer.as`                  | Timer UI for delayed quests                      | SolidJS handles UI            |

### Achievement UI Components

| AS3 File                                | Purpose                                      | Reason to Ignore              |
|-----------------------------------------|----------------------------------------------|-------------------------------|
| `AchievementResolutionCompletedView.as` | Achievement resolution completed dialog      | SolidJS handles UI            |
| `AchievementResolutionProgressView.as`  | Achievement resolution progress dialog       | SolidJS handles UI            |

### Visual/Animation Components

| AS3 File              | Purpose                                         | Reason to Ignore              |
|-----------------------|-------------------------------------------------|-------------------------------|
| `Animation.as`        | Flash animation controller for bitmap sequences | SolidJS/CSS handles animation |
| `ProgressBar.as`      | Visual progress bar component                   | SolidJS handles UI            |
| `Twinkle.as`          | Twinkle animation effect for completion         | SolidJS/CSS handles animation |
| `TwinkleImages.as`    | Asset loader for twinkle animation frames       | SolidJS/CSS handles animation |

### Seasonal Calendar UI

| AS3 File                                  | Purpose                               | Reason to Ignore   |
|-------------------------------------------|---------------------------------------|--------------------|
| `seasonalcalendar/MainWindow.as`          | Main seasonal calendar window         | SolidJS handles UI |
| `seasonalcalendar/Calendar.as`            | Calendar view with scrolling entities | SolidJS handles UI |
| `seasonalcalendar/CalendarArrowButton.as` | Arrow button for calendar navigation  | SolidJS handles UI |
| `seasonalcalendar/CatalogPromo.as`        | Catalog promotion panel in calendar   | SolidJS handles UI |
| `seasonalcalendar/RareTeaser.as`          | Rare item teaser panel in calendar    | SolidJS handles UI |
| `seasonalcalendar/class_3832.as`          | Background image chain renderer       | SolidJS handles UI |

---

## Detailed File Analysis

### HabboQuestEngine.as

**Category**: ENGINE

**Purpose**: Main quest engine component that coordinates all quest subsystems:
- Initializes and manages QuestController, AchievementController, RoomCompetitionController
- Handles toolbar click events for quests/achievements
- Provides helper methods for localization, image setup, rewards
- Implements ILinkEventTracker for deep linking (questengine/achievements, questengine/calendar)
- Coordinates server communication via IHabboCommunicationManager

**Key Properties**:
- `questController` - QuestController instance
- `achievementController` - AchievementController instance
- `achievementsResolutionController` - AchievementsResolutionController instance
- `roomCompetitionController` - RoomCompetitionController instance
- `currentlyInRoom` - Boolean tracking room presence
- `isFirstLoginOfDay` - Boolean for first login detection

**Key Methods**:
- `ensureAchievementsInitialized()` - Ensure achievements data is loaded
- `showAchievements()` / `showQuests()` - Open UI panels
- `getAchievementLevel(category, badge)` - Get user's achievement level
- `requestSeasonalQuests()` / `requestQuests()` - Request quest data from server
- `activateQuest(questId)` - Activate a quest
- `goToQuestRooms()` - Navigate to quest rooms
- `isSeasonalQuest(quest)` - Check if quest is seasonal
- `getSeasonalCampaignCodePrefix()` - Get seasonal campaign prefix
- `linkReceived(link)` - Handle deep links

**Dependencies**:
- IHabboCommunicationManager, IHabboWindowManager, IHabboLocalizationManager
- IHabboToolbar, IHabboCatalog, IHabboNewNavigator
- ISessionDataManager, IRoomEngine, IHabboTracking

---

### class_2197.as (IHabboQuestEngine Interface)

**Category**: ENGINE

**Purpose**: Public interface for the quest engine, extends IUnknown.

**Key Methods**:
- `ensureAchievementsInitialized()` - Initialize achievement data
- `showAchievements()` - Show achievements panel
- `showQuests()` - Show quests panel
- `getAchievementLevel(category, badge)` - Get achievement level
- `reenableRoomCompetitionWindow()` - Re-enable competition window
- `requestSeasonalQuests()` / `requestQuests()` - Request data
- `activateQuest(questId)` - Activate quest
- `goToQuestRooms()` - Navigate to quest rooms
- `events` - IEventDispatcher for quest events

---

### class_3353.as (Quest Message Handler)

**Category**: ENGINE

**Purpose**: Central message router that handles all incoming quest/achievement server messages and dispatches them to appropriate controllers.

**Handled Events**:
- `QuestMessageEvent` - Single quest data update
- `QuestsMessageEvent` - Full quest list
- `SeasonalQuestsMessageEvent` - Seasonal quest list
- `QuestCompletedMessageEvent` - Quest completion
- `QuestCancelledMessageEvent` - Quest cancellation
- `AchievementsEvent` - Full achievement list
- `AchievementEvent` - Single achievement update
- `AchievementsScoreEvent` - Achievement score update
- `AchievementResolutionsMessageEvent` - Resolution achievements
- `AchievementResolutionProgressMessageEvent` - Resolution progress
- `AchievementResolutionCompletedMessageEvent` - Resolution completed
- `CompetitionVotingInfoMessageEvent` / `CompetitionEntrySubmitResultMessageEvent` - Room competition
- `HabboAchievementNotificationMessageEvent` - Achievement level-up
- `IsFirstLoginOfDayEvent` - First login detection
- `ActivityPointsMessageEvent` / `HabboActivityPointNotificationMessageEvent` - Activity points
- `CloseConnectionMessageEvent` - Room exit
- `RoomEntryInfoMessageEvent` - Room entry
- `RoomSettingsSavedEvent` / `ObjectAddMessageEvent` / `ObjectRemoveMessageEvent` - Room changes

---

### QuestController.as

**Category**: ENGINE

**Purpose**: Manages quest lifecycle, quest trackers (per campaign chain), and coordinates quest-related views.

**Key Properties**:
- `_questTrackers` (Map) - Quest trackers keyed by campaign chain code
- `questsList` - QuestsList reference (VIEW - ignore in engine)
- `questDetails` - QuestDetails reference (VIEW - ignore in engine)
- `seasonalCalendarWindow` - MainWindow reference (VIEW - ignore in engine)

**Key Methods**:
- `onQuest(questData)` - Handle quest data update
- `onQuestCompleted(questData, showDialog)` - Handle quest completion
- `onQuestCancelled(campaignChainCode)` - Handle quest cancellation
- `onRoomEnter()` / `onRoomExit()` - Room state changes
- `getTracker(campaignChainCode)` - Get tracker for campaign
- `onActivityPoints(type, amount)` - Handle activity point updates
- `getDefaultCampaign()` - Get default campaign from config
- `update(deltaTime)` - Update all trackers/views

---

### AchievementController.as

**Category**: ENGINE (with heavy VIEW mixing - needs refactoring)

**Purpose**: Manages achievement data, categories, and unseen achievement tracking.

**Key Properties**:
- `var_1357` (AchievementCategories) - All achievement categories
- `var_638` (AchievementCategory) - Currently selected category
- `var_419` (class_1724) - Currently selected achievement
- `var_2106` (Dictionary) - Unseen achievements by ID

**Key Methods**:
- `onAchievements(achievements, defaultCategory)` - Handle achievement list
- `onAchievement(achievement)` - Handle single achievement update
- `ensureAchievementsInitialized()` - Request achievements if not loaded
- `show()` / `close()` - Toggle visibility
- `getAchievementLevel(category, badge)` - Get user's level for achievement
- `selectCategoryInternalLink(code)` - Select category via deep link
- `onRoomExit()` / `onToolbarClick()` - UI state handlers
- `broadcastUnseenAchievementsCount()` - Dispatch unseen count event

**NOTE**: This class mixes engine logic (achievement data management) with VIEW logic (window management, UI refresh). In TypeScript, split into:
- `AchievementController.ts` (ENGINE) - Data management only
- Achievement UI components (SolidJS) - All rendering

---

### AchievementsResolutionController.as

**Category**: ENGINE (with heavy VIEW mixing - needs refactoring)

**Purpose**: Handles the achievement resolution flow where users select achievements to work toward.

**Key Methods**:
- `onResolutionAchievements(stuffId, achievements, endTime)` - Handle resolution list
- `onResolutionProgress(stuffId, achievementId, badge, progress, total, endTime)` - Handle progress
- `onResolutionCompleted(badgeCode, stuffCode)` - Handle completion
- `onLevelUp(data)` - Handle achievement level-up during resolution
- `resetResolution(stuffId)` - Reset resolution progress

---

### RoomCompetitionController.as

**Category**: ENGINE (with heavy VIEW mixing - needs refactoring)

**Purpose**: Manages room competition voting and submission flow.

**Key Methods**:
- `onCompetitionVotingInfo(event)` - Handle voting info
- `onCompetitionEntrySubmitResult(event)` - Handle submission result
- `onRoomEnter(event)` / `onRoomExit()` - Room state handling
- `onContextChanged()` - Handle room furniture changes
- `sendRoomCompetitionInit()` - Send competition init message

---

### AchievementCategories.as

**Category**: ENGINE

**Purpose**: Container class that organizes achievements into categories and calculates overall progress.

**Key Properties**:
- `var_2706` (Vector.<AchievementCategory>) - Ordered list of categories
- `var_3068` (Dictionary) - Categories by code

**Key Methods**:
- `update(achievement)` - Update achievement in appropriate category
- `categoryList` (getter) - Get all categories
- `getMaxProgress()` / `getProgress()` - Calculate total progress
- `getCategoryByCode(code)` - Find category by code

**Constants**:
- `ACHIEVEMENT_DISABLED = 0`
- `ACHIEVEMENT_ENABLED = 1`
- `ACHIEVEMENT_ARCHIVED = 2`
- `ACHIEVEMENT_OFF_SEASON = 3`
- `ACHIEVEMENT_CATEGORY_ARCHIVED = "archive"`

---

### AchievementCategory.as

**Category**: ENGINE

**Purpose**: Single achievement category containing achievements and progress calculations.

**Key Properties**:
- `var_1078` (code) - Category code string
- `var_275` (Vector.<class_1724>) - Achievements in category

**Key Methods**:
- `add(achievement)` - Add achievement to category
- `update(achievement)` - Update existing achievement
- `getProgress()` - Calculate current progress (sum of levels)
- `getMaxProgress()` - Calculate maximum progress (sum of levelCounts)
- `code` (getter) - Get category code
- `achievements` (getter) - Get achievement list

---

### events/QuestCompletedEvent.as

**Category**: ENGINE

**Purpose**: Event dispatched when a quest is completed.

**Properties**:
- `questData` (class_1715) - Completed quest data

**Constants**:
- `QUEST_SEASONAL = "qce_seasonal"` - Type for seasonal quest completion

---

### events/QuestsListEvent.as

**Category**: ENGINE

**Purpose**: Event dispatched when quest list is received from server.

**Properties**:
- `quests` (Array) - List of quest data objects
- `openWindow` (Boolean) - Whether to open quest window

**Constants**:
- `QUESTS_SEASONAL = "qe_quests_seasonal"` - Seasonal quests event type
- `QUESTS = "qu_quests"` - Regular quests event type

---

### events/UnseenAchievementsCountUpdateEvent.as

**Category**: ENGINE

**Purpose**: Event dispatched when unseen achievement count changes.

**Properties**:
- `count` (int) - Number of unseen achievements

**Constants**:
- `TYPE = "qe_uacue"` - Event type constant

---

### seasonalcalendar/CalendarEntityStateEnums.as

**Category**: ENGINE

**Purpose**: State constants and indicator colors for calendar entities.

**Constants**:
- `ACTIVE = 0` - Quest is active/available
- `INACTIVE = 1` - Quest is inactive/future
- `COMPLETED = 2` - Quest is completed
- `const_955 = 3` - Unknown state
- `INDICATOR_COLOR = [2134301, 12439506, 10066329, 10066329]` - Colors for each state

---

### AnimationObject.as

**Category**: ENGINE

**Purpose**: Interface for animation frame objects used by Animation class.

**Methods**:
- `getPosition(time)` - Get position at time
- `getBitmap(time)` - Get bitmap at time
- `isFinished(time)` - Check if animation finished
- `onAnimationStart()` - Called when animation starts

---

## Architecture Pattern

### AS3 Architecture
```
HabboQuestEngine (Component)
    ├── QuestController
    │   ├── QuestsList (VIEW)
    │   ├── QuestDetails (VIEW)
    │   ├── QuestCompleted (VIEW)
    │   ├── NextQuestTimer (VIEW)
    │   ├── QuestTracker[] (VIEW)
    │   └── MainWindow (VIEW - seasonal calendar)
    │
    ├── AchievementController
    │   ├── AchievementCategories
    │   │   └── AchievementCategory[]
    │   └── Window/Progress views (VIEW)
    │
    ├── AchievementsResolutionController
    │   ├── AchievementResolutionProgressView (VIEW)
    │   └── AchievementResolutionCompletedView (VIEW)
    │
    └── RoomCompetitionController
        └── Window views (VIEW)
```

### Our TypeScript Architecture
```
HabboQuestEngine (injectable singleton)
    ├── QuestController
    │   ├── questTrackers (Map<string, QuestTrackerState>)
    │   └── questData (reactive store)
    │
    ├── AchievementController
    │   ├── categories (AchievementCategory[])
    │   └── unseenAchievements (Set<number>)
    │
    ├── AchievementsResolutionController
    │   └── resolutionState (reactive store)
    │
    └── RoomCompetitionController
        └── competitionState (reactive store)

questStore (SolidJS reactive store)
    ├── activeQuests[]
    ├── currentQuest
    ├── achievements[]
    └── UI listens to store changes
```

---

## Message Flow

### Quest Update Flow
```
1. Server sends QuestMessageEvent
2. class_3353.onQuest() receives message
3. QuestController.onQuest(questData) called
4. QuestTracker for campaign chain updated
5. Events dispatched for UI updates
```

### Quest Completion Flow
```
1. Server sends QuestCompletedMessageEvent
2. class_3353.onQuestCompleted() receives message
3. QuestController.onQuestCompleted(questData, showDialog) called
4. QuestTracker.onQuestCompleted() animates completion
5. QuestCompletedEvent dispatched
6. If seasonal, triggers calendar refresh
```

### Achievement Update Flow
```
1. Server sends AchievementEvent
2. class_3353.onAchievement() receives message
3. AchievementController.onAchievement(achievement) called
4. AchievementCategories.update(achievement) updates data
5. If new/unseen, added to unseen dictionary
6. UnseenAchievementsCountUpdateEvent dispatched
```

---

## Key Implementation Notes

1. **Separation of Concerns**: The AS3 code heavily mixes VIEW and ENGINE logic in the same classes. In TypeScript, strictly separate:
   - ENGINE: Data management, server communication, state tracking
   - VIEW: All rendering handled by SolidJS components

2. **Quest Trackers**: Each campaign chain has its own QuestTracker instance. These are created on-demand and disposed when no longer needed.

3. **Seasonal vs Regular Quests**: Seasonal quests use a separate calendar UI and have time-limited availability. The `isSeasonalQuest()` method checks if quest's campaignCode starts with the seasonal prefix.

4. **Achievement States**: Achievements can be disabled (0), enabled (1), archived (2), or off-season (3). Archived achievements go to a special "archive" category.

5. **Deep Linking**: The quest engine handles deep links via ILinkEventTracker:
   - `questengine/achievements` - Open achievements
   - `questengine/achievements/{category}` - Open specific category
   - `questengine/calendar` - Open seasonal calendar
   - `questengine/quests` - Open quests
   - `questengine/gotorooms` - Navigate to quest rooms

6. **First Login Detection**: `isFirstLoginOfDay` flag triggers automatic seasonal calendar opening on first login.

---

## Server Messages Used

### Outgoing (Composers)
- `GetAchievementsComposer` - Request achievement list
- `GetQuestsMessageComposer` - Request quest list
- `GetSeasonalQuestsOnlyMessageComposer` - Request seasonal quests
- `ActivateQuestMessageComposer(questId)` - Activate a quest
- `AcceptQuestMessageComposer(questId)` - Accept a quest
- `RejectQuestMessageComposer(questId)` - Reject a quest
- `OpenQuestTrackerMessageComposer` - Request next quest
- `StartCampaignMessageComposer(campaign)` - Start campaign
- `GetResolutionAchievementsMessageComposer(stuffId, achievementId)` - Get resolution achievements
- `RoomCompetitionInitMessageComposer` - Init room competition
- `SubmitRoomToCompetitionMessageComposer(code, action)` - Submit room
- `VoteForRoomMessageComposer(code)` - Vote for room
- `EventLogMessageComposer(category, name, action)` - Log event

### Incoming (Parsers)
- `QuestMessageEventParser` - Single quest data
- `QuestsMessageEventParser` - Quest list with openWindow flag
- `SeasonalQuestsMessageEventParser` - Seasonal quest list
- `QuestCompletedMessageEventParser` - Quest completion with showDialog
- `QuestCancelledMessageEventParser` - Quest cancellation with expired flag
- `AchievementsEventParser` - Achievement list with defaultCategory
- `AchievementEventParser` - Single achievement update
- `AchievementsScoreEventParser` - Achievement score
- `AchievementResolutionsMessageEventParser` - Resolution list
- `AchievementResolutionProgressMessageEventParser` - Resolution progress
- `AchievementResolutionCompletedMessageEventParser` - Resolution completed
- `HabboAchievementNotificationMessageEventParser` - Achievement notification

---

## Next Implementation Steps

1. **Create Quest Event Types** - QuestCompletedEvent, QuestsListEvent, UnseenAchievementsCountUpdateEvent
2. **Implement AchievementCategory/Categories** - Pure data classes
3. **Implement CalendarEntityStateEnums** - State constants
4. **Create IHabboQuestEngine interface** - Public API
5. **Implement QuestController** - Core quest management (ENGINE only)
6. **Implement AchievementController** - Core achievement management (ENGINE only)
7. **Implement HabboQuestEngine** - Coordinate all controllers
8. **Implement QuestMessageHandler** - Route server messages
9. **Create SolidJS quest store** - Reactive state for UI
10. **Build Quest UI components** - SolidJS views for quests/achievements
