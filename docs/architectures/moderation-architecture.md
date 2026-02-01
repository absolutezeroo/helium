# Moderation Architecture Documentation

This document categorizes all AS3 moderation files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                                     |
|----------|-------|-------------------------------------------------------------------------------------------------|
| ENGINE   | 20    | Core moderation data models, managers, message handlers, action definitions, and business logic |
| VIEW     | 16    | UI panels, controllers, and window management for moderation interfaces                         |

---

## ENGINE FILES (We Need These)

| AS3 File                      | Purpose                                                                                                 | Status |
|-------------------------------|---------------------------------------------------------------------------------------------------------|--------|
| `ModerationManager.as`        | Central moderation component - manages issue tracking, permissions, connections, sound, tracking        | TODO   |
| `ModerationMessageHandler.as` | Handles all incoming moderation server messages (issues, chatlogs, room info, sanctions, user info)     | TODO   |
| `IssueManager.as`             | Core issue/report management - picking, releasing, closing issues, bundle management, priority handling | TODO   |
| `IssueBundle.as`              | Data model for bundled issues - groups related reports, tracks state, priority, picker info             | TODO   |
| `ModActionDefinition.as`      | Constants and data model for moderation action types (ALERT, MUTE, BAN, KICK, TRADING_LOCK, MESSAGE)    | TODO   |
| `class_3472.as`               | Localization helper - maps category IDs to human-readable names (Sex, PII, Scam, Bullying, etc.)        | TODO   |
| `class_3593.as`               | Interface for chatlog listeners - defines `onChatlog()` callback                                        | TODO   |
| `class_3619.as`               | Interface for user info listeners - defines `onUserInfo()` callback                                     | TODO   |
| `IHabboModeration.as`         | Public interface for moderation component - `userSelected()` method                                     | TODO   |
| `IIssueHandler.as`            | Interface for issue handlers - `updateIssuesAndMessages()`, `showDefaultSanction()`                     | TODO   |
| `IIssueBrowserView.as`        | Interface for issue browser views - visibility, update, view container                                  | TODO   |
| `ITrackedWindow.as`           | Interface for tracked windows - `getType()`, `getId()`, `getFrame()`, `show()`                          | TODO   |
| `HideDiscussionMessage.as`    | Action handler to hide/moderate a forum message via `ModerateMessageMessageComposer`                    | TODO   |
| `HideDiscussionThread.as`     | Action handler to hide/moderate a forum thread via `ModerateThreadMessageComposer`                      | TODO   |
| `OpenDiscussionMessage.as`    | Action handler to open a forum message via link event                                                   | TODO   |
| `OpenDiscussionThread.as`     | Action handler to open a forum thread via link event                                                    | TODO   |
| `OpenExternalLink.as`         | Action handler to open external URLs (selfie reports, photo moderation)                                 | TODO   |
| `OpenRoomInSpectatorMode.as`  | Action handler to navigate to a room in spectator mode                                                  | TODO   |
| `OpenRoomTool.as`             | Action handler to open room tool for a specific room ID                                                 | TODO   |
| `OpenUserInfo.as`             | Action handler to open user info frame for a specific user ID                                           | TODO   |

## VIEW FILES (We Ignore These)

| AS3 File                    | Purpose                                                                                            |
|-----------------------------|----------------------------------------------------------------------------------------------------|
| `ChatlogCtrl.as`            | UI controller for displaying chat logs - manages window, list items, text formatting, scrolling    |
| `IssueBrowser.as`           | Main issue browser window - tabs for My/Open/Picked issues, window management                      |
| `IssueHandler.as`           | Issue handling window UI - displays issues, messages, user info panels, action buttons             |
| `IssueListView.as`          | List view component for displaying issue bundles with sorting, pagination                          |
| `MyIssuesView.as`           | Tab view for "My Issues" in issue browser - displays user's picked issues                          |
| `OpenIssuesView.as`         | Tab view for "Open Issues" in issue browser - displays unassigned issues                           |
| `PickedIssuesView.as`       | Tab view for "Picked Issues" in issue browser - displays issues picked by others                   |
| `ModActionCtrl.as`          | Moderation action panel UI - topic dropdown, action type dropdown, message input, sanction buttons |
| `RoomToolCtrl.as`           | Room tool panel UI - displays room info, owner info, chatlog button, kick/lock/rename options      |
| `RoomVisitsCtrl.as`         | Room visits window UI - displays user's room visit history                                         |
| `SendMsgsCtrl.as`           | Send message panel UI - message template dropdown, text input, send button                         |
| `StartPanelCtrl.as`         | Main moderation start panel UI - buttons for room tool, chatlog, ticket queue, user info           |
| `UserClassificationCtrl.as` | User classification display panel UI - shows classified users list                                 |
| `UserInfoCtrl.as`           | User info panel UI - displays user details, sanction counts, action buttons                        |
| `UserInfoFrameCtrl.as`      | User info frame wrapper UI - window frame containing UserInfoCtrl                                  |
| `WindowTracker.as`          | Window tracking/management utility - tracks open windows by type/id, handles positioning           |

---

## Architecture Notes

### Core Data Flow

1. **ModerationMessageHandler** receives server messages and routes to appropriate listeners
2. **IssueManager** maintains issue state, bundles related reports, handles pick/release/close operations
3. **IssueBundle** groups related issues by groupingId and reportedUserId
4. **ModActionDefinition** defines available moderation actions (Alert, Mute, Ban, Kick, Trade Lock, Message)

### Key Interfaces

- `IHabboModeration` - Public component interface
- `IIssueHandler` - Issue handler contract
- `IIssueBrowserView` - Issue browser view contract
- `ITrackedWindow` - Tracked window contract
- `class_3593` - Chatlog listener
- `class_3619` - User info listener

### Message Composers Used

- `GetCfhChatlogMessageComposer` - Request CFH chatlog
- `GetRoomChatlogMessageComposer` - Request room chatlog
- `GetUserChatlogMessageComposer` - Request user chatlog
- `GetModeratorUserInfoMessageComposer` - Request user info
- `GetModeratorRoomInfoMessageComposer` - Request room info
- `GetRoomVisitsMessageComposer` - Request room visits
- `PickIssuesMessageComposer` - Pick issues
- `ReleaseIssuesMessageComposer` - Release issues
- `CloseIssuesMessageComposer` - Close issues
- `CloseIssueDefaultActionMessageComposer` - Close with default sanction
- `ModToolSanctionComposer` - Request sanction data
- `ModToolPreferencesComposer` - Save tool preferences
- `ModKickMessageComposer` - Kick user
- `ModBanMessageComposer` - Ban user
- `ModMuteMessageComposer` - Mute user
- `ModAlertMessageComposer` - Alert user
- `ModMessageMessageComposer` - Send message to user
- `ModTradingLockMessageComposer` - Lock trading
- `DefaultSanctionMessageComposer` - Apply default sanction
- `ModeratorActionMessageComposer` - Room moderation action
- `ModerateRoomMessageComposer` - Moderate room (kick/lock/rename)
- `ModerateMessageMessageComposer` - Moderate forum message
- `ModerateThreadMessageComposer` - Moderate forum thread

### Issue States

- State 1: Open (unassigned)
- State 2: Picked (assigned to moderator)
- State 3: Closed (resolved)

### Issue Categories

Defined in `class_3472.getCategoryName()`:
- 0: Automatic
- 101-106: Chat categories (Sex, PII, Scam, Bullying, Disruption, Other)
- 111-114: IM categories
- 121-124: Other categories
- 130-136: Forum categories (Hate, Violence, Sex, Illegal, PII, Copyright, Spam)
- 1024-1026: Special (Guide, Bullying, Severe Alert)

### Issue Sources

Defined in `class_3472.getSourceName()`:
- 1-2: Normal
- 3: Automatic
- 4: Automatic IM
- 5: Guide System
- 6: IM
- 7: Room
- 8: Panic
- 9: Guardian
- 10: Automatic Helper
- 11: Discussion
- 12: Selfie
- 14: Photo
- 15: Ambassador

### Moderation Action Types

Defined in `ModActionDefinition`:
- 1: Alert
- 2: Mute 1h
- 3: Ban 18h
- 4: Ban 7 days
- 5: Ban 30 days (step 1)
- 6: Ban 100 years
- 7: Ban 30 days (step 2)
- 101: Kick
- 102: Lock trade 1 week (168h)
- 104: Lock trade permanent (876000h)
- 105: Message
- 106: Ban avatar-only 100 years
