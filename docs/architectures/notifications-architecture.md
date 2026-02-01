# Notifications Architecture Documentation

This document categorizes all AS3 notification files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                    |
|----------|-------|--------------------------------------------------------------------------------|
| ENGINE   | 16    | Notification data models, queue management, message handlers, utility classes  |
| VIEW     | 16    | UI components for displaying notifications, panes, popups - SolidJS handles UI |

---

## ENGINE FILES (We Need These)

### Core Notification System

| AS3 File                               | Purpose                                                                                                                                                                                                        | Status |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `notifications/HabboNotifications.as`  | Main component - orchestrates notifications system, manages dependencies (communication, session, localization, window manager), exposes `addItem()`, `showNotification()`, `addSongPlayingNotification()` API | TODO   |
| `notifications/IHabboNotifications.as` | Public interface for notification system - `addItem()`, `showNotification()`, `addSongPlayingNotification()`                                                                                                   | TODO   |
| `notifications/class_3353.as`          | Message event handler hub - registers 25+ server message listeners (MOTD, moderation, achievements, pets, hotel status, bans, club gifts, etc.), routes to appropriate notification handlers                   | TODO   |
| `notifications/NotificationType.as`    | Notification type constants - FRIEND_ONLINE/OFFLINE, ACHIEVEMENT_RECEIVED, BADGE_RECEIVED, INFO, RESPECT, CLUB, SOUND_MACHINE, PETLEVEL, CLUBGIFT, VIP, ROOM_MESSAGES_POSTED                                   | TODO   |
| `notifications/FeedVisibilityEnum.as`  | Visibility state constants - VIEW_STATE_HIDDEN=0, VIEW_STATE_MINIMIZED=1, VIEW_STATE_MAXIMIZED=2                                                                                                               | TODO   |

### Feed System (Data Layer)

| AS3 File                                                 | Purpose                                                                                                                            | Status |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|--------|
| `notifications/feed/data/GenericNotificationItemData.as` | Feed item data model - title, timeStamp, description, decorationImage, iconImage, buttonAction, buttonCaption                      | TODO   |
| `notifications/feed/FeedSettings.as`                     | Feed category settings - manages visible feed categories (ME=0, FRIENDS=1, HOTEL=2), filtering logic                               | TODO   |
| `notifications/feed/NotificationController.as`           | Feed controller - manages FeedSettings, EntityFactory, routes feed items to view, handles room session events for game mode        | TODO   |
| `notifications/feed/StateController.as`                  | Visibility state machine - tracks enabled/gameMode flags, manages current/requested visibility states (hidden/minimized/maximized) | TODO   |

### Singular Notification System (Data Layer)

| AS3 File                                                   | Purpose                                                                                                                                                                                                  | Status |
|------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `notifications/singular/SingularNotificationController.as` | Main singular notification controller - manages notification queue, style config, creates HabboNotificationItem instances, handles moderation disclaimer timing, club gift and safety lock notifications | TODO   |
| `notifications/singular/HabboNotificationItem.as`          | Notification item data - wraps content string and HabboNotificationItemStyle, has `ExecuteUiLinks()` for internal link handling                                                                          | TODO   |
| `notifications/singular/HabboNotificationItemStyle.as`     | Notification styling data - icon BitmapData, iconAssetUri, iconSrc, internalLink URL                                                                                                                     | TODO   |
| `notifications/singular/HabboAlertDialogManager.as`        | Alert dialog handler - handles moderator messages, user banned, hotel closing/maintenance, login failed scenarios with localized messages                                                                | TODO   |

### Utility Classes

| AS3 File                                     | Purpose                                                                                                                          | Status |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|--------|
| `notifications/utils/PetImageUtility.as`     | Pet image generator - uses RoomEngine to generate pet preview images from typeId, paletteId, color                               | TODO   |
| `notifications/utils/ProductImageUtility.as` | Product image generator - generates furniture/wall item/effect icons from productType, furniClassId, extraParam using RoomEngine | TODO   |

---

## VIEW FILES (We Ignore These)

### Main View Components

| AS3 File                                 | Purpose                                                                                                                                      |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `notifications/NotificationPopup.as`     | Modal dialog popup - builds XML-based window, displays title/message/image/link, handles close/action click events                           |
| `notifications/feed/NotificationView.as` | Main feed UI container - manages multiple panes (notifications, stream, info, settings, status), handles minimize toggle, window positioning |

### Feed Entity Views

| AS3 File                                           | Purpose                                                                                                                                                    |
|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `notifications/feed/view/content/class_3603.as`    | `IFeedEntity` interface - requires `window` IWindowContainer getter                                                                                        |
| `notifications/feed/view/content/EntityFactory.as` | Factory for creating FeedEntity views from GenericNotificationItemData                                                                                     |
| `notifications/feed/view/content/FeedEntity.as`    | Feed item view component - manages window rendering (icon, title, message, time, decoration, action button), handles image loading, recycling pool pattern |

### Pane Views

| AS3 File                                            | Purpose                                                                                                      |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `notifications/feed/view/pane/class_3674.as`        | `IPane` interface - paneLevel, isVisible properties                                                          |
| `notifications/feed/view/pane/AbstractPane.as`      | Base pane class - manages window container reference, visibility state, pane level (BASE=0, FEED=1, MODAL=2) |
| `notifications/feed/view/pane/NotificationsPane.as` | Notifications list pane - manages IItemListWindow with sections (urgent, actions, persistent, notifications) |
| `notifications/feed/view/pane/StreamPane.as`        | Activity stream pane - simple list for stream feed items                                                     |
| `notifications/feed/view/pane/InfoPane.as`          | Info modal pane - displays info with OK button to close                                                      |
| `notifications/feed/view/pane/SettingsPane.as`      | Settings modal pane - toggle buttons for ME/HOTEL/FRIENDS category filtering                                 |
| `notifications/feed/view/pane/StatusPane.as`        | Status bar pane - minimize toggle, notification/stream tab buttons                                           |

### Singular Notification Views

| AS3 File                                                 | Purpose                                                                                                            |
|----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `notifications/singular/HabboNotificationViewManager.as` | Manages multiple notification bubble views - handles positioning, stacking, update loop for fade animations        |
| `notifications/singular/HabboNotificationItemView.as`    | Individual notification bubble view - fade in/display/fade out state machine, hover detection, icon/text rendering |
| `notifications/singular/MOTDNotification.as`             | Message of the Day dialog - modal frame with scrollable message list                                               |
| `notifications/singular/ClubGiftNotification.as`         | Club gift toolbar extension - displays gift notification with catalog link button                                  |
| `notifications/singular/SafetyLockedNotification.as`     | Safety lock toolbar extension - displays account safety warning with unlock link                                   |

---

## Architecture Analysis

### Component Relationships

```
HabboNotifications (main component)
    |
    +-- class_3353 (message event handler hub)
    |       |
    |       +-- 25+ server message listeners
    |
    +-- SingularNotificationController
    |       |
    |       +-- HabboNotificationViewManager (VIEW)
    |       |       +-- HabboNotificationItemView[] (VIEW)
    |       |
    |       +-- HabboAlertDialogManager
    |       +-- ClubGiftNotification (VIEW)
    |       +-- SafetyLockedNotification (VIEW)
    |       +-- HabboNotificationItem[] (queue)
    |               +-- HabboNotificationItemStyle
    |
    +-- NotificationController (feed system)
    |       |
    |       +-- FeedSettings
    |       +-- EntityFactory (VIEW)
    |       +-- NotificationView (VIEW)
    |               +-- StateController
    |               +-- AbstractPane subclasses (VIEW)
    |
    +-- PetImageUtility
    +-- ProductImageUtility
```

### Notification Flow

1. **Server Message**: Incoming message received via communication manager
2. **Handler**: `class_3353` routes to appropriate handler method (e.g., `onMOTD`, `onLevelUp`)
3. **Data Creation**: Handler creates `GenericNotificationItemData` or `HabboNotificationItem`
4. **Queue**: Item added to notification queue or feed
5. **Display**: View manager picks from queue when space available, creates view
6. **Animation**: View handles fade in/display/fade out states
7. **Interaction**: Click triggers `ExecuteUiLinks()` for internal link navigation

### Notification Types

| Type              | Handler                         | Destination         |
|-------------------|---------------------------------|---------------------|
| MOTD              | `onMOTD()`                      | Feed + Modal dialog |
| Achievement/Badge | `onLevelUp()`                   | Singular bubble     |
| Respect           | `onRespectNotification()`       | Singular bubble     |
| Pet Level         | `onPetLevelNotification()`      | Singular bubble     |
| Pet Received      | `onPetReceived()`               | Singular bubble     |
| Moderator Message | `onModMessageEvent()`           | Alert dialog + Feed |
| User Banned       | `onUserBannedMessageEvent()`    | Alert dialog        |
| Hotel Closing     | `onHotelClosing()`              | Alert dialog        |
| Hotel Maintenance | `onHotelMaintenance()`          | Alert dialog        |
| Club Gift         | `onClubGiftNotification()`      | Toolbar extension   |
| Safety Lock       | `onUserObject()`                | Toolbar extension   |
| Activity Points   | `onActivityPointNotification()` | Singular bubble     |
| Room Messages     | `onRoomMessagesNotification()`  | Singular bubble     |
| Broadcast         | `onBroadcastMessageEvent()`     | Alert dialog        |

### Server Messages

**Incoming**:
- `ModeratorMessageEvent` - Moderation messages with URL
- `ModeratorCautionEvent` - Moderation cautions
- `RespectNotificationMessageEvent` - Respect received
- `MaintenanceStatusMessageEvent` - Server maintenance
- `PetLevelNotificationEvent` - Pet leveled up
- `InfoHotelClosingMessageEvent` - Hotel closing soon
- `InfoFeedEnableMessageEvent` - Enable/disable feed
- `UserObjectEvent` - User data with safety lock status
- `MOTDNotificationEvent` - Message of the day
- `HabboBroadcastMessageEvent` - Hotel broadcast
- `HabboActivityPointNotificationMessageEvent` - Points earned
- `NotificationDialogMessageEvent` - Generic dialog notification
- `ClubGiftSelectedEvent` - Club gift selected
- `UserBannedMessageEvent` - User banned
- `PetReceivedMessageEvent` - Pet received
- `PetRespectFailedEvent` - Pet respect failed
- `InfoHotelClosedMessageEvent` - Hotel closed
- `ClubGiftNotificationEvent` - Club gifts available
- `LoginFailedHotelClosedMessageEvent` - Login failed
- `RoomMessageNotificationMessageEvent` - Room messages posted
- `RestoreClientMessageEvent` - Restore client from web
- `AccountSafetyLockStatusChangeMessageEvent` - Safety lock status change
- `HabboAchievementNotificationMessageEvent` - Achievement unlocked
- `OpenConnectionMessageEvent` / `RoomEntryInfoMessageEvent` - Room enter

**Outgoing**:
- `GetMOTDMessageComposer` - Request message of the day

---

## Porting Considerations

### Required Subsystems
- Notification queue management with priority
- Timer-based display duration control
- Server message handling via communication layer
- Localization for notification text
- Image loading for icons (badges, pets, products)

### Key Data to Port
- `GenericNotificationItemData` - Feed item structure
- `HabboNotificationItem` + `HabboNotificationItemStyle` - Bubble item structure
- `NotificationType` constants
- `FeedVisibilityEnum` states

### Simplification Options
- Single notification display (no stacking) for initial implementation
- Skip feed panel entirely, use only bubble notifications
- Consolidate alert dialogs into single modal component
- Use browser Notification API for background notifications

### SolidJS UI Considerations
- Feed panel can be a collapsible sidebar component
- Notification bubbles as animated toast components
- Alert dialogs as modal overlays
- Reactive state for notification queue management
