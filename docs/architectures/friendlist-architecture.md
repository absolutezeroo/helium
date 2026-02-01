# Friend List Architecture Documentation

This document categorizes all AS3 friendlist files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                                 |
|----------|-------|---------------------------------------------------------------------------------------------|
| ENGINE   | 18    | Friend data models, relationship management, friend requests, search results, events, enums |
| VIEW     | 21    | UI rendering, window management, tab views, alerts, popups                                  |

---

## ENGINE FILES (We Need These)

| AS3 File                                 | Purpose                                                                                                                       | Status |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|--------|
| `domain/Friend.as`                       | Core friend data model - stores id, name, gender, online status, figure, motto, categoryId, relationshipStatus, etc.          | TODO   |
| `domain/FriendCategory.as`               | Category model for organizing friends (online/offline/custom) - manages friend lists within categories, sorting, pagination   | TODO   |
| `domain/FriendCategories.as`             | Collection manager for all friend categories - handles friend list updates, add/remove friends, category management           | TODO   |
| `domain/FriendRequest.as`                | Friend request data model - stores requestId, requesterName, requesterUserId, state (open/accepted/declined/failed)           | TODO   |
| `domain/FriendRequests.as`               | Collection manager for friend requests - handles request operations, limits, clearing processed requests                      | TODO   |
| `domain/AvatarSearchResults.as`          | Search results storage - stores friends/others arrays from avatar search, tracks sent friend requests                         | TODO   |
| `domain/FriendListTab.as`                | Tab state model - stores tab id, name, selection state, new message flags (contains some view references but primarily state) | TODO   |
| `domain/FriendListTabs.as`               | Tab collection manager - manages tab selection, content dimensions, toggle logic                                              | TODO   |
| `domain/IFriendCategoriesDeps.as`        | Interface for friend categories dependencies - view, messenger, notifications accessors                                       | TODO   |
| `domain/class_3366.as`                   | Interface for search view dependency (ISearchView accessor)                                                                   | TODO   |
| `domain/class_3384.as`                   | Interface for friend requests view dependency (IFriendRequestsView accessor)                                                  | TODO   |
| `domain/class_3508.as`                   | Interface for tabs dependencies - getFriendList(), getWindowHeight()                                                          | TODO   |
| `IFriend.as`                             | Public interface for Friend - defines friend data accessors (id, name, gender, online, figure, relationshipStatus, etc.)      | TODO   |
| `IHabboFriendList.as`                    | Public interface for friend list component - defines all public API methods (open, close, getFriend, askForAFriend, etc.)     | TODO   |
| `RelationshipStatusEnum.as`              | Enum for relationship statuses - NONE, HEART, SMILE, BOBBA with string conversion                                             | TODO   |
| `class_3452.as`                          | Constants for view state and tab IDs - VIEW_CLOSED, TABID_FRIENDS, TABID_FRIEND_REQUESTS, TABID_SEARCH                        | TODO   |
| `events/FriendRequestEvent.as`           | Event class for friend request accept/decline - carries requestId                                                             | TODO   |
| `events/HabboFriendListTrackingEvent.as` | Tracking event constants - CLOSED, FRIENDS, SEARCH, REQUEST, MINIMIZED, MESSENGER                                             | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File                         | Purpose                                                                                                                                                                                                       |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HabboFriendList.as`             | Main component class - mixes ENGINE (message handling, friend management) and VIEW (window creation). Contains critical message handlers we need, but also heavy UI wiring. Consider extracting engine logic. |
| `FriendListView.as`              | Main friend list window - handles window positioning, resize events, tab content display, prepare/refresh cycles                                                                                              |
| `FriendListTabsView.as`          | Tab header rendering - draws tab headers, arrow icons, handles tab clicks, manages tab content containers                                                                                                     |
| `FriendsView.as`                 | Friends tab content - renders friend entries, category headers, handles click events, button states, pagination UI                                                                                            |
| `FriendRequestsView.as`          | Friend requests tab content - renders request entries, accept/decline buttons, accept/decline all functionality                                                                                               |
| `SearchView.as`                  | Search tab content - search input field, search results display, friend request button, chat button                                                                                                           |
| `AlertView.as`                   | Base class for alert popups - window positioning, close handling, content setup                                                                                                                               |
| `FriendRemoveView.as`            | Friend removal confirmation dialog - extends AlertView, sends RemoveFriendMessageComposer                                                                                                                     |
| `RoomInviteView.as`              | Room invitation dialog - extends AlertView, message input, sends SendRoomInviteMessageComposer                                                                                                                |
| `OpenedToWebPopup.as`            | Web redirect popup - shows brief "opened in browser" notification                                                                                                                                             |
| `RelationshipStatusSelector.as`  | Relationship selector dropdown - popup window for choosing heart/smile/bobba status                                                                                                                           |
| `FriendListColorScheme.as`       | UI color constants - selected entry colors, row shading, tab colors, text colors                                                                                                                              |
| `IFriendsView.as`                | Interface for friends view - refreshList(), setNewMessageArrived(), refreshed()                                                                                                                               |
| `IFriendRequestsView.as`         | Interface for friend requests view - add/remove/refresh request entries, accept/decline methods                                                                                                               |
| `ISearchView.as`                 | Interface for search view - refreshList(), setSearchStr(), focus()                                                                                                                                            |
| `ITabView.as`                    | Interface for tab views - init(), fillFooter(), fillList(), getEntryCount(), tabClicked()                                                                                                                     |
| `Util.as`                        | UI utility functions - array manipulation, window dimension calculations, child layout helpers                                                                                                                |
| `domain/FriendCategoriesDeps.as` | Dependency injection for FriendCategories - provides view, messenger, notifications from HabboFriendList                                                                                                      |
| `domain/FriendRequestsDeps.as`   | Dependency injection for FriendRequests - provides view from HabboFriendList tabs                                                                                                                             |
| `domain/AvatarSearchDeps.as`     | Dependency injection for AvatarSearchResults - provides search view from HabboFriendList tabs                                                                                                                 |
| `domain/FriendListTabsDeps.as`   | Dependency injection for FriendListTabs - provides friendList reference and window height                                                                                                                     |

---

## Notes

### HabboFriendList.as - Special Case
This file is the main component and contains both ENGINE and VIEW code:

**ENGINE logic to extract:**
- Message event handlers (`onFriendsListFragment`, `onMessengerInit`, `onFriendListUpdate`, `onFriendRequests`, `onNewFriendRequest`, etc.)
- Friend data management (`getFriend()`, `canBeAskedForAFriend()`, `askForAFriend()`)
- Friend count retrieval (`getFriendCount()`)
- Friend request management (`acceptFriendRequest()`, `declineFriendRequest()`, etc.)
- Relationship status management (`setRelationshipStatus()`, `getRelationshipStatus()`)
- Communication sending (`send()`)

**VIEW logic to ignore:**
- Window manager references
- Button/text refresh methods
- Window creation (`getXmlWindow()`, `getButton()`)
- View positioning and sizing

### Domain Models Are Clean
The `domain/` folder models (`Friend.as`, `FriendCategory.as`, `FriendRequest.as`, etc.) are mostly clean data models. However, they have `IWindowContainer view` properties for UI binding that should be excluded in our TypeScript implementation.

### Key Data Structures to Port

1. **Friend** - id, name, gender, online, followingAllowed, figure, motto, lastAccess, categoryId, realName, persistedMessageUser, pocketHabboUser, relationshipStatus, vipMember
2. **FriendCategory** - id, name, open, friends[], pageIndex, received (for sync)
3. **FriendRequest** - requestId, requesterName, requesterUserId, state
4. **AvatarSearchResults** - friends[], others[], friendRequestSent tracking

### Key Enums/Constants to Port

1. **RelationshipStatusEnum** - NONE(0), HEART(1), SMILE(2), BOBBA(3)
2. **FriendRequest states** - STATE_OPEN(1), STATE_ACCEPTED(2), STATE_DECLINED(3), STATE_FAILED(4)
3. **Tab IDs** - FRIENDS(1), FRIEND_REQUESTS(2), SEARCH(3)
4. **Category IDs** - CATID_ONLINE(0), CATID_OFFLINE(-1)
