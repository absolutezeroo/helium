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
import {Texture} from 'pixi.js';
import {Component, ComponentDependency, type IContext, type IUpdateReceiver} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
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
import {RoomObjectVisualizationFactory} from './object/RoomObjectVisualizationFactory';
import type {IRoomObjectVisualizationFactory} from '@room/object/IRoomObjectVisualizationFactory';
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
import {Vector3d} from '@room/utils/Vector3d';
import type {RoomPlaneParser} from './object/RoomPlaneParser';
import {Logger} from "@core";
import {RoomVisualizationData} from './object/visualization/room/RoomVisualizationData';
import type {IAssetRoomVisualizationData} from './object/visualization/room/rasterizer/basic/PlaneRasterizerTypes';
import type {NitroAsset} from '@core/assets/NitroAsset';
import {AssetLoaderEvent, AssetLoaderEventType} from '@core/assets/loaders/AssetLoaderEvent';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {EventEmitter} from 'eventemitter3';
import {RoomContentLoader} from './RoomContentLoader';
import {RoomObjectTileCursorUpdateMessage} from './messages/RoomObjectTileCursorUpdateMessage';
import {MoveAvatarMessageComposer} from '@habbo/communication/messages/outgoing/room/engine/MoveAvatarMessageComposer';
import {RoomObjectRoomMaskUpdateMessage} from './messages/RoomObjectRoomMaskUpdateMessage';
import {RoomObjectTileMouseEvent} from './events/RoomObjectTileMouseEvent';
import {RoomObjectMouseEvent} from '@room/events/RoomObjectMouseEvent';

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
	private _visualizationFactory: RoomObjectVisualizationFactory;
	private _roomData: Map<string, unknown>;
	private _activeRoomId: number = -1;
	private _ownUserIds: Map<number, number>;
	private _roomObjectAliases: Map<string, string>;
	private _renderingCanvases: Map<number, RoomRenderingCanvas> = new Map();
	private _roomVisualizations: Map<string, IRoomObjectSpriteVisualization> = new Map();
	private _resizeHandlers: WeakMap<RoomRenderingCanvas, () => void> = new WeakMap();
	private _pixiStage: Container | null = null;
	private _roomVisualizationData: RoomVisualizationData | null = null;
	private _configurationManager: IHabboConfigurationManager | null = null;
	private _sessionDataManager: ISessionDataManager | null = null;
	private _contentLoader: RoomContentLoader;
	private _contentLoaderEvents: EventEmitter = new EventEmitter();
	private _boundOnContentLoaded: ((type: string) => void);
	private _pendingFurnitureViz: Map<string, Array<{
		roomId: number;
		objectId: number;
		category: number
	}>> = new Map();
	private _canvasElement: HTMLCanvasElement | null = null;
	private _boundOnPointerMove: ((e: PointerEvent) => void) | null = null;
	private _boundOnPointerDown: ((e: PointerEvent) => void) | null = null;
	private _boundOnClick: ((e: MouseEvent) => void) | null = null;
	private _boundOnDblClick: ((e: MouseEvent) => void) | null = null;

	constructor(context: IContext, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, 0, assetLibrary);
		this._roomObjectFactory = new RoomObjectFactory();
		this._visualizationFactory = new RoomObjectVisualizationFactory();
		this._contentLoader = new RoomContentLoader();
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

					if (manager && 'setObjectFactory' in manager)
					{
						// Set the object factory on room manager
						(manager as unknown as {
							setObjectFactory: (f: RoomObjectFactory) => void;
							setVisualizationFactory: (f: IRoomObjectVisualizationFactory) => void;
						}).setObjectFactory(this._roomObjectFactory);

						// Set the visualization factory on room manager
						(manager as unknown as {
							setVisualizationFactory: (f: IRoomObjectVisualizationFactory) => void;
						}).setVisualizationFactory(this._visualizationFactory);
					}
				},
				true // Required dependency
			),
			new ComponentDependency(
				IID_HabboConfigurationManager,
				(config: IHabboConfigurationManager | null) =>
				{
					this._configurationManager = config;

					// Load room content once the config manager is available
					if (config)
					{
						this.loadRoomContent();
						this.initializeContentLoader();
					}
				},
				false // Optional - room can render with flat colors without textures
			),
			new ComponentDependency(
				IID_SessionDataManager,
				(sessionData: ISessionDataManager | null) =>
				{
					this._sessionDataManager = sessionData;

					if (sessionData)
					{
						this._contentLoader.initFurnitureData(sessionData);
					}
				},
				false // Optional - needed for furniture className lookup
			),
			new ComponentDependency(
				IID_AvatarRenderManager,
				(avatarRenderer: IAvatarRenderManager | null) =>
				{
					this._visualizationFactory.avatarRenderManager = avatarRenderer;
				},
				false // Optional - needed for avatar visualization
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
			log.warn('RoomManager not available');
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
		}
		else if (type === RoomObjectUserTypes.RENTABLE_BOT)
		{
			logicType = RoomObjectLogicEnum.RENTABLE_BOT;
		}
		else if (type === RoomObjectUserTypes.PET)
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

		// Register visualization in canvas if one was created by RoomManager
		const visualization = (object as IRoomObjectController).getVisualization();

		if (visualization)
		{
			const spriteViz = visualization as IRoomObjectSpriteVisualization;
			spriteViz.object = object;

			const key = `${roomId}_${id}_user`;
			this._roomVisualizations.set(key, spriteViz);

			const canvas = this.getRenderingCanvas(roomId);

			if (canvas)
			{
				canvas.addVisualization(spriteViz, object);
			}
		}

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

		// Resolve className from typeId using SessionDataManager
		const className = this.getFurnitureClassName(typeId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

		// Get logic type from content loader if available, otherwise default
		let logicType = this._contentLoader.getLogicType(className) ?? RoomObjectLogicEnum.FURNITURE_MULTISTATE;

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

		// Trigger furniture asset loading
		this.loadFurnitureContent(roomId, id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

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

		// Resolve className from typeId using SessionDataManager
		const className = this.getFurnitureClassName(typeId, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

		// Get logic type from content loader if available, otherwise default
		let logicType = this._contentLoader.getLogicType(className) ?? RoomObjectLogicEnum.FURNITURE_BASIC;

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


		this.loadFurnitureContent(roomId, id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

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
			log.debug(`[UPDATE_USER] room not found for roomId=${roomId}`);

			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
		{
			log.debug(`[UPDATE_USER] object not found: objectId=${objectId} in room=${roomId}`);

			return false;
		}

		log.debug(`[UPDATE_USER] objectId=${objectId} loc=(${location.x},${location.y},${location.z}) target=${targetLocation ? `(${targetLocation.x},${targetLocation.y},${targetLocation.z})` : 'null'}`);

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

			// Reset mouse state for next frame.
			// This resets _mouseCheckCount (so the next mouse_move is processed)
			// and increments _eventId (so events get unique IDs).
			const canvas = this.getRenderingCanvas(this._activeRoomId);

			if (canvas)
			{
				canvas.updateMouseState();
			}
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

	initializeRoom(
		roomId: number,
		planeParser: RoomPlaneParser | null,
		doorX?: number,
		doorY?: number,
		doorZ?: number,
		doorDir?: number
	): void
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

			const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

			if (roomObject)
			{
				const model = roomObject.getModelController();

				if (model)
				{
					// Store the RoomPlaneParser reference in the model
					// (equivalent of AS3 model.setString("room_plane_xml", xml))
					model.setObject(RoomObjectVariableEnum.ROOM_PLANE_PARSER, planeParser);

					// AS3: RoomLogic.initialize(xml) → _planeParser.initializeFromXML(xml)
					const eventHandler = roomObject.getEventHandler();

					if (eventHandler !== null)
					{
						eventHandler.initialize(planeParser);
					}

					// Store dimensions for compatibility
					model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_HEIGHT, planeParser.floorHeight, true);
					model.setNumber(RoomObjectVariableEnum.ROOM_WALL_HEIGHT, planeParser.wallHeight, true);

					// Store door position if detected (AS3: <doors> XML element)
					if (doorX !== undefined && doorDir !== undefined)
					{
						// AS3: Send door mask to RoomLogic via RoomObjectRoomMaskUpdateMessage
						// (RoomEngine.createRoom() lines 3044-3076)
						const doorMaskLocation = new Vector3d(doorX, doorY!, doorZ!);
						const doorMaskMessage = new RoomObjectRoomMaskUpdateMessage(
							RoomObjectRoomMaskUpdateMessage.ADD_MASK,
							'door_0',
							RoomObjectRoomMaskUpdateMessage.MASK_TYPE_DOOR,
							doorMaskLocation,
							RoomObjectRoomMaskUpdateMessage.MASK_CATEGORY_HOLE
						);

						if (eventHandler !== null)
						{
							eventHandler.processUpdateMessage(doorMaskMessage);
						}

						// AS3: door position on model uses -0.5 offset in door direction
						if (doorDir === 90)
						{
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_X, doorX - 0.5, true);
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Y, doorY!, true);
						}

						if (doorDir === 180)
						{
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_X, doorX, true);
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Y, doorY! - 0.5, true);
						}

						model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Z, doorZ!, true);
						model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_DIR, doorDir, true);

						// Set displacement on room geometry for door depth sorting
						// AS3: displacement position uses -0.5 offset in door direction
						const canvas = this.getRenderingCanvas(roomId);

						if (canvas?.geometry)
						{
							const displacementPos = new Vector3d(
								doorDir === 90 ? doorX - 0.5 : doorX,
								doorDir === 180 ? doorY! - 0.5 : doorY!,
								doorZ!
							);

							let displacement: IVector3d | null = null;

							if (doorDir === 90) displacement = new Vector3d(-2000, 0, 0);
							if (doorDir === 180) displacement = new Vector3d(0, -2000, 0);

							if (displacement)
							{
								canvas.geometry.setDisplacement(displacementPos, displacement);
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

			// Load tile cursor content (.nitro bundle) — goes through the same content loading pipeline as furniture
			this.loadFurnitureContent(roomId, OBJECT_ID_TILE_CURSOR, OBJECT_TYPE_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);
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
	 * Attach DOM mouse event listeners on the PixiJS canvas element.
	 * Forwards browser events to the active room's RoomRenderingCanvas.
	 */
	setCanvasElement(canvas: HTMLCanvasElement): void
	{
		// Remove old listeners
		if (this._canvasElement && this._boundOnPointerMove)
		{
			this._canvasElement.removeEventListener('pointermove', this._boundOnPointerMove);
			this._canvasElement.removeEventListener('pointerdown', this._boundOnPointerDown!);
			this._canvasElement.removeEventListener('click', this._boundOnClick!);
			this._canvasElement.removeEventListener('dblclick', this._boundOnDblClick!);
		}

		this._canvasElement = canvas;

		this._boundOnPointerMove = (e: PointerEvent) => this.onCanvasPointerMove(e);
		this._boundOnPointerDown = (e: PointerEvent) => this.onCanvasPointerDown(e);
		this._boundOnClick = (e: MouseEvent) => this.onCanvasClick(e);
		this._boundOnDblClick = (e: MouseEvent) => this.onCanvasDblClick(e);

		canvas.addEventListener('pointermove', this._boundOnPointerMove);
		canvas.addEventListener('pointerdown', this._boundOnPointerDown);
		canvas.addEventListener('click', this._boundOnClick);
		canvas.addEventListener('dblclick', this._boundOnDblClick);
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

			// Store resize handler reference for cleanup
			this._resizeHandlers.set(canvas, onResize);
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
			const resizeHandler = this._resizeHandlers.get(canvas);

			if (resizeHandler)
			{
				window.removeEventListener('resize', resizeHandler);
				this._resizeHandlers.delete(canvas);
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
	 * Get the content loader instance.
	 */
	getContentLoader(): RoomContentLoader
	{
		return this._contentLoader;
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
			const resizeHandler = this._resizeHandlers.get(canvas);

			if (resizeHandler)
			{
				window.removeEventListener('resize', resizeHandler);
				this._resizeHandlers.delete(canvas);
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

		// Dispose visualization factory
		this._visualizationFactory.dispose();

		// Dispose content loader
		this._contentLoader.dispose();
		this._contentLoaderEvents.removeAllListeners();
		this._pendingFurnitureViz.clear();

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
		// Listen for content loader ready events
		this._boundOnContentLoaded = this.onContentLoaded.bind(this);
		this._contentLoaderEvents.on(RoomContentLoader.CONTENT_LOADER_READY, this._boundOnContentLoaded);

		// Register to receive update calls from the context
		this.registerUpdateReceiver(this, 10);
	}

	private onCanvasPointerMove(e: PointerEvent): void
	{
		const canvas = this.getActiveRenderingCanvas();

		if (canvas)
		{
			canvas.handleMouseEvent(e.offsetX, e.offsetY, 'mouse_move', e.altKey, e.ctrlKey, e.shiftKey, e.buttons > 0);
		}
	}

	private onCanvasPointerDown(e: PointerEvent): void
	{
		const canvas = this.getActiveRenderingCanvas();
		if (canvas)
		{
			canvas.handleMouseEvent(e.offsetX, e.offsetY, 'mouse_down', e.altKey, e.ctrlKey, e.shiftKey, true);
		}
	}

	private onCanvasClick(e: MouseEvent): void
	{
		const canvas = this.getActiveRenderingCanvas();
		if (canvas)
		{
			log.debug(`[CLICK] at (${e.offsetX}, ${e.offsetY})`);
			const hit = canvas.handleMouseEvent(e.offsetX, e.offsetY, 'click', e.altKey, e.ctrlKey, e.shiftKey, false);
			log.debug(`[CLICK] hit = ${hit}`);
		}
		else
		{
			log.debug(`[CLICK] no active canvas`);
		}
	}

	private onCanvasDblClick(e: MouseEvent): void
	{
		const canvas = this.getActiveRenderingCanvas();
		if (canvas)
		{
			canvas.handleMouseEvent(e.offsetX, e.offsetY, 'double_click', e.altKey, e.ctrlKey, e.shiftKey, false);
		}
	}

	private getActiveRenderingCanvas(): RoomRenderingCanvas | null
	{
		if (this._activeRoomId < 0) return null;

		return this.getRenderingCanvas(this._activeRoomId);
	}

	/**
	 * Load the room content bundle (.nitro) containing floor/wall textures.
	 * Based on AS3: RoomContentLoader loading room assets.
	 */
	private loadRoomContent(): void
	{
		const assetName = 'room';

		// Check if already loaded
		if (this.hasAsset(assetName))
		{
			this.onRoomContentReady();
			return;
		}

		// Build URL from configuration using generic.asset.url template
		// e.g. generic.asset.url = "${asset.url}/bundled/generic/%libname%.nitro"
		let url = '';

		if (this._configurationManager)
		{
			url = this._configurationManager.getProperty('generic.asset.url', {libname: assetName});
		}

		if (!url)
		{
			log.warn('[RoomEngine] Cannot load room content - no generic.asset.url configured');
			return;
		}

		log.debug(`[RoomEngine] Loading room content from: ${url}`);

		const loader = this.loadAssetFromFile(assetName, url);

		if (loader)
		{
			loader.events.on('event', (event: AssetLoaderEvent) =>
			{
				if (event.type === AssetLoaderEventType.COMPLETE)
				{
					this.onRoomContentReady();
				}
				else if (event.type === AssetLoaderEventType.ERROR)
				{
					log.warn('[RoomEngine] Failed to load room content bundle');
				}
			});
		}
	}

	/**
	 * Process loaded room content bundle and create RoomVisualizationData.
	 */
	private onRoomContentReady(): void
	{
		const asset = this.findAssetByName('room') as NitroAsset | null;

		if (!asset) return;

		const jsonData = asset.jsonData;

		if (!jsonData) return;

		// Extract room visualization data from bundle JSON
		// The room.nitro bundle contains a "roomVisualization" key with floor/wall/landscape data
		const vizData = ((jsonData as Record<string, unknown>).roomVisualization ?? null) as IAssetRoomVisualizationData | null;

		if (!vizData)
		{
			log.warn('[RoomEngine] Room bundle has no roomVisualization data');
			return;
		}

		// Create RoomVisualizationData and initialize with JSON config
		this._roomVisualizationData = new RoomVisualizationData();
		this._roomVisualizationData.initialize(vizData);

		// Convert PixiJS textures to HTMLCanvasElement for the rasterizer system
		const canvasTextures = new Map<string, HTMLCanvasElement>();
		const textures: Map<string, Texture> = asset.textures;

		if (textures)
		{
			for (const [name, texture] of textures)
			{
				const canvas = this.pixiTextureToCanvas(texture);

				if (canvas !== null)
				{
					canvasTextures.set(name, canvas);
				}
			}
		}

		this._roomVisualizationData.initializeAssetCollection(canvasTextures);

		log.debug(`[RoomEngine] Room visualization data initialized with ${canvasTextures.size} textures`);
	}

	/**
	 * Convert a PixiJS Texture to an HTMLCanvasElement.
	 * Extracts the frame region from the spritesheet source image.
	 */
	private pixiTextureToCanvas(texture: Texture): HTMLCanvasElement | null
	{
		try
		{
			const frame = texture.frame;

			if (frame.width < 1 || frame.height < 1) return null;

			const canvas = document.createElement('canvas');

			canvas.width = frame.width;
			canvas.height = frame.height;

			const ctx = canvas.getContext('2d');

			if (!ctx) return null;

			const source = texture.source?.resource;

			if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)
			{
				ctx.drawImage(
					source,
					frame.x, frame.y, frame.width, frame.height,
					0, 0, frame.width, frame.height
				);

				return canvas;
			}

			// ImageBitmap support
			if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap)
			{
				ctx.drawImage(
					source,
					frame.x, frame.y, frame.width, frame.height,
					0, 0, frame.width, frame.height
				);

				return canvas;
			}

			return null;
		}
		catch
		{
			return null;
		}
	}

	private getRoomIdentifier(roomId: number): string
	{
		return `${ROOM_ID_PREFIX}${roomId}`;
	}

	private onRoomObjectEvent(event: unknown): void
	{
		// Handle tile mouse events for tile cursor
		if (event instanceof RoomObjectTileMouseEvent)
		{
			this.handleTileMouseEvent(event);
		}
		else if (event instanceof RoomObjectMouseEvent)
		{
			this.handleObjectMouseEvent(event);
		}

		// Forward object events
		if (event && typeof event === 'object' && 'type' in event)
		{
			this.events.emit('roomObjectEvent', event);
		}
	}

	/**
	 * Handle tile mouse events - update the tile cursor.
	 * Based on AS3 RoomObjectEventHandler.handleMouseOverTile()
	 */
	private handleTileMouseEvent(event: RoomObjectTileMouseEvent): void
	{
		if (this._activeRoomId < 0) return;

		const tileX = event.tileXAsInt;
		const tileY = event.tileYAsInt;
		const tileZ = event.tileZ;

		if (event.type === RoomObjectMouseEvent.ROE_MOUSE_MOVE)
		{
			const tileCursor = this.getTileCursor(this._activeRoomId);

			if (tileCursor && tileCursor.getEventHandler())
			{
				const cursorUpdate = new RoomObjectTileCursorUpdateMessage(
					new Vector3d(tileX, tileY, tileZ),
					tileZ,
					true,
					event.eventId
				);

				tileCursor.getEventHandler()!.processUpdateMessage(cursorUpdate);
			}
		}
		else if (event.type === RoomObjectMouseEvent.ROE_MOUSE_CLICK)
		{
			log.info(`[WALK] Tile (${tileX}, ${tileY}) connection=${!!this._connection}`);

			if (this._connection)
			{
				this._connection.send(new MoveAvatarMessageComposer(tileX, tileY));
			}
		}
	}

	/**
	 * Handle object mouse events - debug logging for furniture clicks.
	 */
	private handleObjectMouseEvent(event: RoomObjectMouseEvent): void
	{
		if (event.type !== RoomObjectMouseEvent.ROE_MOUSE_CLICK) return;

		const obj = event.object;

		if (!obj) return;

		const objType = obj.getType();
		const objId = obj.getId();

		// Skip room object itself
		if (objType === 'room' || objId < 0) return;

		const loc = obj.getLocation();

		log.info(`[CLICK] Object id=${objId} type="${objType}" pos=(${loc?.x?.toFixed(1)}, ${loc?.y?.toFixed(1)}, ${loc?.z?.toFixed(1)})`);
	}

	/**
	 * Create and add a visualization for a room object.
	 * Uses the visualization factory for creating visualization instances.
	 *
	 * @see AS3 RoomManager.createRoomObject() visualization creation
	 */
	private createVisualizationForObject(roomId: number, objectId: number, type: string): IRoomObjectSpriteVisualization | null
	{
		const visualization = this._visualizationFactory.createRoomObjectVisualization(type);

		if (visualization === null)
		{
			return null;
		}

		// Check if visualization is sprite-based
		const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

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

		// Initialize room visualization with texture data (rasterizers)
		if (type === OBJECT_TYPE_ROOM && this._roomVisualizationData !== null)
		{
			spriteVisualization.initialize(this._roomVisualizationData);
		}

		// Store visualization
		const key = `${roomId}_${objectId}_${type}`;
		this._roomVisualizations.set(key, spriteVisualization);

		// Add to rendering canvas
		const canvas = this.getRenderingCanvas(roomId);

		if (canvas && object)
		{
			canvas.addVisualization(spriteVisualization, object);
		}

		return spriteVisualization;
	}

	/**
	 * Update visualizations for a room.
	 * Canvas.render() handles visualization updates and screen positioning.
	 * Based on AS3: RoomSpriteCanvas.render() calling visualization.update() internally.
	 */
	private updateRoomVisualizations(roomId: number, time: number): void
	{
		const canvas = this.getRenderingCanvas(roomId);

		if (!canvas)
		{
			return;
		}

		canvas.render(time);
	}

	/**
	 * Initialize the content loader with the asset library and configuration manager.
	 */
	private initializeContentLoader(): void
	{
		if (!this.assets || !this._configurationManager)
		{
			return;
		}

		this._contentLoader.initialize(this.assets, this._configurationManager);

		// Pre-load placeholder content types so they're available when objects are created.
		// Based on AS3 RoomEngine loading PLACE_HOLDER_TYPES at initialization.
		const placeHolderTypes = this._contentLoader.getPlaceHolderTypes();

		for (const type of placeHolderTypes)
		{
			// 'room' is loaded separately via loadRoomContent()
			if (type === 'room')
			{
				continue;
			}

			this._contentLoader.loadObjectContent(type, this._contentLoaderEvents);
		}
	}

	/**
	 * Get furniture className from typeId.
	 * Uses RoomContentLoader's typeId→className mapping (populated by setActiveObjectType/setWallItemType).
	 *
	 * @see AS3 RoomContentLoader var_2179
	 * @param typeId The furniture type ID
	 * @param category The object category (furniture or wall)
	 * @returns The className string
	 */
	private getFurnitureClassName(typeId: number, category: number): string
	{
		// First try the content loader's typeId→className map
		const className = this._contentLoader.getClassName(typeId, category);

		if (className)
		{
			return className;
		}

		// Fallback to SessionDataManager
		if (this._sessionDataManager)
		{
			let furniData;

			if (category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
			{
				furniData = this._sessionDataManager.getWallItemData(typeId);
			}
			else
			{
				furniData = this._sessionDataManager.getFloorItemData(typeId);
			}

			if (furniData)
			{
				return furniData.className;
			}
		}

		log.warn(`Unknown furniture typeId: ${typeId}, category: ${category}`);

		return `type_${typeId}`;
	}

	/**
	 * Start loading furniture content and track pending visualization requests.
	 */
	private loadFurnitureContent(roomId: number, objectId: number, className: string, category: number): void
	{
		if (this._contentLoader.isLoaded(className))
		{
			// Already loaded - create visualization immediately
			this.createVisualizationForFurniture(roomId, objectId, className, category);
			return;
		}

		// Track this object as pending for when content loads
		let pending = this._pendingFurnitureViz.get(className);

		if (!pending)
		{
			pending = [];
			this._pendingFurnitureViz.set(className, pending);
		}

		pending.push({roomId, objectId, category});

		// Start loading
		this._contentLoader.loadObjectContent(className, this._contentLoaderEvents);
	}

	/**
	 * Called when a furniture content bundle has finished loading.
	 */
	private onContentLoaded(type: string): void
	{
		// Create visualizations for all pending objects of this type
		const pending = this._pendingFurnitureViz.get(type);

		if (pending)
		{
			for (const entry of pending)
			{
				this.createVisualizationForFurniture(entry.roomId, entry.objectId, type, entry.category);
			}

			this._pendingFurnitureViz.delete(type);
		}
	}

	/**
	 * Create a visualization for a furniture item using loaded content.
	 * Uses the visualization factory for creating instances and caching viz data.
	 *
	 * @param roomId The room ID
	 * @param objectId The object ID
	 * @param className The furniture className
	 * @param category The object category
	 *
	 * @see AS3 RoomManager.createRoomObject() lines 335-356
	 */
	private createVisualizationForFurniture(roomId: number, objectId: number, className: string, category: number): void
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return;
		}

		const object = room.getObject(objectId, category);

		if (!object)
		{
			return;
		}

		// Get visualization type from content loader.
		// For tile_cursor and selection_arrow, force className as vizType so the factory
		// creates the specialized class (TileCursorVisualization). For everything else
		// (including placeholders), use the bundle's declared visualizationType.
		let vizType: string;

		if (className === OBJECT_TYPE_TILE_CURSOR || className === 'selection_arrow')
		{
			vizType = className;
		}
		else
		{
			const bundleVizType = this._contentLoader.getVisualizationType(className);

			if (!bundleVizType)
			{
				return;
			}

			vizType = bundleVizType;
		}

		// Create visualization instance from visualization factory
		const visualization = this._visualizationFactory.createRoomObjectVisualization(vizType);

		if (!visualization)
		{
			log.warn(`[createVisualizationForFurniture] Factory returned null for vizType=${vizType}`);
			return;
		}

		const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

		// Set asset collection from content loader
		const assetCollection = this._contentLoader.getAssetCollection(className);

		if (assetCollection)
		{
			spriteVisualization.assetCollection = assetCollection;
		}

		// Get or create visualization data via the visualization factory (cached)
		const rawVizData = this._contentLoader.getVisualizationConfig(className);

		if (rawVizData)
		{
			const vizData = this._visualizationFactory.getRoomObjectVisualizationData(className, vizType, rawVizData);

			if (vizData)
			{
				spriteVisualization.initialize(vizData);
			}
		}

		// Assign the room object
		spriteVisualization.object = object;

		// Store visualization
		const key = `${roomId}_${objectId}_furniture_${className}`;
		this._roomVisualizations.set(key, spriteVisualization);

		// Add to rendering canvas
		const canvas = this.getRenderingCanvas(roomId);

		if (canvas)
		{
			canvas.addVisualization(spriteVisualization, object);
		}
	}
}
