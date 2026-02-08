# Utils Architecture Documentation

This document categorizes all AS3 utility files from `source_as_win63/habbo/util/` and `source_as_win63/habbo/utils/` into **ENGINE** (business logic we need to implement) and **VIEW** (UI code we ignore since SolidJS handles our UI).

> **Rule**: AS3 source in `source_as_win63/` is the source of truth. Follow it exactly.

---

## Summary

| Category          | Count | Description                                            |
|-------------------|-------|--------------------------------------------------------|
| ENGINE (Required) | 22    | Utility functions, data structures, animations, crypto |
| VIEW (Ignore)     | 6     | UI utilities, window management, icons                 |

---

## ENGINE FILES (We Need These)

### Core Utilities

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `Base64.as`                    | Base64 encoding/decoding utilities                   | `Base64.ts`                      | TODO   |
| `StringBuffer.as`              | Mutable string buffer with ByteArray backing         | `StringBuffer.ts`                | TODO   |
| `StringUtil.as`                | String manipulation utilities (trim, empty, etc.)    | `StringUtil.ts`                  | TODO   |
| `FixedSizeStack.as`            | Fixed-size circular buffer for integers              | `FixedSizeStack.ts`              | TODO   |
| `FriendlyTime.as`              | Human-readable time formatting (e.g., "5 mins ago")  | `FriendlyTime.ts`                | TODO   |

### Communication & Storage

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `CommunicationUtils.as`        | Login data storage, fingerprinting, XOR encryption   | `CommunicationUtils.ts`          | TODO   |
| `IEncryptedLocalStorage.as`    | Interface for encrypted local storage                | `IEncryptedLocalStorage.ts`      | TODO   |

### Avatar & Figure

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `FigureDataContainer.as`       | Avatar figure string parsing and manipulation        | `FigureDataContainer.ts`         | TODO   |

### Graphics & Canvas

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `Canvas.as`                    | BitmapData extension with quad/triangle drawing      | `Canvas.ts`                      | TODO   |
| `class_3543.as`                | Bitmap resampling with quality scaling               | `BitmapResampler.ts`             | TODO   |

### Math & Geometry

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `class_419.as`                 | Math utilities (normalize, lerp, clamp, map)         | `MathUtils.ts`                   | TODO   |

### Platform Detection

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `class_497.as`                 | Device/platform detection (iOS, Android, desktop)    | `PlatformUtils.ts`               | TODO   |

### Identification

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `class_3521.as`                | Builder Club ID detection utility                    | `BuilderClubUtils.ts`            | TODO   |

### AIR/Native Application

| AS3 File                         | Purpose                                       | TS Equivalent                | Status |
|----------------------------------|-----------------------------------------------|------------------------------|--------|
| `air/INativeApplicationProxy.as` | Interface for native app background execution | `INativeApplicationProxy.ts` | TODO   |
| `air/NativeApplicationEvents.as` | Native application event constants            | `NativeApplicationEvents.ts` | TODO   |

### Animation System

| AS3 File                       | Purpose                                              | TS Equivalent                    | Status |
|--------------------------------|------------------------------------------------------|----------------------------------|--------|
| `animation/class_65.as`        | IAnimatable interface (advanceTime)                  | `IAnimatable.ts`                 | TODO   |
| `animation/DelayedCall.as`     | Delayed function execution with pooling              | `DelayedCall.ts`                 | TODO   |
| `animation/Juggler.as`         | Animation manager, handles tweens and delayed calls  | `Juggler.ts`                     | TODO   |
| `animation/Transitions.as`     | Easing functions (linear, ease, bounce, elastic)     | `Transitions.ts`                 | TODO   |
| `animation/Tween.as`           | Property animation with transitions and callbacks    | `Tween.ts`                       | TODO   |
| `animation/TweenUtils.as`      | Helper methods for common alpha tweens               | `TweenUtils.ts`                  | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File                       | Purpose                                              | Reason Ignored                   |
|--------------------------------|------------------------------------------------------|----------------------------------|
| `VisitUserUtil.as`             | UI click handler for visiting user rooms             | UI event binding                 |
| `class_3527.as`                | User info region mouse hover state management        | UI state management              |
| `HabboWebTools.as`             | External interface calls for web page interactions   | Browser-specific, Flash external |
| `InfoText.as`                  | Text field with placeholder info text                | UI component wrapper             |
| `LoadingIcon.as`               | Animated loading spinner icon                        | UI visual component              |
| `TextWindowUtils.as`           | HTML link styling for text windows                   | UI styling utility               |
| `WindowToggle.as`              | Window visibility toggle with desktop management     | UI window management             |

---

## Detailed File Analysis

### Base64.as

**Category**: ENGINE

**Purpose**: Base64 decoding utilities using ByteArray for efficient byte manipulation.

**Key Methods**:
- `decode(str)` - Decode Base64 string to UTF string
- `decodeToByteArray(str)` - Decode Base64 string to ByteArray

**Implementation Notes**:
- Uses pre-computed decode character lookup table
- Handles padding (`=`) correctly
- Should use native `atob()`/`btoa()` in TypeScript or a proper library

---

### StringBuffer.as

**Category**: ENGINE

**Purpose**: Mutable string buffer backed by ByteArray, providing efficient string manipulation operations similar to Java's StringBuilder.

**Key Methods**:
- `appendString/Char/Int/ByteArray()` - Various append methods
- `insertString/Char/Int()` - Insert at position
- `indexOf/lastIndexOf()` - Search operations
- `replace/replaceChar()` - Replacement operations
- `substring/substr/subbuf()` - Extraction operations
- `reverse()` - Reverse buffer contents
- `clear/reset()` - Clear buffer

**Implementation Notes**:
- Uses dual buffers (main and back buffer) for efficient insertions
- Position tracking for writing
- In TypeScript, consider using array-based implementation or native string operations

---

### StringUtil.as

**Category**: ENGINE

**Purpose**: Common string manipulation utilities.

**Key Methods**:
- `addLeftZeroPadding(str, length)` - Pad string with leading zeros
- `stripFontTag(str)` - Remove HTML font tags
- `trim(str)` - Remove leading/trailing whitespace
- `removeWhiteSpace(str)` - Remove all spaces
- `toAlphaNumericLow(str)` - Convert to lowercase alphanumeric only
- `nonNull(str)` - Return empty string if null
- `isEmpty(str)` - Check if null or empty
- `isBlank(str)` - Check if null, empty, or only whitespace
- `makeMagicString(offset, ...indices)` - Build string from character lookup table

---

### FixedSizeStack.as

**Category**: ENGINE

**Purpose**: Fixed-size circular buffer for integer values, useful for tracking recent values.

**Key Methods**:
- `addValue(value)` - Add value, wrapping around if full
- `getMax()` - Get maximum value in buffer
- `getMin()` - Get minimum value in buffer
- `reset()` - Clear the buffer

**Use Cases**:
- Performance sampling
- Recent value tracking
- Rolling statistics

---

### FriendlyTime.as

**Category**: ENGINE

**Purpose**: Convert seconds to human-readable time strings (e.g., "5 minutes ago").

**Key Methods**:
- `getFriendlyTime(localization, seconds, suffix, threshold)` - Full format
- `getShortFriendlyTime(localization, seconds, suffix, threshold)` - Abbreviated format

**Time Units**:
- Seconds (< 60)
- Minutes (60-3600)
- Hours (3600-86400)
- Days (86400-604800)
- Months (2592000)
- Years (31536000)

**Dependencies**:
- `IHabboLocalizationManager` - For localized time strings

---

### CommunicationUtils.as

**Category**: ENGINE

**Purpose**: Login credentials management, fingerprinting, and encryption utilities.

**Key Methods**:
- `storePassword(password)` - Store password (encrypted if available)
- `restorePassword()` - Retrieve stored password
- `resetPassword()` - Clear stored password
- `clearAllLoginData()` - Clear all login data
- `writeSOLProperty/readSOLProperty()` - SharedObject storage
- `readSOLString/Boolean/Integer/Float()` - Typed SOL reads
- `decodeFromBitmap(bitmap)` - Steganographic data extraction
- `xor(str, key)` - XOR encryption
- `generateFingerprint()` - Browser fingerprint using fonts, plugins, etc.
- `generateRandomHexString(length)` - Random hex string generator
- `removeProtocol(url)` - Strip http(s):// from URL

**Properties Stored**:
- `environment` - Server environment
- `login` - Login name
- `userid` - User ID
- `useruniqueid` - Unique user ID
- `autologin` - Remember login flag
- `loginmethod` - Login method (habbo/facebook)
- `machineid` - Machine identifier
- `ratingstatus/ratingstatustime` - App rating status

**Dependencies**:
- `IEncryptedLocalStorage` - Optional encrypted storage
- `MD5` - For fingerprint hashing

---

### IEncryptedLocalStorage.as

**Category**: ENGINE

**Purpose**: Interface for encrypted local storage operations.

**Methods**:
- `reset()` - Clear all encrypted storage
- `storeString(key, value)` - Store encrypted string, returns success
- `restoreString(key)` - Retrieve decrypted string

---

### FigureDataContainer.as

**Category**: ENGINE

**Purpose**: Parse and manipulate Habbo avatar figure strings (format: `setType-partId-color1-color2.setType2-partId2-color1`).

**Key Methods**:
- `loadAvatarData(figureString, gender)` - Parse figure string
- `hasSetType(type)` - Check if set type exists
- `getPartSetId(type)` - Get part ID for set type
- `getColourIds(type)` - Get color IDs for set type
- `getFigureString()` - Reconstruct figure string
- `savePartData(type, id, colors)` - Update part data
- `getFigureStringWithFace(faceId)` - Get figure with specific face

**Set Types**:
- `hd` - Head
- `hr` - Hair
- `ha` - Hat
- `he` - Head accessories
- `ea` - Eye accessories
- `fa` - Face accessories
- `ch` - Shirt
- `cc` - Jacket
- `ca` - Chest accessories
- `cp` - Chest prints
- `lg` - Trousers
- `sh` - Shoes
- `wa` - Waist accessories

**Constants**:
- `MALE = "M"`, `FEMALE = "F"`, `UNISEX = "U"`
- `BLOCKED_FX_TYPES` - Effect types that cannot be used

---

### Canvas.as

**Category**: ENGINE

**Purpose**: BitmapData extension with quad and triangle rendering for isometric textures.

**Key Methods**:
- `drawQuad(points, texture, color)` - Draw textured quadrilateral
- `fillTriangle(points, texture, origin, sampler, color)` - Fill textured triangle
- `colorize(pixel, tint)` - Apply color tint to pixel
- `averageColor(bitmap)` - Calculate average color of bitmap

**Texture Samplers**:
- `sampleLeftWallTexture()` - Sample for left-facing walls
- `sampleRightWallTexture()` - Sample for right-facing walls
- `sampleFloorTexture()` - Sample for floor tiles

**Use Cases**:
- Room floor rendering
- Wall texture rendering
- Isometric surface texturing

---

### class_3543.as (BitmapResampler)

**Category**: ENGINE

**Purpose**: High-quality bitmap resampling with progressive downscaling.

**Key Methods**:
- `resampleBitmapData(bitmap, scale)` - Resample with quality preservation
- `resizeBitmapData(bitmap, scale)` - Direct resize using matrix transform

**Algorithm**:
- For scale >= 1: Direct resize
- For scale < 1: Progressive halving until close to target, then final resize
- This prevents aliasing artifacts common with large scale reductions

---

### class_419.as (MathUtils)

**Category**: ENGINE

**Purpose**: Common mathematical utilities for interpolation and mapping.

**Key Methods**:
- `normalize(value, min, max)` - Normalize value to 0-1 range
- `lerp(t, min, max)` - Linear interpolation
- `clamp(value, min, max)` - Clamp value to range
- `map(value, inMin, inMax, outMin, outMax)` - Map value from one range to another
- `rectangleTransformMatrix(from, to)` - Create transform matrix between rectangles

---

### class_497.as (PlatformUtils)

**Category**: ENGINE

**Purpose**: Device and platform detection utilities.

**Key Methods**:
- `init()` - Initialize platform detection
- `isAndroid/isIos/isDesktop()` - Platform checks
- `isPhone()` - Phone device check
- `platformId/platformString()` - Platform identification
- `deviceType()` - Device type (phone/tablet/desktop)
- `isDeviceHD/isSmallScreenDevice()` - Screen capability checks
- `isLowMemoryDevice` - Memory constraint check
- `smartScaleFactor()` - Recommended scale for device
- `maxDynamicTextureDimension` - Max texture size for device

**Constants**:
- `DEVICE_TYPE_PHONE/TABLET/DESKTOP`
- `PLATFORM_DESKTOP/ANDROID/IOS`
- `PHONE_SCALE_FACTOR = 0.65`

---

### class_3521.as (BuilderClubUtils)

**Category**: ENGINE

**Purpose**: Detect if a furniture ID belongs to Builder Club items.

**Key Methods**:
- `isBuilderClubId(id)` - Returns true if ID >= 2147418112 (0x7FFF0000)

---

### air/INativeApplicationProxy.as

**Category**: ENGINE

**Purpose**: Interface for native application lifecycle control (AIR).

**Methods**:
- `dispose()` - Clean up resources
- `allowBackgroundExecution(allow)` - Control background execution

**Extends**: `IEventDispatcher`

---

### air/NativeApplicationEvents.as

**Category**: ENGINE

**Purpose**: Event constants for native application state changes.

**Constants**:
- `APPLICATION_DEACTIVE = "NAE_application_deactive"` - App went to background
- `APPLICATION_ACTIVE = "NAE_application_active"` - App came to foreground
- `APPLICATION_SUSPEND = "NAE_application_suspend"` - App suspended

---

### animation/class_65.as (IAnimatable)

**Category**: ENGINE

**Purpose**: Interface for objects that can be animated by the Juggler.

**Methods**:
- `advanceTime(time: Number)` - Advance animation by delta time in seconds

---

### animation/DelayedCall.as

**Category**: ENGINE

**Purpose**: Execute a function after a specified delay, with object pooling.

**Key Methods**:
- `fromPool(callback, delay, args)` - Get pooled or new instance
- `toPool(call)` - Return to pool
- `reset(callback, delay, args)` - Reset for reuse
- `advanceTime(time)` - Process time advancement
- `complete()` - Complete immediately

**Properties**:
- `totalTime` - Total delay duration
- `currentTime` - Elapsed time
- `repeatCount` - Number of repetitions (0 = infinite)
- `isComplete` - Whether call has completed

---

### animation/Juggler.as

**Category**: ENGINE

**Purpose**: Central animation manager that coordinates tweens and delayed calls.

**Key Methods**:
- `add(animatable)` - Add object to be animated
- `remove(animatable)` - Remove object
- `removeTweens(target)` - Remove all tweens for target
- `containsTweens(target)` - Check if target has active tweens
- `purge()` - Remove all animatables
- `delayCall(callback, delay, ...args)` - Create delayed call
- `repeatCall(callback, interval, count, ...args)` - Create repeating call
- `tween(target, duration, props)` - Create and add tween
- `advanceTime(time)` - Advance all animations

**Properties**:
- `elapsedTime` - Total elapsed time

---

### animation/Transitions.as

**Category**: ENGINE

**Purpose**: Easing functions for animations.

**Available Transitions**:
- `linear` - No easing
- `easeIn/easeOut/easeInOut/easeOutIn` - Cubic easing
- `easeInBack/easeOutBack/easeInOutBack/easeOutInBack` - Overshoot easing
- `easeInElastic/easeOutElastic/easeInOutElastic/easeOutInElastic` - Spring easing
- `easeInBounce/easeOutBounce/easeInOutBounce/easeOutInBounce` - Bounce easing

**Key Methods**:
- `getTransition(name)` - Get transition function by name
- `register(name, func)` - Register custom transition

---

### animation/Tween.as

**Category**: ENGINE

**Purpose**: Animate object properties over time with transitions and callbacks.

**Key Methods**:
- `fromPool/toPool()` - Object pooling
- `reset(target, duration, transition)` - Reset for reuse
- `animate(property, endValue)` - Add property animation
- `scaleTo/moveTo/fadeTo/rotateTo()` - Convenience methods
- `advanceTime(time)` - Process time advancement
- `getEndValue(property)` - Get target value for property

**Properties**:
- `target` - Object being animated
- `transition` - Easing function name
- `transitionFunc` - Easing function
- `totalTime/currentTime/progress` - Timing
- `delay/repeatCount/repeatDelay` - Timing options
- `reverse` - Reverse on repeat
- `roundToInt` - Round values to integers
- `onStart/onUpdate/onRepeat/onComplete` - Callbacks
- `onStartArgs/onUpdateArgs/onRepeatArgs/onCompleteArgs` - Callback arguments
- `nextTween` - Chain tweens

**Special Handling**:
- Color properties (RGB interpolation)
- Angle properties (rad/deg with shortest path)

---

### animation/TweenUtils.as

**Category**: ENGINE

**Purpose**: Convenience methods for common tween operations.

**Constants**:
- `FAST_ALPHA_TWEEN_TIME = 0.2`
- `STANDARD_ALPHA_TWEEN_TIME = 0.4`
- `SLOW_ALPHA_TWEEN_TIME_DOUBLE = 0.8`
- `REALLY_SLOW_ALPHA_TWEEN_TIME = 1.2`
- `STANDARD_ANCHOR_TWEEN_TIME = 0.4`

**Key Methods**:
- `alphaTweenVisible(target, delay, duration, transition)` - Fade in (0 to 1)
- `alphaTweenInvisible(target, delay, duration, transition)` - Fade out (1 to 0)
- `alphaTweenBlink(target, delay, duration)` - Blink effect (0 to 0.4)

**Static Property**:
- `var_347` - Shared Juggler instance for TweenUtils

---

## Architecture Pattern

### Animation System Architecture (AS3)
```
Juggler (manages all animations)
    ├── IAnimatable[] (objects to animate)
    │   ├── Tween (property animation)
    │   │   ├── target object
    │   │   ├── properties to animate
    │   │   └── transition function
    │   └── DelayedCall (delayed execution)
    │       ├── callback function
    │       └── delay/repeat settings
    └── Transitions (static easing functions)

TweenUtils (convenience methods)
    └── shared Juggler instance
```

### Our TypeScript Architecture
```
Juggler (injectable singleton)
    ├── animatables: Set<IAnimatable>
    ├── add/remove/advanceTime methods
    └── convenience methods (delayCall, tween)

Tween/DelayedCall (use object pooling)
    └── implement IAnimatable interface

Transitions (static module or Map)
    └── easing functions

AnimationService (optional wrapper)
    └── integrates with SolidJS reactivity if needed
```

---

## Implementation Priority

### High Priority (Core Engine)
1. **MathUtils** (class_419) - Basic math needed everywhere
2. **StringUtil** - Common string operations
3. **FigureDataContainer** - Essential for avatar system
4. **Base64** - Needed for data encoding

### Medium Priority (Animation/Graphics)
5. **Transitions** - Easing functions
6. **Tween** - Property animation
7. **DelayedCall** - Delayed execution
8. **Juggler** - Animation coordinator
9. **Canvas** - Room rendering

### Lower Priority (Platform/Storage)
10. **CommunicationUtils** - Login persistence
11. **PlatformUtils** (class_497) - Device detection
12. **FixedSizeStack** - Performance tracking
13. **FriendlyTime** - Time formatting

---

## Next Implementation Steps

1. **Create MathUtils** - Basic math utilities (normalize, lerp, clamp, map)
2. **Create StringUtil** - String manipulation utilities
3. **Port FigureDataContainer** - Avatar figure string handling
4. **Implement animation system** - IAnimatable, Transitions, Tween, Juggler
5. **Add Base64 utilities** - Use native browser APIs
6. **Create CommunicationUtils** - Local storage for login data
7. **Test with existing systems** - Verify integration
