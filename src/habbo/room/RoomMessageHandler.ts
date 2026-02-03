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
import {HeightMapMessageEvent} from '../communication/messages/incoming/room/engine/HeightMapMessageEvent';
import {FloorHeightMapMessageEvent} from '../communication/messages/incoming/room/engine/FloorHeightMapMessageEvent';
import {HeightMapUpdateMessageEvent} from '../communication/messages/incoming/room/engine/HeightMapUpdateMessageEvent';
import {ObjectsMessageEvent} from '../communication/messages/incoming/room/engine/ObjectsMessageEvent';
import {ObjectAddMessageEvent} from '../communication/messages/incoming/room/engine/ObjectAddMessageEvent';
import {ObjectUpdateMessageEvent} from '../communication/messages/incoming/room/engine/ObjectUpdateMessageEvent';
import {ObjectRemoveMessageEvent} from '../communication/messages/incoming/room/engine/ObjectRemoveMessageEvent';
import {ObjectDataUpdateMessageEvent} from '../communication/messages/incoming/room/engine/ObjectDataUpdateMessageEvent';
import {ItemsMessageEvent} from '../communication/messages/incoming/room/engine/ItemsMessageEvent';
import {ItemAddMessageEvent} from '../communication/messages/incoming/room/engine/ItemAddMessageEvent';
import {ItemUpdateMessageEvent} from '../communication/messages/incoming/room/engine/ItemUpdateMessageEvent';
import {ItemRemoveMessageEvent} from '../communication/messages/incoming/room/engine/ItemRemoveMessageEvent';
import {UsersMessageEvent} from '../communication/messages/incoming/room/engine/UsersMessageEvent';
import {UserUpdateMessageEvent} from '../communication/messages/incoming/room/engine/UserUpdateMessageEvent';
import {UserRemoveMessageEvent} from '../communication/messages/incoming/room/engine/UserRemoveMessageEvent';
import {SlideObjectBundleMessageEvent} from '../communication/messages/incoming/room/engine/SlideObjectBundleMessageEvent';

// Parsers
import type {HeightMapMessageParser} from '../communication/messages/parser/room/engine/HeightMapMessageParser';
import type {FloorHeightMapMessageParser} from '../communication/messages/parser/room/engine/FloorHeightMapMessageParser';
import type {HeightMapUpdateMessageParser} from '../communication/messages/parser/room/engine/HeightMapUpdateMessageParser';
import type {ObjectsMessageParser} from '../communication/messages/parser/room/engine/ObjectsMessageParser';
import type {ObjectAddMessageParser} from '../communication/messages/parser/room/engine/ObjectAddMessageParser';
import type {ObjectUpdateMessageParser} from '../communication/messages/parser/room/engine/ObjectUpdateMessageParser';
import type {ObjectRemoveMessageParser} from '../communication/messages/parser/room/engine/ObjectRemoveMessageParser';
import type {ObjectDataUpdateMessageParser} from '../communication/messages/parser/room/engine/ObjectDataUpdateMessageParser';
import type {ItemsMessageParser} from '../communication/messages/parser/room/engine/ItemsMessageParser';
import type {ItemAddMessageParser} from '../communication/messages/parser/room/engine/ItemAddMessageParser';
import type {ItemUpdateMessageParser} from '../communication/messages/parser/room/engine/ItemUpdateMessageParser';
import type {ItemRemoveMessageParser} from '../communication/messages/parser/room/engine/ItemRemoveMessageParser';
import type {UsersMessageParser} from '../communication/messages/parser/room/engine/UsersMessageParser';
import type {UserUpdateMessageParser} from '../communication/messages/parser/room/engine/UserUpdateMessageParser';
import type {UserRemoveMessageParser} from '../communication/messages/parser/room/engine/UserRemoveMessageParser';
import type {SlideObjectBundleMessageParser} from '../communication/messages/parser/room/engine/SlideObjectBundleMessageParser';
import type {FurnitureFloorData} from '../communication/messages/incoming/room/engine/FurnitureFloorData';
import type {FurnitureWallData} from '../communication/messages/incoming/room/engine/FurnitureWallData';
import type {RoomUserData} from '../communication/messages/incoming/room/engine/RoomUserData';

export class RoomMessageHandler
{
	public static readonly EFFECT_NONE = 0;
	public static readonly EFFECT_ROOM_SHAKE = 1;
	public static readonly EFFECT_ROOM_ROTATE = 2;
	public static readonly EFFECT_ROOM_DISCO = 3;

	private _connection: IConnection | null = null;
	private _roomCreator: IRoomCreator | null = null;
	private _currentRoomId: number = 0;
	private _ownUserId: number = -1;
	private _initialConnection: boolean = true;

	constructor(roomCreator: IRoomCreator)
	{
		this._roomCreator = roomCreator;
	}

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

		// Request height map on subsequent connections
		// On first connection, furniture aliases are requested first
		this._initialConnection = false;
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
		console.log(`[RoomMessageHandler] Height map received: ${parser.width}x${parser.height}`);
	}

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

		// Initialize room from floor height map
		console.log(`[RoomMessageHandler] Floor height map received: ${parser.width}x${parser.height}, scale: ${parser.scale}`);

		// Initialize room
		if (this._roomCreator !== null)
		{
			this._roomCreator.initializeRoom(this._currentRoomId, null);
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
}
