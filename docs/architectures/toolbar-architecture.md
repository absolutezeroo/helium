# Toolbar Architecture Documentation

This document categorizes all AS3 toolbar files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                             |
|----------|-------|-------------------------------------------------------------------------|
| ENGINE   | 18    | State management, events, enums, interfaces, business logic controllers |
| VIEW     | 18    | Visual rendering, window management, UI components, bitmap handling     |

---

## ENGINE FILES (We Need These)

| AS3 File                                   | Purpose                                                                                                                  | Status |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------|
| `toolbar/HabboToolbar.as`                  | Main toolbar component - state management, event handling, extension lifecycle, feature flags, communication with server | TODO   |
| `toolbar/HabboToolbarEnum.as`              | Toolbar state constants (HOTEL_VIEW, ROOM_VIEW, HIDDEN, COLLAPSED, etc.)                                                 | TODO   |
| `toolbar/HabboToolbarIconEnum.as`          | Icon identifier constants and name mapping (NAVIGATOR, CATALOGUE, INVENTORY, etc.)                                       | TODO   |
| `toolbar/IHabboToolbar.as`                 | Toolbar interface - public API contract (events, state, icons)                                                           | TODO   |
| `toolbar/IExtensionView.as`                | Extension view interface - attach/detach extensions, visibility control                                                  | TODO   |
| `toolbar/ToolbarDisplayExtensionIds.as`    | Extension ID constants (purse, settings, club_promo, video_offers, etc.)                                                 | TODO   |
| `toolbar/class_3422.as`                    | Category enum constants (SOCIAL, GROUP, QUEST, GAME)                                                                     | TODO   |
| `toolbar/class_3571.as`                    | Toolbar slot position constants (PURSE, SETTINGS, CREDITS, CLUB, etc.)                                                   | TODO   |
| `toolbar/events/HabboToolbarEvent.as`      | Toolbar event class - click events, icon IDs, camera launch origins                                                      | TODO   |
| `toolbar/events/ExtensionViewEvent.as`     | Extension view resize event                                                                                              | TODO   |
| `toolbar/memenu/MeMenuController.as`       | Me menu state management - visibility toggle, navigation actions, unseen counts                                          | TODO   |
| `toolbar/memenu/MeMenuNewController.as`    | New me menu controller - feature flags, visibility logic, unseen item tracking                                           | TODO   |
| `toolbar/memenu/MeMenuIconLoader.as`       | Avatar icon loading logic - listens for user/figure changes, updates icon                                                | TODO   |
| `toolbar/memenu/MeMenuNewIconLoader.as`    | New avatar icon loader - similar to MeMenuIconLoader with FigureUpdateEvent                                              | TODO   |
| `toolbar/extensions/PurseAreaExtension.as` | Purse area logic - credit/point balance handling, club area, icon locations                                              | TODO   |
| `toolbar/extensions/SettingsExtension.as`  | Settings menu logic - button management, navigation to sub-settings                                                      | TODO   |
| `toolbar/extensions/purse/class_3491.as`   | Currency indicator interface - dispose, window, registerUpdateEvents                                                     | TODO   |
| `toolbar/offers/OfferExtension.as`         | Offer system logic - video offers, rewards indication, visibility state                                                  | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File                                                           | Purpose                                                                                      |
|--------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `toolbar/BottomBackgroundBorder.as`                                | Visual background border rendering - window positioning, resize handling                     |
| `toolbar/BottomBarLeft.as`                                         | Left toolbar bar visual - icon rendering, hover states, animations, window building from XML |
| `toolbar/ToolbarView.as`                                           | Main toolbar visual rendering - icon states, hover effects, label visibility, animations     |
| `toolbar/ExtensionView.as`                                         | Extension container visual - item list window management, layout positioning                 |
| `toolbar/extensions/CitizenshipVipDiscountPromoExtension.as`       | VIP discount promo window - visual creation, min/max toggle, timer UI                        |
| `toolbar/extensions/CitizenshipVipQuestsPromoExtension.as`         | VIP quests promo window - visual creation, button rendering                                  |
| `toolbar/extensions/ClubDiscountPromoExtension.as`                 | Club discount promo visual - window creation, animations, text rendering                     |
| `toolbar/extensions/VideoOfferExtension.as`                        | Video offer promo visual - window creation, mouse events, text colors                        |
| `toolbar/extensions/purse/CurrencyIndicatorBase.as`                | Base currency indicator visual - window creation, icon animation, overlay effects            |
| `toolbar/extensions/purse/PurseClubArea.as`                        | Club area visual - icon rendering, amount display, bounce animation                          |
| `toolbar/extensions/purse/indicators/SeasonalCurrencyIndicator.as` | Seasonal currency visual - icon styling, color theming, text display                         |
| `toolbar/extensions/settings/OtherSettingsView.as`                 | Other settings visual - checkbox rendering, button events                                    |
| `toolbar/extensions/settings/SoundSettingsView.as`                 | Sound settings visual - volume sliders, button rendering                                     |
| `toolbar/extensions/settings/SoundSettingsItem.as`                 | Sound settings item visual - slider rendering, icon states                                   |
| `toolbar/memenu/MeMenuSettingsMenuView.as`                         | Me menu settings visual - button layout, window positioning                                  |
| `toolbar/memenu/chatsettings/MeMenuChatSettingsView.as`            | Chat settings visual - checkbox rendering, window positioning                                |
| `toolbar/memenu/soundsettings/MeMenuSoundSettingsView.as`          | Sound settings visual - volume containers, button rendering                                  |
| `toolbar/memenu/soundsettings/MeMenuSoundSettingsItem.as`          | Sound settings item visual - slider, icon bitmap states                                      |
| `toolbar/memenu/soundsettings/MeMenuSoundSettingsSlider.as`        | Volume slider visual - drag handling, position calculation                                   |

---

## Detailed Analysis

### ENGINE Files Breakdown

#### Core Toolbar Components
- **HabboToolbar.as** - The main component that orchestrates everything. Contains:
  - Component dependencies (catalog, inventory, messenger, navigator, etc.)
  - Event dispatching for toolbar clicks
  - State management (setToolbarState)
  - Extension initialization (purse, settings, seasonal currency, VIP promos)
  - Server communication (EventLogMessageComposer)
  - Feature flag checks (getBoolean, getProperty)

- **HabboToolbarEnum.as** - State constants:
  - `HTE_STATE_HOTEL_VIEW`, `HTE_STATE_ROOM_VIEW`, `HTE_STATE_HIDDEN`, `HTE_STATE_COLLAPSED`
  - `HTE_STATE_NOOB_NOT_HOME`, `HETE_STATE_NOOB_HOME`, `HTE_STATE_GAME_CENTER_VIEW`

- **HabboToolbarIconEnum.as** - Icon identifiers:
  - `HTIE_ICON_HELP`, `HTIE_ICON_NAVIGATOR`, `HTIE_ICON_CATALOGUE`, `HTIE_ICON_INVENTORY`
  - `HTIE_ICON_QUESTS`, `HTIE_ICON_MEMENU`, `HTIE_ICON_GAMES`, `HTIE_ICON_CAMERA`, etc.

#### Event System
- **HabboToolbarEvent.as** - Events with:
  - `TOOLBAR_CLICK`, `GROUP_ROOM_INFO_CLICK`, `RESIZED`, `CAMERA_TOGGLE`
  - Camera launch origins: `roomToolsMenu`, `chatCameraCommand`, `toolBarCameraIcon`

#### Me Menu Logic
- **MeMenuController.as** / **MeMenuNewController.as** - Handle:
  - Profile viewing (GetExtendedProfileMessageComposer)
  - Room navigation (showOwnRooms)
  - Talent track (GetTalentTrackMessageComposer)
  - Achievement display
  - Guide tool visibility (USE_GUIDE_TOOL perk)
  - Unseen item counts (achievements, minimail, forums)

#### Extension Logic
- **PurseAreaExtension.as** - Handles:
  - Credit/point balance updates (PurseEvent)
  - Club area management
  - Button clicks (vault, club join, help, settings, logout)

### VIEW Files Breakdown

All VIEW files share common patterns:
- Window creation from XML assets
- Event listeners for mouse events (WME_CLICK, WME_OVER, WME_OUT)
- Icon state management (_hover, _normal)
- Position/size calculations
- Animation handling (DropBounce, EaseOut, JumpBy)
- Bitmap manipulation for icons

These are handled by SolidJS in our implementation.

---

## Migration Notes

### Key State to Preserve
1. **Toolbar State**: Current view mode (hotel, room, hidden, collapsed)
2. **Extension Visibility**: Which extensions are attached/visible
3. **Unseen Counts**: Achievement, minimail, forum, inventory counts
4. **Feature Flags**: Games enabled, guides enabled, talent track, etc.
5. **Icon Visibility**: Per-icon visibility based on state and permissions

### Key Events to Implement
1. `HTE_TOOLBAR_CLICK` - Icon click with iconId
2. `HTE_RESIZED` - Toolbar size changed
3. `HTE_ICON_CAMERA` - Camera toggle
4. `EVE_EXTENSION_VIEW_RESIZED` - Extension area resized

### Server Messages Used
- `GetExtendedProfileMessageComposer` - View profile
- `GetTalentTrackMessageComposer` - View talents
- `EventLogMessageComposer` - Analytics tracking
- `SetRoomCameraPreferencesMessageComposer` - Camera settings
- `SetIgnoreRoomInvitesMessageComposer` - Room invite settings
- `GetHabboClubExtendOfferMessageComposer` - Club offers
- `StartCampaignMessageComposer` - Campaign quests
