# Helium Code Style Guide

> **Version**: 1.0.0
> **Sources de vérité**: AS3 (logique), Nitro Renderer (TypeScript patterns), Nitro React (UI patterns)

Ce document définit les conventions strictes pour le développement d'Helium. Toute contribution doit suivre ces règles.

---

## Table des matières

1. [Principes généraux](#1-principes-généraux)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Composers (Messages sortants)](#3-composers-messages-sortants)
4. [Parsers (Messages entrants)](#4-parsers-messages-entrants)
5. [Events (Événements de messages)](#5-events-événements-de-messages)
6. [Managers (Services)](#6-managers-services)
7. [Data Classes (Modèles)](#7-data-classes-modèles)
8. [Interfaces](#8-interfaces)
9. [Enums et Constantes](#9-enums-et-constantes)
10. [Imports et Exports](#10-imports-et-exports)
11. [Documentation](#11-documentation)
12. [Checklist de revue](#12-checklist-de-revue)

---

## 1. Principes généraux

### 1.1 Hiérarchie des sources

```
┌─────────────────────────────────────────────────────────────┐
│  1. AS3 (source_as/)           → Logique métier, structure  │
│  2. Nitro Renderer             → Patterns TypeScript        │
│  3. Nitro React (source_nitro_react/) → Patterns UI/Store   │
└─────────────────────────────────────────────────────────────┘
```

**Règle absolue**: Toujours lire le code AS3 AVANT d'implémenter une feature.

### 1.2 Conventions de nommage

| Type              | Convention       | Exemple                 |
|-------------------|------------------|-------------------------|
| Classes           | PascalCase       | `SessionDataManager`    |
| Interfaces        | I + PascalCase   | `ISessionDataManager`   |
| Fichiers          | PascalCase.ts    | `SessionDataManager.ts` |
| Variables privées | _ + camelCase    | `_userId`               |
| Constantes        | UPPER_SNAKE_CASE | `MAX_USERS`             |
| Méthodes          | camelCase        | `getUserById()`         |
| Paramètres        | camelCase        | `userId: number`        |

### 1.3 Formatage

```typescript
// Accolades: style Allman (nouvelle ligne)
export class Example
{
	private _value: number = 0;

	get value(): number
	{
		return this._value;
	}

	doSomething(): void
	{
		if (condition)
		{
			// ...
		}
	}
}
```

### 1.4 Ordre des membres d'une classe

```typescript
export class ExampleClass
{
	// 1. Constantes statiques
	public static readonly MAX_VALUE: number = 100;
	private static readonly DEFAULT_NAME: string = '';

	// 2. Propriétés privées avec getters (groupés)
	private _id: number = 0;

	get id(): number
	{
		return this._id;
	}

	private _name: string = '';

	get name(): string
	{
		return this._name;
	}

	// 3. Constructeur
	constructor(id: number, name: string)
	{
		this._id = id;
		this._name = name;
	}

	// 4. Méthodes publiques
	public doSomething(): void
	{
		// ...
	}

	// 5. Méthodes privées
	private helperMethod(): void
	{
		// ...
	}

	// 6. Dispose (toujours en dernier)
	dispose(): void
	{
		// ...
	}
}
```

---

## 2. Structure des fichiers

### 2.1 Arborescence des messages

```
src/habbo/communication/messages/
├── incoming/                    # Events (Server → Client)
│   ├── availability/
│   │   └── AvailabilityStatusMessageEvent.ts
│   ├── avatar/
│   │   └── FigureUpdateMessageEvent.ts
│   └── {feature}/
│       └── {Feature}MessageEvent.ts
│
├── outgoing/                    # Composers (Client → Server)
│   ├── handshake/
│   │   └── ClientHelloMessageComposer.ts
│   └── {feature}/
│       └── {Action}MessageComposer.ts
│
└── parser/                      # Parsers
    ├── availability/
    │   └── AvailabilityStatusMessageParser.ts
    └── {feature}/
        └── {Feature}MessageParser.ts
```

### 2.2 Nommage des fichiers

| Type       | Pattern                        | Exemple                              |
|------------|--------------------------------|--------------------------------------|
| Composer   | `{Action}MessageComposer.ts`   | `CreateFlatMessageComposer.ts`       |
| Parser     | `{Feature}MessageParser.ts`    | `AvailabilityStatusMessageParser.ts` |
| Event      | `{Feature}MessageEvent.ts`     | `FigureUpdateMessageEvent.ts`        |
| Manager    | `{Domain}Manager.ts`           | `SessionDataManager.ts`              |
| Interface  | `I{Name}.ts`                   | `ISessionDataManager.ts`             |
| Data/Model | `{Name}Data.ts` ou `{Name}.ts` | `FigureData.ts`, `FurnitureItem.ts`  |

---

## 3. Composers (Messages sortants)

### 3.1 Template strict

```typescript
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * [Description courte du message]
 *
 * @see source_as/habbo/communication/messages/outgoing/{feature}/{Name}MessageComposer.as
 */
export class
{
	Name
}

MessageComposer
implements
IMessageComposer < ConstructorParameters < typeof {Name}
MessageComposer >>
{
	private _data
:
ConstructorParameters < typeof {Name}
MessageComposer >;

constructor(/* paramètres typés */)
{
	this._data = [/* paramètres dans l'ordre */];
}

getMessageArray()
{
	return this._data;
}

dispose()
:
void
	{
		return;
	}
}
```

### 3.2 Exemples

#### Composer sans paramètres

```typescript
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Demande la liste des favoris du navigateur
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetUserFlatCatsMessageComposer.as
 */
export class GetUserFlatCatsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetUserFlatCatsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetUserFlatCatsMessageComposer>;

	constructor()
	{
		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
```

#### Composer avec paramètres simples

```typescript
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Change le nom d'utilisateur
 *
 * @see source_as/habbo/communication/messages/outgoing/avatar/ChangeUserNameMessageComposer.as
 */
export class ChangeUserNameMessageComposer implements IMessageComposer<ConstructorParameters<typeof ChangeUserNameMessageComposer>>
{
	private _data: ConstructorParameters<typeof ChangeUserNameMessageComposer>;

	constructor(newName: string)
	{
		this._data = [newName];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
```

#### Composer avec paramètres multiples

```typescript
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Crée une nouvelle room
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/CreateFlatMessageComposer.as
 */
export class CreateFlatMessageComposer implements IMessageComposer<ConstructorParameters<typeof CreateFlatMessageComposer>>
{
	private _data: ConstructorParameters<typeof CreateFlatMessageComposer>;

	constructor(
		roomName: string,
		roomDescription: string,
		roomModel: string,
		categoryId: number,
		maxUsers: number,
		tradeMode: number
	)
	{
		this._data = [roomName, roomDescription, roomModel, categoryId, maxUsers, tradeMode];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
```

#### Composer avec logique de construction

```typescript
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Définit les badges actifs (portés)
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/badges/SetActivatedBadgesComposer.as
 */
export class SetActivatedBadgesComposer implements IMessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(...badgeIds: string[])
	{
		this._data = [];

		for (let i = 0; i < 5; i++)
		{
			this._data.push(i + 1);           // slot (1-5)
			this._data.push(badgeIds[i] ?? ''); // badge id ou vide
		}
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
```

### 3.3 Règles des Composers

| Règle               | Description                                                          |
|---------------------|----------------------------------------------------------------------|
| **Interface**       | Toujours `IMessageComposer<ConstructorParameters<typeof ClassName>>` |
| **Type alternatif** | Utiliser `unknown[]` si logique de construction complexe             |
| **_data**           | Toujours privé, initialisé dans le constructeur                      |
| **Ordre**           | Les paramètres dans `_data` DOIVENT suivre l'ordre AS3               |
| **dispose()**       | Toujours `return;` (pas de cleanup nécessaire en TS)                 |
| **JSDoc**           | Obligatoire avec `@see` vers le fichier AS3                          |

---

## 4. Parsers (Messages entrants)

### 4.1 Template strict

```typescript
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * [Description courte]
 *
 * @see source_as/habbo/communication/messages/parser/{feature}/{Name}MessageParser.as
 */
export class
{
	Name
}

MessageParser
implements
IMessageParser
{
	// Propriétés privées avec getters (groupées)
private
	_
	{
		property1
	}
:
	{
		type
	}
	= {defaultValue};

	get
	{
		property1
	}
	(): { type }
	{
		return this._
		{
			property1
		}
		;
	}

private
	_
	{
		property2
	}
:
	{
		type
	}
	= {defaultValue};

	get
	{
		property2
	}
	(): { type }
	{
		return this._
		{
			property2
		}
		;
	}

	// Méthodes de l'interface
	flush()
:
	boolean
	{
		this._
		{
			property1
		}
		= {defaultValue};
		this._
		{
			property2
		}
		= {defaultValue};
		return true;
	}

	parse(wrapper
:
	IMessageDataWrapper
):
	boolean
	{
		if (!wrapper) return false;

		this._
		{
			property1
		}
		= wrapper.read
		{
			Type
		}
		();
		this._
		{
			property2
		}
		= wrapper.read
		{
			Type
		}
		();

		return true;
	}
}
```

### 4.2 Exemples

#### Parser simple

```typescript
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser pour le statut de disponibilité de l'hôtel
 *
 * @see source_as/habbo/communication/messages/parser/availability/AvailabilityStatusMessageEventParser.as
 */
export class AvailabilityStatusMessageParser implements IMessageParser
{
	private _isOpen: boolean = false;

	get isOpen(): boolean
	{
		return this._isOpen;
	}

	private _onShutDown: boolean = false;

	get onShutDown(): boolean
	{
		return this._onShutDown;
	}

	private _isAuthenticHabbo: boolean = false;

	get isAuthenticHabbo(): boolean
	{
		return this._isAuthenticHabbo;
	}

	flush(): boolean
	{
		this._isOpen = false;
		this._onShutDown = false;
		this._isAuthenticHabbo = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._isOpen = wrapper.readBoolean();
		this._onShutDown = wrapper.readBoolean();

		if (wrapper.bytesAvailable > 0)
		{
			this._isAuthenticHabbo = wrapper.readBoolean();
		}

		return true;
	}
}
```

#### Parser avec collection

```typescript
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FurniListItemParser} from './FurniListItemParser';

/**
 * Parser pour la liste de meubles de l'inventaire
 *
 * @see source_as/habbo/communication/messages/parser/inventory/furni/FurniListMessageParser.as
 */
export class FurniListMessageParser implements IMessageParser
{
	private _totalFragments: number = 0;

	get totalFragments(): number
	{
		return this._totalFragments;
	}

	private _fragmentIndex: number = 0;

	get fragmentIndex(): number
	{
		return this._fragmentIndex;
	}

	private _items: FurniListItemParser[] = [];

	get items(): FurniListItemParser[]
	{
		return this._items;
	}

	flush(): boolean
	{
		this._totalFragments = 0;
		this._fragmentIndex = 0;
		this._items = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._totalFragments = wrapper.readInt();
		this._fragmentIndex = wrapper.readInt();

		const itemCount = wrapper.readInt();

		for (let i = 0; i < itemCount; i++)
		{
			this._items.push(new FurniListItemParser(wrapper));
		}

		return true;
	}
}
```

#### Parser imbriqué (Data class)

```typescript
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/inventory/items/IStuffData';
import {StuffDataFactory} from '@habbo/inventory/items/stuffdata';

/**
 * Parser pour un item de meuble individuel
 * Note: N'implémente PAS IMessageParser car utilisé comme nested parser
 *
 * @see source_as/habbo/communication/messages/incoming/inventory/furni/class_1707.as
 */
export class FurniListItemParser
{
	private static readonly WALL_ITEM_TYPE = 'I';
	private static readonly FLOOR_ITEM_TYPE = 'S';

	private _itemId: number = 0;

	get itemId(): number
	{
		return this._itemId;
	}

	private _itemType: string = '';

	get itemType(): string
	{
		return this._itemType;
	}

	private _stuffData: IStuffData | null = null;

	get stuffData(): IStuffData | null
	{
		return this._stuffData;
	}

	// Pas de flush() - utilisé une seule fois puis jeté

	constructor(wrapper: IMessageDataWrapper)
	{
		this.parse(wrapper);
	}

	private parse(wrapper: IMessageDataWrapper): void
	{
		this._itemId = wrapper.readInt();
		this._itemType = wrapper.readString();
		this._stuffData = StuffDataFactory.parseStuffData(wrapper);

		// Parsing conditionnel selon le type
		if (this._itemType === FurniListItemParser.FLOOR_ITEM_TYPE)
		{
			// Lecture supplémentaire pour les items de sol
		}
	}
}
```

### 4.3 Règles des Parsers

| Règle                 | Description                                                    |
|-----------------------|----------------------------------------------------------------|
| **Interface**         | `IMessageParser` pour les parsers principaux                   |
| **Nested parsers**    | Pas d'interface, constructeur avec wrapper                     |
| **Validation**        | Toujours `if (!wrapper) return false;` en début de `parse()`   |
| **Champs optionnels** | Vérifier `wrapper.bytesAvailable > 0` avant lecture            |
| **flush()**           | Réinitialiser TOUTES les propriétés à leurs valeurs par défaut |
| **Ordre de lecture**  | DOIT correspondre exactement à l'ordre AS3                     |
| **Getters**           | Toujours readonly (pas de setters publics)                     |
| **Collections**       | Utiliser des classes typées, pas `any[]`                       |

### 4.4 Méthodes de lecture disponibles

```typescript
wrapper.readInt();        // number (32-bit signed)
wrapper.readShort();      // number (16-bit signed)
wrapper.readByte();       // number (8-bit signed)
wrapper.readBoolean();    // boolean
wrapper.readString();     // string
wrapper.readFloat();      // number (32-bit float)
wrapper.readDouble();     // number (64-bit float)
wrapper.readLong();       // bigint (64-bit signed)
wrapper.readBytes(length); // Uint8Array
wrapper.bytesAvailable;   // number (bytes restants)
```

---

## 5. Events (Événements de messages)

### 5.1 Template strict

```typescript
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {

{
	Name
}
MessageParser
}
from
'../../parser/{feature}/{Name}MessageParser';

/**
 * [Description de l'événement]
 *
 * @see source_as/habbo/communication/messages/incoming/{feature}/{Name}Event.as
 */
export class
{
	Name
}

MessageEvent
extends
MessageEvent
{
	constructor(callback
:
	MessageEventCallback
)
	{
		super(callback, {Name}
		MessageParser
	)
		;
	}
}
```

### 5.2 Exemples

#### Event simple

```typescript
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AvailabilityStatusMessageParser} from '../../parser/availability/AvailabilityStatusMessageParser';

/**
 * Événement de statut de disponibilité de l'hôtel
 * Indique si l'hôtel est ouvert, en fermeture, etc.
 *
 * @see source_as/habbo/communication/messages/incoming/availability/AvailabilityStatusMessageEvent.as
 */
export class AvailabilityStatusMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AvailabilityStatusMessageParser);
	}
}
```

#### Event avec constantes

```typescript
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ChangeUserNameResultMessageParser} from '../../parser/avatar/ChangeUserNameResultMessageParser';

/**
 * Résultat du changement de nom d'utilisateur
 *
 * @see source_as/habbo/communication/messages/incoming/avatar/ChangeUserNameResultMessageEvent.as
 */
export class ChangeUserNameResultMessageEvent extends MessageEvent
{
	public static readonly NAME_OK: number = 0;
	public static readonly ERROR_NAME_REQUIRED: number = 1;
	public static readonly ERROR_NAME_TOO_SHORT: number = 2;
	public static readonly ERROR_NAME_TOO_LONG: number = 3;
	public static readonly ERROR_NAME_NOT_VALID: number = 4;
	public static readonly ERROR_NAME_IN_USE: number = 5;
	public static readonly ERROR_NAME_CHANGE_NOT_ALLOWED: number = 6;
	public static readonly ERROR_MERGE_HOTEL_DOWN: number = 7;

	constructor(callback: MessageEventCallback)
	{
		super(callback, ChangeUserNameResultMessageParser);
	}
}
```

### 5.3 Règles des Events

| Règle                  | Description                                             |
|------------------------|---------------------------------------------------------|
| **Héritage**           | Toujours `extends MessageEvent`                         |
| **Constructeur**       | Un seul paramètre: `callback: MessageEventCallback`     |
| **Super call**         | `super(callback, ParserClass)` - pas d'instanciation    |
| **Constantes**         | `public static readonly` pour les codes d'erreur/statut |
| **Pas de getParser()** | Utiliser `event.parser` puis cast si nécessaire         |
| **Nommage**            | `{Feature}MessageEvent` (toujours avec "Message")       |

### 5.4 Utilisation des Events

```typescript
// Enregistrement
this._communication.addMessageEvent(
	new AvailabilityStatusMessageEvent(this.onAvailabilityStatus.bind(this))
);

// Handler
private
onAvailabilityStatus(event
:
AvailabilityStatusMessageEvent
):
void
	{
		const parser = event.parser as AvailabilityStatusMessageParser;

		if(parser.isOpen
)
{
	// Hôtel ouvert
}
}
```

---

## 6. Managers (Services)

### 6.1 Template strict

```typescript
import {injectable} from 'inversify';
import {EventEmitter} from 'eventemitter3';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {I

{
	Name
}
Manager
}
from
'./I{Name}Manager';

/**
 * [Description du manager]
 *
 * @see source_as/habbo/{feature}/{Name}Manager.as
 */
@injectable()
export class
{
	Name
}

Manager
extends
EventEmitter < {Name}
ManagerEvents > implements
I
{
	Name
}
Manager
{
	// Dépendances injectées
private
	_communication: IHabboCommunicationManager;

	// État interne
private
	_messageEvents: IMessageEvent[] = [];
private
	_disposed: boolean = false;

	constructor(communication
:
	IHabboCommunicationManager
)
	{
		super();
		this._communication = communication;
		this.registerMessageEvents();
	}

	// Méthodes publiques de l'interface
public
	doSomething()
:
	void
		{
			// ...
		}

	// Enregistrement des events
private
	registerMessageEvents()
:
	void
		{
			this.addMessageEvent(new SomeMessageEvent(this.onSomeMessage.bind(this)));
		}

private
	addMessageEvent(event
:
	IMessageEvent
):
	void
		{
			this._communication.addMessageEvent(event);
			this._messageEvents.push(event);
		}

	// Handlers privés
private
	onSomeMessage(event
:
	SomeMessageEvent
):
	void
		{
			const parser = event.parser as SomeMessageParser;
			// Traitement...
			this.emit('someEvent', data);
		}

	// Dispose
	dispose()
:
	void
		{
			if(this._disposed
)
	return;

	for (const event of this._messageEvents)
	{
		this._communication.removeMessageEvent(event);
	}

	this._messageEvents = [];
	this._disposed = true;
}
}
```

### 6.2 Interface du Manager

```typescript
import type {EventEmitter} from 'eventemitter3';

export interface {
	Name
}

ManagerEvents
{
	'eventName'
:
	(data: DataType) => void;
	'anotherEvent'
:
	() => void;
}

export interface I
{
	Name
}

Manager
extends
EventEmitter < {Name}
ManagerEvents >
{
	// Propriétés readonly
	readonly someProperty
:
string;

// Méthodes
doSomething()
:
void;
dispose()
:
void;
}
```

### 6.3 Règles des Managers

| Règle              | Description                                       |
|--------------------|---------------------------------------------------|
| **Décorateur**     | Toujours `@injectable()`                          |
| **EventEmitter**   | Hériter de `EventEmitter<ManagerEvents>`          |
| **Interface**      | Implémenter `I{Name}Manager`                      |
| **DI**             | Injection par constructeur uniquement             |
| **Message events** | Tracker dans `_messageEvents[]` pour cleanup      |
| **Handlers**       | Toujours `.bind(this)` dans registerMessageEvents |
| **Dispose**        | Vérifier `_disposed`, nettoyer les events         |

---

## 7. Data Classes (Modèles)

### 7.1 Template strict

```typescript
/**
 * [Description du modèle]
 *
 * @see source_as/habbo/{feature}/{Name}.as
 */
export class
{
	Name
}

Data
{
	// Constantes statiques
public static readonly
	SOME_CONSTANT: number = 0;

	// Propriétés privées avec getters
private
	_
	{
		property
	}
:
	{
		type
	}
	;

	get
	{
		property
	}
	(): { type }
	{
		return this._
		{
			property
		}
		;
	}

	// Constructeur
	constructor(data
:
	{
		Name
	}
	DataInit
)
	{
		this._
		{
			property
		}
		= data.
		{
			property
		}
		;
	}

	// Méthodes de mise à jour (si mutable)
	update(data
:
	Partial < {Name}
	DataInit >
):
	void
		{
			if(data.{property} !== undefined
)
	{
		this._
		{
			property
		}
		= data.
		{
			property
		}
		;
	}
}
}

// Interface d'initialisation
export interface {
	Name
}

DataInit
{
	{
		property
	}
:
	{
		type
	}
	;
}
```

### 7.2 Exemple

```typescript
/**
 * Représente un ami dans la liste d'amis
 *
 * @see source_as/habbo/friendlist/MessengerFriend.as
 */
export class MessengerFriend
{
	public static readonly RELATIONSHIP_NONE: number = 0;
	public static readonly RELATIONSHIP_HEART: number = 1;
	public static readonly RELATIONSHIP_SMILE: number = 2;
	public static readonly RELATIONSHIP_BOBBA: number = 3;

	private _id: number;

	get id(): number
	{
		return this._id;
	}

	private _name: string;

	get name(): string
	{
		return this._name;
	}

	private _online: boolean;

	get online(): boolean
	{
		return this._online;
	}

	private _figure: string;

	get figure(): string
	{
		return this._figure;
	}

	constructor(data: MessengerFriendInit)
	{
		this._id = data.id;
		this._name = data.name;
		this._online = data.online;
		this._figure = data.figure;
	}

	/**
	 * Crée une instance depuis un parser
	 */
	static fromParser(parser: FriendParser): MessengerFriend
	{
		return new MessengerFriend({
			id: parser.id,
			name: parser.name,
			online: parser.online,
			figure: parser.figure,
		});
	}

	/**
	 * Met à jour les données de l'ami
	 */
	update(data: Partial<MessengerFriendInit>): void
	{
		if (data.name !== undefined) this._name = data.name;
		if (data.online !== undefined) this._online = data.online;
		if (data.figure !== undefined) this._figure = data.figure;
	}
}

export interface MessengerFriendInit
{
	id: number;
	name: string;
	online: boolean;
	figure: string;
}
```

---

## 8. Interfaces

### 8.1 Template strict

```typescript
/**
 * [Description de l'interface]
 */
export interface I
{
	Name
}

{
	// Propriétés readonly groupées par catégorie

	// === Identification ===
	readonly
	id: number;
	readonly
	name: string;

	// === État ===
	readonly
	isActive: boolean;

	// === Méthodes ===
	doSomething()
:
	void;
	dispose()
:
	void;
}
```

### 8.2 Règles des Interfaces

| Règle            | Description                                         |
|------------------|-----------------------------------------------------|
| **Préfixe**      | Toujours `I` pour les interfaces                    |
| **readonly**     | Utiliser pour les propriétés non-mutables           |
| **Groupement**   | Séparer par commentaires `// === Category ===`      |
| **Pas de `get`** | TypeScript gère les getters automatiquement         |
| **EventEmitter** | Hériter de `EventEmitter<EventsType>` si nécessaire |

---

## 9. Enums et Constantes

### 9.1 Pattern `as const` (recommandé)

```typescript
/**
 * Niveaux de club Habbo
 */
export const HabboClubLevelEnum = {
		NO_CLUB: 0,
		CLUB: 1,
		VIP: 2,
	} as const;

export type HabboClubLevel = typeof HabboClubLevelEnum[keyof typeof HabboClubLevelEnum];

// Fonctions helper
export function hasClub(level: number): boolean
{
	return level >= HabboClubLevelEnum.CLUB;
}

export function hasVip(level: number): boolean
{
	return level >= HabboClubLevelEnum.VIP;
}
```

### 9.2 Pattern Class Static (pour compatibilité AS3)

```typescript
/**
 * Types de produits du catalogue
 */
export class ProductTypeEnum
{
	public static readonly WALL: string = 'i';
	public static readonly FLOOR: string = 's';
	public static readonly EFFECT: string = 'e';
	public static readonly HABBO_CLUB: string = 'h';
	public static readonly BADGE: string = 'b';
	public static readonly PET: string = 'p';
}
```

---

## 10. Imports et Exports

### 10.1 Ordre des imports

```typescript
// 1. Imports de modules externes
import {injectable} from 'inversify';
import {EventEmitter} from 'eventemitter3';

// 2. Imports de types (avec 'type')
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

// 3. Imports locaux
import {SomeClass} from './SomeClass';
import {AnotherClass} from '../other/AnotherClass';
```

### 10.2 Path aliases

| Alias     | Chemin       | Usage                        |
|-----------|--------------|------------------------------|
| `@/`      | `src/`       | Imports généraux             |
| `@core/`  | `src/core/`  | Communication, assets, utils |
| `@habbo/` | `src/habbo/` | Logique Habbo                |
| `@room/`  | `src/room/`  | Engine de room               |
| `@iid/`   | `src/iid/`   | Inversify container          |

### 10.3 Règles

- Toujours utiliser `import type` pour les types purs
- Préférer les path aliases aux chemins relatifs profonds
- Un export par fichier (sauf barrel files)
- Pas de `export default`

---

## 11. Documentation

### 11.1 JSDoc obligatoire

```typescript
/**
 * Description courte de la classe/fonction.
 *
 * Description longue si nécessaire, expliquant le comportement,
 * les cas d'usage, etc.
 *
 * @see source_as/path/to/OriginalClass.as
 * @example
 * const instance = new MyClass(param);
 * instance.doSomething();
 */
```

### 11.2 Éléments à documenter

| Élément            | Obligatoire | Contenu                             |
|--------------------|-------------|-------------------------------------|
| Classes            | Oui         | Description + `@see` AS3            |
| Méthodes publiques | Oui         | Description + `@param` + `@returns` |
| Interfaces         | Oui         | Description du contrat              |
| Constantes         | Non         | Si non évident                      |
| Méthodes privées   | Non         | Si logique complexe                 |

---

## 12. Checklist de revue

### Avant de committer

- [ ] Ai-je lu le code AS3 correspondant ?
- [ ] Le nommage suit-il les conventions ?
- [ ] Les imports sont-ils ordonnés correctement ?
- [ ] Les types sont-ils explicites (pas de `any`) ?
- [ ] JSDoc présent avec `@see` vers AS3 ?
- [ ] `dispose()` nettoie-t-il toutes les ressources ?
- [ ] Les events sont-ils trackés pour cleanup ?
- [ ] L'ordre de lecture/écriture correspond-il à AS3 ?

### Pour les Composers

- [ ] Implémente `IMessageComposer<ConstructorParameters<...>>` ?
- [ ] `_data` initialisé dans le constructeur ?
- [ ] Ordre des paramètres identique à AS3 ?
- [ ] `dispose()` retourne `void` ?

### Pour les Parsers

- [ ] Implémente `IMessageParser` ?
- [ ] Validation `if (!wrapper) return false;` ?
- [ ] `flush()` réinitialise toutes les propriétés ?
- [ ] Getters pour toutes les propriétés privées ?
- [ ] Champs optionnels vérifiés avec `bytesAvailable` ?

### Pour les Events

- [ ] Étend `MessageEvent` ?
- [ ] Constructeur avec `MessageEventCallback` uniquement ?
- [ ] Constantes `public static readonly` si nécessaire ?
- [ ] Parser importé correctement ?

---

## Appendice: Migration AS3 → TypeScript

### Mapping des types

| AS3          | TypeScript                             |
|--------------|----------------------------------------|
| `int`        | `number`                               |
| `uint`       | `number`                               |
| `Number`     | `number`                               |
| `String`     | `string`                               |
| `Boolean`    | `boolean`                              |
| `Array`      | `T[]` ou `Array<T>`                    |
| `Dictionary` | `Map<K, V>`                            |
| `Vector.<T>` | `T[]`                                  |
| `Object`     | `Record<string, unknown>` ou interface |
| `*`          | `unknown` (jamais `any`)               |
| `Function`   | Type spécifique ou `() => void`        |
| `Class`      | `new (...args) => T`                   |

### Mapping des patterns

| AS3 Pattern            | TypeScript Pattern               |
|------------------------|----------------------------------|
| `extends Component`    | `@injectable()` + constructor DI |
| `IEventDispatcher`     | `EventEmitter<Events>`           |
| `param1.readInteger()` | `wrapper.readInt()`              |
| `var_xxx` (obfusqué)   | Nom descriptif avec `_` prefix   |
| `[SecureSWF]`          | JSDoc comment                    |
