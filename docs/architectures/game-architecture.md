# Game Architecture Documentation

This document categorizes all AS3 game files into **ENGINE** (game logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                           |
|----------|-------|-----------------------------------------------------------------------|
| ENGINE   | 42    | Game logic, synchronization, physics, events, game objects, utilities |
| VIEW     | 16    | UI rendering, window components, visual layouts, leaderboard displays |

---

## ENGINE FILES (We Need These)

### Root Game Files

| AS3 File                   | Purpose                                                                 | Status |
|----------------------------|-------------------------------------------------------------------------|--------|
| `game/class_1805.as`       | IHabboGameManager interface - defines game manager public API           | TODO   |
| `game/class_3523.as`       | HabboGames constants - game name identifiers (CYCLERACING, SNOWWAR)     | TODO   |
| `game/GameChatEvent.as`    | Game chat event data - user ID, message, bubble type                    | TODO   |
| `game/HabboGameManager.as` | Main game manager component - coordinates games, communication, session | TODO   |
| `game/IncomingMessages.as` | Hotel status incoming messages handler                                  | TODO   |

### Arena Core (Synchronization Engine)

| AS3 File                                        | Purpose                                                                           | Status |
|-------------------------------------------------|-----------------------------------------------------------------------------------|--------|
| `game/snowwar/arena/SynchronizedGameArena.as`   | Core game loop - turn management, event queue, checksum validation, team scoring  | TODO   |
| `game/snowwar/arena/class_3565.as`              | Game stage implementation - game objects, subturn execution, checksum calculation | TODO   |
| `game/snowwar/arena/class_3564.as`              | IGameStage interface - defines game stage operations                              | TODO   |
| `game/snowwar/arena/class_3615.as`              | IGameExtension interface - pulse interval, subturn count configuration            | TODO   |
| `game/snowwar/arena/DefaultGameStage.as`        | Base game stage class with game object management                                 | TODO   |
| `game/snowwar/arena/IGameObject.as`             | Base interface for all game objects - ID, type, state                             | TODO   |
| `game/snowwar/arena/ISynchronizedGameObject.as` | Interface for synchronized game objects - checksum, events                        | TODO   |
| `game/snowwar/arena/ISynchronizedGameEvent.as`  | Interface for synchronized game events - type, args, target                       | TODO   |

### Game Objects

| AS3 File                                                | Purpose                                                                               | Status |
|---------------------------------------------------------|---------------------------------------------------------------------------------------|--------|
| `game/snowwar/gameobjects/HumanGameObject.as`           | Player entity - movement, snowball throwing, health, scoring, ghost mode (750+ lines) | TODO   |
| `game/snowwar/gameobjects/SnowBallGameObject.as`        | Snowball projectile - trajectory physics, collision detection, damage                 | TODO   |
| `game/snowwar/gameobjects/SnowWarGameObject.as`         | Base game object class - position, collision, bounding volume                         | TODO   |
| `game/snowwar/gameobjects/SnowballMachineGameObject.as` | Snowball dispenser - unlimited snowball source                                        | TODO   |
| `game/snowwar/gameobjects/SnowballPileGameObject.as`    | Snowball pickup - limited snowball count, respawning                                  | TODO   |
| `game/snowwar/gameobjects/SnowballGivingGameObject.as`  | Base class for snowball sources - giving rate, capacity                               | TODO   |
| `game/snowwar/gameobjects/TreeGameObject.as`            | Destructible tree obstacle - health, destruction state                                | TODO   |

### Game Events

| AS3 File                                                    | Purpose                                                           | Status |
|-------------------------------------------------------------|-------------------------------------------------------------------|--------|
| `game/snowwar/events/class_3587.as`                         | SnowWarSynchronizedEvent base class - type, args, target handling | TODO   |
| `game/snowwar/events/CreateSnowballEvent.as`                | Snowball creation event - target position, trajectory             | TODO   |
| `game/snowwar/events/HumanGetsSnowballsFromMachineEvent.as` | Player collects snowballs from machine event                      | TODO   |
| `game/snowwar/events/HumanLeftGameEvent.as`                 | Player leaves game event                                          | TODO   |
| `game/snowwar/events/HumanStartsToMakeASnowballEvent.as`    | Player starts making snowball event                               | TODO   |
| `game/snowwar/events/HumanThrowsSnowballAtHumanEvent.as`    | Player throws at player event - trajectory type                   | TODO   |
| `game/snowwar/events/HumanThrowsSnowballAtPositionEvent.as` | Player throws at position event - target coordinates              | TODO   |
| `game/snowwar/events/MachineCreatesSnowballEvent.as`        | Machine generates snowball event                                  | TODO   |
| `game/snowwar/events/NewMoveTargetEvent.as`                 | Player movement target event - destination coordinates            | TODO   |

### SnowWar Core

| AS3 File                          | Purpose                                                                                  | Status |
|-----------------------------------|------------------------------------------------------------------------------------------|--------|
| `game/snowwar/SnowWarEngine.as`   | Main game engine - coordinates all game systems, communication, game state (1400+ lines) | TODO   |
| `game/snowwar/class_3353.as`      | Message handler - network events to game events mapping                                  | TODO   |
| `game/snowwar/class_3566.as`      | Extended game stage - tile management, heightmap parsing, pathfinding                    | TODO   |
| `game/snowwar/class_3602.as`      | ClickType constants - throw trajectory types (CYCLIC_NORMAL, CYCLIC_LOW, CYCLIC_HIGH)    | TODO   |
| `game/snowwar/class_3616.as`      | SnowWar game extension - 50ms pulse, 3 subturns per turn                                 | TODO   |
| `game/snowwar/Tile.as`            | Tile class - pathfinding node, occupancy, height, blocking state                         | TODO   |
| `game/snowwar/KeyboardControl.as` | Keyboard input to direction mapping - WASD/arrow key handling                            | TODO   |

### Enumerations

| AS3 File                        | Purpose                                             | Status |
|---------------------------------|-----------------------------------------------------|--------|
| `game/snowwar/enum/ViewMode.as` | Visualization mode enum - DEFAULT, GHOST, INVISIBLE | TODO   |

### Utilities (Math/Physics)

| AS3 File                             | Purpose                                                                        | Status |
|--------------------------------------|--------------------------------------------------------------------------------|--------|
| `game/snowwar/utils/Direction8.as`   | 8-direction enum with rotation utilities - N, NE, E, SE, S, SW, W, NW          | TODO   |
| `game/snowwar/utils/Direction360.as` | 360-degree direction with sine/cosine lookup tables                            | TODO   |
| `game/snowwar/utils/Location3D.as`   | 3D position - distance calculation, direction to target, coordinate operations | TODO   |
| `game/snowwar/utils/QuickRandom.as`  | Deterministic pseudo-random number generator for sync                          | TODO   |
| `game/snowwar/utils/class_3750.as`   | Fast integer square root calculation                                           | TODO   |
| `game/snowwar/utils/class_3757.as`   | Java-compatible integer division (handles negatives)                           | TODO   |
| `game/snowwar/utils/class_3828.as`   | Collision detection utilities - circle, box, triple-circle intersections       | TODO   |
| `game/snowwar/utils/class_3589.as`   | IPathfindingNode interface - pathfinding properties                            | TODO   |
| `game/snowwar/utils/class_3590.as`   | PathfindingNode base class - G/H/F costs, parent tracking                      | TODO   |
| `game/snowwar/utils/class_3629.as`   | IBoundingVolume interface - collision shape definition                         | TODO   |

---

## VIEW FILES (We Ignore These - SolidJS Handles UI)

### Game UI Components

| AS3 File                                       | Purpose                                                                   | Why Ignored      |
|------------------------------------------------|---------------------------------------------------------------------------|------------------|
| `game/snowwar/ui/SnowWarUI.as`                 | In-game HUD - snowball counter, timer, score, health bars, team display   | SolidJS replaces |
| `game/snowwar/ui/GameArenaView.as`             | Arena rendering - avatar updates, room engine integration, visual effects | SolidJS replaces |
| `game/snowwar/ui/GameEndingViewController.as`  | Results screen - player stats, winners, score breakdown                   | SolidJS replaces |
| `game/snowwar/ui/GameLoadingViewController.as` | Loading screen - player ready status, arena preview                       | SolidJS replaces |
| `game/snowwar/ui/GameLobbyWindowCtrl.as`       | Pre-game lobby - player list, countdown timer, cancel button              | SolidJS replaces |
| `game/snowwar/ui/GamesMainViewController.as`   | Main menu - play button, instructions, leaderboard link                   | SolidJS replaces |
| `game/snowwar/ui/BackgroundViewController.as`  | Background image rendering for game screens                               | SolidJS replaces |

### Leaderboard UI

| AS3 File                                                   | Purpose                                                     | Why Ignored      |
|------------------------------------------------------------|-------------------------------------------------------------|------------------|
| `game/snowwar/leaderboard/LeaderboardViewController.as`    | Leaderboard window controller - tab switching, data display | SolidJS replaces |
| `game/snowwar/leaderboard/LeaderboardTable.as`             | Base leaderboard table - data model, pagination, sorting    | SolidJS replaces |
| `game/snowwar/leaderboard/TotalLeaderboardTable.as`        | All-time leaderboard data                                   | SolidJS replaces |
| `game/snowwar/leaderboard/TotalGroupLeaderboardTable.as`   | Group all-time leaderboard data                             | SolidJS replaces |
| `game/snowwar/leaderboard/WeeklyTotalLeaderboardTable.as`  | Weekly leaderboard data                                     | SolidJS replaces |
| `game/snowwar/leaderboard/WeeklyGroupLeaderboardTable.as`  | Weekly group leaderboard data                               | SolidJS replaces |
| `game/snowwar/leaderboard/WeeklyFriendLeaderboardTable.as` | Weekly friends leaderboard data                             | SolidJS replaces |

### Window Utilities

| AS3 File                                             | Purpose                                                        | Why Ignored      |
|------------------------------------------------------|----------------------------------------------------------------|------------------|
| `game/snowwar/utils/WindowUtils.as`                  | Flash window creation utilities - XML parsing, bitmap handling | SolidJS replaces |
| `game/snowwar/utils/SnowWarAnimatedWindowElement.as` | Animated UI element - frame-based animation on windows         | SolidJS replaces |

---

## Architecture Notes

### Game Synchronization System

The SnowWar game uses a deterministic synchronization model:

1. **SynchronizedGameArena** manages the main game loop with turns and subturns
2. Each turn is divided into 3 subturns (configured in `class_3616.as`)
3. Game state is validated via checksums calculated from all game objects
4. Events are queued and executed at specific subturns for determinism
5. **Ghost player** system allows client-side prediction while waiting for server confirmation

### Game Object Hierarchy

```
IGameObject (interface)
  |
  +-- ISynchronizedGameObject (interface)
        |
        +-- SnowWarGameObject (base class)
              |
              +-- HumanGameObject (players)
              +-- SnowBallGameObject (projectiles)
              +-- SnowballGivingGameObject (base)
              |     +-- SnowballMachineGameObject
              |     +-- SnowballPileGameObject
              +-- TreeGameObject (obstacles)
```

### Key Constants

- **Pulse interval**: 50ms (from `class_3616.as`)
- **Subturns per turn**: 3
- **Direction8 values**: N=0, NE=1, E=2, SE=3, S=4, SW=5, W=6, NW=7
- **Throw types**: CYCLIC_NORMAL=0, CYCLIC_LOW=1, CYCLIC_HIGH=2

### Collision Detection

The game uses multiple collision shapes defined in `class_3828.as`:
- **Circle-to-circle**: Basic distance check
- **Circle-to-box**: Point-in-rectangle with radius
- **Triple-circle**: Three overlapping circles for complex shapes

### Pathfinding

Tiles implement `IPathfindingNode` interface for A* pathfinding:
- Each tile tracks G cost (distance from start), H cost (heuristic to goal), F cost (G+H)
- Tiles can be blocked by objects or have height restrictions
- Movement is constrained to 8 directions

---

## Migration Priority

### Phase 1: Core Game Logic
1. `SynchronizedGameArena.as` - Game loop
2. `class_3565.as` - Game stage
3. `HumanGameObject.as` - Player logic
4. All event classes - Game state changes

### Phase 2: Physics & Utilities
1. `Direction8.as`, `Direction360.as` - Direction math
2. `Location3D.as` - Position calculations
3. `class_3828.as` - Collision detection
4. `QuickRandom.as` - Deterministic random

### Phase 3: Game Objects
1. `SnowBallGameObject.as` - Projectiles
2. `TreeGameObject.as` - Obstacles
3. `SnowballMachineGameObject.as`, `SnowballPileGameObject.as` - Pickups

### Phase 4: Integration
1. `SnowWarEngine.as` - Main coordinator (extract non-UI logic)
2. `class_3353.as` - Message handling
3. `Tile.as`, `class_3566.as` - Map/stage management
