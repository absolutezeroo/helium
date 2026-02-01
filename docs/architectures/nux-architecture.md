# NUX (New User Experience) Architecture Documentation

This document categorizes all AS3 NUX (tutorial system) files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                    |
|----------|-------|--------------------------------------------------------------------------------|
| ENGINE   | 1     | Business logic, message handlers, state management, tutorial flow coordination |
| VIEW     | 3     | UI dialogs and views for tutorial prompts                                      |

---

## ENGINE FILES (We Need These)

| AS3 File             | Purpose                                                                                                                                                                                                                                                                                                                                                                  | Status |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `HabboNuxDialogs.as` | Core NUX component. Handles server communication for tutorial messages (`NewUserExperienceNotCompleteEvent`, `NewUserExperienceGiftOfferEvent`), manages tutorial state, coordinates gift selection flow, handles link events (`nux/lobbyoffer`), integrates with room sessions to show lobby offers to new users, and manages phone verification prompts for old users. | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File                  | Purpose                                                                                                                                                                        |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NuxGiftSelectionView.as` | Multi-step gift selection dialog UI. Displays gift options with thumbnails, handles user selection clicks, builds window from XML asset. Pure view logic with button handlers. |
| `NuxNoobRoomOfferView.as` | Lobby offer dialog for new users. Shows popup offering to visit "noob lobby" room, positioned at screen corner. Simple close/go button handlers.                               |
| `NuxOfferOldUserView.as`  | Returning user offer dialog. Shows skip/verify buttons for phone number verification prompt. Delegates actions to parent controller.                                           |

---

## Detailed Analysis

### HabboNuxDialogs.as
**Category: ENGINE**

This is the main NUX component that coordinates the new user experience tutorial system. Key responsibilities:

- **Server Communication**:
  - Handles `NewUserExperienceNotCompleteEvent` - triggers when user hasn't completed NUX
  - Handles `NewUserExperienceGiftOfferEvent` - receives gift selection options
  - Sends `NewUserExperienceGetGiftsMessageComposer` - submits selected gifts
  - Sends `SetPhoneNumberVerificationStatusMessageComposer` - handles phone verification
  - Sends `EventLogMessageComposer` - tracks NUX analytics events

- **Link Event Handling**: Listens for `nux/lobbyoffer/show` links to trigger lobby offers

- **Room Session Integration**: Monitors room session events to show lobby popup when new users enter their home room (after configurable delay)

- **Configuration Dependencies**:
  - `nux.lobbies.enabled` - Feature flag for lobby offers
  - `nux.noob.lobby.popup.delay` - Delay before showing lobby popup (default 70 seconds)

- **State Management**:
  - Tracks `isRealNoob` status from session data
  - Manages lifecycle of child views (create/destroy)
  - Handles timer for delayed popup display

### NuxGiftSelectionView.as
**Category: VIEW**

Multi-step gift selection dialog that displays available gift options:
- Loads UI from `nux_gift_selection_xml` XML asset
- Displays gift options in scrollable list with thumbnails and product names
- Handles multi-step selection (day/step progression)
- Uses product data for localized names
- Pure UI rendering and user interaction handling

### NuxNoobRoomOfferView.as
**Category: VIEW**

Simple popup dialog for new users:
- Loads UI from `nux_noob_room_offer_xml` XML asset
- Positioned at fixed offset (20, 20)
- "Go" button triggers link event to navigate to predefined noob lobby
- "Close" button dismisses the popup
- Pure UI rendering

### NuxOfferOldUserView.as
**Category: VIEW**

Dialog for returning users who haven't completed verification:
- Loads UI from `nux_offer_old_user_xml` XML asset
- Centered on screen, close button hidden
- "Skip" button triggers rejection flow (confirmation dialog)
- "Go" button triggers verification flow
- Delegates all actions to parent `HabboNuxDialogs` controller

---

## TypeScript Migration Notes

When porting to TypeScript/SolidJS:

1. **HabboNuxDialogs** - Convert to a service/manager class:
   - Message handling integrates with existing communication layer
   - Replace Flash Timer with `setTimeout`/`setInterval`
   - Replace link event system with your routing/event system
   - Session data integration via existing session manager
   - Emit events for UI state changes (SolidJS store listens)

2. **Views** - Replaced entirely by SolidJS components:
   - `NuxGiftSelectionDialog.tsx` - Gift selection modal
   - `NuxLobbyOfferPopup.tsx` - Lobby offer notification
   - `NuxVerificationDialog.tsx` - Phone verification prompt

3. **State Management**:
   ```typescript
   // Example store structure
   interface NuxStore {
     showGiftSelection: boolean;
     giftOptions: GiftOption[];
     currentStep: number;
     totalSteps: number;
     showLobbyOffer: boolean;
     showVerificationPrompt: boolean;
   }
   ```

4. **Message Types to Implement**:
   - Incoming: `NewUserExperienceNotCompleteEvent`, `NewUserExperienceGiftOfferEvent`
   - Outgoing: `NewUserExperienceGetGiftsMessageComposer`, `SetPhoneNumberVerificationStatusMessageComposer`

---

## Communication Messages

### Incoming
| Message                             | Purpose                                            |
|-------------------------------------|----------------------------------------------------|
| `NewUserExperienceNotCompleteEvent` | Server indicates user hasn't finished NUX tutorial |
| `NewUserExperienceGiftOfferEvent`   | Server sends available gift options for selection  |

### Outgoing
| Message                                           | Purpose                                                    |
|---------------------------------------------------|------------------------------------------------------------|
| `NewUserExperienceGetGiftsMessageComposer`        | Submit user's gift selections (day, step, option index)    |
| `SetPhoneNumberVerificationStatusMessageComposer` | Update phone verification status (0=verify, 2=never again) |
| `EventLogMessageComposer`                         | Track NUX-related analytics events                         |

---

## Architecture Pattern

### AS3 Architecture
```
HabboNuxDialogs (Component)
    ├── Handles incoming NUX messages
    ├── Manages view lifecycle
    ├── NuxGiftSelectionView (VIEW)
    ├── NuxNoobRoomOfferView (VIEW)
    └── NuxOfferOldUserView (VIEW)
```

### Our TypeScript Architecture
```
NuxManager (service/singleton)
    ├── Handles incoming NUX messages
    ├── Emits state change events
    └── Coordinates tutorial flow

nuxStore (SolidJS reactive store)
    ├── Listens to NuxManager events
    └── Exposes reactive signals to UI

SolidJS Components (separate)
    ├── NuxGiftSelectionDialog
    ├── NuxLobbyOfferPopup
    └── NuxVerificationDialog
```
