# Development Guide

> Generated: 2026-01-31 | Scan Level: Exhaustive

## Prerequisites

- **Node.js** 18+ (ES2022 target)
- **npm** 8+
- **Modern Browser** with WebGL support

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd helium

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

## Build Commands

| Command           | Description                                |
|-------------------|--------------------------------------------|
| `npm install`     | Install all dependencies                   |
| `npm run dev`     | Start Vite dev server with HMR             |
| `npm run build`   | TypeScript compile + Vite production build |
| `npm run preview` | Preview the production build locally       |

## Project Structure

```
src/
├── core/          # Low-level infrastructure
├── habbo/         # Habbo business logic
├── room/          # Room rendering (stub)
├── iid/           # Dependency injection
├── ui/            # SolidJS UI layer
├── Helium.ts      # Main application class
└── index.ts       # Library exports
```

## Configuration

### Helium Bootstrap

```typescript
import Helium from './Helium';

await Helium.bootstrap({
    // PixiJS options
    background: '#000000',
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio,

    // Connection config
    connection: {
        host: 'wss://game.habbo.com',
        ports: [30000, 30001],
        ssoTicket: 'your-sso-ticket',
        autoConnect: true,
    },

    // External variables URL
    configurationUrl: '/gamedata/external_variables.txt',
});
```

### Environment Setup

Create configuration based on your Habbo server:

1. **Host:** WebSocket endpoint (e.g., `wss://game.habbo.com`)
2. **Ports:** Available ports to try
3. **SSO Ticket:** Authentication ticket from retro server
4. **Configuration URL:** Path to external_variables.txt

## Development Workflow

### Adding a New Message (Incoming)

1. **Create Parser** in `src/habbo/communication/messages/parser/<category>/`:

```typescript
// NewMessageParser.ts
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class NewMessageParser implements IMessageParser {
    private _someData: string = '';

    get someData(): string { return this._someData; }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._someData = wrapper.readString();
        return true;
    }

    dispose(): void {
        this._someData = '';
    }
}
```

2. **Create Event** in `src/habbo/communication/messages/incoming/<category>/`:

```typescript
// NewMessageEvent.ts
import {NewMessageParser} from '../../parser/<category>/NewMessageParser';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

export class NewMessageEvent implements IMessageEvent {
    static readonly parser = NewMessageParser;
    private _parser: NewMessageParser;
    private _connection: any;

    constructor() {
        this._parser = new NewMessageParser();
    }

    get parser() { return this._parser; }
    get connection() { return this._connection; }
    set connection(value) { this._connection = value; }

    dispose(): void {
        this._parser.dispose();
    }
}
```

3. **Register** in `src/habbo/communication/HabboMessages.ts`:

```typescript
import {NewMessageEvent} from './messages/incoming/<category>/NewMessageEvent';

// In registerEvents():
this._events.set(1234, NewMessageEvent);
```

4. **Handle** in appropriate manager or handler class.

### Adding a New Message (Outgoing)

1. **Create Composer** in `src/habbo/communication/messages/outgoing/<category>/`:

```typescript
// NewMessageComposer.ts
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

export class NewMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(param1: string, param2: number) {
        this._data = [param1, param2];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        this._data = [];
    }
}
```

2. **Register** in `src/habbo/communication/HabboMessages.ts`:

```typescript
import {NewMessageComposer} from './messages/outgoing/<category>/NewMessageComposer';

// In registerComposers():
this._composers.set(5678, NewMessageComposer);
```

3. **Use** via manager:

```typescript
connection.send(new NewMessageComposer('hello', 42));
```

### Adding a New UI Component

1. **Create Component** in `src/ui/components/<category>/`:

```tsx
// NewComponent.tsx
import {Component} from 'solid-js';

export const NewComponent: Component = () => {
    return (
        <div class="new-component">
            <h2>New Component</h2>
        </div>
    );
};
```

2. **Export** in `src/ui/components/<category>/index.ts`

3. **Use** in parent component or App.tsx

### Adding a New Manager

1. **Create Interface** in `src/habbo/<module>/I<Name>Manager.ts`
2. **Create Implementation** in `src/habbo/<module>/<Name>Manager.ts`
3. **Add Symbol** in `src/iid/types.ts`:

```typescript
export const TYPES = {
    // ... existing
    NewManager: Symbol.for('NewManager'),
};
```

4. **Register** in `src/iid/container.ts`:

```typescript
container.bind<INewManager>(TYPES.NewManager)
    .to(NewManager)
    .inSingletonScope();
```

## Code Conventions

### Naming

- **Interfaces:** Prefix with `I` (e.g., `IHabboCommunicationManager`)
- **Events:** Suffix with `MessageEvent` (e.g., `PingMessageEvent`)
- **Parsers:** Suffix with `MessageParser` (e.g., `PingMessageParser`)
- **Composers:** Suffix with `MessageComposer` (e.g., `PongMessageComposer`)

### Patterns

- **Singleton Services:** All managers are singletons via Inversify
- **Dispose Pattern:** Implement `dispose()` for cleanup
- **Event Emitters:** Use EventEmitter3 for pub/sub
- **Reactive State:** Use SolidJS stores for UI state

### File Organization

- One class per file
- Group by feature/domain (not by type)
- Index files for clean exports

## Testing

> No test framework is currently configured.

To add tests:

```bash
npm install -D vitest @testing-library/solid
```

## Debugging

### Browser DevTools

1. Open DevTools (F12)
2. Check Console for Helium logs
3. Network tab for WebSocket messages

### Logger Usage

```typescript
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MyModule');

log.info('Information message');
log.warn('Warning message');
log.error('Error message');
log.success('Success message');
log.incoming(messageId, messageName);  // For incoming messages
log.outgoing(messageId, messageName);  // For outgoing messages
```

## Reference Sources

The project includes two reference implementations:

| Folder          | Purpose                                      |
|-----------------|----------------------------------------------|
| `source_as_win63/`    | Original Habbo Flash client (ActionScript 3) |
| `source_nitro/` | Nitro TypeScript client                      |

Use these as reference when implementing new features to ensure protocol compatibility.
