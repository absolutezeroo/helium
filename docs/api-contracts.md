# API Contracts (Habbo Protocol)

> Generated: 2026-01-31 | Scan Level: Exhaustive

## Overview

Helium implements the Habbo WebSocket protocol for client-server communication. Messages are binary-encoded with a header containing message ID and length.

## Message Structure

### Binary Format

```
┌──────────────┬──────────────┬─────────────────┐
│ Length (4B)  │ MsgID (2B)   │ Payload (var)   │
└──────────────┴──────────────┴─────────────────┘
```

- **Length:** 4-byte big-endian integer (includes header)
- **MsgID:** 2-byte big-endian integer (message identifier)
- **Payload:** Variable-length data (strings, ints, etc.)

### Data Types

| Type    | Format                     | Read Method     |
|---------|----------------------------|-----------------|
| Int     | 4-byte big-endian          | `readInt()`     |
| Short   | 2-byte big-endian          | `readShort()`   |
| Byte    | 1-byte                     | `readByte()`    |
| String  | 2-byte length + UTF-8 data | `readString()`  |
| Boolean | 1-byte (0 or 1)            | `readBoolean()` |
| Long    | 8-byte big-endian          | `readLong()`    |

## Incoming Messages (Server → Client)

### Handshake

| ID   | Event Class                           | Description                |
|------|---------------------------------------|----------------------------|
| 771  | `InitDiffieHandshakeMessageEvent`     | DH key exchange initiation |
| 3777 | `CompleteDiffieHandshakeMessageEvent` | DH key exchange completion |
| 2323 | `AuthenticationOKMessageEvent`        | Authentication successful  |
| 3974 | `UniqueMachineIdMessageEvent`         | Machine ID verification    |
| 4000 | `DisconnectReasonMessageEvent`        | Server disconnect reason   |
| 3129 | `IsFirstLoginOfDayMessageEvent`       | First login flag           |

### Session

| ID   | Event Class                 | Description                 |
|------|-----------------------------|-----------------------------|
| 658  | `PingMessageEvent`          | Keep-alive ping from server |
| 598  | `GenericErrorMessageEvent`  | Generic error response      |
| 1416 | `UserRightsMessageEvent`    | User permission levels      |
| 3048 | `UserObjectMessageEvent`    | User profile data           |
| 1916 | `NoobnessLevelMessageEvent` | New user level indicator    |

### Availability

| ID   | Event Class                      | Description               |
|------|----------------------------------|---------------------------|
| 3449 | `AvailabilityStatusMessageEvent` | Hotel availability status |

### Avatar

| ID  | Event Class                | Description          |
|-----|----------------------------|----------------------|
| 836 | `FigureUpdateMessageEvent` | Avatar figure update |

### Navigator

| ID   | Event Class                              | Description               |
|------|------------------------------------------|---------------------------|
| 895  | `NavigatorSettingsMessageEvent`          | Navigator settings        |
| 2676 | `FavouritesMessageEvent`                 | Favorite rooms list       |
| 2668 | `FavouriteChangedMessageEvent`           | Favorite added/removed    |
| 3963 | `GetGuestRoomResultMessageEvent`         | Room data response        |
| 2913 | `GuestRoomSearchResultMessageEvent`      | Room search results       |
| 1256 | `UserFlatCatsMessageEvent`               | User room categories      |
| 2753 | `UserEventCatsMessageEvent`              | Event categories          |
| 2470 | `PopularRoomTagsResultMessageEvent`      | Popular room tags         |
| 2912 | `OfficialRoomsMessageEvent`              | Official rooms list       |
| 2632 | `CategoriesWithVisitorCountMessageEvent` | Category visitor counts   |
| 3282 | `CanCreateRoomMessageEvent`              | Room creation permission  |
| 3736 | `CanCreateRoomEventMessageEvent`         | Event creation permission |
| 2389 | `FlatCreatedMessageEvent`                | Room created confirmation |
| 2454 | `RoomRatingMessageEvent`                 | Room rating               |
| 2340 | `RoomInfoUpdatedMessageEvent`            | Room info changed         |
| 2074 | `DoorbellMessageEvent`                   | Doorbell notification     |
| 1818 | `RoomEventMessageEvent`                  | Room event data           |
| 3720 | `RoomEventCancelMessageEvent`            | Event cancelled           |
| 1882 | `FlatAccessDeniedMessageEvent`           | Room access denied        |
| 2870 | `ConvertedRoomIdMessageEvent`            | Room ID conversion        |
| 3954 | `CompetitionRoomsDataMessageEvent`       | Competition rooms         |

### Notifications

| ID   | Event Class                  | Description            |
|------|------------------------------|------------------------|
| 2875 | `ActivityPointsMessageEvent` | Activity points update |
| 114  | `InfoFeedEnableMessageEvent` | Info feed status       |

### Inventory

| ID   | Event Class                     | Description           |
|------|---------------------------------|-----------------------|
| 464  | `FigureSetIdsMessageEvent`      | Available figure sets |
| 1196 | `AchievementsScoreMessageEvent` | Achievement score     |
| 1119 | `AvatarEffectsMessageEvent`     | Avatar effects list   |

### Mystery Box

| ID  | Event Class                  | Description      |
|-----|------------------------------|------------------|
| 351 | `MysteryBoxKeysMessageEvent` | Mystery box keys |

### Catalog

| ID   | Event Class                                  | Description          |
|------|----------------------------------------------|----------------------|
| 3907 | `BuildersClubSubscriptionStatusMessageEvent` | Builders club status |

## Outgoing Messages (Client → Server)

### Handshake

| ID   | Composer Class                           | Description            |
|------|------------------------------------------|------------------------|
| 4000 | `ClientHelloMessageComposer`             | Client hello handshake |
| 586  | `InitDiffieHandshakeMessageComposer`     | Init DH key exchange   |
| 2616 | `CompleteDiffieHandshakeMessageComposer` | Complete DH exchange   |
| 2602 | `VersionCheckMessageComposer`            | Client version check   |
| 53   | `SSOTicketMessageComposer`               | SSO authentication     |
| 1390 | `UniqueIDMessageComposer`                | Device unique ID       |

### Session

| ID   | Composer Class                | Description              |
|------|-------------------------------|--------------------------|
| 2596 | `PongMessageComposer`         | Keep-alive pong response |
| 1113 | `DisconnectMessageComposer`   | Client disconnect        |
| 245  | `InfoRetrieveMessageComposer` | Request user info        |

### Tracking

| ID   | Composer Class            | Description   |
|------|---------------------------|---------------|
| 2297 | `EventLogMessageComposer` | Event logging |

### Navigator

| ID   | Composer Class                                | Description           |
|------|-----------------------------------------------|-----------------------|
| 2756 | `GetGuestRoomMessageComposer`                 | Get room data         |
| 2120 | `CreateFlatMessageComposer`                   | Create new room       |
| 1813 | `AddFavouriteRoomMessageComposer`             | Add to favorites      |
| 1897 | `DeleteFavouriteRoomMessageComposer`          | Remove from favorites |
| 2690 | `RoomTextSearchMessageComposer`               | Text search           |
| 3349 | `PopularRoomsSearchMessageComposer`           | Popular rooms search  |
| 1009 | `MyRoomsSearchMessageComposer`                | My rooms search       |
| 2476 | `MyFavouriteRoomsSearchMessageComposer`       | Favorite rooms search |
| 1637 | `GetOfficialRoomsMessageComposer`             | Official rooms        |
| 1075 | `CanCreateRoomMessageComposer`                | Check room creation   |
| 1184 | `GetUserFlatCatsMessageComposer`              | Get room categories   |
| 2913 | `GetUserEventCatsMessageComposer`             | Get event categories  |
| 2654 | `UpdateHomeRoomMessageComposer`               | Set home room         |
| 990  | `RateFlatMessageComposer`                     | Rate room             |
| 1283 | `ToggleStaffPickMessageComposer`              | Toggle staff pick     |
| 3338 | `GetPopularRoomTagsMessageComposer`           | Get popular tags      |
| 1211 | `MyFriendsRoomsSearchMessageComposer`         | Friends' rooms        |
| 1539 | `ForwardToSomeRoomMessageComposer`            | Forward to room       |
| 2366 | `ConvertGlobalRoomIdMessageComposer`          | Convert room ID       |
| 3479 | `CancelEventMessageComposer`                  | Cancel event          |
| 3413 | `EditEventMessageComposer`                    | Edit event            |
| 3898 | `CompetitionRoomsSearchMessageComposer`       | Competition search    |
| 2574 | `RoomsWithHighestScoreSearchMessageComposer`  | Top rated rooms       |
| 2296 | `RoomsWhereMyFriendsAreSearchMessageComposer` | Rooms with friends    |
| 3264 | `MyRoomHistorySearchMessageComposer`          | Room history          |
| 1832 | `MyFrequentRoomHistorySearchMessageComposer`  | Frequent rooms        |
| 2911 | `MyRoomRightsSearchMessageComposer`           | Rooms with rights     |
| 1355 | `MyGuildBasesSearchMessageComposer`           | Guild bases           |
| 1703 | `MyRecommendedRoomsMessageComposer`           | Recommended rooms     |
| 2628 | `GuildBaseSearchMessageComposer`              | Guild base search     |
| 1348 | `SetRoomSessionTagsMessageComposer`           | Set room tags         |
| 3779 | `RoomAdSearchMessageComposer`                 | Room ad search        |
| 2318 | `RemoveOwnRoomRightsRoomMessageComposer`      | Remove room rights    |
| 3785 | `RoomAdEventTabAdClickedComposer`             | Ad click tracking     |
| 3648 | `RoomAdEventTabViewedComposer`                | Ad view tracking      |

## Connection Handshake Flow

```
1. Client → Server: ClientHelloMessageComposer (4000)
2. Client → Server: InitDiffieHandshakeMessageComposer (586)
3. Server → Client: InitDiffieHandshakeMessageEvent (771)
   - Contains: prime, generator, server public key
4. Client → Server: CompleteDiffieHandshakeMessageComposer (2616)
   - Contains: client public key
5. Server → Client: CompleteDiffieHandshakeMessageEvent (3777)
   - Encryption now active
6. Client → Server: SSOTicketMessageComposer (53)
   - Contains: SSO ticket
7. Server → Client: AuthenticationOKMessageEvent (2323)
   - Login successful
8. Server → Client: UserObjectMessageEvent (3048)
   - User profile data
9. Server → Client: UserRightsMessageEvent (1416)
   - Permission levels
```

## Error Codes

| Code | Description                   |
|------|-------------------------------|
| 1    | Generic error                 |
| 4000 | Disconnect (server-initiated) |

## Usage Example

```typescript
// Sending a message
const composer = new RoomTextSearchMessageComposer('hotel');
connection.send(composer);

// Handling incoming message
manager.addMessageEvent(new GuestRoomSearchResultMessageEvent());
// Parser processes: wrapper.readInt(), wrapper.readString(), etc.
```
