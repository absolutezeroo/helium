# Guide de style Helium

Ce document définit toutes les conventions de code du projet. Ces règles sont obligatoires et sans exception.

## Table des matières

1. [Formatage](#formatage)
2. [Nommage](#nommage)
3. [Imports et exports](#imports-et-exports)
4. [Classes et interfaces](#classes-et-interfaces)
5. [Méthodes](#méthodes)
6. [Propriétés](#propriétés)
7. [JSDoc](#jsdoc)
8. [Structure de fichier](#structure-de-fichier)
9. [Conventions spécifiques Habbo](#conventions-spécifiques-habbo)

---

## Formatage

### Accolades : Allman (OBLIGATOIRE)

L'accolade ouvrante est TOUJOURS sur sa propre ligne. Aucune exception.

```typescript
// CORRECT
export class RoomSession
{
    constructor()
    {
        if(condition)
        {
            doSomething();
        }
        else
        {
            doSomethingElse();
        }
    }
}

// FAUX — K&R interdit
export class RoomSession {
    constructor() {
        if(condition) {
```

### Indentation

- 4 espaces (pas de tabulations)
- Contenu indenté à l'intérieur des accolades

### Espacement

```typescript
// Pas d'espace avant les parenthèses
if(condition)           // CORRECT
if (condition)          // FAUX

for(let i = 0; ...)    // CORRECT
for (let i = 0; ...)   // FAUX

myFunction()            // CORRECT
myFunction ()           // FAUX

// Espace après les virgules
foo(a, b, c)            // CORRECT
foo(a,b,c)              // FAUX

// Espaces autour des opérateurs
x = a + b               // CORRECT
x=a+b                   // FAUX
```

### Lignes vides

- Une ligne vide entre les méthodes
- Une ligne vide entre les sections logiques dans une méthode longue
- Pas de lignes vides multiples consécutives
- Pas de ligne vide après l'accolade ouvrante d'une classe ou méthode

---

## Nommage

| Élément | Convention | Exemples |
|---------|-----------|----------|
| Classes | PascalCase | `RoomSessionManager`, `AvatarRenderManager` |
| Interfaces | `I` + PascalCase | `IRoomSessionManager`, `IMessageParser` |
| Champs privés | `_` + camelCase | `_roomId`, `_sessions`, `_disposed` |
| Champs protégés | `_` + camelCase | `_connection`, `_listener` |
| Champs publics | camelCase | `roomId`, `name` (rare, préférer des getters) |
| Méthodes publiques | camelCase | `getSession()`, `createRoom()` |
| Méthodes privées | camelCase | `processEvent()`, `parseData()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_ROOM_COUNT`, `DEFAULT_TIMEOUT` |
| Enums | PascalCase | `RoomType.Public`, `ObjectCategory.Floor` |
| Paramètres de type | Lettre majuscule | `T`, `K`, `V` |
| Fichiers de classe | PascalCase | `RoomSession.ts`, `IRoomSession.ts` |
| Fichiers utilitaires | camelCase | `colorUtils.ts`, `mathHelper.ts` |

### Correspondance AS3

Les noms DOIVENT correspondre à l'AS3 sauf quand la convention TypeScript impose un changement :

```
AS3: RoomSessionManager      → TS: RoomSessionManager       (identique)
AS3: IRoomSessionManager     → TS: IRoomSessionManager       (identique)
AS3: _roomSessions           → TS: _roomSessions             (identique)
AS3: var k_MAX_ROOMS:int     → TS: MAX_ROOMS (const)         (convention TS)
AS3: function dispose():void → TS: dispose(): void           (identique)
```

---

## Imports et exports

### Import type

```typescript
// Utiliser import type pour les types uniquement
import type { IRoomSession } from './IRoomSession';
import type { IMessageDataWrapper } from '@core/communication/messages/IMessageDataWrapper';

// Import régulier pour les valeurs (classes, fonctions, constantes)
import { RoomSession } from './RoomSession';
import { Component } from '@core/di/Component';
```

### Alias de chemins

Toujours préférer les alias aux chemins relatifs profonds :

```typescript
// CORRECT — alias
import { Component } from '@core/di/Component';
import type { IRoomEngine } from '@room/IRoomEngine';

// FAUX — chemin relatif profond
import { Component } from '../../../../core/di/Component';
```

### Named exports uniquement

```typescript
// CORRECT
export { RoomSessionManager };
export type { IRoomSessionManager };

// FAUX
export default RoomSessionManager;
```

### Ordre des imports

1. Types externes (`import type` de packages tiers)
2. Imports externes (packages tiers)
3. Types internes (`import type` depuis `@core/`, `@habbo/`, etc.)
4. Imports internes (depuis `@core/`, `@habbo/`, etc.)
5. Imports relatifs

---

## Classes et interfaces

### Structure de classe

```typescript
/**
 * Description de la classe.
 *
 * @see sources/source_as_win63/habbo/module/ClassName.as
 */
export class ClassName extends ParentClass implements IClassName
{
    // 1. Constantes statiques
    public static readonly MAX_COUNT: number = 100;

    // 2. Champs privés/protégés
    private _id: number;
    private _name: string;
    private _disposed: boolean = false;

    // 3. Constructeur
    constructor(id: number, name: string)
    {
        super();

        this._id = id;
        this._name = name;
    }

    // 4. Getters/Setters
    get id(): number { return this._id; }
    get name(): string { return this._name; }

    set name(value: string)
    {
        this._name = value;
    }

    // 5. Méthodes publiques
    public doSomething(): void
    {
        // ...
    }

    // 6. Méthodes protégées
    protected processInternal(): void
    {
        // ...
    }

    // 7. Méthodes privées
    private handleEvent(): void
    {
        // ...
    }

    // 8. dispose() — TOUJOURS en dernier
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        // Nettoyage...
    }
}
```

### Interface

```typescript
/**
 * Interface for ClassName.
 *
 * @see sources/source_as_win63/habbo/module/IClassName.as
 */
export interface IClassName
{
    readonly id: number;
    readonly name: string;

    doSomething(): void;
    dispose(): void;
}
```

### Règles

- Chaque classe a une interface `I*` dans un fichier séparé
- L'interface liste uniquement les membres publics
- Les interfaces utilisent `readonly` pour les getters sans setter

---

## Méthodes

### Vérifications en début de méthode

```typescript
// Pattern standard pour les handlers de messages
private onRoomInfo(event: RoomInfoEvent): void
{
    if(!event) return;

    const parser = event.parser;

    if(!parser) return;

    // Traitement...
}
```

### Retours null

```typescript
// Retourner null (pas undefined) pour les valeurs optionnelles
public getSession(roomId: number): IRoomSession | null
{
    return this._sessions.get(roomId) ?? null;
}
```

### dispose()

```typescript
// TOUJOURS la dernière méthode de la classe
dispose(): void
{
    if(this._disposed) return;

    this._disposed = true;

    // 1. Retirer les listeners
    // 2. Vider les collections
    // 3. Nullifier les références
    this._sessions.clear();
    this._connection = null;
}
```

---

## Propriétés

### Getters courts (une ligne)

```typescript
get roomId(): number { return this._roomId; }
get name(): string { return this._name; }
get isDisposed(): boolean { return this._disposed; }
```

### Getters longs (multi-ligne)

```typescript
get fullName(): string
{
    if(!this._firstName || !this._lastName) return '';

    return `${this._firstName} ${this._lastName}`;
}
```

### Setters

```typescript
set name(value: string)
{
    if(this._name === value) return;

    this._name = value;
}
```

---

## JSDoc

### Obligatoire sur

- Toutes les classes
- Toutes les méthodes publiques
- Toutes les interfaces

### Format

```typescript
/**
 * Description courte de la classe/méthode.
 *
 * @see sources/source_as_win63/habbo/module/ClassName.as
 */
```

### Paramètres et retours

```typescript
/**
 * Creates a new room session.
 *
 * @param roomId - The room identifier
 * @param password - The room password (empty string if none)
 * @returns The created session, or null if creation failed
 */
public createSession(roomId: number, password: string): IRoomSession | null
```

### Référence AS3

Le tag `@see` DOIT pointer vers le fichier AS3 source correspondant :

```typescript
/**
 * @see sources/source_as_win63/habbo/session/RoomSessionManager.as
 */
```

---

## Structure de fichier

### Un fichier = une classe/interface

```
RoomSession.ts          → export class RoomSession
IRoomSession.ts         → export interface IRoomSession
RoomSessionManager.ts   → export class RoomSessionManager
IRoomSessionManager.ts  → export interface IRoomSessionManager
```

### Organisation des dossiers

Suivre la structure AS3 :

```
source_as_win63/habbo/session/
├── RoomSessionManager.as
├── IRoomSessionManager.as
├── RoomSession.as
├── IRoomSession.as
└── handler/
    ├── RoomDataHandler.as
    └── RoomChatHandler.as

→ packages/helium-engine/src/habbo/session/
  ├── RoomSessionManager.ts
  ├── IRoomSessionManager.ts
  ├── RoomSession.ts
  ├── IRoomSession.ts
  └── handler/
      ├── RoomDataHandler.ts
      └── RoomChatHandler.ts
```

### Fichiers barrel (index.ts)

- Créer un `index.ts` par dossier de module pour les exports
- Exporter les classes publiques et les interfaces
- Ne PAS exporter les classes internes/privées

---

## Conventions spécifiques Habbo

### Classification ENGINE vs VIEW

- **ENGINE** : À implémenter — logique métier, modèles, handlers, parsers
- **VIEW** : À ignorer — fenêtres UI, dialogs, composants Flash (SolidJS les remplace)

### Mapping AS3 → TypeScript

| AS3 | TypeScript |
|-----|-----------|
| `int` | `number` |
| `uint` | `number` |
| `Number` | `number` |
| `String` | `string` |
| `Boolean` | `boolean` |
| `Array` | Type précis (`string[]`, `Map<K,V>`) |
| `Dictionary` | `Map<K, V>` |
| `Vector.<T>` | `T[]` |
| `Object` | Type précis ou `Record<string, unknown>` |
| `null` | `null` (pas `undefined`) |
| `Event` | `MessageEvent` ou event spécifique |
| `EventDispatcher` | `EventEmitter` (EventEmitter3) |

### Éviter `any`

```typescript
// FAUX
private _data: any;

// CORRECT — typer précisément
private _data: Map<number, RoomData>;
private _data: Record<string, unknown>;  // Si le type est vraiment inconnu
```
