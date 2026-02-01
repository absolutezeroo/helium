# Friend Bar Architecture Documentation

This document categorizes all AS3 friendbar files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                                     |
|----------|-------|-------------------------------------------------------------------------------------------------|
| ENGINE   | 30    | Friend data models, notifications, events, forum data, forum controller, utility classes       |
| VIEW     | 113   | UI rendering, window management, tabs, widgets, landing views, popups, onboarding, animations  |

---

## ENGINE FILES (We Need These)

### Core Data Models (`data/`)

| AS3 File                    | Purpose                                                                                                      | Status |
|-----------------------------|--------------------------------------------------------------------------------------------------------------|--------|
| `data/FriendEntity.as`      | Core friend entity model - stores id, name, gender, online status, allowFollow, figure, categoryId, motto, lastAccess, realName, notifications | TODO   |
| `data/IFriendEntity.as`     | Interface for FriendEntity - defines friend data accessors (id, name, gender, online, figure, notifications, logEventId) | TODO   |
| `data/FriendNotification.as`| Notification model - typeCode (MESSENGER, ROOM_EVENT, ACHIEVEMENT, QUEST, PLAYING_GAME, FINISHED_GAME), message, viewOnce flag | TODO   |
| `data/IFriendNotification.as`| Interface for FriendNotification - typeCode, message, viewOnce accessors                                   | TODO   |
| `data/FriendRequest.as`     | Friend request data model - stores id, name, figure for incoming friend requests                            | TODO   |
| `data/IFriendRequest.as`    | Interface for FriendRequest - id, name, figure accessors                                                    | TODO   |
| `data/HabboFriendBarData.as`| Main data component - manages friend list, friend requests, handles server messages, dispatches events, provides API for friend operations (follow, chat, find friends, accept/decline requests) | TODO   |
| `data/IHabboFriendBarData.as`| Public interface for friend bar data - numFriends, getFriendAt/ByID/ByName, friend requests, followToRoom, startConversation, findNewFriends, toggleFriendList/Messenger, showProfile | TODO   |

### Events (`events/`)

| AS3 File                              | Purpose                                                                                 | Status |
|---------------------------------------|-----------------------------------------------------------------------------------------|--------|
| `events/ActiveConversationsCountEvent.as` | Event for messenger conversation count updates - activeConversationsCount, hasUnread | TODO   |
| `events/FindFriendsNotificationEvent.as` | Event for find friends result - success boolean                                        | TODO   |
| `events/FriendBarResizeEvent.as`      | Event dispatched when friend bar is resized/collapsed                                   | TODO   |
| `events/FriendBarSelectionEvent.as`   | Event when a friend is selected - friendId, friendName                                  | TODO   |
| `events/FriendBarUpdateEvent.as`      | Event dispatched when friend list data is updated                                       | TODO   |
| `events/FriendRequestUpdateEvent.as`  | Event dispatched when friend requests are updated                                       | TODO   |
| `events/NewMessageEvent.as`           | Event for new instant message - notify flag, senderId                                   | TODO   |
| `events/NotificationEvent.as`         | Event for friend notifications - friendId, notification object                          | TODO   |

### Group Forums Data (`groupforums/`)

| AS3 File                                  | Purpose                                                                               | Status |
|-------------------------------------------|---------------------------------------------------------------------------------------|--------|
| `groupforums/GroupForumController.as`     | Main controller for group forums - handles all forum CRUD operations, message handlers, thread/message management, read markers, unread counts | TODO   |
| `groupforums/ForumsListData.as`           | Data model for forums list - listCode, totalAmount, startIndex, forums array, unreadForumsCount calculation | TODO   |
| `groupforums/ThreadsListData.as`          | Data model for threads list - totalThreads, startIndex, threads array, threadsById dictionary, updateThread | TODO   |
| `groupforums/MessagesListData.as`         | Data model for messages list - threadId, startIndex, totalMessages, messages array, messagesById dictionary | TODO   |
| `groupforums/StringBuffer.as`             | Utility class for string building with HTML escaping (< >) - used for forum message formatting | TODO   |
| `groupforums/UnseenForumsCountUpdatedEvent.as` | Event for unseen forums count changes - unseenForumsCount                           | TODO   |
| `groupforums/class_3505.as`               | Interface for GroupForumController (IGroupForumController) - extends IUnknown        | TODO   |
| `groupforums/class_3606.as`               | Unknown interface/class - requires analysis                                           | TODO   |

### Main Interfaces

| AS3 File                   | Purpose                                                                                  | Status |
|----------------------------|------------------------------------------------------------------------------------------|--------|
| `IHabboFriendBar.as`       | Public interface for friend bar component - events accessor, visible setter             | TODO   |
| `IHabboEpicPopupView.as`   | Interface for epic popup view - showPopup(key) method                                   | TODO   |
| `IHabboLandingView.as`     | Interface for landing view - activate(), disable() methods                              | TODO   |
| `IHabboTalent.as`          | Interface for talent system component (empty interface, extends IUnknown)               | TODO   |

---

## VIEW FILES (We Ignore These)

### Main Component

| AS3 File            | Purpose                                                                                       |
|---------------------|-----------------------------------------------------------------------------------------------|
| `HabboFriendBar.as` | Main component - attaches sub-components (FriendBarData, FriendBarView, LandingView, Talent, EpicPopupView, GroupForumController), visibility control |

### View Core (`view/`)

| AS3 File                            | Purpose                                                                                       |
|-------------------------------------|-----------------------------------------------------------------------------------------------|
| `view/AbstractView.as`              | Base class for views - provides windowManager, avatarManager, localizationManager, sessionDataManager, tracking dependencies |
| `view/HabboFriendBarView.as`        | Main friend bar view - builds UI, handles friend tabs, messenger icon, pagination, collapse, link events, notifications display |
| `view/IHabboFriendBarView.as`       | Interface for friend bar view - visible, selectTab, deSelect, getAvatarFaceBitmap, messenger/friendList icon notifications |

### View Tabs (`view/tabs/`)

| AS3 File                              | Purpose                                                                                       |
|---------------------------------------|-----------------------------------------------------------------------------------------------|
| `view/tabs/ITab.as`                   | Interface for tabs - window, selected, recycled, select, deselect, recycle                    |
| `view/tabs/Tab.as`                    | Base tab class - handles selection state, mouse events, expose/conceal states                 |
| `view/tabs/FriendEntityTab.as`        | Tab for displaying a friend - avatar, name, controls (message, visit, profile, game), notification tokens |
| `view/tabs/NewFriendEntityTab.as`     | Updated friend entity tab - similar to FriendEntityTab with new styling                       |
| `view/tabs/FriendRequestTab.as`       | Tab for single friend request - extends FriendEntityTab, accept/decline bubble               |
| `view/tabs/NewFriendRequestTab.as`    | Updated friend request tab - extends NewFriendEntityTab                                       |
| `view/tabs/FriendRequestsTab.as`      | Tab for multiple friend requests - shows list of requests with accept/decline all            |
| `view/tabs/AddFriendsTab.as`          | Tab for finding new friends - find friends button                                             |
| `view/tabs/NewOpenMessengerTab.as`    | Tab for opening messenger                                                                     |

### View Tokens (`view/tabs/tokens/`)

| AS3 File                                | Purpose                                                                                       |
|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| `view/tabs/tokens/Token.as`             | Base token class - icon element, window element, notification reference, prepare method      |
| `view/tabs/tokens/AchievementToken.as`  | Token for achievement notifications                                                          |
| `view/tabs/tokens/GameToken.as`         | Token for game notifications (playing game)                                                  |
| `view/tabs/tokens/MessengerToken.as`    | Token for messenger notifications (new messages)                                             |
| `view/tabs/tokens/QuestToken.as`        | Token for quest notifications                                                                |
| `view/tabs/tokens/RoomEventToken.as`    | Token for room event notifications                                                           |

### View Utils (`view/utils/`)

| AS3 File                        | Purpose                                                                                       |
|---------------------------------|-----------------------------------------------------------------------------------------------|
| `view/utils/Icon.as`            | Base icon class - bitmap rendering, alignment, timer-based animation, hover/notify states   |
| `view/utils/FriendListIcon.as`  | Friend list icon with notify animation                                                       |
| `view/utils/MessengerIcon.as`   | Messenger icon with notify animation                                                         |
| `view/utils/TextCropper.as`     | Utility for cropping text with ellipsis to fit width                                         |

### Group Forums Views (`groupforums/`)

| AS3 File                             | Purpose                                                                                       |
|--------------------------------------|-----------------------------------------------------------------------------------------------|
| `groupforums/GroupForumView.as`      | Main group forum view - forums list, thread list, messages list, navigation, settings        |
| `groupforums/ForumsListView.as`      | View for displaying list of forums                                                           |
| `groupforums/ThreadListView.as`      | View for displaying threads in a forum                                                       |
| `groupforums/MessageListView.as`     | View for displaying messages in a thread                                                     |
| `groupforums/ComposeMessageView.as`  | View for composing new messages/threads                                                      |
| `groupforums/ForumSettingsView.as`   | View for forum settings (permissions, moderation)                                            |

### Landing View (`landingview/`)

| AS3 File                                   | Purpose                                                                                       |
|--------------------------------------------|-----------------------------------------------------------------------------------------------|
| `landingview/HabboLandingView.as`          | Main landing page view - widget layout, navigation, room hopping, catalog integration        |

### Landing View Interfaces (`landingview/interfaces/`)

| AS3 File                                                | Purpose                                                                                       |
|---------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `landingview/interfaces/ILandingViewWidget.as`          | Interface for landing view widgets                                                           |
| `landingview/interfaces/IResizeAwareWidget.as`          | Interface for widgets that respond to resize                                                 |
| `landingview/interfaces/ISettingsAwareWidget.as`        | Interface for widgets that use settings                                                      |
| `landingview/interfaces/ISlotAwareWidget.as`            | Interface for widgets that occupy slots                                                      |
| `landingview/interfaces/class_3836.as`                  | Unknown interface                                                                             |
| `landingview/interfaces/class_3837.as`                  | Unknown interface                                                                             |
| `landingview/interfaces/elements/IElementHandler.as`    | Interface for element handlers                                                               |
| `landingview/interfaces/elements/ILayoutNameProvider.as`| Interface for layout name providers                                                          |
| `landingview/interfaces/elements/class_3860.as`         | Unknown interface                                                                             |
| `landingview/interfaces/elements/class_3863.as`         | Unknown interface                                                                             |

### Landing View Layout (`landingview/layout/`)

| AS3 File                                          | Purpose                                                                                       |
|---------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `landingview/layout/CommonWidgetSettings.as`      | Common settings for widgets                                                                  |
| `landingview/layout/DynamicLayoutManager.as`      | Dynamic layout management for landing view                                                   |
| `landingview/layout/LandingViewWidgetType.as`     | Enum/constants for widget types                                                              |
| `landingview/layout/MovingBackgroundObjects.as`   | Animated background objects container                                                        |
| `landingview/layout/WidgetContainer.as`           | Container for widgets                                                                        |
| `landingview/layout/WidgetContainerLayout.as`     | Layout logic for widget containers                                                           |

### Landing View Background Objects (`landingview/layout/backgroundobjects/`)

| AS3 File                                                              | Purpose                                                                                       |
|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `landingview/layout/backgroundobjects/BackgroundObject.as`            | Base class for background objects                                                            |
| `landingview/layout/backgroundobjects/LinearMovingBackgroundObject.as`| Linearly moving background object                                                            |
| `landingview/layout/backgroundobjects/RandomWalkMovingBackgroundObject.as` | Random walk moving background object                                                    |
| `landingview/layout/backgroundobjects/SpiralMovingBackgroundObject.as`| Spiral moving background object                                                              |
| `landingview/layout/backgroundobjects/StaticAnimatedBackgroundObject.as` | Static but animated background object                                                     |
| `landingview/layout/backgroundobjects/class_3839.as`                  | Unknown background object class                                                              |
| `landingview/layout/backgroundobjects/events/PathResetEvent.as`       | Event for path reset in background objects                                                   |

### Landing View Widgets (`landingview/widget/`)

| AS3 File                                                        | Purpose                                                                                       |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `landingview/widget/AvatarImageWidget.as`                       | Widget displaying avatar image                                                               |
| `landingview/widget/BonusRarePromoWidget.as`                    | Widget for bonus rare promotions                                                             |
| `landingview/widget/CatalogPromoWidget.as`                      | Widget for catalog promotions                                                                |
| `landingview/widget/CatalogPromoWidgetSmall.as`                 | Small catalog promotion widget                                                               |
| `landingview/widget/CommunityGoalHallOfFameWidget.as`           | Widget for community goal hall of fame                                                       |
| `landingview/widget/CommunityGoalPrizesWidget.as`               | Widget for community goal prizes                                                             |
| `landingview/widget/CommunityGoalVsModeWidget.as`               | Widget for community goal vs mode                                                            |
| `landingview/widget/CommunityGoalVsModeWidgetWithVoting.as`     | Widget for community goal vs mode with voting                                                |
| `landingview/widget/CommunityGoalWidget.as`                     | Widget for community goals                                                                   |
| `landingview/widget/DailyQuestWidget.as`                        | Widget for daily quests                                                                      |
| `landingview/widget/ExpiringCatalogPageSmallWidget.as`          | Small widget for expiring catalog pages                                                      |
| `landingview/widget/ExpiringCatalogPageWidget.as`               | Widget for expiring catalog pages                                                            |
| `landingview/widget/GenericWidget.as`                           | Generic widget base                                                                          |
| `landingview/widget/HabboModerationPromoWidget.as`              | Widget for moderation promotions                                                             |
| `landingview/widget/HabboTalentsPromoWidget.as`                 | Widget for talents promotions                                                                |
| `landingview/widget/HabboWayPromoWidget.as`                     | Widget for Habbo Way promotions                                                              |
| `landingview/widget/NextLimitedRareCountdownWidget.as`          | Widget for limited rare countdown                                                            |
| `landingview/widget/PromoArticleWidget.as`                      | Widget for promotional articles                                                              |
| `landingview/widget/RoomHopperNetworkWidget.as`                 | Widget for room hopper network                                                               |
| `landingview/widget/SafetyQuizPromoWidget.as`                   | Widget for safety quiz promotions                                                            |
| `landingview/widget/UserListWidget.as`                          | Widget for user lists                                                                        |
| `landingview/widget/WidgetContainerWidget.as`                   | Container widget for other widgets                                                           |

### Landing View Widget Elements (`landingview/widget/elements/`)

| AS3 File                                                             | Purpose                                                                                       |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `landingview/widget/elements/CatalogButtonElementHandler.as`         | Handler for catalog button elements                                                          |
| `landingview/widget/elements/ConcurrentUsersInfoElementHandler.as`   | Handler for concurrent users info                                                            |
| `landingview/widget/elements/TitleElementHandler.as`                 | Handler for title elements                                                                   |
| `landingview/widget/elements/class_3862.as`                          | Unknown element handler                                                                      |
| `landingview/widget/elements/class_3877.as` - `class_3897.as`        | 21 unknown element handler classes                                                           |

### Popup View (`popup/`)

| AS3 File                      | Purpose                                                                                       |
|-------------------------------|-----------------------------------------------------------------------------------------------|
| `popup/HabboEpicPopupView.as` | Epic popup display - handles EpicPopupMessageEvent, shows fullscreen promotional popups      |

### Talent System (`talent/`)

| AS3 File                               | Purpose                                                                                       |
|----------------------------------------|-----------------------------------------------------------------------------------------------|
| `talent/HabboTalent.as`                | Main talent component - handles link events, talent track display                            |
| `talent/TalentTrackController.as`      | Controller for talent track view                                                             |
| `talent/TalentLevelUpController.as`    | Controller for talent level up notifications                                                 |
| `talent/TalentProgressMeter.as`        | Progress meter UI for talents                                                                |
| `talent/TalentPromoCtrl.as`            | Controller for talent promotions                                                             |
| `talent/CitizenshipPopupController.as` | Controller for citizenship popups                                                            |

### Onboarding (`onBoardingHc/`)

| AS3 File                              | Purpose                                                                                       |
|---------------------------------------|-----------------------------------------------------------------------------------------------|
| `onBoardingHc/OnBoardingHcFlow.as`    | Main onboarding flow - avatar editor, room picker, name change                               |
| `onBoardingHc/NameChangeDialog.as`    | Name change dialog UI                                                                        |
| `onBoardingHc/HitchNameChangeDialog.as` | Alternative name change dialog                                                             |
| `onBoardingHc/IBoardingContext.as`    | Interface for onboarding context                                                             |

### Onboarding Steps (`onBoardingHcSteps/`)

| AS3 File                                        | Purpose                                                                                       |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `onBoardingHcSteps/AvatarEditor.as`             | Avatar editor step in onboarding                                                             |
| `onBoardingHcSteps/Background.as`               | Background visuals for onboarding                                                            |
| `onBoardingHcSteps/RandomAvatarCloudsAnimation.as` | Cloud animation for avatar randomization                                                  |
| `onBoardingHcSteps/RoomPicker.as`               | Room picker step in onboarding                                                               |

---

## Notes

### HabboFriendBarData.as - Critical Engine Component

This is the main data management component containing critical logic:

**ENGINE logic to port:**
- Friend list management (`numFriends`, `getFriendAt/ByID/ByName`, `setFriendAt`)
- Friend request management (`numFriendRequests`, `getFriendRequestAt/ByID/ByName`, `acceptFriendRequest`, `declineFriendRequest`, `acceptAllFriendRequests`, `declineAllFriendRequests`)
- Message event handlers (`onFriendsListFragment`, `onFriendListUpdate`, `onNewFriendRequest`, `onFriendRequestList`, `onNewConsoleMessage`, `onRoomInvite`, `onFriendNotification`)
- Friend actions (`followToRoom`, `startConversation`, `findNewFriends`, `showProfile`, `showProfileByName`)
- Messenger/Friend list toggles (`toggleFriendList`, `toggleMessenger`)
- Tracking (`sendGameTabTracking`, `sendGameButtonTracking`)

### GroupForumController.as - Critical Engine Component

Main controller for group forums containing:

**ENGINE logic to port:**
- Forum list management (`openForumsList`, `requestThreadList`, `requestThreadMessageList`)
- Thread operations (`postNewThread`, `deleteThread`, `unDeleteThread`, `lockThread`, `stickThread`, `reportThread`)
- Message operations (`postNewMessage`, `deleteMessage`, `unDeleteMessage`, `reportMessage`)
- Read marker management (`markForumAsRead`, `markForumsAsRead`, `getThreadLastReadMessageIndex`, `updateUnreadMessageCounts`)
- Navigation (`goToMessageIndex`, `linkReceived`)
- All message event handlers for forum data

### Key Data Structures to Port

1. **FriendEntity** - id, name, gender, online, allowFollow, figure, categoryId, motto, lastAccess, realName, notifications[], logEventId
2. **FriendNotification** - typeCode (MESSENGER=-1, ROOM_EVENT=0, ACHIEVEMENT=1, QUEST=2, PLAYING_GAME=3, FINISHED_GAME=4), message, viewOnce
3. **FriendRequest** - id, name, figure
4. **ForumsListData** - listCode, totalAmount, startIndex, forums[]
5. **ThreadsListData** - totalThreads, startIndex, threads[], threadsById
6. **MessagesListData** - threadId, startIndex, totalMessages, messages[], messagesById

### Key Events to Port

1. **FriendBarUpdateEvent** - "FBE_UPDATED"
2. **FriendRequestUpdateEvent** - "FBE_REQUESTS"
3. **NewMessageEvent** - "FBE_MESSAGE" (notify, senderId)
4. **NotificationEvent** - "FBE_NOTIFICATION_EVENT" (friendId, notification)
5. **ActiveConversationsCountEvent** - "AMC_EVENT" (count, hasUnread)
6. **FindFriendsNotificationEvent** - "FIND_FRIENDS_RESULT" (success)
7. **FriendBarResizeEvent** - "FBE_BAR_RESIZE_EVENT"
8. **FriendBarSelectionEvent** - "FBVE_FRIEND_SELECTED" (friendId, friendName)
9. **UnseenForumsCountUpdatedEvent** - "UNSEEN_FORUMS_COUNT" (count)

### Notification Type Codes

```
TYPE_MESSENGER = -1     // Instant message notification
TYPE_ROOM_EVENT = 0     // Room event notification
TYPE_ACHIEVEMENT = 1    // Achievement notification
TYPE_QUEST = 2          // Quest notification
TYPE_PLAYING_GAME = 3   // Friend playing game notification
TYPE_FINISHED_GAME = 4  // Friend finished game notification
```

### Forum List Codes

```
FORUMS_LIST_CODE_ACTIVE = 0     // Most active forums
FORUMS_LIST_CODE_POPULAR = 1    // Most popular forums
FORUMS_LIST_CODE_MY_FORUMS = 2  // User's forums
```
