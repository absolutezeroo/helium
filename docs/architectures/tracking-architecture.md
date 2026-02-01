# Tracking Architecture Documentation

This document categorizes all AS3 tracking files into **ENGINE** (analytics/event tracking code we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                        |
|----------|-------|--------------------------------------------------------------------|
| ENGINE   | 10    | Analytics, performance monitoring, event tracking, error reporting |
| VIEW     | 0     | No pure UI/rendering files in this module                          |

---

## ENGINE FILES (We Need These)

| AS3 File                    | Purpose                                                                                                                                                                                                                                                                                                                                                 | Status |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `HabboTracking.as`          | Core tracking component. Singleton manager that orchestrates all tracking subsystems (framerate, latency, performance, lag, toolbar clicks). Handles login step tracking, error reporting, Google Analytics integration, and event logging to server. Listens to events from navigator, catalog, inventory, friendlist, help, room engine, and toolbar. | TODO   |
| `IHabboTracking.as`         | Interface defining the public tracking API: trackGoogle(), legacyTrackGoogle(), logError(), chatLagDetected(), trackEventLog(), trackEventLogOncePerSession(), trackTalentTrackOpen().                                                                                                                                                                  | TODO   |
| `FramerateTracker.as`       | Tracks average framerate over time using running average calculation. Reports framerate to Google Analytics at configurable intervals (default 300s). Has maximum event limit to prevent spam.                                                                                                                                                          | TODO   |
| `LatencyTracker.as`         | Measures network latency via ping/pong messages. Sends LatencyPingRequestMessageComposer, handles LatencyPingResponseMessageEvent. Calculates average latency, filters outliers (>2x average), and reports via LatencyPingReportMessageComposer.                                                                                                        | TODO   |
| `PerformanceTracker.as`     | Monitors system performance including memory usage, update intervals, garbage collection events. Sends PerformanceLogMessageComposer with user agent, Flash version, OS, memory usage, average update interval, slow update count. Uses GarbageTester for GC detection.                                                                                 | TODO   |
| `LagWarningLogger.as`       | Detects and reports chat lag events. Accumulates lag warnings and sends batched reports via LagWarningReportMessageComposer at configurable intervals.                                                                                                                                                                                                  | TODO   |
| `ToolbarClickTracker.as`    | Tracks toolbar button clicks via Google Analytics. Has configurable maximum event limit (default 100) to prevent excessive tracking.                                                                                                                                                                                                                    | TODO   |
| `GarbageTester.as`          | Helper class extending EventDispatcherWrapper used by PerformanceTracker to detect garbage collection cycles. Minimal implementation - presence in GarbageMonitor list indicates GC hasn't occurred.                                                                                                                                                    | TODO   |
| `HabboErrorVariableEnum.as` | Constants enum for error reporting variables: host, port, is_fatal, sent/received message data, timestamps, user agent, capabilities, context, room info, flash version, mouse events, debug info. Used with ErrorReportStorage.                                                                                                                        | TODO   |
| `HabboLoginTrackingStep.as` | Constants enum for login flow tracking steps: CONNECTION_INIT, CONNECTION_ESTABLISHED, HANDSHAKING, HANDSHAKE_OK/FAIL, AUTHENTICATED, ROOM_ENTER, HOTELVIEW_LOAD_START/OK/FAILED.                                                                                                                                                                       | TODO   |

## VIEW FILES (We Ignore These)

| AS3 File | Purpose                                         |
|----------|-------------------------------------------------|
| *(none)* | No pure UI/rendering files found in this module |

---

## Detailed Analysis

### HabboTracking.as
**Category: ENGINE**

The central tracking component and singleton manager. Key responsibilities:

- **Singleton Pattern**: Static `getInstance()` provides global access to tracking
- **Subsystem Orchestration**: Creates and manages FramerateTracker, LatencyTracker, PerformanceTracker, LagWarningLogger, ToolbarClickTracker
- **Login Step Tracking**: Tracks connection lifecycle via ExternalInterface.call("FlashExternalInterface.logLoginStep")
- **Error Reporting**: Captures errors via ErrorReportStorage, logs via ExternalInterface.call("FlashExternalInterface.logError")
- **Event Logging**: Sends EventLogMessageComposer to server for various events
- **Once-Per-Session Tracking**: Maintains vector of tracked events to avoid duplicates
- **Component Event Listening**: Subscribes to events from multiple components:
  - Navigator (tabs, search types)
  - Catalog (open/close, page views, purchases)
  - Inventory (tabs)
  - Friendlist (tabs)
  - Help (open/close)
  - Room Engine (room enter/exit, room ads)
  - Toolbar (button clicks)
  - Window Manager (sleep/render/input states)
- **Error Context Flags**: Maintains array of flags for error context (config, localization, handshake, window state, navigator, inventory, friendlist, room settings, catalog, help)
- **Google Analytics**: Empty stub methods for trackGoogle() and legacyTrackGoogle() - likely implemented via ExternalInterface in production
- **Update Loop**: Implements IUpdateReceiver for per-frame updates to all subsystems

### IHabboTracking.as
**Category: ENGINE**

Interface contract for tracking service:
- `trackGoogle(category: String, action: String, value: int = -1): void`
- `legacyTrackGoogle(category: String, action: String, data: Array = null): void`
- `logError(message: String): void`
- `chatLagDetected(lagTime: int): void`
- `trackEventLog(category: String, type: String, action: String, label: String = "", roomId: int = 0): void`
- `trackEventLogOncePerSession(category: String, type: String, action: String, label: String = "", roomId: int = 0): void`
- `trackTalentTrackOpen(trackType: String, talentState: String): void`

### FramerateTracker.as
**Category: ENGINE**

Monitors and reports framerate performance:
- **Running Average**: Calculates cumulative moving average of update intervals
- **Framerate Calculation**: `frameRate = Math.round(1000 / averageInterval)`
- **Periodic Reporting**: Reports to Google Analytics every N seconds (configurable via `tracking.framerate.reportInterval.seconds`, default 300)
- **Event Limiting**: Maximum events capped (configurable via `tracking.framerate.maximumEvents`, default 5)
- **Google Analytics**: Reports under category "performance", action "averageFramerate"

### LatencyTracker.as
**Category: ENGINE**

Measures network round-trip latency:
- **Ping/Pong Protocol**: Sends LatencyPingRequestMessageComposer with test ID, receives LatencyPingResponseMessageEvent
- **Interval Testing**: Configurable ping interval (default 20000ms via `latencytest.interval`)
- **Latency Collection**: Stores latencies in array, calculates when reaching report index (default 100 via `latencytest.report.index`)
- **Outlier Filtering**: Excludes latencies > 2x average from adjusted average
- **Delta Reporting**: Only reports if average changed by more than threshold (default 3ms via `latencytest.report.delta`)
- **Server Reporting**: Sends LatencyPingReportMessageComposer with average, adjusted average, and sample count

### PerformanceTracker.as
**Category: ENGINE**

Comprehensive system performance monitoring:
- **System Info Collection**: Flash version, OS, user agent (via ExternalInterface), debugger flag
- **Memory Tracking**: System.totalMemory converted to KB
- **Update Interval Tracking**: Running average of update intervals, counts slow updates (>1000ms by default)
- **Garbage Collection Detection**: Uses GarbageMonitor + GarbageTester to detect GC cycles
- **Periodic Reporting**: Configurable interval (default 60s via `performancetest.interval`) and limit (default 10 via `performancetest.reportlimit`)
- **Distribution Mode**: Optional mode to only report if mean deviance exceeds threshold (default 10%)
- **Server Reporting**: Sends PerformanceLogMessageComposer with timestamp, user agent, version, OS, debugger flag, memory, GC count, average interval, slow update count

### LagWarningLogger.as
**Category: ENGINE**

Batches and reports chat lag events:
- **Lag Detection**: Called via `chatLagDetected(lagTime)` from external code
- **Warning Accumulation**: Counts warnings until report interval reached
- **Batched Reporting**: Sends LagWarningReportMessageComposer with warning count at configurable intervals (default 10s via `lagWarningLog.interval.seconds`)
- **Enable Flag**: Controlled via `lagWarningLog.enabled` config

### ToolbarClickTracker.as
**Category: ENGINE**

Tracks toolbar interaction:
- **Click Tracking**: Called with icon name on toolbar button click
- **Google Analytics**: Reports under category "toolbar", action = icon name
- **Event Limiting**: Maximum events capped (configurable via `toolbar.tracking.max.events`, default 100)
- **Enable Flag**: Controlled via `toolbar.tracking.enabled` config

### GarbageTester.as
**Category: ENGINE**

Minimal helper for garbage collection detection:
- **Weak Reference Target**: Extends EventDispatcherWrapper, instances tracked by GarbageMonitor
- **GC Detection**: When GC runs, weak reference is cleared, allowing PerformanceTracker to detect collection occurred
- **No Active Logic**: Just a constructor accepting a string parameter (unused)

### HabboErrorVariableEnum.as
**Category: ENGINE**

Constants for error report fields:
- **Connection Info**: `host`, `port`
- **Error State**: `is_fatal`, `error_ctx`, `error_data`, `error_cat`, `error_desc`
- **Timing**: `start_time`, `crash_time`, `sent_msg_time`, `rece_msg_time`
- **Message Data**: `sent_msg_data`, `rece_msg_data`
- **System Info**: `agent`, `system`, `flash_version`, `avg_update`
- **Room State**: `last_room`, `in_room`
- **Mouse Events**: `mouse_up_time`, `mouse_up_target`, `click_time`, `click_target`
- **Debug**: `debug`

### HabboLoginTrackingStep.as
**Category: ENGINE**

Constants for login flow tracking:
- `CONNECTION_INIT` = "client.init.socket.init"
- `CONNECTION_ESTABLISHED` = "client.init.socket.ok"
- `HANDSHAKING` = "client.init.handshake.start"
- `HANDSHAKE_OK` = "client.init.handshake.ok"
- `HANDSHAKE_FAIL` = "client.init.handshake.fail"
- `AUTHENTICATED` = "client.init.auth.ok"
- `ROOM_ENTER` = "client.init.room.enter"
- `HOTELVIEW_LOAD_START` = "client.init.hotelview.start"
- `HOTELVIEW_LOAD_OK` = "client.init.hotelview.ok"
- `HOTELVIEW_LOAD_FAILED` = "client.init.hotelview.fail"

---

## Server Communication Messages

The tracking module uses these server messages:

### Outgoing (Composers)
| Message                             | Purpose                                                       |
|-------------------------------------|---------------------------------------------------------------|
| `EventLogMessageComposer`           | Generic event logging (category, type, action, label, roomId) |
| `LatencyPingRequestMessageComposer` | Initiate latency test with request ID                         |
| `LatencyPingReportMessageComposer`  | Report latency stats (average, adjusted, count)               |
| `PerformanceLogMessageComposer`     | Report performance metrics                                    |
| `LagWarningReportMessageComposer`   | Report accumulated lag warnings                               |

### Incoming (Events)
| Message                                    | Purpose                         |
|--------------------------------------------|---------------------------------|
| `LatencyPingResponseMessageEvent`          | Server response to ping request |
| `AuthenticationOKMessageEvent`             | Triggers auth tracking          |
| `RoomEntryInfoMessageEvent`                | Triggers room enter tracking    |
| `HabboAchievementNotificationMessageEvent` | Triggers achievement tracking   |

---

## Configuration Keys

| Key                                                  | Default | Description                                      |
|------------------------------------------------------|---------|--------------------------------------------------|
| `processlog.enabled`                                 | -       | Enable login step tracking via ExternalInterface |
| `tracking.framerate.reportInterval.seconds`          | 300     | Framerate report interval                        |
| `tracking.framerate.maximumEvents`                   | 5       | Max framerate reports per session                |
| `latencytest.interval`                               | 20000   | Ping test interval (ms)                          |
| `latencytest.report.index`                           | 100     | Samples before latency report                    |
| `latencytest.report.delta`                           | 3       | Min change to trigger report (ms)                |
| `performancetest.interval`                           | 60      | Performance report interval (s)                  |
| `performancetest.reportlimit`                        | 10      | Max performance reports                          |
| `performancetest.slowupdatelimit`                    | 1000    | Slow update threshold (ms)                       |
| `performancetest.distribution.enabled`               | false   | Use mean deviance filtering                      |
| `performancetest.distribution.deviancelimit.percent` | 10      | Deviance threshold (%)                           |
| `monitor.garbage.collection`                         | false   | Enable GC detection                              |
| `lagWarningLog.enabled`                              | false   | Enable lag warning reports                       |
| `lagWarningLog.interval.seconds`                     | 10      | Lag report interval                              |
| `toolbar.tracking.enabled`                           | false   | Enable toolbar click tracking                    |
| `toolbar.tracking.max.events`                        | 100     | Max toolbar tracking events                      |

---

## TypeScript Migration Notes

When porting to TypeScript/SolidJS:

1. **HabboTracking** - Convert to a service class or store. The singleton pattern can become a module-level instance or use dependency injection. Replace ExternalInterface calls with:
   - Standard JS window.postMessage for external communication
   - Console logging for development
   - Modern analytics SDK (Google Analytics 4, etc.)

2. **IHabboTracking** - Convert to a TypeScript interface.

3. **FramerateTracker** - Use `requestAnimationFrame` timestamp deltas or Performance API for framerate calculation.

4. **LatencyTracker** - Integrate with existing WebSocket communication layer. Can use WebSocket ping/pong or custom messages.

5. **PerformanceTracker** - Use Performance API (`performance.memory`, `performance.now()`) and `navigator.userAgent`. Note: Some metrics like garbage collection are not directly observable in JS.

6. **LagWarningLogger** - Port directly, integrate with chat system.

7. **ToolbarClickTracker** - Port directly, integrate with toolbar component.

8. **Enum Classes** - Convert to TypeScript const enums or string literal unions.

9. **ErrorReportStorage** - Replace with modern error tracking (Sentry, LogRocket, etc.) or custom implementation.

10. **Event System** - Replace Flash events with:
    - Custom EventEmitter pattern
    - SolidJS signals for reactive state
    - Observer pattern for subscriptions
