# Advertisement Architecture Documentation

This document categorizes all AS3 advertisement files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth.

---

## Summary

| Category | Count | Description                                           |
|----------|-------|-------------------------------------------------------|
| ENGINE   | 5     | Business logic, data models, events, state management |
| VIEW     | 0     | No pure UI/rendering files in this module             |

---

## ENGINE FILES (We Need These)

| AS3 File                      | Purpose                                                                                                                                                                                                                                                                        | Status |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `AdManager.as`                | Core advertisement manager component. Handles interstitial ad logic, billboard image loading/caching, server communication (GetInterstitialMessageComposer, InterstitialMessageEvent), and dispatches AdEvent/InterstitialEvent. Manages ad image requests with deduplication. | TODO   |
| `AdImageRequest.as`           | Data model for ad image requests. Stores roomId, objectId, objectCategory, imageURL, and clickURL. Pure value object with getters.                                                                                                                                             | TODO   |
| `class_1811.as`               | Interface (IAdManager) defining the public API: events property, showInterstitial(), and loadRoomAdImage(). Used for dependency injection.                                                                                                                                     | TODO   |
| `events/AdEvent.as`           | Event class for room advertisement events. Carries image data (BitmapData), room/object IDs, URLs, and ad warning images. Event types: ROOM_AD_IMAGE_LOADED, ROOM_AD_IMAGE_LOADING_FAILED, ROOM_AD_SHOW.                                                                       | TODO   |
| `events/InterstitialEvent.as` | Event class for interstitial ad lifecycle. Carries status string. Event types: INTERSTITIAL_SHOW, INTERSTITIAL_NOT_SHOWN, INTERSTITIAL_COMPLETE.                                                                                                                               | TODO   |

## VIEW FILES (We Ignore These)

| AS3 File | Purpose                                         |
|----------|-------------------------------------------------|
| *(none)* | No pure UI/rendering files found in this module |

---

## Detailed Analysis

### AdManager.as
**Category: ENGINE**

This is the main advertisement manager component. Key responsibilities:
- **Server Communication**: Sends `GetInterstitialMessageComposer` and handles `InterstitialMessageEvent` responses
- **Interstitial Logic**: Determines if interstitials can be shown via config (`interstitials.2016.enabled`) and server response
- **Billboard Image Loading**: Loads ad images from URLs, caches them in asset library, handles load success/failure
- **Request Deduplication**: Tracks pending image requests to avoid duplicate loads for same room/object
- **Event Dispatching**: Fires `AdEvent` and `InterstitialEvent` for consumers to react to

Note: While it uses `BitmapData` and Flash display objects internally for image processing, these are for data manipulation (transparency emulation), not UI rendering. The actual display of ads happens elsewhere.

### AdImageRequest.as
**Category: ENGINE**

Simple immutable data model (value object) that encapsulates an ad image request:
- `roomId: int` - The room where the ad will be displayed
- `objectId: int` - The furniture object ID for billboard ads
- `objectCategory: int` - Category of the object
- `imageURL: String` - URL to load the ad image from
- `clickURL: String` - URL to navigate to when ad is clicked

### class_1811.as (IAdManager Interface)
**Category: ENGINE**

Interface contract for the ad manager, enabling dependency injection:
- `events: IEventDispatcher` - Access to event dispatcher for subscribing to ad events
- `showInterstitial(): void` - Trigger interstitial ad display flow
- `loadRoomAdImage(roomId, objectId, objectCategory, imageURL, clickURL): void` - Request loading of a room billboard ad

### events/AdEvent.as
**Category: ENGINE**

Custom event class for room advertisement events:
- **Event Types**: `ROOM_AD_IMAGE_LOADED`, `ROOM_AD_IMAGE_LOADING_FAILED`, `ROOM_AD_SHOW`
- **Data Carried**: image (BitmapData), roomId, objectId, objectCategory, imageUrl, clickUrl, adWarningL, adWarningR

### events/InterstitialEvent.as
**Category: ENGINE**

Custom event class for interstitial ad lifecycle:
- **Event Types**: `INTERSTITIAL_SHOW`, `INTERSTITIAL_NOT_SHOWN`, `INTERSTITIAL_COMPLETE`
- **Data Carried**: status (String)

---

## TypeScript Migration Notes

When porting to TypeScript/SolidJS:

1. **AdManager** - Convert to a service class or store. Replace Flash's `ExternalInterface.call` with standard JS/TS window messaging or remove if not needed.

2. **AdImageRequest** - Convert to a TypeScript interface or class.

3. **class_1811 (IAdManager)** - Convert to a TypeScript interface.

4. **Events** - Replace Flash Event classes with:
   - TypeScript event emitter pattern, or
   - SolidJS signals/stores for reactive state, or
   - Custom event types with callbacks

5. **BitmapData handling** - The image processing in AdManager (`emulateBackgroundTransparency`) can be done with HTML Canvas API or handled differently in modern web context.

6. **Communication** - The server message handling (`GetInterstitialMessageComposer`, `InterstitialMessageEvent`) should integrate with the existing Nitro-style communication layer.
