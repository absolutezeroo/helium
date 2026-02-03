/**
 * RoomEngine
 *
 * Based on AS3: com.sulake.habbo.room.RoomEngine
 *
 * Main room engine implementation. Orchestrates room rendering,
 * object management, and event handling.
 */
import {Component, type IContext, type IUpdateReceiver} from '@core/runtime';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomEngine} from './IRoomEngine';
import type {IRoomCreator} from './IRoomCreator';
import type {IRoomEngineServices} from './IRoomEngineServices';
import type {IRoomContentListener} from './IRoomContentListener';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomInstanceContainer} from '@room/IRoomInstanceContainer';
import type {IRoomManagerListener} from '@room/IRoomManagerListener';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomObjectManager} from '@room/IRoomObjectManager';
import {RoomInstance} from '@room/RoomInstance';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {RoomObjectLogicEnum} from './object/RoomObjectLogicEnum';
import {RoomObjectUserTypes} from './object/RoomObjectUserTypes';
import {RoomObjectVariableEnum} from './object/RoomObjectVariableEnum';
import {RoomEngineEvent} from './events/RoomEngineEvent';
import {RoomEngineObjectEvent} from './events/RoomEngineObjectEvent';
import {RoomObjectFactory} from './RoomObjectFactory';
import type {IStuffData} from './object/data/IStuffData';

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
import type {IVector3d} from '@room/utils/IVector3d';

// Room identifier prefix
const ROOM_ID_PREFIX = 'room_';
const OBJECT_ID_ROOM = -1;
const OBJECT_TYPE_ROOM = 'room';
const OBJECT_ID_TILE_CURSOR = -2;
const OBJECT_TYPE_TILE_CURSOR = 'tile_cursor';
const OBJECT_ID_SELECTION_ARROW = -3;

export class RoomEngine extends Component implements
	IRoomEngine,
	IRoomCreator,
	IRoomEngineServices,
	IRoomManagerListener,
	IRoomContentListener,
	IRoomInstanceContainer,
	IUpdateReceiver
{
	private _roomObjectFactory: RoomObjectFactory;
	private _rooms: Map<string, IRoomInstance>;
	private _roomData: Map<string, unknown>;
	private _activeRoomId: number = -1;
	private _ownUserIds: Map<number, number>;
	private _connection: IConnection | null = null;
	private _isDecorateMode: boolean = false;
	private _isGameMode: boolean = false;

	constructor(context: IContext)
	{
		super(context);
		this._roomObjectFactory = new RoomObjectFactory();
		this._rooms = new Map();
		this._roomData = new Map();
		this._ownUserIds = new Map();

		// Listen to object events from factory
		this._roomObjectFactory.addObjectEventListener(this.onRoomObjectEvent.bind(this));
	}

	// ========== IRoomEngineServices implementation ==========

	get connection(): IConnection | null
	{
		return this._connection;
	}

	set connection(value: IConnection | null)
	{
		this._connection = value;
	}

	get isDecorateMode(): boolean
	{
		return this._isDecorateMode;
	}

	get isGameMode(): boolean
	{
		return this._isGameMode;
	}

	getRoom(roomId: number): IRoomInstance | null
	{
		return this.getRoomInstance(roomId);
	}

	getRoomObjectCategory(type: string): number
	{
		switch (type)
		{
			case 'room':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM;
			case 'user':
			case 'bot':
			case 'rentable_bot':
			case 'pet':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
			case 'wall':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
			default:
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
		}
	}

	getRoomObjectWithIndex(roomId: number, index: number, category: number): IRoomObject | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getObjectWithIndex(index, category);
	}

	getRoomObjectCount(roomId: number, category: number): number
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return 0;
		}

		return room.getObjectCount(category);
	}

	getTileCursor(roomId: number): IRoomObjectController | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getObject(OBJECT_ID_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController | null;
	}

	getSelectionArrow(roomId: number): IRoomObjectController | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getObject(OBJECT_ID_SELECTION_ARROW, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController | null;
	}

	getIsPlayingGame(roomId: number): boolean
	{
		return false; // TODO: implement game state
	}

	getActiveRoomIsPlayingGame(): boolean
	{
		return this.getIsPlayingGame(this._activeRoomId);
	}

	isAreaSelectionMode(): boolean
	{
		return false; // TODO: implement area selection
	}

	isMoveBlocked(): boolean
	{
		return false; // TODO: implement move blocking
	}

	isWhereYouClickWhereYouGo(): boolean
	{
		return true; // Default behavior
	}

	// ========== IRoomManagerListener implementation ==========

	roomManagerInitialized(success: boolean): void
	{
		if (success)
		{
			this.events.emit('roomManagerInitialized');
		}
	}

	contentLoaded(type: string, success: boolean): void
	{
		this.events.emit('contentLoaded', type, success);
	}

	objectInitialized(roomId: string, objectId: number, category: number): void
	{
		this.events.emit('objectInitialized', roomId, objectId, category);
	}

	objectsInitialized(type: string): void
	{
		this.events.emit('objectsInitialized', type);
	}

	// ========== IRoomContentListener implementation ==========

	iconLoaded(typeId: number, type: string, success: boolean): void
	{
		this.events.emit('iconLoaded', typeId, type, success);
	}

	// ========== IRoomInstanceContainer implementation ==========

	createRoomObject(roomId: string, objectId: number, type: string, category: number): IRoomObject | null
	{
		const room = this._rooms.get(roomId);
		if (!room)
		{
			return null;
		}

		const object = room.createRoomObject(objectId, type, category);
		if (object)
		{
			const logic = this._roomObjectFactory.createRoomObjectLogic(type);
			if (logic)
			{
				(object as IRoomObjectController).setEventHandler(logic);
				logic.object = object as IRoomObjectController;
			}
		}

		return object;
	}

	createRoomObjectManager(): IRoomObjectManager
	{
		return this._roomObjectFactory.createRoomObjectManager();
	}

	// ========== IRoomEngine implementation ==========

	createRoomInstance(roomId: number): IRoomInstance | null
	{
		const roomIdStr = this.getRoomIdentifier(roomId);

		if (this._rooms.has(roomIdStr))
		{
			return this._rooms.get(roomIdStr) ?? null;
		}

		const room = new RoomInstance(roomIdStr, this);
		this._rooms.set(roomIdStr, room);

		// Create room object
		room.createRoomObject(OBJECT_ID_ROOM, OBJECT_TYPE_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);

		// Create tile cursor
		room.createRoomObject(OBJECT_ID_TILE_CURSOR, OBJECT_TYPE_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);

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

		this.events.emit(RoomEngineEvent.REE_DISPOSED, new RoomEngineEvent(RoomEngineEvent.REE_DISPOSED, roomId));
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

	getActiveRoomId(): number
	{
		return this._activeRoomId;
	}

	// Object management

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
		let logicType: string = RoomObjectLogicEnum.USER;
		if (type === RoomObjectUserTypes.BOT)
		{
			logicType = RoomObjectLogicEnum.BOT;
		}
		else if (type === RoomObjectUserTypes.RENTABLE_BOT)
		{
			logicType = RoomObjectLogicEnum.RENTABLE_BOT;
		}
		else if (type === RoomObjectUserTypes.PET)
		{
			logicType = RoomObjectLogicEnum.PET;
		}

		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);
		if (!object)
		{
			return false;
		}

		// Set up logic
		const logic = this._roomObjectFactory.createRoomObjectLogic(logicType);
		if (logic)
		{
			(object as IRoomObjectController).setEventHandler(logic);
			logic.object = object as IRoomObjectController;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER)
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

		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);
		if (!object)
		{
			return false;
		}

		// Set up logic
		const logic = this._roomObjectFactory.createRoomObjectLogic(logicType);
		if (logic)
		{
			(object as IRoomObjectController).setEventHandler(logic);
			logic.object = object as IRoomObjectController;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		const model = (object as IRoomObjectController).getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);
			if (ownerName)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
			}
			if (extra)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_EXTRAS, extra);
			}
		}

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
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

		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);
		if (!object)
		{
			return false;
		}

		// Set up logic
		const logic = this._roomObjectFactory.createRoomObjectLogic(logicType);
		if (logic)
		{
			(object as IRoomObjectController).setEventHandler(logic);
			logic.object = object as IRoomObjectController;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		const model = (object as IRoomObjectController).getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);
			if (ownerName)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
			}
			if (extra)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_EXTRAS, extra);
			}
		}

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
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

		return room.getObject(objectId, category);
	}

	disposeRoomObject(roomId: number, objectId: number, category: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const success = room.disposeObject(objectId, category);

		if (success)
		{
			this.events.emit(
				RoomEngineObjectEvent.REOE_OBJECT_REMOVED,
				new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_REMOVED, roomId, objectId, category)
			);
		}

		return success;
	}

	// User updates

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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
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

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarSignUpdateMessage(signType);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	setRoomObjectUserOwnUser(roomId: number, objectId: number): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		this._ownUserIds.set(roomId, objectId);

		const message = new RoomObjectAvatarOwnMessage();
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	// Rendering / IUpdateReceiver

	update(time: number): void
	{
		// Update all rooms
		for (const room of this._rooms.values())
		{
			room.update();
		}
	}

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

		const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;
		if (roomObject)
		{
			const model = roomObject.getModelController();
			if (model)
			{
				model.setString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE, floorType, true);
				model.setString(RoomObjectVariableEnum.ROOM_WALL_TYPE, wallType, true);
				model.setString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE, landscapeType, true);
				model.setNumber(RoomObjectVariableEnum.ROOM_WORLD_TYPE, worldType, true);
			}
		}

		this.events.emit(RoomEngineEvent.REE_INITIALIZED, new RoomEngineEvent(RoomEngineEvent.REE_INITIALIZED, roomId));
	}

	// Room data

	getRoomOwnObjectId(roomId: number): number
	{
		return this._ownUserIds.get(roomId) ?? -1;
	}

	setRoomOwnObjectId(roomId: number, objectId: number): void
	{
		this._ownUserIds.set(roomId, objectId);
	}

	// ========== IRoomCreator implementation ==========

	disposeRoom(roomId: number): void
	{
		this.disposeRoomInstance(roomId);
	}

	setWorldType(roomId: number, worldType: string): void
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return;
		}

		const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;
		if (roomObject)
		{
			const model = roomObject.getModelController();
			if (model)
			{
				model.setNumber(RoomObjectVariableEnum.ROOM_WORLD_TYPE, parseInt(worldType, 10) || 0, true);
			}
		}
	}

	initializeRoom(roomId: number, data: unknown): void
	{
		// Create room instance if it doesn't exist
		let room = this.getRoomInstance(roomId);
		if (!room)
		{
			room = this.createRoomInstance(roomId);
		}

		if (!room)
		{
			return;
		}

		this.setActiveRoom(roomId);
		this.events.emit(RoomEngineEvent.REE_INITIALIZED, new RoomEngineEvent(RoomEngineEvent.REE_INITIALIZED, roomId));
	}

	addObjectFurniture(
		roomId: number,
		id: number,
		typeId: number,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		data: IStuffData | null,
		extra: number,
		expiryTime: number,
		usagePolicy: number,
		ownerId: number,
		ownerName: string,
		synchronized: boolean,
		refresh: boolean,
		sizeZ: number
	): boolean
	{
		return this.addRoomObjectFurniture(
			roomId,
			id,
			typeId,
			location,
			direction,
			state,
			extra.toString(),
			expiryTime,
			usagePolicy,
			ownerId,
			ownerName,
			synchronized
		);
	}

	addObjectFurnitureByName(
		roomId: number,
		id: number,
		className: string,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		data: IStuffData | null,
		extra: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const logicType = RoomObjectLogicEnum.FURNITURE_MULTISTATE;

		const object = room.createRoomObject(id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);
		if (!object)
		{
			return false;
		}

		const logic = this._roomObjectFactory.createRoomObjectLogic(logicType);
		if (logic)
		{
			(object as IRoomObjectController).setEventHandler(logic);
			logic.object = object as IRoomObjectController;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		const model = (object as IRoomObjectController).getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
		}

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
		);

		return true;
	}

	updateObjectFurniture(
		roomId: number,
		id: number,
		location: IVector3d | null,
		direction: IVector3d | null,
		state: number,
		data: IStuffData | null,
		extra?: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) as IRoomObjectController;
		if (!object)
		{
			return false;
		}

		if (location)
		{
			(object as IRoomObjectController).setLocation(location);
		}

		if (direction)
		{
			(object as IRoomObjectController).setDirection(direction);
		}

		const model = object.getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
		}

		return true;
	}

	updateObjectFurnitureLocation(
		roomId: number,
		id: number,
		location: IVector3d,
		direction: IVector3d | null,
		target: IVector3d,
		animationTime?: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) as IRoomObjectController;
		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectMoveUpdateMessage(location, direction, target);
		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	disposeObjectFurniture(
		roomId: number,
		id: number,
		pickerId?: number,
		refresh?: boolean
	): boolean
	{
		return this.disposeRoomObject(roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);
	}

	addObjectWallItem(
		roomId: number,
		id: number,
		typeId: number,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		data: string,
		usagePolicy: number,
		ownerId: number,
		ownerName: string,
		secondsToExpiration: number
	): boolean
	{
		return this.addRoomObjectWallItem(
			roomId,
			id,
			typeId,
			location,
			direction,
			state,
			data,
			ownerId,
			ownerName
		);
	}

	updateObjectWallItem(
		roomId: number,
		id: number,
		location: IVector3d | null,
		direction: IVector3d | null,
		state: number,
		data: string
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL) as IRoomObjectController;
		if (!object)
		{
			return false;
		}

		if (location)
		{
			(object as IRoomObjectController).setLocation(location);
		}

		if (direction)
		{
			(object as IRoomObjectController).setDirection(direction);
		}

		const model = object.getModelController();
		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
		}

		return true;
	}

	disposeObjectWallItem(
		roomId: number,
		id: number,
		pickerId?: number
	): boolean
	{
		return this.disposeRoomObject(roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);
	}

	addObjectUser(
		roomId: number,
		roomIndex: number,
		location: IVector3d,
		direction: IVector3d,
		headDirection: number,
		userType: number,
		figure: string
	): boolean
	{
		// Map userType to string type
		let type: string;
		switch (userType)
		{
			case 2:
				type = RoomObjectUserTypes.PET;
				break;
			case 3:
				type = RoomObjectUserTypes.BOT;
				break;
			case 4:
				type = RoomObjectUserTypes.RENTABLE_BOT;
				break;
			default:
				type = RoomObjectUserTypes.USER;
				break;
		}

		return this.addRoomObjectUser(roomId, roomIndex, location, direction, type);
	}

	updateObjectUser(
		roomId: number,
		roomIndex: number,
		location: IVector3d,
		target: IVector3d | null,
		canStandUp?: boolean,
		baseZ?: number,
		direction?: IVector3d,
		headDirection?: number,
		animationTime?: number,
		skipPositionUpdate?: boolean
	): boolean
	{
		return this.updateRoomObjectUser(
			roomId,
			roomIndex,
			location,
			target,
			direction ?? location,
			headDirection ?? 0,
			canStandUp ?? true,
			baseZ ?? 0
		);
	}

	updateObjectUserFigure(
		roomId: number,
		roomIndex: number,
		figure: string,
		sex: string,
		subType?: string,
		isRiding?: boolean
	): boolean
	{
		return this.updateRoomObjectUserFigure(roomId, roomIndex, figure, sex, subType ?? null, isRiding ?? false);
	}

	disposeObjectUser(
		roomId: number,
		roomIndex: number
	): boolean
	{
		return this.disposeRoomObject(roomId, roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);
	}

	setOwnUserId(roomId: number, roomIndex: number): void
	{
		this.setRoomObjectUserOwnUser(roomId, roomIndex);
	}

	// Private methods

	private getRoomIdentifier(roomId: number): string
	{
		return `${ROOM_ID_PREFIX}${roomId}`;
	}

	private onRoomObjectEvent(event: unknown): void
	{
		// Forward object events
		this.events.emit('roomObjectEvent', event);
	}
}
