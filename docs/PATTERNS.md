# Helium Implementation Patterns

Detailed templates for each class type. Always use these patterns as a base during implementation.

## Table of contents

1. [MessageComposer](#messagecomposer)
2. [MessageParser](#messageparser)
3. [MessageEvent](#messageevent)
4. [Manager (Component DI)](#manager-component-di)
5. [Handler (BaseHandler)](#handler-basehandler)
6. [Data class](#data-class)
7. [Interface](#interface)
8. [Message registration](#message-registration)
9. [SolidJS Store (client)](#solidjs-store-client)
10. [Pitfalls to avoid](#pitfalls-to-avoid)

---

## MessageComposer

Composers serialize data for sending to the server.

### Template

```typescript
import { MessageComposer } from '@core/communication/messages/MessageComposer';

/**
 * Sends a request to open a flat connection.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/OpenFlatConnectionMessageComposer.as
 */
export class OpenFlatConnectionMessageComposer extends MessageComposer<ConstructorParameters<typeof OpenFlatConnectionMessageComposer>>
{
    private _data: ConstructorParameters<typeof OpenFlatConnectionMessageComposer>;

    constructor(roomId: number, password: string)
    {
        super();
        this._data = [roomId, password];
    }

    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
```

### Rules

- The generic type of `MessageComposer<T>` is a tuple matching the sent data
- The `_data` field is private and typed with the same tuple
- The constructor calls `super()` then assigns `_data`
- `getMessageArray()` simply returns `_data`
- No complex logic in the composer — just data packaging

### Tuple type examples

```typescript
extends MessageComposer<ConstructorParameters<typeof MyMessageComposer>>
```

---

## MessageParser

Parsers deserialize data received from the server.

### Template

```typescript
import type { IMessageDataWrapper } from '@core/communication/messages/IMessageDataWrapper';
import type { IMessageParser } from '@core/communication/messages/IMessageParser';

/**
 * Parses room info data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/room/RoomInfoParser.as
 */
export class RoomInfoParser implements IMessageParser
{
    private _roomId: number = 0;
    private _roomName: string = '';
    private _ownerId: number = 0;
    private _ownerName: string = '';

    flush(): boolean
    {
        this._roomId = 0;
        this._roomName = '';
        this._ownerId = 0;
        this._ownerName = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._ownerId = wrapper.readInt();
        this._ownerName = wrapper.readString();
        return true;
    }

    get roomId(): number { return this._roomId; }
    get roomName(): string { return this._roomName; }
    get ownerId(): number { return this._ownerId; }
    get ownerName(): string { return this._ownerName; }
}
```

### Rules

- Implements `IMessageParser` with `flush()` and `parse(wrapper)`
- `flush()` resets ALL fields to their default values and returns `true`
- `parse()` checks `if(!wrapper) return false` first
- The read order in `parse()` MUST match exactly the server's send order (see AS3)
- Public getters for each parsed field
- No business logic in the parser — just data extraction

### Available read methods

```typescript
wrapper.readInt()       // 32-bit signed integer
wrapper.readShort()     // 16-bit signed integer
wrapper.readByte()      // Signed byte
wrapper.readString()    // String (length-prefixed)
wrapper.readBoolean()   // Boolean (1 byte)
wrapper.readLong()      // 64-bit integer (BigInt converted to number)
wrapper.readFloat()     // 32-bit float
```

---

## MessageEvent

Events bind a Parser to a callback for incoming message handling.

### Template

```typescript
import { MessageEvent } from '@core/communication/messages/MessageEvent';
import type { IMessageEvent, MessageEventCallback } from '@core/communication/messages/IMessageEvent';
import { RoomInfoParser } from './RoomInfoParser';

/**
 * Event fired when room info is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/room/RoomInfoEvent.as
 */
export class RoomInfoEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: MessageEventCallback)
    {
        super(callBack, RoomInfoParser);
    }
}
```

### Rules

- Extends `MessageEvent` and implements `IMessageEvent`
- Constructor takes a single `callBack: Function` parameter
- Passes the Parser class (not an instance) to `super()`
- The `parser` getter casts `getParser()` to the concrete parser type

---

## Manager (Component DI)

Managers are the main business logic classes, registered in the DI system.

### Template

```typescript
import { Component } from '@core/di/Component';
import type { IRoomEngine } from '@room/IRoomEngine';

/**
 * Manages room instances and their lifecycle.
 *
 * @see sources/win63_version/room/RoomManager.as
 */
export class RoomManager extends Component implements IRoomManager
{
    private _rooms: Map<string, IRoomInstance> = new Map();
    private _disposed: boolean = false;

    constructor()
    {
        super();
    }

    /**
     * Called when all dependencies are resolved.
     */
    protected override onUnlock(): void
    {
        // Post-DI initialization
    }

    public createRoom(roomId: string): IRoomInstance | null
    {
        if(this._rooms.has(roomId)) return null;

        const room = new RoomInstance(roomId, this);
        this._rooms.set(roomId, room);
        return room;
    }

    public getRoom(roomId: string): IRoomInstance | null
    {
        return this._rooms.get(roomId) ?? null;
    }

    public removeRoom(roomId: string): void
    {
        const room = this._rooms.get(roomId);

        if(room)
        {
            room.dispose();
            this._rooms.delete(roomId);
        }
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        for(const room of this._rooms.values())
        {
            room.dispose();
        }

        this._rooms.clear();
    }
}
```

### Rules

- Extends `Component` and implements an `I*` interface
- **NEVER override `get events()`** — use a different name for custom events
- `dispose()` is ALWAYS the last method
- `dispose()` checks `_disposed` to avoid double calls
- IIDs are registered in `packages/helium-engine/src/iid/index.ts`

---

## Handler (BaseHandler)

Handlers listen to server messages and delegate to a listener.

### Template

```typescript
import type { IConnection } from '@core/communication/connections/IConnection';

/**
 * Handles room-related messages from the server.
 *
 * @see sources/win63_version/habbo/session/handler/RoomDataHandler.as
 */
export class RoomDataHandler
{
    private _connection: IConnection;
    private _listener: IRoomHandlerListener;

    constructor(connection: IConnection, listener: IRoomHandlerListener)
    {
        this._connection = connection;
        this._listener = listener;

        this._connection.addMessageEvent(new RoomInfoEvent(this.onRoomInfo.bind(this)));
        this._connection.addMessageEvent(new RoomReadyEvent(this.onRoomReady.bind(this)));
    }

    private onRoomInfo(event: RoomInfoEvent): void
    {
        if(!event) return;

        const parser = event.parser;

        if(!parser) return;

        // Process data and call listener
        this._listener.onRoomInfo(parser.roomId, parser.roomName);
    }

    private onRoomReady(event: RoomReadyEvent): void
    {
        if(!event) return;

        const parser = event.parser;

        if(!parser) return;

        this._listener.onRoomReady(parser.roomId);
    }

    dispose(): void
    {
        this._connection = null;
        this._listener = null;
    }
}
```

### Rules

- Takes an `IConnection` and a listener in the constructor
- Registers MessageEvents on the connection
- Each message handler checks `if(!event)` and `if(!parser)`
- Delegates processing to the listener, contains NO business logic
- The listener pattern matches `I*Listener` or `I*HandlerListener` interfaces from AS3

---

## Data class

Data classes represent protocol structures.

### Template

```typescript
import type { IMessageDataWrapper } from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents a room entry from navigation results.
 *
 * @see sources/win63_version/habbo/navigator/RoomDataParser.as
 */
export class RoomDataParser
{
    private _roomId: number;
    private _roomName: string;
    private _ownerId: number;
    private _ownerName: string;
    private _userCount: number;
    private _maxUsers: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._ownerId = wrapper.readInt();
        this._ownerName = wrapper.readString();
        this._userCount = wrapper.readInt();
        this._maxUsers = wrapper.readInt();
    }

    get roomId(): number { return this._roomId; }
    get roomName(): string { return this._roomName; }
    get ownerId(): number { return this._ownerId; }
    get ownerName(): string { return this._ownerName; }
    get userCount(): number { return this._userCount; }
    get maxUsers(): number { return this._maxUsers; }
}
```

### Rules

- Constructor takes an `IMessageDataWrapper` and reads the data
- Read order MUST match exactly the AS3
- Public getters, no setters (immutable after construction)
- May have a static `parse()` method if the AS3 has one

---

## Interface

### Template

```typescript
import type { IRoomInstance } from './IRoomInstance';

/**
 * Interface for the room manager.
 *
 * @see sources/win63_version/room/IRoomManager.as
 */
export interface IRoomManager
{
    createRoom(roomId: string): IRoomInstance | null;
    getRoom(roomId: string): IRoomInstance | null;
    removeRoom(roomId: string): void;
    dispose(): void;
}
```

### Rules

- `I` + PascalCase prefix
- Must match exactly the AS3 public methods
- Separate file from the implementation (`IRoomManager.ts` ≠ `RoomManager.ts`)

---

## Message registration

Messages are registered in `HabboMessages.ts`.

### Template

```typescript
// In HabboMessages.ts, registerMessages() method

// Incoming messages (server → client)
this.registerMessageEvent(new RoomInfoEvent(null), IncomingHeader.ROOM_INFO);
this.registerMessageEvent(new RoomReadyEvent(null), IncomingHeader.ROOM_READY);

// Outgoing messages (client → server)
this.registerComposer(OpenFlatConnectionMessageComposer, OutgoingHeader.OPEN_FLAT_CONNECTION);
```

### Rules

- Incoming events are instantiated with `null` as callback (the handler replaces it)
- Outgoing composers are registered by class (not by instance)
- Message IDs are in `IncomingHeader` and `OutgoingHeader`

---

## SolidJS Store (client)

Stores connect the engine to the SolidJS UI.

### Template

```typescript
import { createSignal } from 'solid-js';
import type { IRoomData } from '@habbo/navigator/IRoomData';

// Reactive signals
const [currentRoom, setCurrentRoom] = createSignal<IRoomData | null>(null);
const [isNavigatorOpen, setIsNavigatorOpen] = createSignal(false);

// Initialization function (called after engine bootstrap)
export function initNavigatorStore(navigator: IHabboNewNavigator): void
{
    navigator.on('roomSelected', (room: IRoomData) =>
    {
        setCurrentRoom(room);
    });

    navigator.on('opened', () => setIsNavigatorOpen(true));
    navigator.on('closed', () => setIsNavigatorOpen(false));
}

// Exports for components
export const navigatorStore = {
    currentRoom,
    isNavigatorOpen,
    setIsNavigatorOpen,
};
```

### Rules

- Stores go in `packages/helium-client/src/stores/`
- Use `createSignal` from SolidJS
- Listen to engine events via EventEmitter3
- Export an object with the needed signals and setters
- The store does NOT know about components (strict separation)

---

## Pitfalls to avoid

### 0. Performance anti-patterns

These patterns are common when porting AS3→TypeScript. AS3 used Flash Player with a different GC; in JavaScript, these patterns cause freezes and excessive memory usage. The AS3 lifecycle (dispose, flush/parse, object management) is preserved — these rules target JS-runtime-specific pitfalls within that lifecycle.

#### a) Array.includes/indexOf for frequent lookups

```typescript
// WRONG — O(n) on every received message
private _pendingTypes: string[] = [];

if(!this._pendingTypes.includes(type))
{
    this._pendingTypes.push(type);
}

// CORRECT — O(1)
private _pendingTypes: Set<string> = new Set();

if(!this._pendingTypes.has(type))
{
    this._pendingTypes.add(type);
}
```

**Rule**: if a collection is queried via `includes()`, `indexOf()`, or `find()` AND it can exceed 10 elements, replace it with `Set` or `Map`.

#### b) Object allocation in parsers

```typescript
// WRONG — new temporary Map on every parse
parse(wrapper: IMessageDataWrapper): boolean
{
    const ownerMap = new Map<number, string>();  // GC'd after every call
    // ...
}

// CORRECT — reuse a field
private _ownerMap: Map<number, string> = new Map();

parse(wrapper: IMessageDataWrapper): boolean
{
    this._ownerMap.clear();
    // ...
}
```

#### c) Array replacement instead of clearing

```typescript
// WRONG — flush() and parse() both create a new array
flush(): boolean
{
    this._objects = [];  // old array → GC garbage
    return true;
}

// CORRECT — clear in place
flush(): boolean
{
    this._objects.length = 0;
    return true;
}
```

#### d) Textures and OffscreenCanvas in the render loop

Porting AS3 `BitmapData` → `OffscreenCanvas` is conceptually correct, but `new OffscreenCanvas()` + `Texture.from()` on every frame creates a GPU memory leak. Always cache the results.

#### e) Sorting every frame without a dirty flag

If Z-order hasn't changed, don't re-sort. Use a `_zOrderDirty` flag set to `true` only when objects are added, removed, or change Z-index.

#### f) Missing viewport culling

Any offscreen object should be skipped by the render loop. Check bounds (AABB) before calling `renderObject()` or `updateVisualization()`.

Full reference: **Performance** section of `docs/STYLEGUIDE.md`.

---

### 1. Overriding `get events()` in Component

```typescript
// WRONG — breaks the DI system
class MyManager extends Component
{
    private _myEvents = new EventEmitter();
    get events() { return this._myEvents; }  // BREAKS DI RESOLUTION
}

// CORRECT — use a different name
class MyManager extends Component
{
    private _myEvents = new EventEmitter();
    get managerEvents() { return this._myEvents; }
}
```

The DI system uses `Component.events` (via `this._events`) for dependency resolution. Overriding it disconnects the DI listeners.

### 2. Infinite recursion with createRoomObject

```typescript
// WRONG — RoomInstance.createRoomObject() calls container.createRoomObject()
// which calls room.createRoomObject() again → infinite loop
createRoomObject(roomId, objectId, type, category)
{
    const room = this._rooms.get(roomId);
    return room.createRoomObject(objectId, type, category);  // RECURSION
}

// CORRECT — use createObjectInternal
createRoomObject(roomId, objectId, type, category)
{
    const room = this._rooms.get(roomId);
    return room.createObjectInternal(objectId, 1, type, category);
}
```

### 3. Engine → client imports

```typescript
// WRONG — the engine must NEVER know about the client
import { navigatorStore } from '@ui/stores/navigatorStore';  // FORBIDDEN

// CORRECT — the engine emits events, the client listens
this.emit('searchResults', results);  // Engine emits
```

### 4. Forgetting to read the AS3

Before EVERY implementation, verify:
- Did you read the AS3 source file?
- Did you check the `implements`?
- Did you check the `handler/` directory?
- Did you read the `I<Class>.as` interface?

If the answer is no to any of these, STOP and read first.
