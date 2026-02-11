# Messenger Architecture Documentation

This document categorizes all AS3 messenger files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Description                                                             |
|----------|-------|-------------------------------------------------------------------------|
| ENGINE   | 5     | Message data models, events, messenger service interface and core logic |
| VIEW     | 2     | UI components for rendering chat windows and conversations              |

---

## ENGINE FILES (We Need These)

| AS3 File                                      | Purpose                                                                                                                                                  | Status |
|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `messenger/ChatEntry.as`                      | Data model for chat messages with type constants (OWN_CHAT, OTHER_CHAT, INFO, etc.), message content, sender info, timestamps, and confirmation tracking | TODO   |
| `messenger/DummyFriend.as`                    | Fallback IFriend implementation for users not in friend list (used for group chats or persisted message senders)                                         | TODO   |
| `messenger/events/ActiveConversationEvent.as` | Event dispatched when active conversation count changes; carries count and unread status                                                                 | TODO   |
| `messenger/events/MiniMailMessageEvent.as`    | Event for MiniMail notifications; carries unread count                                                                                                   | TODO   |
| `messenger/IHabboMessenger.as`                | Public interface defining messenger service API: toggle, start/close conversations, online status, room invites, following                               | TODO   |

## VIEW FILES (We Ignore These)

| AS3 File                      | Purpose                                                                                                                                                                                                                |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `messenger/HabboMessenger.as` | Main component class - **HYBRID** but primarily orchestrates UI (MainView) and manages Component dependencies. Core send/receive logic is tightly coupled with view management. Business logic extracted to interface. |
| `messenger/MainView.as`       | Primary UI controller - manages chat window layout, avatar list, conversation list rendering, scroll behavior, window event handling, and user input. Pure UI code.                                                    |

---

## Detailed Analysis

### ENGINE Files

#### `ChatEntry.as`
**Category**: ENGINE (Data Model)

Core message data structure representing a single chat entry:
- **Type constants**: `TYPE_OWN_CHAT` (1), `TYPE_OTHER_CHAT` (2), `const_1089` (3 - notification), `TYPE_INFO` (4), `const_1038` (5 - invitation)
- **Properties**: chatId, message, senderId, senderName, senderFigure, messageId
- **Timestamp handling**: Tracks seconds since sent and client receive time for accurate display
- **Confirmation system**: `awaitConfirmationId` for message delivery confirmation

```actionscript
// Key structure we need:
public class ChatEntry {
    public static const TYPE_OWN_CHAT:int = 1;
    public static const TYPE_OTHER_CHAT:int = 2;
    // ... message type, chatId, message, sender info, timestamps
}
```

#### `DummyFriend.as`
**Category**: ENGINE (Data Model)

Implements `IFriend` interface as a fallback for non-friend senders:
- Used when receiving messages from users not in current friend list
- Stores basic user info: id, name, figure
- Returns sensible defaults (online: true, followingAllowed: true, etc.)

#### `events/ActiveConversationEvent.as`
**Category**: ENGINE (Event)

Event class for conversation state changes:
- Event type: `ACTIVE_CONVERSATION_COUNT_CHANGED` ("ACCE_changed")
- Carries: `activeConversationsCount`, `hasUnread` boolean
- Used to update UI badges/indicators externally

#### `events/MiniMailMessageEvent.as`
**Category**: ENGINE (Event)

Event class for MiniMail system:
- Event types: `const_455` ("MMME_new"), `const_1125` ("MMME_unread")
- Carries: `unreadCount`
- Dispatched when new mail arrives or unread count updates

#### `IHabboMessenger.as`
**Category**: ENGINE (Interface)

Public service interface - this is the API we expose:
```actionscript
interface IHabboMessenger {
    function get events(): IEventDispatcher;
    function isOpen(): Boolean;
    function toggleMessenger(): void;
    function startConversation(userId: int): void;
    function closeConversation(userId: int): void;
    function setFollowingAllowed(userId: int, allowed: Boolean): void;
    function setOnlineStatus(userId: int, online: Boolean): void;
    function getUnseenMiniMailMessageCount(): int;
    function getRoomInvitesIgnored(): Boolean;
    function setRoomInvitesIgnored(ignored: Boolean): void;
    function set followingToGroupRoom(value: Boolean): void;
}
```

---

### VIEW Files

#### `HabboMessenger.as`
**Category**: VIEW (Component/Controller) - but contains extractable logic

This is the main Habbo Component. While it handles message events, it's heavily coupled to the UI framework:

**View-related (ignore)**:
- Extends `Component` (Habbo's UI component base)
- Manages `_windowManager`, `_soundManager` for UI
- Creates and manages `MainView` instance
- XML window building via `getXmlWindow()`

**Logic we might extract**:
- Message event handlers (could be engine-side)
- `send()` method for outgoing messages
- Room invite handling (`_roomInvitesIgnored`)
- MiniMail count tracking

**Key message handlers**:
- `onNewConsoleMessage` - incoming chat messages
- `onConsoleHistory` - message history loading
- `onRoomInvite` - room invitation handling
- `onInstantMessageError` - error handling

#### `MainView.as`
**Category**: VIEW (Pure UI)

The main chat window UI - all of this is replaced by SolidJS:

**UI Components managed**:
- `_frame` - main window container
- `_conversationList` - scrollable chat history
- `_avatarList` - friend avatars in header
- `_chatItemTemplate`, `_notificationItemTemplate`, etc.

**UI Logic (all ignored)**:
- Window resize handling
- Scroll behavior (`addMissingChatEntries`, `scrollBack`)
- Avatar list management (visibility, scrolling)
- Chat bubble combining (messages within 10 min threshold)
- Window event procedures (clicks, resize, scroll)

**Error messages dictionary** (useful reference):
```actionscript
ERROR_MESSAGES[3] = "${messenger.error.receivermuted}";
ERROR_MESSAGES[4] = "${messenger.error.sendermuted}";
ERROR_MESSAGES[5] = "${messenger.error.offline}";
ERROR_MESSAGES[6] = "${messenger.error.notfriend}";
ERROR_MESSAGES[7] = "${messenger.error.busy}";
// ... etc
```

---

## Protocol Messages Used

### Incoming (Server -> Client)
| Message                         | Parser                             | Purpose                                 |
|---------------------------------|------------------------------------|-----------------------------------------|
| `MessengerInitEvent`            | -                                  | Initialize messenger system             |
| `NewConsoleMessageEvent`        | `NewConsoleMessageEventParser`     | New incoming chat message               |
| `ConsoleMessageHistoryEvent`    | `ConsoleMessageHistoryEventParser` | Message history response                |
| `InstantMessageErrorEvent`      | `InstantMessageErrorEventParser`   | Message send error                      |
| `RoomInviteEvent`               | `RoomInviteEventParser`            | Room invitation received                |
| `AccountPreferencesEvent`       | -                                  | User preferences (room invites ignored) |
| `HabboGroupDetailsMessageEvent` | -                                  | Group room details for following        |
| `class_756`                     | -                                  | MiniMail new message                    |
| `class_307`                     | `class_1288`                       | MiniMail unread count                   |

### Outgoing (Client -> Server)
| Composer                              | Purpose                                             |
|---------------------------------------|-----------------------------------------------------|
| `SendMsgMessageComposer`              | Send chat message (userId, message, confirmationId) |
| `GetMessengerHistoryComposer`         | Request message history                             |
| `FollowFriendMessageComposer`         | Follow friend to room                               |
| `GetHabboGroupDetailsMessageComposer` | Get group room info                                 |
| `GetExtendedProfileMessageComposer`   | Open user profile                                   |
| `OpenFlatConnectionMessageComposer`   | Enter room                                          |
| `EventLogMessageComposer`             | Analytics tracking                                  |

---

## Key Business Logic to Port

1. **Message confirmation flow**: Messages sent with `awaitConfirmationId`, confirmed by server with `confirmationId` in response
2. **Message combining**: Messages within 10 minutes (`COMBINE_MESSAGING_THRESHOLD = 600000ms`) from same sender can be grouped
3. **History pagination**: Fetch history in chunks, tracked by `messageId` of oldest message
4. **Rate limiting**: `_historyFetchesTimestamps` prevents spam requests (4 second cooldown)
5. **Online/offline notifications**: Track friend status changes and display info messages
6. **Group chat support**: Negative IDs indicate group conversations (badge display instead of avatar)

---

## Migration Notes

1. **State to port**: Conversation history, pending messages, confirmed message IDs, unread status
2. **Events to emit**: `ActiveConversationEvent` equivalent for SolidJS reactive updates
3. **Interface to implement**: `IHabboMessenger` methods as TypeScript service
4. **Data models**: `ChatEntry` as TypeScript interface/class
