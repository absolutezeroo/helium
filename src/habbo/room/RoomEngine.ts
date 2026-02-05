/**
 * RoomEngine
 *
 * Based on AS3: com.sulake.habbo.room.RoomEngine
 *
 * Main room engine implementation. Orchestrates room rendering,
 * object management, and event handling.
 *
 * IMPORTANT: RoomEngine depends on IRoomManager for room instance management.
 * It does NOT manage rooms directly - that's RoomManager's responsibility.
 */
import type {Container} from 'pixi.js';
import {Component, ComponentDependency, type IContext, type IUpdateReceiver} from '@core/runtime';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomEngine} from './IRoomEngine';
import type {IRoomCreator} from './IRoomCreator';
import type {IRoomEngineServices} from './IRoomEngineServices';
import type {IRoomContentListener} from './IRoomContentListener';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomManager} from '@room/IRoomManager';
import type {IRoomManagerListener} from '@room/IRoomManagerListener';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import {IID_RoomManager} from '@iid/IIDRoomManager';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {RoomObjectLogicEnum} from './object/RoomObjectLogicEnum';
import {RoomObjectUserTypes} from './object/RoomObjectUserTypes';
import {RoomObjectVariableEnum} from './object/RoomObjectVariableEnum';
import {RoomEngineEvent} from './events/RoomEngineEvent';
import {RoomEngineObjectEvent} from './events/RoomEngineObjectEvent';
import {RoomObjectFactory} from './RoomObjectFactory';
import {RoomRenderingCanvas} from './renderer/RoomRenderingCanvas';
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
import type {RoomPlaneParser} from './object/RoomPlaneParser';
import {Logger} from "@/core";

const log = Logger.getLogger('RoomEngine');

// Room identifier prefix
const ROOM_ID_PREFIX = 'room_';
const OBJECT_ID_ROOM = -1;
const OBJECT_TYPE_ROOM = 'room';
const OBJECT_ID_TILE_CURSOR = -2;
const OBJECT_TYPE_TILE_CURSOR = 'tile_cursor';
const OBJECT_ID_SELECTION_ARROW = -3;

export class RoomEngine extends Component implements IRoomEngine,
	IRoomManagerListener,
	IRoomCreator,
	IRoomEngineServices,
	IUpdateReceiver,
	IRoomContentListener
{
	private _roomObjectFactory: RoomObjectFactory;
	private _roomData: Map<string, unknown>;
	private _activeRoomId: number = -1;
	private _ownUserIds: Map<number, number>;
	private _roomObjectAliases: Map<string, string>;
	private _renderingCanvases: Map<number, RoomRenderingCanvas> = new Map();
	private _roomVisualizations: Map<string, IRoomObjectSpriteVisualization> = new Map();
	private _pixiStage: Container | null = null;

	constructor(context: IContext)
	{
		super(context);
		this._roomObjectFactory = new RoomObjectFactory();
		this._roomData = new Map();
		this._ownUserIds = new Map();
		this._roomObjectAliases = new Map();

		// Listen to object events from factory
		this._roomObjectFactory.addObjectEventListener(this.onRoomObjectEvent.bind(this));
	}

	private _roomManager: IRoomManager | null = null;

	get roomManager(): IRoomManager | null
	{
		return this._roomManager;
	}

	private _connection: IConnection | null = null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	set connection(value: IConnection | null)
	{
		this._connection = value;
	}

	private _isDecorateMode: boolean = false;

	get isDecorateMode(): boolean
	{
		return this._isDecorateMode;
	}

	private _isGameMode: boolean = false;

	get isGameMode(): boolean
	{
		return this._isGameMode;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_RoomManager,
				(manager: IRoomManager | null) =>
				{
					this._roomManager = manager;

					if (manager)
					{
						// Set the object factory on room manager
						(manager as any).setObjectFactory?.(this._roomObjectFactory);
					}
				},
				true // Required dependency
			),
		];
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

	roomManagerInitialized(success: boolean): void
	{
		if (success)
		{
			this.events.emit(RoomEngineEvent.REE_ENGINE_INITIALIZED);
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

	iconLoaded(typeId: number, type: string, success: boolean): void
	{
		this.events.emit('iconLoaded', typeId, type, success);
	}

	createRoomInstance(roomId: number): IRoomInstance | null
	{
		if (!this._roomManager)
		{
			console.warn('[RoomEngine] RoomManager not available');
			return null;
		}

		const roomIdStr = this.getRoomIdentifier(roomId);

		// Check if room already exists
		let room = this._roomManager.getRoom(roomIdStr);

		if (room)
		{
			return room;
		}

		// Create via RoomManager
		room = this._roomManager.createRoom(roomIdStr, null);

		if (!room)
		{
			return null;
		}

		// Create room object and tile cursor
		// These go through RoomManager.createRoomObject which handles the internal creation
		room.createRoomObject(OBJECT_ID_ROOM, OBJECT_TYPE_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);
		room.createRoomObject(OBJECT_ID_TILE_CURSOR, OBJECT_TYPE_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);

		return room;
	}

	disposeRoomInstance(roomId: number): void
	{
		if (!this._roomManager)
		{
			return;
		}

		const roomIdStr = this.getRoomIdentifier(roomId);
		this._roomManager.disposeRoom(roomIdStr);

		this._roomData.delete(roomIdStr);
		this._ownUserIds.delete(roomId);

		// Clean up visualizations for this room
		const keysToDelete: string[] = [];

		for (const [key, visualization] of this._roomVisualizations)
		{
			if (key.startsWith(`${roomId}_`))
			{
				visualization.dispose();
				keysToDelete.push(key);
			}
		}

		for (const key of keysToDelete)
		{
			this._roomVisualizations.delete(key);
		}

		// Dispose rendering canvas
		this.disposeRenderingCanvas(roomId);

		this.events.emit(RoomEngineEvent.REE_DISPOSED, new RoomEngineEvent(RoomEngineEvent.REE_DISPOSED, roomId));
	}

	getRoomInstance(roomId: number): IRoomInstance | null
	{
		if (!this._roomManager)
		{
			return null;
		}

		const roomIdStr = this.getRoomIdentifier(roomId);
		return this._roomManager.getRoom(roomIdStr);
	}

	setActiveRoom(roomId: number): void
	{
		this._activeRoomId = roomId;
	}

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
		let logicType: string = RoomObjectLogicEnum.USER;

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

		// Create object via RoomManager (room.createRoomObject delegates to container)
		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

		if (!object)
		{
			return false;
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

	update(time: number): void
	{
		// Delegate update to RoomManager
		if (this._roomManager)
		{
			this._roomManager.update(time);
		}

		// Update visualizations for active room
		if (this._activeRoomId >= 0)
		{
			this.updateRoomVisualizations(this._activeRoomId, time);
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

	getRoomOwnObjectId(roomId: number): number
	{
		return this._ownUserIds.get(roomId) ?? -1;
	}

	setRoomOwnObjectId(roomId: number, objectId: number): void
	{
		this._ownUserIds.set(roomId, objectId);
	}

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

	initializeRoom(roomId: number, planeParser: RoomPlaneParser | null): void
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

		// If we have plane data, store it for rendering
		if (planeParser !== null)
		{
			log.debug(`[RoomEngine] Initializing room ${roomId} with ${planeParser.planeCount} planes`);

			// Store plane parser data on room model for later use by visualization
			const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

			if (roomObject)
			{
				const model = roomObject.getModelController();

				if (model)
				{
					// Store plane parser reference for visualization
					model.setNumber(RoomObjectVariableEnum.ROOM_PLANE_COUNT, planeParser.planeCount, true);
					model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_HEIGHT, planeParser.floorHeight, true);
					model.setNumber(RoomObjectVariableEnum.ROOM_WALL_HEIGHT, planeParser.wallHeight, true);

					// Store plane data for each plane
					for (let i = 0; i < planeParser.planeCount; i++)
					{
						const loc = planeParser.getPlaneLocation(i);
						const leftSide = planeParser.getPlaneLeftSide(i);
						const rightSide = planeParser.getPlaneRightSide(i);
						const type = planeParser.getPlaneType(i);

						if (loc && leftSide && rightSide)
						{
							// Store plane data in model for visualization to use
							model.setNumber(`plane_${i}_type`, type, true);
							model.setNumber(`plane_${i}_loc_x`, loc.x, true);
							model.setNumber(`plane_${i}_loc_y`, loc.y, true);
							model.setNumber(`plane_${i}_loc_z`, loc.z, true);
							model.setNumber(`plane_${i}_left_x`, leftSide.x, true);
							model.setNumber(`plane_${i}_left_y`, leftSide.y, true);
							model.setNumber(`plane_${i}_left_z`, leftSide.z, true);
							model.setNumber(`plane_${i}_right_x`, rightSide.x, true);
							model.setNumber(`plane_${i}_right_y`, rightSide.y, true);
							model.setNumber(`plane_${i}_right_z`, rightSide.z, true);

							// Store secondary normals
							const secNormals = planeParser.getPlaneSecondaryNormals(i);
							model.setNumber(`plane_${i}_sec_normal_count`, secNormals.length, true);
							for (let j = 0; j < secNormals.length; j++)
							{
								const secNormal = secNormals[j];
								model.setNumber(`plane_${i}_sec_normal_${j}_x`, secNormal.x, true);
								model.setNumber(`plane_${i}_sec_normal_${j}_y`, secNormal.y, true);
								model.setNumber(`plane_${i}_sec_normal_${j}_z`, secNormal.z, true);
							}
						}
					}
				}
			}

			// Create room visualization
			const roomVisualization = this.createVisualizationForObject(roomId, OBJECT_ID_ROOM, OBJECT_TYPE_ROOM);

			if (roomVisualization)
			{
				log.debug(`[RoomEngine] Created room visualization for room ${roomId}`);
			}
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

		const object = room.createRoomObject(id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

		if (!object)
		{
			return false;
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

	/**
	 * Update user action (expression, dance, sleep, typing, carry, use object).
	 * Based on AS3: RoomEngine.updateObjectUserAction
	 */
	updateObjectUserAction(
		roomId: number,
		roomIndex: number,
		action: string,
		value: number
	): boolean
	{
		const roomInstance = this.getRoomInstance(roomId);

		if (roomInstance === null)
		{
			return false;
		}

		const roomObject = roomInstance.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

		if (roomObject === null)
		{
			return false;
		}

		const model = (roomObject as IRoomObjectController).getModelController();

		if (model === null)
		{
			return false;
		}

		model.setNumber(action, value);

		return true;
	}

	/**
	 * Update user effect.
	 * Based on AS3: RoomEngine.updateObjectUserEffect
	 */
	updateObjectUserEffect(
		roomId: number,
		roomIndex: number,
		effectId: number,
		_delayMilliSeconds: number
	): boolean
	{
		const roomInstance = this.getRoomInstance(roomId);

		if (roomInstance === null)
		{
			return false;
		}

		const roomObject = roomInstance.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

		if (roomObject === null)
		{
			return false;
		}

		const model = (roomObject as IRoomObjectController).getModelController();

		if (model === null)
		{
			return false;
		}

		// Set the effect - delay handling would be done by visualization layer
		model.setNumber(RoomObjectVariableEnum.AVATAR_EFFECT, effectId);

		return true;
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

	addObjectUpdateCategory(category: number): void
	{
		if (this._roomManager)
		{
			this._roomManager.addObjectUpdateCategory(category);
		}
	}

	removeObjectUpdateCategory(category: number): void
	{
		if (this._roomManager)
		{
			this._roomManager.removeObjectUpdateCategory(category);
		}
	}

	/**
	 * Set a furniture type alias.
	 * Maps a furniture type name to an alias name.
	 * Based on AS3: com.sulake.habbo.room.RoomEngine.setRoomObjectAlias
	 */
	setRoomObjectAlias(name: string, alias: string): void
	{
		this._roomObjectAliases.set(name, alias);
	}

	/**
	 * Get the alias for a furniture type name.
	 * Returns the alias if set, otherwise returns the original name.
	 */
	getRoomObjectAlias(name: string): string
	{
		return this._roomObjectAliases.get(name) ?? name;
	}

	/**
	 * Set the PixiJS stage for rendering
	 */
	setStage(stage: Container): void
	{
		this._pixiStage = stage;
	}

	/**
	 * Get or create a rendering canvas for a room
	 */
	getRenderingCanvas(roomId: number, canvasId: number = 1): RoomRenderingCanvas | null
	{
		const key = roomId * 1000 + canvasId;

		if (!this._renderingCanvases.has(key))
		{
			// Use actual window dimensions
			const width = window.innerWidth;
			const height = window.innerHeight;

			// Create new rendering canvas
			const canvas = new RoomRenderingCanvas(canvasId, width, height, 64);

			this._renderingCanvases.set(key, canvas);

			// Add to PixiJS stage if available
			if (this._pixiStage)
			{
				this._pixiStage.addChild(canvas.container);
			}

			// Listen for window resize to update canvas dimensions
			const onResize = () =>
			{
				canvas.initialize(window.innerWidth, window.innerHeight);
			};

			window.addEventListener('resize', onResize);

			// Store resize handler reference for cleanup (use the canvas container)
			(canvas as any)._resizeHandler = onResize;
		}

		return this._renderingCanvases.get(key) ?? null;
	}

	/**
	 * Dispose a rendering canvas for a room
	 */
	disposeRenderingCanvas(roomId: number, canvasId: number = 1): void
	{
		const key = roomId * 1000 + canvasId;
		const canvas = this._renderingCanvases.get(key);

		if (canvas)
		{
			// Remove resize handler if attached
			const resizeHandler = (canvas as any)._resizeHandler;

			if (resizeHandler)
			{
				window.removeEventListener('resize', resizeHandler);
			}

			// Remove from PixiJS stage
			if (this._pixiStage && canvas.container.parent === this._pixiStage)
			{
				this._pixiStage.removeChild(canvas.container);
			}

			canvas.dispose();
			this._renderingCanvases.delete(key);
		}
	}

	/**
	 * Dispose the room engine
	 */
	override dispose(): void
	{
		// Unregister from update loop
		this.removeUpdateReceiver(this);

		// Dispose all rendering canvases
		for (const [key, canvas] of this._renderingCanvases)
		{
			const resizeHandler = (canvas as any)._resizeHandler;

			if (resizeHandler)
			{
				window.removeEventListener('resize', resizeHandler);
			}

			if (this._pixiStage && canvas.container.parent === this._pixiStage)
			{
				this._pixiStage.removeChild(canvas.container);
			}

			canvas.dispose();
		}

		this._renderingCanvases.clear();

		// Dispose all visualizations
		for (const visualization of this._roomVisualizations.values())
		{
			visualization.dispose();
		}

		this._roomVisualizations.clear();

		// Clear stage reference
		this._pixiStage = null;

		super.dispose();
	}

	/**
	 * Called when all dependencies are resolved.
	 * Register for updates to drive the rendering loop.
	 */
	protected override initComponent(): void
	{
		// Register to receive update calls from the context
		this.registerUpdateReceiver(this, 10);
	}

	private getRoomIdentifier(roomId: number): string
	{
		return `${ROOM_ID_PREFIX}${roomId}`;
	}

	private onRoomObjectEvent(event: unknown): void
	{
		// Forward object events
		this.events.emit('roomObjectEvent', event);
	}

	/**
	 * Create and add a visualization for a room object
	 */
	private createVisualizationForObject(roomId: number, objectId: number, type: string): IRoomObjectSpriteVisualization | null
	{
		const visualization = this._roomObjectFactory.createRoomObjectVisualization(type);

		if (visualization === null)
		{
			return null;
		}

		// Check if visualization is sprite-based
		const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

		if (!('container' in spriteVisualization))
		{
			return null;
		}

		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return null;
		}

		const object = room.getObject(objectId, this.getRoomObjectCategory(type));

		if (object)
		{
			spriteVisualization.object = object;
		}

		// Store visualization
		const key = `${roomId}_${objectId}_${type}`;
		this._roomVisualizations.set(key, spriteVisualization);

		// Add to rendering canvas
		const canvas = this.getRenderingCanvas(roomId);

		if (canvas)
		{
			canvas.addVisualization(spriteVisualization.container, 0);
		}

		return spriteVisualization;
	}

	/**
	 * Update visualizations for a room
	 */
	private updateRoomVisualizations(roomId: number, time: number): void
	{
		const canvas = this.getRenderingCanvas(roomId);

		if (!canvas)
		{
			return;
		}

		// Update all visualizations for this room
		for (const [key, visualization] of this._roomVisualizations)
		{
			if (key.startsWith(`${roomId}_`))
			{
				visualization.update(canvas.geometry, time, false, false);
			}
		}
	}
}
