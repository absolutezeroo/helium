/**
 * RoomManager
 *
 * Based on AS3: com.sulake.room.RoomManager
 *
 * Manages room instances and their objects. Implements IRoomInstanceContainer
 * to create room objects with proper logic and visualization.
 */
import {Component, type IContext} from '@core/runtime';
import type {IRoomManager} from './IRoomManager';
import type {IRoomInstance} from './IRoomInstance';
import type {IRoomInstanceContainer} from './IRoomInstanceContainer';
import type {IRoomManagerListener} from './IRoomManagerListener';
import type {IRoomContentLoader} from './IRoomContentLoader';
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomObjectController} from './object/IRoomObjectController';
import type {IRoomObjectManager} from './IRoomObjectManager';
import type {IRoomObjectFactory} from './IRoomObjectFactory';
import {RoomInstance} from './RoomInstance';

/**
 * Room manager states
 */
export const RoomManagerState = {
	ERROR: -1,
	LOADING: 0,
	LOADED: 1,
	INITIALIZING: 2,
	INITIALIZED: 3,
} as const;

export class RoomManager extends Component implements IRoomManager, IRoomInstanceContainer
{
	private _rooms: Map<string, IRoomInstance> = new Map();
	private _contentLoader: IRoomContentLoader | null = null;
	private _objectFactory: IRoomObjectFactory | null = null;
	private _listener: IRoomManagerListener | null = null;
	private _updateCategories: number[] = [];
	private _pendingTypes: string[] = [];

	constructor(context: IContext)
	{
		super(context);
	}

	private _state: number = RoomManagerState.INITIALIZED;

	get state(): number
	{
		return this._state;
	}

	/**
	 * Set the object factory used to create room object logic
	 */
	setObjectFactory(factory: IRoomObjectFactory): void
	{
		this._objectFactory = factory;
	}

	/**
	 * Initialize the room manager
	 */
	initialize(data: unknown, listener: IRoomManagerListener): boolean
	{
		if (this._state >= RoomManagerState.INITIALIZING)
		{
			return false;
		}

		if (this._contentLoader === null)
		{
			return false;
		}

		this._listener = listener;

		// Load placeholder types
		const placeHolderTypes = this._contentLoader.getPlaceHolderTypes();

		for (const type of placeHolderTypes)
		{
			if (!this._pendingTypes.includes(type))
			{
				this._contentLoader.loadObjectContent(type, this.events);
				this._pendingTypes.push(type);
			}
		}

		this._state = RoomManagerState.INITIALIZING;

		// If no pending types, mark as initialized immediately
		if (this._pendingTypes.length === 0)
		{
			this._state = RoomManagerState.INITIALIZED;

			if (this._listener)
			{
				this._listener.roomManagerInitialized(true);
			}
		}

		return true;
	}

	/**
	 * Set the content loader
	 */
	setContentLoader(loader: IRoomContentLoader): void
	{
		if (this._contentLoader)
		{
			this._contentLoader.dispose();
		}

		this._contentLoader = loader;
	}

	/**
	 * Add an object update category
	 */
	addObjectUpdateCategory(category: number): void
	{
		if (this._updateCategories.includes(category))
		{
			return;
		}

		this._updateCategories.push(category);

		// Add to all existing rooms
		for (const room of this._rooms.values())
		{
			room.addObjectUpdateCategory(category);
		}
	}

	/**
	 * Remove an object update category
	 */
	removeObjectUpdateCategory(category: number): void
	{
		const index = this._updateCategories.indexOf(category);

		if (index < 0)
		{
			return;
		}

		this._updateCategories.splice(index, 1);

		// Remove from all existing rooms
		for (const room of this._rooms.values())
		{
			room.removeObjectUpdateCategory(category);
		}
	}

	/**
	 * Create a new room instance
	 */
	createRoom(id: string, data: unknown): IRoomInstance | null
	{
		if (this._rooms.has(id))
		{
			return null;
		}

		const room = new RoomInstance(id, this);
		this._rooms.set(id, room);

		// Add update categories to the new room
		for (const category of this._updateCategories)
		{
			room.addObjectUpdateCategory(category);
		}

		return room;
	}

	/**
	 * Get a room by ID
	 */
	getRoom(id: string): IRoomInstance | null
	{
		return this._rooms.get(id) ?? null;
	}

	/**
	 * Get a room by index
	 */
	getRoomWithIndex(index: number): IRoomInstance | null
	{
		const rooms = Array.from(this._rooms.values());

		if (index >= 0 && index < rooms.length)
		{
			return rooms[index];
		}

		return null;
	}

	/**
	 * Get the number of rooms
	 */
	getRoomCount(): number
	{
		return this._rooms.size;
	}

	/**
	 * Dispose a room
	 */
	disposeRoom(id: string): boolean
	{
		const room = this._rooms.get(id);

		if (room)
		{
			room.dispose();
			this._rooms.delete(id);
			return true;
		}

		return false;
	}

	/**
	 * Check if content is available for a type
	 */
	isContentAvailable(type: string): boolean
	{
		if (this._contentLoader)
		{
			return this._contentLoader.hasInternalContent(type);
		}

		return false;
	}

	/**
	 * Update all rooms
	 */
	update(time: number): void
	{
		for (const room of this._rooms.values())
		{
			room.update();
		}
	}

	/**
	 * Create a room object
	 *
	 * This is called by RoomInstance.createRoomObject() to actually create the object.
	 * Uses createObjectInternal() on the room to avoid recursion.
	 */
	createRoomObject(roomId: string, objectId: number, type: string, category: number): IRoomObject | null
	{

		const room = this.getRoom(roomId);

		if (!room)
		{
			return null;
		}

		// Cast to RoomInstance to access createObjectInternal
		const roomInstance = room as RoomInstance;

		// Get visualization and logic types from content loader.
		// Fall back to the object type itself if the content loader doesn't have
		// the info yet (e.g. bundle not loaded). The factory handles built-in types
		// like 'room', 'tile_cursor' directly.
		let visualizationType: string | null = type;
		let logicType: string | null = type;

		if (this._contentLoader && !this._contentLoader.hasInternalContent(type))
		{
			const contentVizType = this._contentLoader.getVisualizationType(type);
			const contentLogicType = this._contentLoader.getLogicType(type);

			if (contentVizType) visualizationType = contentVizType;
			if (contentLogicType) logicType = contentLogicType;
		}

		// Create the object using createObjectInternal (not createRoomObject to avoid recursion)
		const stateCount = 1;
		const object = roomInstance.createObjectInternal(objectId, stateCount, type, category);

		if (!object)
		{
			return null;
		}

		const controller = object as IRoomObjectController;

		// Create and assign logic
		if (this._objectFactory && logicType)
		{
			const logic = this._objectFactory.createRoomObjectLogic(logicType);

			if (logic)
			{
				controller.setEventHandler(logic);
				logic.object = controller;
			}
		}

		// Notify content loader
		if (this._contentLoader)
		{
			this._contentLoader.roomObjectCreated(object, roomId);
		}

		return object;
	}

	/**
	 * Create a room object manager
	 */
	createRoomObjectManager(): IRoomObjectManager
	{
		if (this._objectFactory)
		{
			return this._objectFactory.createRoomObjectManager();
		}

		// Fallback - should not happen
		throw new Error('[RoomManager] No object factory available');
	}

	override dispose(): void
	{
		if (this.disposed) return;

		// Dispose all rooms
		for (const room of this._rooms.values())
		{
			room.dispose();
		}

		this._rooms.clear();

		if (this._contentLoader)
		{
			this._contentLoader.dispose();
			this._contentLoader = null;
		}

		this._listener = null;
		this._objectFactory = null;
		this._updateCategories = [];
		this._pendingTypes = [];

		super.dispose();
	}
}
