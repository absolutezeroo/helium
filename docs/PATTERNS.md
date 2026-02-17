# Patterns d'implémentation Helium

Templates détaillés pour chaque type de classe. Toujours utiliser ces patterns comme base lors de l'implémentation.

## Table des matières

1. [MessageComposer](#messagecomposer)
2. [MessageParser](#messageparser)
3. [MessageEvent](#messageevent)
4. [Manager (Component DI)](#manager-component-di)
5. [Handler (BaseHandler)](#handler-basehandler)
6. [Data class](#data-class)
7. [Interface](#interface)
8. [Enregistrement de messages](#enregistrement-de-messages)
9. [Store SolidJS (client)](#store-solidjs-client)
10. [Pièges à éviter](#pièges-à-éviter)

---

## MessageComposer

Les Composers sérialisent les données pour l'envoi au serveur.

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

### Règles

- Le type générique de `MessageComposer<T>` est un tuple correspondant aux données envoyées
- Le champ `_data` est privé et typé avec le même tuple
- Le constructeur appelle `super()` puis assigne `_data`
- `getMessageArray()` retourne simplement `_data`
- Pas de logique complexe dans le composer — juste du packaging de données

### Exemples de types tuple

```typescript
extends MessageComposer<ConstructorParameters<typeof MyMessageComposer>>
```

---

## MessageParser

Les Parsers désérialisent les données reçues du serveur.

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

### Règles

- Implémente `IMessageParser` avec `flush()` et `parse(wrapper)`
- `flush()` réinitialise TOUS les champs à leurs valeurs par défaut et retourne `true`
- `parse()` vérifie `if(!wrapper) return false` en premier
- L'ordre de lecture dans `parse()` DOIT correspondre exactement à l'ordre d'envoi du serveur (voir l'AS3)
- Getters publics pour chaque champ parsé
- Pas de logique métier dans le parser — juste de l'extraction de données

### Méthodes de lecture disponibles

```typescript
wrapper.readInt()       // Entier 32-bit signé
wrapper.readShort()     // Entier 16-bit signé
wrapper.readByte()      // Octet signé
wrapper.readString()    // String (longueur-préfixée)
wrapper.readBoolean()   // Booléen (1 octet)
wrapper.readLong()      // Entier 64-bit (BigInt converti en number)
wrapper.readFloat()     // Flottant 32-bit
```

---

## MessageEvent

Les Events lient un Parser à un callback pour le traitement des messages entrants.

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

### Règles

- Étend `MessageEvent` et implémente `IMessageEvent`
- Le constructeur prend un seul paramètre `callBack: Function`
- Passe la classe Parser (pas une instance) à `super()`
- Le getter `parser` cast `getParser()` vers le type concret du parser

---

## Manager (Component DI)

Les Managers sont les classes de logique métier principales, enregistrées dans le système DI.

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
        // Initialisation post-DI
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

### Règles

- Étend `Component` et implémente une interface `I*`
- **NE JAMAIS overrider `get events()`** — utiliser un nom différent pour les events custom
- `dispose()` est TOUJOURS la dernière méthode
- `dispose()` vérifie `_disposed` pour éviter les doubles appels
- Les IIDs sont enregistrés dans `packages/helium-engine/src/iid/index.ts`

---

## Handler (BaseHandler)

Les Handlers écoutent les messages du serveur et délèguent à un listener.

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

        // Traiter les données et appeler le listener
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

### Règles

- Prend une `IConnection` et un listener dans le constructeur
- Enregistre des MessageEvents sur la connexion
- Chaque handler de message vérifie `if(!event)` et `if(!parser)`
- Délègue le traitement au listener, ne contient PAS de logique métier
- Le pattern listener correspond aux interfaces `I*Listener` ou `I*HandlerListener` de l'AS3

---

## Data class

Les classes de données représentent les structures du protocole.

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

### Règles

- Le constructeur prend un `IMessageDataWrapper` et lit les données
- L'ordre de lecture DOIT correspondre exactement à l'AS3
- Getters publics, pas de setters (immutable après construction)
- Peut avoir une méthode statique `parse()` si l'AS3 l'a

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

### Règles

- Préfixe `I` + PascalCase
- Doit correspondre exactement aux méthodes publiques de l'AS3
- Fichier séparé de l'implémentation (`IRoomManager.ts` ≠ `RoomManager.ts`)

---

## Enregistrement de messages

Les messages sont enregistrés dans `HabboMessages.ts`.

### Template

```typescript
// Dans HabboMessages.ts, méthode registerMessages()

// Messages entrants (serveur → client)
this.registerMessageEvent(new RoomInfoEvent(null), IncomingHeader.ROOM_INFO);
this.registerMessageEvent(new RoomReadyEvent(null), IncomingHeader.ROOM_READY);

// Messages sortants (client → serveur)
this.registerComposer(OpenFlatConnectionMessageComposer, OutgoingHeader.OPEN_FLAT_CONNECTION);
```

### Règles

- Les events entrants sont instanciés avec `null` comme callback (le handler le remplace)
- Les composers sortants sont enregistrés par classe (pas par instance)
- Les IDs de messages sont dans `IncomingHeader` et `OutgoingHeader`

---

## Store SolidJS (client)

Les stores connectent l'engine à l'UI SolidJS.

### Template

```typescript
import { createSignal } from 'solid-js';
import type { IRoomData } from '@habbo/navigator/IRoomData';

// Signaux réactifs
const [currentRoom, setCurrentRoom] = createSignal<IRoomData | null>(null);
const [isNavigatorOpen, setIsNavigatorOpen] = createSignal(false);

// Fonction d'initialisation (appelée après bootstrap engine)
export function initNavigatorStore(navigator: IHabboNewNavigator): void
{
    navigator.on('roomSelected', (room: IRoomData) =>
    {
        setCurrentRoom(room);
    });

    navigator.on('opened', () => setIsNavigatorOpen(true));
    navigator.on('closed', () => setIsNavigatorOpen(false));
}

// Exports pour les composants
export const navigatorStore = {
    currentRoom,
    isNavigatorOpen,
    setIsNavigatorOpen,
};
```

### Règles

- Les stores sont dans `packages/helium-client/src/stores/`
- Utilisent `createSignal` de SolidJS
- Écoutent les events de l'engine via EventEmitter3
- Exportent un objet avec les signaux et les setters nécessaires
- Le store ne connaît PAS les composants (séparation stricte)

---

## Pièges à éviter

### 0. Anti-patterns de performance

Ces patterns sont fréquents lors du portage AS3→TypeScript. L'AS3 utilisait Flash Player avec un GC différent ; en JavaScript, ces patterns causent des freezes et une consommation mémoire excessive.

#### a) Array.includes/indexOf pour les lookups fréquents

```typescript
// FAUX — O(n) à chaque message reçu
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

**Règle** : si une collection est consultée par `includes()`, `indexOf()` ou `find()` ET qu'elle peut dépasser 10 éléments, la remplacer par `Set` ou `Map`.

#### b) Allocation d'objets dans les parsers

```typescript
// FAUX — nouveau Map temporaire à chaque parse
parse(wrapper: IMessageDataWrapper): boolean
{
    const ownerMap = new Map<number, string>();  // GC après chaque appel
    // ...
}

// CORRECT — réutiliser un champ
private _ownerMap: Map<number, string> = new Map();

parse(wrapper: IMessageDataWrapper): boolean
{
    this._ownerMap.clear();
    // ...
}
```

#### c) Remplacement de tableau au lieu de vidage

```typescript
// FAUX — flush() et parse() créent tous les deux un nouveau tableau
flush(): boolean
{
    this._objects = [];  // ancien tableau → déchet GC
    return true;
}

// CORRECT — vider en place
flush(): boolean
{
    this._objects.length = 0;
    return true;
}
```

#### d) Textures et OffscreenCanvas dans la boucle de rendu

Le portage AS3 `BitmapData` → `OffscreenCanvas` est correct conceptuellement, mais `new OffscreenCanvas()` + `Texture.from()` à chaque frame crée une fuite de mémoire GPU. Toujours cacher les résultats.

#### e) Tri à chaque frame sans dirty flag

Si l'ordre Z ne change pas, ne pas re-trier. Utiliser un flag `_zOrderDirty` mis à `true` uniquement quand un objet est ajouté, retiré, ou change de Z.

#### f) Absence de viewport culling

Tout objet hors écran doit être ignoré par la boucle de rendu. Vérifier les bornes (AABB) avant d'appeler `renderObject()` ou `updateVisualization()`.

Référence complète : section **Performance** de `docs/STYLEGUIDE.md`.

---

### 1. Override de `get events()` dans Component

```typescript
// FAUX — casse le système DI
class MyManager extends Component
{
    private _myEvents = new EventEmitter();
    get events() { return this._myEvents; }  // CASSE LA RÉSOLUTION DI
}

// CORRECT — utiliser un nom différent
class MyManager extends Component
{
    private _myEvents = new EventEmitter();
    get managerEvents() { return this._myEvents; }
}
```

Le système DI utilise `Component.events` (via `this._events`) pour la résolution des dépendances. L'overrider déconnecte les listeners DI.

### 2. Récursion infinie avec createRoomObject

```typescript
// FAUX — RoomInstance.createRoomObject() appelle container.createRoomObject()
// qui rappelle room.createRoomObject() → boucle infinie
createRoomObject(roomId, objectId, type, category)
{
    const room = this._rooms.get(roomId);
    return room.createRoomObject(objectId, type, category);  // RÉCURSION
}

// CORRECT — utiliser createObjectInternal
createRoomObject(roomId, objectId, type, category)
{
    const room = this._rooms.get(roomId);
    return room.createObjectInternal(objectId, 1, type, category);
}
```

### 3. Imports engine → client

```typescript
// FAUX — l'engine ne doit JAMAIS connaître le client
import { navigatorStore } from '@ui/stores/navigatorStore';  // INTERDIT

// CORRECT — l'engine émet des events, le client écoute
this.emit('searchResults', results);  // L'engine émet
```

### 4. Oublier de lire l'AS3

Avant CHAQUE implémentation, vérifier :
- As-tu lu le fichier AS3 source ?
- As-tu vérifié les `implements` ?
- As-tu vérifié le dossier `handler/` ?
- As-tu lu l'interface `I<Classe>.as` ?

Si la réponse est non à l'une de ces questions, STOP et lis d'abord.
