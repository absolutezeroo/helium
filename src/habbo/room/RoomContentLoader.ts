/**
 * RoomContentLoader
 *
 * Based on AS3: com.sulake.habbo.room.RoomContentLoader
 *
 * Loader for room content (furniture, pets, room assets).
 * This is a stub implementation that will be expanded when asset loading is implemented.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IRoomContentLoader} from '@room/IRoomContentLoader';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {getVisualizationType} from './object/RoomObjectUserTypes';

export class RoomContentLoader implements IRoomContentLoader
{
	public static readonly CONTENT_LOADER_READY = 'RCL_LOADER_READY';

	private static readonly PLACE_HOLDER_FURNITURE = 'place_holder';
	private static readonly PLACE_HOLDER_WALL_ITEM = 'wall_place_holder';
	private static readonly PLACE_HOLDER_PET = 'pet_place_holder';
	private static readonly PLACE_HOLDER_DEFAULT = 'place_holder';
	private static readonly ROOM_CONTENT = 'room';
	private static readonly TILE_CURSOR = 'tile_cursor';
	private static readonly SELECTION_ARROW = 'selection_arrow';

	private static readonly PLACE_HOLDER_TYPES = [
		'place_holder',
		'wall_place_holder',
		'pet_place_holder',
		'room',
		'tile_cursor',
		'selection_arrow'
	];
	private _floorItems: Map<string, number> = new Map();
	private _wallItems: Map<string, number> = new Map();
	private _pets: Map<string, number> = new Map();

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	public dispose(): void
	{
		this._floorItems.clear();
		this._wallItems.clear();
		this._pets.clear();
		this._disposed = true;
	}

	public getObjectCategory(type: string): number
	{
		if (type === null)
		{
			return RoomObjectCategoryEnum.MINIMUM;
		}

		if (this._floorItems.has(type))
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
		}

		if (this._wallItems.has(type))
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
		}

		if (this._pets.has(type))
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
		}

		if (type.indexOf('poster') === 0)
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
		}

		if (type === 'room')
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM;
		}

		if (type === 'user' || type === 'pet' || type === 'bot' || type === 'rentable_bot')
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
		}

		if (type === 'tile_cursor' || type === 'selection_arrow')
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR;
		}

		return RoomObjectCategoryEnum.MINIMUM;
	}

	public getPlaceHolderType(type: string): string
	{
		if (this._floorItems.has(type))
		{
			return RoomContentLoader.PLACE_HOLDER_FURNITURE;
		}

		if (this._wallItems.has(type))
		{
			return RoomContentLoader.PLACE_HOLDER_WALL_ITEM;
		}

		if (this._pets.has(type))
		{
			return RoomContentLoader.PLACE_HOLDER_PET;
		}

		return RoomContentLoader.PLACE_HOLDER_DEFAULT;
	}

	public getPlaceHolderTypes(): string[]
	{
		return RoomContentLoader.PLACE_HOLDER_TYPES;
	}

	public getContentType(type: string): string
	{
		return type;
	}

	public hasInternalContent(type: string): boolean
	{
		type = getVisualizationType(type);

		if (type === 'user' || type === 'game_snowball' || type === 'game_snowsplash')
		{
			return true;
		}

		return false;
	}

	public loadObjectContent(_type: string, _events: EventEmitter): boolean
	{
		// TODO: Implement asset loading
		return false;
	}

	public getVisualizationType(_type: string): string | null
	{
		// TODO: Implement when asset system is ready
		return null;
	}

	public getLogicType(_type: string): string | null
	{
		// TODO: Implement when asset system is ready
		return null;
	}

	public roomObjectCreated(object: IRoomObject, roomId: string): void
	{
		const controller = object as IRoomObjectController; // cast: type assertion required

		if (controller && controller.getModelController())
		{
			controller.getModelController().setString('object_room_id', roomId, true);
		}
	}

	public setActiveObjectType(typeId: number, type: string): void
	{
		this._floorItems.set(type, typeId);
	}

	public setWallItemType(typeId: number, type: string): void
	{
		this._wallItems.set(type, typeId);
	}

	public setPetType(typeId: number, type: string): void
	{
		this._pets.set(type, typeId);
	}
}
