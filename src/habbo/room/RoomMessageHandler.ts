/**
 * RoomMessageHandler
 *
 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler
 *
 * Handles all incoming server messages for rooms.
 * Bridges the communication layer to the room engine.
 */
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomCreator} from './IRoomCreator';
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';

// Message Events - Room Session
import {RoomReadyMessageEvent} from '../communication/messages/incoming/room/session/RoomReadyMessageEvent';
import type {RoomReadyMessageParser} from '../communication/messages/parser/room/session/RoomReadyMessageParser';

// Message Events - Room Engine
import {
	FurnitureAliasesMessageEvent
} from '../communication/messages/incoming/room/engine/FurnitureAliasesMessageEvent';
import {HeightMapMessageEvent} from '../communication/messages/incoming/room/engine/HeightMapMessageEvent';
import {FloorHeightMapMessageEvent} from '../communication/messages/incoming/room/engine/FloorHeightMapMessageEvent';
import {HeightMapUpdateMessageEvent} from '../communication/messages/incoming/room/engine/HeightMapUpdateMessageEvent';
import {ObjectsMessageEvent} from '../communication/messages/incoming/room/engine/ObjectsMessageEvent';
import {ObjectAddMessageEvent} from '../communication/messages/incoming/room/engine/ObjectAddMessageEvent';
import {ObjectUpdateMessageEvent} from '../communication/messages/incoming/room/engine/ObjectUpdateMessageEvent';
import {ObjectRemoveMessageEvent} from '../communication/messages/incoming/room/engine/ObjectRemoveMessageEvent';
import {
	ObjectDataUpdateMessageEvent
} from '../communication/messages/incoming/room/engine/ObjectDataUpdateMessageEvent';
import {ItemsMessageEvent} from '../communication/messages/incoming/room/engine/ItemsMessageEvent';
import {ItemAddMessageEvent} from '../communication/messages/incoming/room/engine/ItemAddMessageEvent';
import {ItemUpdateMessageEvent} from '../communication/messages/incoming/room/engine/ItemUpdateMessageEvent';
import {ItemRemoveMessageEvent} from '../communication/messages/incoming/room/engine/ItemRemoveMessageEvent';
import {UsersMessageEvent} from '../communication/messages/incoming/room/engine/UsersMessageEvent';
import {UserUpdateMessageEvent} from '../communication/messages/incoming/room/engine/UserUpdateMessageEvent';
import {UserRemoveMessageEvent} from '../communication/messages/incoming/room/engine/UserRemoveMessageEvent';
import {
	SlideObjectBundleMessageEvent
} from '../communication/messages/incoming/room/engine/SlideObjectBundleMessageEvent';

// Message Events - Room Chat
import {UserTypingMessageEvent} from '../communication/messages/incoming/room/chat/UserTypingMessageEvent';

// Message Events - Room Action
import {ExpressionMessageEvent} from '../communication/messages/incoming/room/action/ExpressionMessageEvent';
import {DanceMessageEvent} from '../communication/messages/incoming/room/action/DanceMessageEvent';
import {AvatarEffectMessageEvent} from '../communication/messages/incoming/room/action/AvatarEffectMessageEvent';
import {SleepMessageEvent} from '../communication/messages/incoming/room/action/SleepMessageEvent';
import {CarryObjectMessageEvent} from '../communication/messages/incoming/room/action/CarryObjectMessageEvent';
import {UseObjectMessageEvent} from '../communication/messages/incoming/room/action/UseObjectMessageEvent';
import {UserChangeMessageEvent} from '../communication/messages/incoming/room/action/UserChangeMessageEvent';

// Parsers
import type {HeightMapMessageParser} from '../communication/messages/parser/room/engine/HeightMapMessageParser';
import type {
	FloorHeightMapMessageParser
} from '../communication/messages/parser/room/engine/FloorHeightMapMessageParser';
import type {
	HeightMapUpdateMessageParser
} from '../communication/messages/parser/room/engine/HeightMapUpdateMessageParser';
import type {ObjectsMessageParser} from '../communication/messages/parser/room/engine/ObjectsMessageParser';
import type {ObjectAddMessageParser} from '../communication/messages/parser/room/engine/ObjectAddMessageParser';
import type {ObjectUpdateMessageParser} from '../communication/messages/parser/room/engine/ObjectUpdateMessageParser';
import type {ObjectRemoveMessageParser} from '../communication/messages/parser/room/engine/ObjectRemoveMessageParser';
import type {
	ObjectDataUpdateMessageParser
} from '../communication/messages/parser/room/engine/ObjectDataUpdateMessageParser';
import type {ItemsMessageParser} from '../communication/messages/parser/room/engine/ItemsMessageParser';
import type {ItemAddMessageParser} from '../communication/messages/parser/room/engine/ItemAddMessageParser';
import type {ItemUpdateMessageParser} from '../communication/messages/parser/room/engine/ItemUpdateMessageParser';
import type {ItemRemoveMessageParser} from '../communication/messages/parser/room/engine/ItemRemoveMessageParser';
import type {UsersMessageParser} from '../communication/messages/parser/room/engine/UsersMessageParser';
import type {UserUpdateMessageParser} from '../communication/messages/parser/room/engine/UserUpdateMessageParser';
import type {UserRemoveMessageParser} from '../communication/messages/parser/room/engine/UserRemoveMessageParser';
import type {
	SlideObjectBundleMessageParser
} from '../communication/messages/parser/room/engine/SlideObjectBundleMessageParser';
import type {
	FurnitureAliasesMessageParser
} from '../communication/messages/parser/room/engine/FurnitureAliasesMessageParser';
import type {FurnitureFloorData} from '../communication/messages/incoming/room/engine/FurnitureFloorData';
import type {FurnitureWallData} from '../communication/messages/incoming/room/engine/FurnitureWallData';
import type {RoomUserData} from '../communication/messages/incoming/room/engine/RoomUserData';

// Parsers - Room Chat
import type {
	UserTypingMessageEventParser
} from '../communication/messages/parser/room/chat/UserTypingMessageEventParser';

// Parsers - Room Action
import type {
	ExpressionMessageEventParser
} from '../communication/messages/parser/room/action/ExpressionMessageEventParser';
import type {DanceMessageEventParser} from '../communication/messages/parser/room/action/DanceMessageEventParser';
import type {
	AvatarEffectMessageEventParser
} from '../communication/messages/parser/room/action/AvatarEffectMessageEventParser';
import type {SleepMessageEventParser} from '../communication/messages/parser/room/action/SleepMessageEventParser';
import type {
	CarryObjectMessageEventParser
} from '../communication/messages/parser/room/action/CarryObjectMessageEventParser';
import type {
	UseObjectMessageEventParser
} from '../communication/messages/parser/room/action/UseObjectMessageEventParser';
import type {
	UserChangeMessageEventParser
} from '../communication/messages/parser/room/action/UserChangeMessageEventParser';

// Room Object Variables
import {RoomObjectVariableEnum} from './object/RoomObjectVariableEnum';

// Outgoing Composers
import {
	GetFurnitureAliasesMessageComposer
} from '../communication/messages/outgoing/room/engine/GetFurnitureAliasesMessageComposer';
import {GetHeightMapMessageComposer} from '../communication/messages/outgoing/room/engine/GetHeightMapMessageComposer';

// Room Entry Tile
import {RoomEntryTileMessageEvent} from '../communication/messages/incoming/room/layout/RoomEntryTileMessageEvent';
import type {RoomEntryTileMessageParser} from '../communication/messages/parser/room/layout/RoomEntryTileMessageParser';

// Room Object
import {RoomPlaneParser} from './object/RoomPlaneParser';
import {Logger} from "@/core";

const log = Logger.getLogger('RoomMessageHandler');

export class RoomMessageHandler
{
	public static readonly EFFECT_NONE = 0;
	public static readonly EFFECT_ROOM_SHAKE = 1;
	public static readonly EFFECT_ROOM_ROTATE = 2;
	public static readonly EFFECT_ROOM_DISCO = 3;
	private _roomCreator: IRoomCreator | null = null;
	private _currentRoomId: number = 0;
	private _ownUserId: number = -1;
	private _initialConnection: boolean = true;
	private _planeParser: RoomPlaneParser;
	private _entryTileEvent: RoomEntryTileMessageEvent | null = null;

	constructor(roomCreator: IRoomCreator)
	{
		this._roomCreator = roomCreator;
		this._planeParser = new RoomPlaneParser();
	}

	private _connection: IConnection | null = null;

	set connection(connection: IConnection | null)
	{
		if (this._connection !== null)
		{
			return;
		}

		if (connection !== null)
		{
			this._connection = connection;

			// Register message events
			connection.addMessageEvent(new RoomReadyMessageEvent(this.onRoomReady.bind(this)));
			connection.addMessageEvent(new FurnitureAliasesMessageEvent(this.onFurnitureAliases.bind(this)));
			connection.addMessageEvent(new HeightMapMessageEvent(this.onHeightMap.bind(this)));
			connection.addMessageEvent(new FloorHeightMapMessageEvent(this.onFloorHeightMap.bind(this)));
			connection.addMessageEvent(new HeightMapUpdateMessageEvent(this.onHeightMapUpdate.bind(this)));
			connection.addMessageEvent(new ObjectsMessageEvent(this.onObjects.bind(this)));
			connection.addMessageEvent(new ObjectAddMessageEvent(this.onObjectAdd.bind(this)));
			connection.addMessageEvent(new ObjectUpdateMessageEvent(this.onObjectUpdate.bind(this)));
			connection.addMessageEvent(new ObjectRemoveMessageEvent(this.onObjectRemove.bind(this)));
			connection.addMessageEvent(new ObjectDataUpdateMessageEvent(this.onObjectDataUpdate.bind(this)));
			connection.addMessageEvent(new ItemsMessageEvent(this.onItems.bind(this)));
			connection.addMessageEvent(new ItemAddMessageEvent(this.onItemAdd.bind(this)));
			connection.addMessageEvent(new ItemUpdateMessageEvent(this.onItemUpdate.bind(this)));
			connection.addMessageEvent(new ItemRemoveMessageEvent(this.onItemRemove.bind(this)));
			connection.addMessageEvent(new UsersMessageEvent(this.onUsers.bind(this)));
			connection.addMessageEvent(new UserUpdateMessageEvent(this.onUserUpdate.bind(this)));
			connection.addMessageEvent(new UserRemoveMessageEvent(this.onUserRemove.bind(this)));
			connection.addMessageEvent(new SlideObjectBundleMessageEvent(this.onSlideUpdate.bind(this)));

			// Room layout events
			connection.addMessageEvent(new RoomEntryTileMessageEvent(this.onEntryTileData.bind(this)));

			// Avatar action events
			connection.addMessageEvent(new UserTypingMessageEvent(this.onTypingStatus.bind(this)));
			connection.addMessageEvent(new ExpressionMessageEvent(this.onExpression.bind(this)));
			connection.addMessageEvent(new DanceMessageEvent(this.onDance.bind(this)));
			connection.addMessageEvent(new AvatarEffectMessageEvent(this.onAvatarEffect.bind(this)));
			connection.addMessageEvent(new SleepMessageEvent(this.onAvatarSleep.bind(this)));
			connection.addMessageEvent(new CarryObjectMessageEvent(this.onCarryObject.bind(this)));
			connection.addMessageEvent(new UseObjectMessageEvent(this.onUseObject.bind(this)));
			connection.addMessageEvent(new UserChangeMessageEvent(this.onUserChange.bind(this)));
		}
	}

	dispose(): void
	{
		this._connection = null;
		this._roomCreator = null;
	}

	setCurrentRoom(roomId: number): void
	{
		if (this._currentRoomId !== 0)
		{
			if (this._roomCreator !== null)
			{
				this._roomCreator.disposeRoom(this._currentRoomId);
			}
		}

		this._currentRoomId = roomId;
	}

	resetCurrentRoom(): void
	{
		this._currentRoomId = 0;
	}

	private onRoomReady(event: IMessageEvent): void
	{
		const roomReadyEvent = event as RoomReadyMessageEvent;

		if (roomReadyEvent === null || event.connection === null)
		{
			return;
		}

		const parser = roomReadyEvent.getParser() as RoomReadyMessageParser;

		if (parser === null)
		{
			return;
		}

		if (this._currentRoomId !== parser.roomId)
		{
			this.setCurrentRoom(parser.roomId);
		}

		const roomType = parser.roomType;

		if (this._roomCreator !== null)
		{
			this._roomCreator.setWorldType(parser.roomId, roomType);
		}

		// Request furniture aliases on first connection, height map on subsequent
		// Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onRoomReady
		if (this._initialConnection)
		{
			event.connection.send(new GetFurnitureAliasesMessageComposer());
			this._initialConnection = false;
		}
		else
		{
			event.connection.send(new GetHeightMapMessageComposer());
		}
	}

	/**
	 * Handle furniture aliases from server.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onFurnitureAliases
	 */
	private onFurnitureAliases(event: IMessageEvent): void
	{
		if (this._roomCreator === null || event.connection === null)
		{
			return;
		}

		const aliasesEvent = event as FurnitureAliasesMessageEvent;

		if (aliasesEvent === null)
		{
			return;
		}

		const parser = aliasesEvent.parser as FurnitureAliasesMessageParser;

		if (parser === null)
		{
			return;
		}

		const count = parser.aliasCount;

		log.debug(`[RoomMessageHandler] Received ${count} furniture aliases`);

		for (let i = 0; i < count; i++)
		{
			const name = parser.getName(i);
			const alias = parser.getAlias(i);

			if (name !== null && alias !== null)
			{
				this._roomCreator.setRoomObjectAlias(name, alias);
			}
		}

		// Now request height map - AS3 flow
		event.connection.send(new GetHeightMapMessageComposer());
	}

	private onHeightMap(event: IMessageEvent): void
	{
		const heightMapEvent = event as HeightMapMessageEvent;

		if (heightMapEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = heightMapEvent.getParser() as HeightMapMessageParser;

		if (parser === null)
		{
			return;
		}

		// Process height map data
		// This creates the stacking height map used for furniture placement
		log.debug(`[RoomMessageHandler] Height map received: ${parser.width}x${parser.height}`);
	}

	/**
	 * Handle entry tile data (arrives BEFORE FloorHeightMap).
	 * Based on AS3: RoomMessageHandler.onEntryTileData
	 */
	private onEntryTileData(event: IMessageEvent): void
	{
		this._entryTileEvent = event as RoomEntryTileMessageEvent;
	}

	/**
	 * Handle floor height map data. Detects door position and generates planes.
	 * Based on AS3: RoomMessageHandler.onFloorHeightMap (lines 540-627)
	 */
	private onFloorHeightMap(event: IMessageEvent): void
	{
		const floorEvent = event as FloorHeightMapMessageEvent;

		if (floorEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = floorEvent.getParser() as FloorHeightMapMessageParser;

		if (parser === null)
		{
			return;
		}

		const width = parser.width;
		const height = parser.height;

		// Reset and initialize plane parser
		this._planeParser.reset();
		this._planeParser.initializeTileMap(width, height);

		// Get entry tile data if available (arrives before FloorHeightMap)
		let entryTileParser: RoomEntryTileMessageParser | null = null;

		if (this._entryTileEvent !== null)
		{
			entryTileParser = this._entryTileEvent.getParser() as RoomEntryTileMessageParser;
		}

		// Door detection variables (AS3 lines 567-570)
		let doorX: number = -1;
		let doorY: number = -1;
		let doorZ: number = 0;
		let doorDir: number = 0;

		// Scan tiles: detect door and set heights (AS3 lines 579-596)
		for (let y = 0; y < height; y++)
		{
			for (let x = 0; x < width; x++)
			{
				const tileHeight = parser.getTileHeight(x, y);

				// Door detection: check if tile is on the border and has 3 blocked neighbors
				// AS3 condition: (y > 0 && y < height-1 || x > 0 && x < width-1) && height != -110
				if ((y > 0 && y < height - 1 || x > 0 && x < width - 1) && tileHeight !== -110)
				{
					// If we have entry tile data, only check that specific tile
					if (entryTileParser === null || (x === entryTileParser.x && y === entryTileParser.y))
					{
						// Pattern 1: top + left + bottom blocked → door direction 90 (facing right)
						if (parser.getTileHeight(x, y - 1) === -110
							&& parser.getTileHeight(x - 1, y) === -110
							&& parser.getTileHeight(x, y + 1) === -110)
						{
							doorX = x + 0.5;
							doorY = y;
							doorZ = tileHeight;
							doorDir = 90;
						}

						// Pattern 2: top + left + right blocked → door direction 180 (facing down)
						if (parser.getTileHeight(x, y - 1) === -110
							&& parser.getTileHeight(x - 1, y) === -110
							&& parser.getTileHeight(x + 1, y) === -110)
						{
							doorX = x;
							doorY = y + 0.5;
							doorZ = tileHeight;
							doorDir = 180;
						}
					}
				}

				this._planeParser.setTileHeight(x, y, tileHeight);
			}
		}

		const doorFound = doorX >= 0 && doorY >= 0;

		// Set door tile height BEFORE initializeFromTileData (AS3 line 598)
		const doorTileX = Math.floor(doorX);
		const doorTileY = Math.floor(doorY);

		if (doorFound)
		{
			this._planeParser.setTileHeight(doorTileX, doorTileY, doorZ);
		}

		// Generate floor/wall planes, passing explicit door tile position
		this._planeParser.initializeFromTileData(
			parser.fixedWallsHeight,
			doorFound ? {x: doorTileX, y: doorTileY} : undefined
		);

		// Set door tile height AFTER with wallHeight added (AS3 line 601)
		if (doorFound)
		{
			this._planeParser.setTileHeight(
				Math.floor(doorX), Math.floor(doorY),
				doorZ + this._planeParser.wallHeight
			);

			log.debug(`[RoomMessageHandler] Door detected at (${doorX}, ${doorY}, ${doorZ}) dir=${doorDir}`);
		}

		// Initialize room with plane parser data and door info
		if (this._roomCreator !== null)
		{
			this._roomCreator.initializeRoom(
				this._currentRoomId,
				this._planeParser,
				doorFound ? doorX : undefined,
				doorFound ? doorY : undefined,
				doorFound ? doorZ : undefined,
				doorFound ? doorDir : undefined
			);
		}
	}

	private onHeightMapUpdate(event: IMessageEvent): void
	{
		const updateEvent = event as HeightMapUpdateMessageEvent;

		if (updateEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = updateEvent.getParser() as HeightMapUpdateMessageParser;

		if (parser === null)
		{
			return;
		}

		// Process tile updates
		while (parser.next())
		{
			const x = parser.x;
			const y = parser.y;
			const height = parser.tileHeight;
			const blocked = parser.isStackingBlocked;
			// Update tile height map
		}
	}

	private onObjects(event: IMessageEvent): void
	{
		const objectsEvent = event as ObjectsMessageEvent;

		if (objectsEvent === null)
		{
			return;
		}

		const parser = objectsEvent.getParser() as ObjectsMessageParser;

		if (parser === null)
		{
			return;
		}

		const count = parser.objectCount;

		for (let i = 0; i < count; i++)
		{
			const data = parser.getObject(i);

			if (data !== null)
			{
				this.addFloorFurniture(this._currentRoomId, data);
			}
		}
	}

	private onObjectAdd(event: IMessageEvent): void
	{
		const addEvent = event as ObjectAddMessageEvent;

		if (addEvent === null)
		{
			return;
		}

		const parser = addEvent.getParser() as ObjectAddMessageParser;

		if (parser === null)
		{
			return;
		}

		const data = parser.object;

		if (data !== null)
		{
			this.addFloorFurniture(this._currentRoomId, data);
		}
	}

	private onObjectUpdate(event: IMessageEvent): void
	{
		const updateEvent = event as ObjectUpdateMessageEvent;

		if (updateEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = updateEvent.getParser() as ObjectUpdateMessageParser;

		if (parser === null)
		{
			return;
		}

		const data = parser.object;

		if (data !== null)
		{
			const location: IVector3d = new Vector3d(data.x, data.y, data.z);
			const direction: IVector3d = new Vector3d(data.dir);

			this._roomCreator.updateObjectFurniture(
				this._currentRoomId,
				data.id,
				location,
				direction,
				data.state,
				data.data,
				data.extra
			);
		}
	}

	private onObjectRemove(event: IMessageEvent): void
	{
		const removeEvent = event as ObjectRemoveMessageEvent;

		if (removeEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = removeEvent.getParser() as ObjectRemoveMessageParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.disposeObjectFurniture(
			this._currentRoomId,
			parser.objectId,
			parser.pickerId
		);
	}

	private onObjectDataUpdate(event: IMessageEvent): void
	{
		const dataEvent = event as ObjectDataUpdateMessageEvent;

		if (dataEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = dataEvent.getParser() as ObjectDataUpdateMessageParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.updateObjectFurniture(
			this._currentRoomId,
			parser.id,
			null,
			null,
			parser.state,
			parser.data
		);
	}

	private onItems(event: IMessageEvent): void
	{
		const itemsEvent = event as ItemsMessageEvent;

		if (itemsEvent === null)
		{
			return;
		}

		const parser = itemsEvent.getParser() as ItemsMessageParser;

		if (parser === null)
		{
			return;
		}

		const count = parser.itemCount;

		for (let i = 0; i < count; i++)
		{
			const data = parser.getItem(i);

			if (data !== null)
			{
				this.addWallItem(this._currentRoomId, data);
			}
		}
	}

	private onItemAdd(event: IMessageEvent): void
	{
		const addEvent = event as ItemAddMessageEvent;

		if (addEvent === null)
		{
			return;
		}

		const parser = addEvent.getParser() as ItemAddMessageParser;

		if (parser === null)
		{
			return;
		}

		const data = parser.data;

		if (data !== null)
		{
			this.addWallItem(this._currentRoomId, data);
		}
	}

	private onItemUpdate(event: IMessageEvent): void
	{
		const updateEvent = event as ItemUpdateMessageEvent;

		if (updateEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = updateEvent.getParser() as ItemUpdateMessageParser;

		if (parser === null)
		{
			return;
		}

		const data = parser.data;

		if (data !== null)
		{
			// TODO: Calculate location from wall coordinates
			this._roomCreator.updateObjectWallItem(
				this._currentRoomId,
				data.id,
				null, // location (needs legacy geometry)
				null, // direction
				data.state,
				data.data
			);
		}
	}

	private onItemRemove(event: IMessageEvent): void
	{
		const removeEvent = event as ItemRemoveMessageEvent;

		if (removeEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = removeEvent.getParser() as ItemRemoveMessageParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.disposeObjectWallItem(
			this._currentRoomId,
			parser.itemId,
			parser.pickerId
		);
	}

	private onUsers(event: IMessageEvent): void
	{
		const usersEvent = event as UsersMessageEvent;

		if (usersEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = usersEvent.getParser() as UsersMessageParser;

		if (parser === null)
		{
			return;
		}

		for (let i = 0; i < parser.userCount; i++)
		{
			const data = parser.getUser(i);

			if (data !== null)
			{
				this.addUser(this._currentRoomId, data);
			}
		}
	}

	private onUserUpdate(event: IMessageEvent): void
	{
		const updateEvent = event as UserUpdateMessageEvent;

		if (updateEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = updateEvent.getParser() as UserUpdateMessageParser;

		if (parser === null)
		{
			return;
		}

		for (let i = 0; i < parser.userCount; i++)
		{
			const data = parser.getUser(i);

			if (data !== null)
			{
				const location: IVector3d = new Vector3d(data.x, data.y, data.z);
				const direction: IVector3d = new Vector3d(data.bodyDir);

				// Parse actions to check for movement
				// Actions format: "mv x,y,z" or "sit 0.5" etc.
				let target: IVector3d | null = null;
				const actions = data.actions.split('/');

				for (const action of actions)
				{
					const parts = action.split(' ');

					if (parts[0] === 'mv' && parts.length > 1)
					{
						const coords = parts[1].split(',');

						if (coords.length >= 3)
						{
							target = new Vector3d(
								parseInt(coords[0], 10),
								parseInt(coords[1], 10),
								parseFloat(coords[2])
							);
						}
					}
				}

				this._roomCreator.updateObjectUser(
					this._currentRoomId,
					data.roomIndex,
					location,
					target,
					false,
					0,
					direction,
					data.headDir
				);
			}
		}
	}

	private onUserRemove(event: IMessageEvent): void
	{
		const removeEvent = event as UserRemoveMessageEvent;

		if (removeEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = removeEvent.getParser() as UserRemoveMessageParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.disposeObjectUser(this._currentRoomId, parser.roomIndex);
	}

	private onSlideUpdate(event: IMessageEvent): void
	{
		const slideEvent = event as SlideObjectBundleMessageEvent;

		if (slideEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = slideEvent.getParser() as SlideObjectBundleMessageParser;

		if (parser === null)
		{
			return;
		}

		// Update roller state
		this._roomCreator.updateObjectFurniture(this._currentRoomId, parser.id, null, null, 1, null);
		this._roomCreator.updateObjectFurniture(this._currentRoomId, parser.id, null, null, 2, null);

		// Process sliding objects
		for (const obj of parser.objectList)
		{
			this._roomCreator.updateObjectFurnitureLocation(
				this._currentRoomId,
				obj.id,
				obj.loc,
				null,
				obj.target
			);
		}

		// Process sliding avatar
		if (parser.avatar !== null)
		{
			this._roomCreator.updateObjectUser(
				this._currentRoomId,
				parser.avatar.id,
				parser.avatar.loc,
				parser.avatar.target
			);
		}
	}

	private addFloorFurniture(roomId: number, data: FurnitureFloorData): void
	{
		if (data === null || this._roomCreator === null)
		{
			return;
		}

		const location: IVector3d = new Vector3d(data.x, data.y, data.z);
		const direction: IVector3d = new Vector3d(data.dir);

		if (data.staticClass !== null)
		{
			this._roomCreator.addObjectFurnitureByName(
				roomId,
				data.id,
				data.staticClass,
				location,
				direction,
				data.state,
				data.data,
				data.extra
			);
		}
		else
		{
			this._roomCreator.addObjectFurniture(
				roomId,
				data.id,
				data.type,
				location,
				direction,
				data.state,
				data.data,
				data.extra,
				data.expiryTime,
				data.usagePolicy,
				data.ownerId,
				data.ownerName,
				true,
				true,
				data.sizeZ
			);
		}
	}

	private addWallItem(roomId: number, data: FurnitureWallData): void
	{
		if (data === null || this._roomCreator === null)
		{
			return;
		}

		// TODO: Calculate proper location from wall coordinates using legacy geometry
		const location: IVector3d = new Vector3d(data.wallX, data.wallY, 0);
		const direction: IVector3d = new Vector3d(data.dir === 'r' ? 90 : 0);

		this._roomCreator.addObjectWallItem(
			roomId,
			data.id,
			data.type,
			location,
			direction,
			data.state,
			data.data,
			data.usagePolicy,
			data.ownerId,
			data.ownerName,
			data.secondsToExpiration
		);
	}

	private addUser(roomId: number, data: RoomUserData): void
	{
		if (data === null || this._roomCreator === null)
		{
			return;
		}

		const location: IVector3d = new Vector3d(data.x, data.y, data.z);
		const direction: IVector3d = new Vector3d(data.dir);

		this._roomCreator.addObjectUser(
			roomId,
			data.roomIndex,
			location,
			direction,
			data.dir,
			data.userType,
			data.figure
		);

		// Check if this is the own user
		if (data.webID === this._ownUserId)
		{
			this._roomCreator.setOwnUserId(roomId, data.roomIndex);
		}

		// Update user figure
		this._roomCreator.updateObjectUserFigure(
			roomId,
			data.roomIndex,
			data.figure,
			data.sex,
			data.subType,
			data.isRiding
		);
	}

	/**
	 * Handle user typing status update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onTypingStatus
	 */
	private onTypingStatus(event: IMessageEvent): void
	{
		const typingEvent = event as UserTypingMessageEvent;

		if (typingEvent === null)
		{
			return;
		}

		const parser = typingEvent.getParser() as UserTypingMessageEventParser;

		if (parser === null)
		{
			return;
		}

		const value = parser.isTyping ? 1 : 0;

		this._roomCreator?.updateObjectUserAction(
			this._currentRoomId,
			parser.userId,
			RoomObjectVariableEnum.AVATAR_IS_TYPING,
			value
		);
	}

	/**
	 * Handle user expression update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onExpression
	 */
	private onExpression(event: IMessageEvent): void
	{
		const expressionEvent = event as ExpressionMessageEvent;

		if (expressionEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = expressionEvent.getParser() as ExpressionMessageEventParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.updateObjectUserAction(
			this._currentRoomId,
			parser.userId,
			RoomObjectVariableEnum.AVATAR_EXPRESSION,
			parser.expressionType
		);
	}

	/**
	 * Handle user dance update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onDance
	 */
	private onDance(event: IMessageEvent): void
	{
		const danceEvent = event as DanceMessageEvent;

		if (danceEvent === null || danceEvent.getParser() === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = danceEvent.getParser() as DanceMessageEventParser;

		this._roomCreator.updateObjectUserAction(
			this._currentRoomId,
			parser.userId,
			RoomObjectVariableEnum.AVATAR_DANCE,
			parser.danceStyle
		);
	}

	/**
	 * Handle avatar effect update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onAvatarEffect
	 */
	private onAvatarEffect(event: IMessageEvent): void
	{
		const effectEvent = event as AvatarEffectMessageEvent;

		if (effectEvent === null || effectEvent.getParser() === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = effectEvent.getParser() as AvatarEffectMessageEventParser;

		this._roomCreator.updateObjectUserEffect(
			this._currentRoomId,
			parser.userId,
			parser.effectId,
			parser.delayMilliSeconds
		);
	}

	/**
	 * Handle avatar sleep status update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onAvatarSleep
	 */
	private onAvatarSleep(event: IMessageEvent): void
	{
		const sleepEvent = event as SleepMessageEvent;

		if (sleepEvent === null || sleepEvent.getParser() === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = sleepEvent.getParser() as SleepMessageEventParser;

		const value = parser.sleeping ? 1 : 0;

		this._roomCreator.updateObjectUserAction(
			this._currentRoomId,
			parser.userId,
			RoomObjectVariableEnum.AVATAR_SLEEP,
			value
		);
	}

	/**
	 * Handle carry object update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onCarryObject
	 */
	private onCarryObject(event: IMessageEvent): void
	{
		if (this._roomCreator === null)
		{
			return;
		}

		const carryEvent = event as CarryObjectMessageEvent;

		if (carryEvent === null)
		{
			return;
		}

		const parser = carryEvent.getParser() as CarryObjectMessageEventParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.updateObjectUserAction(
			this._currentRoomId,
			parser.userId,
			RoomObjectVariableEnum.AVATAR_CARRY_OBJECT,
			parser.itemType
		);
	}

	/**
	 * Handle use object update.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onUseObject
	 */
	private onUseObject(event: IMessageEvent): void
	{
		if (this._roomCreator === null)
		{
			return;
		}

		const useEvent = event as UseObjectMessageEvent;

		if (useEvent === null)
		{
			return;
		}

		const parser = useEvent.getParser() as UseObjectMessageEventParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.updateObjectUserAction(
			this._currentRoomId,
			parser.userId,
			RoomObjectVariableEnum.AVATAR_USE_OBJECT,
			parser.itemType
		);
	}

	/**
	 * Handle user figure change.
	 * Based on AS3: com.sulake.habbo.room.RoomMessageHandler.onUserChange
	 */
	private onUserChange(event: IMessageEvent): void
	{
		const changeEvent = event as UserChangeMessageEvent;

		if (changeEvent === null)
		{
			return;
		}

		if (this._roomCreator === null)
		{
			return;
		}

		const parser = changeEvent.getParser() as UserChangeMessageEventParser;

		if (parser === null)
		{
			return;
		}

		this._roomCreator.updateObjectUserFigure(
			this._currentRoomId,
			parser.id,
			parser.figure,
			parser.sex
		);
	}
}
