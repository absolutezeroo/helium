# Campaign Architecture Documentation

This document categorizes all AS3 campaign files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Description                                               |
|----------|-------|-----------------------------------------------------------|
| ENGINE   | 2     | Campaign data, calendar state logic, server communication |
| VIEW     | 3     | Calendar UI rendering, animations, visual effects         |

---

## ENGINE FILES (We Need These)

| AS3 File                   | Purpose                                                                                                                                                                                                                                                                                          | Status |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `HabboCampaigns.as`        | Core campaign manager component. Handles server communication (OpenCampaignCalendarDoorComposer, CampaignCalendarDataMessageEvent, CampaignCalendarDoorOpenedMessageEvent), manages campaign data state, processes door opening logic, and provides link event handling for calendar navigation. | TODO   |
| `calendar/CalendarItem.as` | Calendar item state logic. Contains day state constants (STATE_UNLOCKED, STATE_LOCKED_AVAILABLE, STATE_LOCKED_EXPIRED, STATE_LOCKED_FUTURE) and pure logic function `resolveDayState()` that determines calendar item state based on campaign data.                                              | TODO   |

## VIEW FILES (We Ignore These)

| AS3 File                          | Purpose                                                                                                                                                                                    |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `calendar/CalendarView.as`        | Main calendar UI window. Handles modal dialog creation, resize events, scroll positioning, input handling (button clicks), and visual state updates. SolidJS will handle all UI rendering. |
| `calendar/CalendarItemWiggle.as`  | Animation effect for calendar items. Creates a bounce/wiggle animation using Timer-based position updates. Pure visual effect for UI feedback.                                             |
| `calendar/CalendarSpinnerUtil.as` | Gradient overlay rendering for calendar scroller. Creates gradient masks using BitmapData and Sprite graphics. Pure visual effect for scroll indicators.                                   |

---

## Detailed Analysis

### HabboCampaigns.as
**Category: ENGINE**

This is the main campaign manager component. Key responsibilities:
- **Server Communication**: Registers handlers for `CampaignCalendarDataMessageEvent` and `CampaignCalendarDoorOpenedMessageEvent`
- **Opening Calendar Doors**: Sends `OpenCampaignCalendarDoorComposer` or `OpenCampaignCalendarDoorAsStaffComposer` to open calendar gifts
- **Campaign Data Storage**: Stores campaign data in `class_1641` (campaignDays, currentDay, campaignName, openedDays, missedDays)
- **Product Notification**: Handles received products, updates opened days list, requests furniture icons from room engine
- **Link Event Tracking**: Implements `ILinkEventTracker` to handle "openView/calendar" links

**Dependencies:**
- `IHabboCommunicationManager` - Server messaging
- `ISessionDataManager` - Product and furniture data lookup
- `IHabboWindowManager` - Window creation (VIEW - passed to CalendarView)
- `IHabboLocalizationManager` - Localization strings
- `IHabboCatalog` - Catalog integration
- `IRoomEngine` - Furniture icon retrieval

### calendar/CalendarItem.as
**Category: ENGINE (Partial)**

Contains both engine logic and view population code. We need only the state logic:

**Engine Logic (We Need):**
- `STATE_UNLOCKED = 1` - Day has been opened
- `STATE_LOCKED_AVAILABLE = 2` - Day can be opened today
- `STATE_LOCKED_EXPIRED = 3` - Day was missed
- `STATE_LOCKED_FUTURE = 4` - Day is in the future
- `resolveDayState(data, dayIndex)` - Pure function that determines day state:
  - If day in `openedDays` -> UNLOCKED
  - If day > `currentDay` -> FUTURE
  - If day in `missedDays` -> EXPIRED
  - Otherwise -> AVAILABLE

**View Logic (We Ignore):**
- `populateItem()` - Clones and configures window containers
- `updateState()` - Updates visual state, triggers wiggle
- `updateThumbnail()` - Updates thumbnail bitmap display
- `showWiggleEffect()` - Creates wiggle animation

### calendar/CalendarView.as
**Category: VIEW**

Main calendar UI implementation:
- Creates modal dialog from XML template
- Populates item list with calendar day items
- Handles resize events for responsive layout
- Processes button input (present click, navigation, close)
- Manages scroll position and selection state
- Creates gradient overlays via CalendarSpinnerUtil
- Displays received product info

### calendar/CalendarItemWiggle.as
**Category: VIEW**

Pure animation class for visual feedback:
- Timer-based animation loop (80ms interval)
- Bounces window up and down with decreasing amplitude
- 7 bounce iterations before stopping
- Uses sine-based movement calculation

### calendar/CalendarSpinnerUtil.as
**Category: VIEW**

Gradient overlay utility for scroll indicators:
- Creates horizontal gradient overlays using BitmapData
- Draws gradient fills using Sprite graphics
- Updates based on scroll position

---

## Communication Messages

### Outgoing
- `OpenCampaignCalendarDoorComposer(campaignName, dayIndex)` - Open a calendar door as regular user
- `OpenCampaignCalendarDoorAsStaffComposer(campaignName, dayIndex)` - Force open any door as staff

### Incoming
- `CampaignCalendarDataMessageEvent` - Campaign data (days, current day, opened/missed days)
- `CampaignCalendarDoorOpenedMessageEvent` - Door opened result (productName, customImage, furnitureClassName)

---

## Data Models

### class_1641 (CampaignCalendarData)
Campaign data structure (parsed from CampaignCalendarDataMessageEventParser):
- `campaignDays: int` - Total number of days in campaign
- `currentDay: int` - Current active day (0-indexed)
- `campaignName: String` - Campaign identifier (e.g., "summer", "advent")
- `openedDays: Vector.<int>` - Days already opened by user
- `missedDays: Vector.<int>` - Days that expired without being opened

---

## TypeScript Migration Notes

When porting to TypeScript/SolidJS:

1. **HabboCampaigns** - Convert to a service class or singleton. Key methods:
   - `openPackage(dayIndex)` - Send door open request
   - `openPackageAsStaff(dayIndex)` - Staff force open
   - `onCalendarData(data)` - Handle incoming data
   - `onDoorOpened(result)` - Handle door opened response

2. **CalendarItem State Logic** - Extract as pure TypeScript:
   ```typescript
   export enum CalendarDayState {
     UNLOCKED = 1,
     LOCKED_AVAILABLE = 2,
     LOCKED_EXPIRED = 3,
     LOCKED_FUTURE = 4
   }

   export function resolveDayState(
     openedDays: number[],
     missedDays: number[],
     currentDay: number,
     dayIndex: number
   ): CalendarDayState {
     if (openedDays.includes(dayIndex)) return CalendarDayState.UNLOCKED;
     if (dayIndex > currentDay) return CalendarDayState.LOCKED_FUTURE;
     if (missedDays.includes(dayIndex)) return CalendarDayState.LOCKED_EXPIRED;
     return CalendarDayState.LOCKED_AVAILABLE;
   }
   ```

3. **Campaign Store** - Create SolidJS store for reactive state:
   ```typescript
   interface CampaignStore {
     isOpen: boolean;
     campaignData: CampaignCalendarData | null;
     selectedDay: number;
     receivedProduct: ProductData | null;
   }
   ```

4. **Events** - Replace Flash events with:
   - TypeScript event emitter for internal communication
   - SolidJS signals for reactive UI updates

5. **Link Event Handling** - Integrate with application's link/route system for "openView/calendar" navigation.

---

## Architecture Pattern

### AS3 Architecture
```
HabboCampaigns (Component)
    |-- ILinkEventTracker (handles "openView/calendar")
    |-- class_1641 (campaign data)
    |-- CalendarView (VIEW - displays calendar UI)
        |-- CalendarItem (state logic + view population)
        |-- CalendarItemWiggle (animation)
        |-- CalendarSpinnerUtil (gradient overlays)
```

### Our TypeScript Architecture
```
CampaignService (injectable singleton)
    |-- Campaign message handlers
    |-- Campaign data state
    |-- Event emitter for state changes

campaignStore (SolidJS reactive store)
    |-- Listens to CampaignService events
    |-- Exposes reactive signals to UI components

CalendarDayState (enum + pure functions)
    |-- resolveDayState() logic
```
