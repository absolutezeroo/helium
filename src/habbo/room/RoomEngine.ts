/**
 * RoomEngine
 *
 * Based on AS3: com.sulake.habbo.room.RoomEngine
 *
 * Main room engine implementation. Orchestrates room rendering,
 * object management, and event handling.
 */
import {EventEmitter} from 'eventemitter3';
import {inject, injectable} from 'inversify';
import type {IRoomEngine} from './IRoomEngine';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomManager} from '@room/IRoomManager';
import type {IVector3d} from '@room/utils/IVector3d';
import {RoomInstance} from '@room/RoomInstance';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {RoomObjectLogicEnum} from './object/RoomObjectLogicEnum';
import {RoomObjectUserTypes} from './object/RoomObjectUserTypes';
import {RoomObjectVariableEnum} from './object/RoomObjectVariableEnum';
import {RoomEngineEvent} from './events/RoomEngineEvent';
import {RoomEngineObjectEvent} from './events/RoomEngineObjectEvent';
import {RoomObjectFactory} from './RoomObjectFactory';

// Messages
import {RoomObjectMoveUpdateMessage} from './messages/RoomObjectMoveUpdateMessage';
import {RoomObjectAvatarUpdateMessage} from './messages/RoomObjectAvatarUpdateMessage';
import {RoomObjectAvatarFigureUpdateMessage} from './messages/RoomObjectAvatarFigureUpdateMessage';
import {RoomObjectAvatarPostureUpdateMessage} from './messages/RoomObjectAvatarPostureUpdateMessage';
import {RoomObjectAvatarGestureUpdateMessage} from './messages/RoomObjectAvatarGestureUpdateMessage';
import {RoomObjectAvatarEffectUpdateMessage} from './messages/RoomObjectAvatarEffectUpdateMessage';
import {RoomObjectAvatarChatUpdateMessage} from './messages/RoomObjectAvatarChatUpdateMessage';
import {RoomObjectAvatarTypingUpdateMessage} from './messages/RoomObjectAvatarTypingUpdateMessage';
import {RoomObjectAvatarDanceUpdateMessage} from './messages/RoomObjectAvatarDanceUpdateMessage';
import {RoomObjectAvatarSleepUpdateMessage} from './messages/RoomObjectAvatarSleepUpdateMessage';
import {RoomObjectAvatarCarryObjectUpdateMessage} from './messages/RoomObjectAvatarCarryObjectUpdateMessage';
import {RoomObjectAvatarSignUpdateMessage} from './messages/RoomObjectAvatarSignUpdateMessage';
import {RoomObjectAvatarOwnMessage} from './messages/RoomObjectAvatarOwnMessage';

import {IID} from '@iid/types';

// Room identifier prefix
const ROOM_ID_PREFIX = 'room_';
const OBJECT_ID_ROOM = -1;
const OBJECT_TYPE_ROOM = 'room';
const OBJECT_ID_TILE_CURSOR = -2;
const OBJECT_TYPE_TILE_CURSOR = 'tile_cursor';

@injectable()
export class RoomEngine implements IRoomEngine
{
	private _roomManager: IRoomManager;
	private _roomObjectFactory: RoomObjectFactory;
	private _rooms: Map<string, IRoomInstance>;
	private _roomData: Map<string, unknown>;
	private _activeRoomId: number = -1;
	private _ownUserIds: Map<number, number>;
	private _isInitialized = false;

	constructor(
		@inject(IID.IRoomManager) roomManager: IRoomManager
	)
	{
		this._events = new EventEmitter();
		this._roomManager = roomManager;
		this._roomObjectFactory = new RoomObjectFactory();
		this._rooms = new Map();
		this._roomData = new Map();
		this._ownUserIds = new Map();

		// Listen to object events from factory
		this._roomObjectFactory.addObjectEventListener(this.onRoomObjectEvent.bind(this));

		this._isInitialized = true;
	}

	private _events: EventEmitter;

	get events(): EventEmitter
	{
		return this._events;
	}

	private _isDisposed = false;

	// Room lifecycle

	get isDisposed(): boolean
	{
		return this._isDisposed;
	}

	createRoomInstance(roomId: number): IRoomInstance | null
	{
		const roomIdStr = this.getRoomIdentifier(roomId);

		if (this._rooms.has(roomIdStr))
		{
			return this._rooms.get(roomIdStr) ?? null;
		}

		const room = new RoomInstance(roomIdStr, this._roomObjectFactory);
		this._rooms.set(roomIdStr, room);

		// Create room object
		this.createRoomObject(room, OBJECT_ID_ROOM, OBJECT_TYPE_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);

		// Create tile cursor
		this.createRoomObject(room, OBJECT_ID_TILE_CURSOR, OBJECT_TYPE_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);

		return room;
	}

	disposeRoomInstance(roomId: number): void
	{
		const roomIdStr = this.getRoomIdentifier(roomId);
		const room = this._rooms.get(roomIdStr);

		if (room)
		{
			room.dispose();
			this._rooms.delete(roomIdStr);
		}

		this._roomData.delete(roomIdStr);
		this._ownUserIds.delete(roomId);

		this._events.emit(RoomEngineEvent.REE_DISPOSED, new RoomEngineEvent(RoomEngineEvent.REE_DISPOSED, roomId));
	}

	getRoomInstance(roomId: number): IRoomInstance | null
	{
		const roomIdStr = this.getRoomIdentifier(roomId);
		return this._rooms.get(roomIdStr) ?? null;
	}

	setActiveRoom(roomId: number): void
	{
		this._activeRoomId = roomId;
	}

	// Object management

	getActiveRoomId(): number
	{
		return this._activeRoomId;
	}

	addRoomObjectUser(
		roomId: number,
		id: number,
		location: IVector3d,
		direction: IVector3d,
		type: string
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		// Determine logic type based on user type
		let logicType = RoomObjectLogicEnum.USER;
		if (type === RoomObjectUserTypes.BOT)
		{
			logicType = RoomObjectLogicEnum.BOT;
		} else if (type === RoomObjectUserTypes.RENTABLE_BOT)
		{
			logicType = RoomObjectLogicEnum.RENTABLE_BOT;
		} else if (type === RoomObjectUserTypes.PET)
		{
			logicType = RoomObjectLogicEnum.PET;
		}

		const object = this.createRoomObject(room, id, logicType, RoomObjectCategoryEnum.USER);
		if (!object)
		{
			return false;
		}

		object.setLocation(location);
		object.setDirection(direction);

		this._events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.USER)
		);

		return true;
	}

	addRoomObjectFurniture(
		roomId: number,
		id: number,
		typeId: number,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		extra: string | null,
		expiryTime: number,
		usagePolicy: number,
		ownerId: number,
		ownerName: string | null,
		synchronize = true
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		// TODO: Get actual logic type from furniture data
		const logicType = RoomObjectLogicEnum.FURNITURE_MULTISTATE;

		const object = this.createRoomObject(room, id, logicType, RoomObjectCategoryEnum.FURNITURE);
		if (!object)
		{
			return false;
		}

		object.setLocation(location);
		object.setDirection(direction);

		const model = object.getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_STATE, state);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);
			if (ownerName)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
			}
			if (extra)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_EXTRA_PARAM, extra);
			}
		}

		this._events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.FURNITURE)
		);

		return true;
	}

	addRoomObjectWallItem(
		roomId: number,
		id: number,
		typeId: number,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		extra: string | null,
		ownerId: number,
		ownerName: string | null
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		// TODO: Get actual logic type from furniture data
		const logicType = RoomObjectLogicEnum.FURNITURE_BASIC;

		const object = this.createRoomObject(room, id, logicType, RoomObjectCategoryEnum.WALL);
		if (!object)
		{
			return false;
		}

		object.setLocation(location);
		object.setDirection(direction);

		const model = object.getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_STATE, state);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);
			if (ownerName)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
			}
			if (extra)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_EXTRA_PARAM, extra);
			}
		}

		this._events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.WALL)
		);

		return true;
	}

	getRoomObject(roomId: number, objectId: number, category: number): IRoomObject | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getRoomObject(objectId, category);
	}

	// User updates

	disposeRoomObject(roomId: number, objectId: number, category: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const success = room.disposeRoomObject(objectId, category);

		if (success)
		{
			this._events.emit(
				RoomEngineObjectEvent.REOE_OBJECT_REMOVED,
				new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_REMOVED, roomId, objectId, category)
			);
		}

		return success;
	}

	updateRoomObjectUser(
		roomId: number,
		objectId: number,
		location: IVector3d,
		targetLocation: IVector3d | null,
		direction: IVector3d,
		headDirection: number,
		canStandUp: boolean,
		baseY: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectMoveUpdateMessage(location, direction, targetLocation);
		object.getEventHandler()!.processUpdateMessage(message);

		const avatarMessage = new RoomObjectAvatarUpdateMessage(location, direction, headDirection, canStandUp, baseY);
		object.getEventHandler()!.processUpdateMessage(avatarMessage);

		return true;
	}

	updateRoomObjectUserFigure(
		roomId: number,
		objectId: number,
		figure: string,
		gender: string | null,
		clubLevel: string | null,
		isRiding: boolean
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarFigureUpdateMessage(figure, gender ?? 'M', '', isRiding);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserPosture(roomId: number, objectId: number, posture: string, parameter: string): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarPostureUpdateMessage(posture, parameter);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserGesture(roomId: number, objectId: number, gesture: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarGestureUpdateMessage(gesture);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserEffect(roomId: number, objectId: number, effect: number, delay = 0): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarEffectUpdateMessage(effect, delay);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserChat(roomId: number, objectId: number, numberOfWords: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarChatUpdateMessage(numberOfWords);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserTyping(roomId: number, objectId: number, isTyping: boolean): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarTypingUpdateMessage(isTyping);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserDance(roomId: number, objectId: number, danceStyle: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarDanceUpdateMessage(danceStyle);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserSleep(roomId: number, objectId: number, isSleeping: boolean): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarSleepUpdateMessage(isSleeping);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserCarryObject(roomId: number, objectId: number, itemType: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarCarryObjectUpdateMessage(itemType);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	updateRoomObjectUserSign(roomId: number, objectId: number, signType: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarSignUpdateMessage(signType);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	// Rendering

	setRoomObjectUserOwnUser(roomId: number, objectId: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getRoomObject(objectId, RoomObjectCategoryEnum.USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		this._ownUserIds.set(roomId, objectId);

		const message = new RoomObjectAvatarOwnMessage();
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	update(time: number): void
	{
		// Update all rooms
		for (const room of this._rooms.values())
		{
			room.update(time);
		}
	}

	// Room data

	initializeRoomVisuals(
		roomId: number,
		floorType: string,
		wallType: string,
		landscapeType: string,
		worldType: number
	): void
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return;
		}

		const roomObject = room.getRoomObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.ROOM) as IRoomObjectController;
		if (roomObject)
		{
			const model = roomObject.getModelController();
			if (model)
			{
				model.setString('room_floor_type', floorType, true);
				model.setString('room_wall_type', wallType, true);
				model.setString('room_landscape_type', landscapeType, true);
				model.setNumber('room_world_type', worldType, true);
			}
		}

		this._events.emit(RoomEngineEvent.REE_INITIALIZED, new RoomEngineEvent(RoomEngineEvent.REE_INITIALIZED, roomId));
	}

	getRoomOwnObjectId(roomId: number): number
	{
		return this._ownUserIds.get(roomId) ?? -1;
	}

	// Disposal

	setRoomOwnObjectId(roomId: number, objectId: number): void
	{
		this._ownUserIds.set(roomId, objectId);
	}

	dispose(): void
	{
		if (this._isDisposed)
		{
			return;
		}

		// Dispose all rooms
		for (const [roomIdStr, room] of this._rooms)
		{
			room.dispose();
		}

		this._rooms.clear();
		this._roomData.clear();
		this._ownUserIds.clear();
		this._events.removeAllListeners();

		this._isDisposed = true;
	}

	// Private methods

	private getRoomIdentifier(roomId: number): string
	{
		return `${ROOM_ID_PREFIX}${roomId}`;
	}

	private createRoomObject(
		room: IRoomInstance,
		objectId: number,
		type: string,
		category: number
	): IRoomObjectController | null
	{
		const object = room.createRoomObject(objectId, type, category);

		if (object)
		{
			const logic = this._roomObjectFactory.createRoomObjectLogic(type);
			if (logic)
			{
				object.setEventHandler(logic);
				logic.object = object;
			}
		}

		return object;
	}

	private onRoomObjectEvent(event: unknown): void
	{
		// Forward object events
		this._events.emit('roomObjectEvent', event);
	}
}
