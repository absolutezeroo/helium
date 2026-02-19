/**
 * RoomContentLoader
 *
 * Based on AS3: com.sulake.habbo.room.RoomContentLoader
 *
 * Loader for room content (furniture, pets, room assets).
 * Loads .nitro bundles, creates GraphicAssetCollections and FurnitureVisualizationData,
 * and caches them for visualization initialization.
 */
import {EventEmitter} from 'eventemitter3';
import type {IRoomContentLoader} from '@room/IRoomContentLoader';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IGraphicAssetCollection} from '@room/object/visualization/utils/IGraphicAssetCollection';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IFurniDataListener} from '@habbo/session/furniture/IFurniDataListener';
import type {NitroAsset} from '@core/assets/NitroAsset';
import {AssetLoaderEvent, AssetLoaderEventType} from '@core/assets/loaders/AssetLoaderEvent';
import {GraphicAssetCollection} from '@room/object/visualization/utils/GraphicAssetCollection';
import {RoomContentLoadedEvent} from '@room/events/RoomContentLoadedEvent';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {getVisualizationType} from './object/RoomObjectUserTypes';
import {Logger} from '@core';

const log = Logger.getLogger('RoomContentLoader');

export class RoomContentLoader implements IRoomContentLoader, IFurniDataListener
{
	public static readonly CONTENT_LOADER_READY = 'RCL_LOADER_READY';

	private static readonly PLACE_HOLDER_FURNITURE = 'place_holder';
	private static readonly PLACE_HOLDER_WALL_ITEM = 'place_holder_wall';
	private static readonly PLACE_HOLDER_PET = 'place_holder_pet';
	private static readonly PLACE_HOLDER_DEFAULT = 'place_holder';
	private static readonly ROOM_CONTENT = 'room';
	private static readonly TILE_CURSOR = 'tile_cursor';
	private static readonly SELECTION_ARROW = 'selection_arrow';

	private static readonly PLACE_HOLDER_TYPES = [
		'place_holder',
		'place_holder_wall',
		'place_holder_pet',
		'room',
		'tile_cursor',
		'selection_arrow'
	];

	/**
	 * Special content types that use generic.asset.url instead of furniture.asset.url.
	 * Based on AS3 RoomContentLoader.getObjectContentURLs() switch statement.
	 */
	private static readonly SPECIAL_CONTENT_TYPES = new Set([
		'place_holder',
		'place_holder_wall',
		'place_holder_pet',
		'room',
		'tile_cursor',
		'selection_arrow',
	]);

	private _floorItems: Map<string, number> = new Map();
	private _wallItems: Map<string, number> = new Map();
	private _pets: Map<string, number> = new Map();
	private _floorItemsByTypeId: Map<number, string> = new Map();
	private _wallItemsByTypeId: Map<number, string> = new Map();

	private _sessionDataManager: ISessionDataManager | null = null;
	private _assetLibrary: IAssetLibrary | null = null;
	private _configurationManager: IHabboConfigurationManager | null = null;
	private _furnitureAssetUrl: string = '';
	private _furniDataReady: boolean = false;
	private _loadedTypes: Map<string, boolean> = new Map();
	private _loadingTypes: Map<string, Promise<void>> = new Map();
	private _assetCollections: Map<string, GraphicAssetCollection> = new Map();
	private _visualizationConfigMap: Map<string, unknown> = new Map();
	private _visualizationTypeMap: Map<string, string> = new Map();
	private _logicTypeMap: Map<string, string> = new Map();

	private _contentEvents: EventEmitter = new EventEmitter();

	get contentEvents(): EventEmitter
	{
		return this._contentEvents;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	get isFurniDataReady(): boolean
	{
		return this._furniDataReady;
	}

	/**
	 * Initialize the content loader with dependencies.
	 */
	initialize(assetLibrary: IAssetLibrary, configurationManager: IHabboConfigurationManager): void
	{
		this._assetLibrary = assetLibrary;
		this._configurationManager = configurationManager;

		this._furnitureAssetUrl = configurationManager.getProperty('furniture.asset.url');

		if (!this._furnitureAssetUrl)
		{
			log.warn('No furniture.asset.url configured');
		}
		else
		{
			log.debug(`Furniture asset URL template: ${this._furnitureAssetUrl}`);
		}
	}

	/**
	 * Initialize furniture data maps from SessionDataManager.
	 * Populates typeId→className and className→typeId mappings for all furniture.
	 *
	 * @see AS3 RoomContentLoader.initFurnitureData (line 783)
	 */
	initFurnitureData(sessionDataManager: ISessionDataManager): void
	{
		this._sessionDataManager = sessionDataManager;

		const furniData = sessionDataManager.getFurniData(this);

		if (!furniData || furniData.length === 0)
		{
			return;
		}

		sessionDataManager.removeFurniDataListener(this);

		this.populateFurniData(furniData);

		this._furniDataReady = true;

		log.debug(`Furniture data initialized: ${this._floorItems.size} floor items, ${this._wallItems.size} wall items`);
	}

	/**
	 * Called by SessionDataManager when furniture data becomes available.
	 *
	 * @see AS3 IFurniDataListener / class_1813
	 */
	furniDataReady(): void
	{
		if (!this._sessionDataManager)
		{
			return;
		}

		const furniData = this._sessionDataManager.getFurniData(this);

		if (!furniData || furniData.length === 0)
		{
			return;
		}

		this._sessionDataManager.removeFurniDataListener(this);

		this.populateFurniData(furniData);

		this._furniDataReady = true;

		log.debug(`Furniture data ready: ${this._floorItems.size} floor items, ${this._wallItems.size} wall items`);
	}

	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		this._floorItems.clear();
		this._wallItems.clear();
		this._pets.clear();
		this._floorItemsByTypeId.clear();
		this._wallItemsByTypeId.clear();

		for (const collection of this._assetCollections.values())
		{
			collection.dispose();
		}

		this._assetCollections.clear();
		this._visualizationConfigMap.clear();
		this._visualizationTypeMap.clear();
		this._logicTypeMap.clear();
		this._loadedTypes.clear();
		this._loadingTypes.clear();
		this._contentEvents.removeAllListeners();
	}

	getObjectCategory(type: string): number
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

	getPlaceHolderType(type: string): string
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

	getPlaceHolderTypes(): string[]
	{
		return RoomContentLoader.PLACE_HOLDER_TYPES;
	}

	getContentType(type: string): string
	{
		return type;
	}


	hasInternalContent(type: string): boolean
	{
		type = getVisualizationType(type);

		if (type === 'user' || type === 'game_snowball' || type === 'game_snowsplash')
		{
			return true;
		}

		return false;
	}

	/**
	 * Load content for a furniture type.
	 *
	 * @param type The furniture className
	 * @param events EventEmitter to emit CONTENT_LOADER_READY when loaded
	 * @returns true if loading started or already loaded
	 */
	loadObjectContent(type: string, events: EventEmitter): boolean
	{
		if (this._loadedTypes.get(type))
		{
			// Already loaded - emit success immediately
			events.emit(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, type);
			return true;
		}

		if (this._loadingTypes.has(type))
		{
			// Already loading - wait for it to finish then emit
			this._loadingTypes.get(type)!.then(() =>
			{
				events.emit(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, type);
			});

			return true;
		}

		if (!this._assetLibrary)
		{
			return false;
		}

		// Build URL: special types use generic.asset.url, regular furniture uses furniture.asset.url
		// Based on AS3 RoomContentLoader.getObjectContentURLs()
		const url = this.getContentUrl(type);

		if (!url)
		{
			log.warn(`Cannot resolve URL for content type: ${type}`);
			return false;
		}

		log.debug(`Loading content: ${type} from ${url}`);

		const loadPromise = this.loadFurnitureBundle(type, url, events);
		this._loadingTypes.set(type, loadPromise);

		return true;
	}

	getVisualizationType(type: string): string | null
	{
		return this._visualizationTypeMap.get(type) ?? null;
	}

	getLogicType(type: string): string | null
	{
		return this._logicTypeMap.get(type) ?? null;
	}

	/**
	 * Get the cached asset collection for a furniture type.
	 */
	getAssetCollection(type: string): IGraphicAssetCollection | null
	{
		return this._assetCollections.get(type) ?? null;
	}

	/**
	 * Get the raw visualization config JSON for a furniture type.
	 * The RoomObjectVisualizationFactory uses this to create and cache
	 * IRoomObjectVisualizationData instances.
	 */
	getVisualizationConfig(type: string): unknown | null
	{
		return this._visualizationConfigMap.get(type) ?? null;
	}

	/**
	 * Get the className for a furniture typeId.
	 *
	 * @see AS3 RoomContentLoader var_2179 (typeId → className map)
	 */
	getClassName(typeId: number, category: number): string | null
	{
		if (category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
		{
			return this._wallItemsByTypeId.get(typeId) ?? null;
		}

		return this._floorItemsByTypeId.get(typeId) ?? null;
	}

	/**
	 * Check if content is loaded for a given type.
	 */
	isLoaded(type: string): boolean
	{
		return this._loadedTypes.get(type) === true;
	}

	roomObjectCreated(object: IRoomObject, roomId: string): void
	{
		const controller = object as IRoomObjectController;

		if (controller && controller.getModelController())
		{
			controller.getModelController().setString('object_room_id', roomId, true);
		}
	}

	setActiveObjectType(typeId: number, type: string): void
	{
		this._floorItems.set(type, typeId);
		this._floorItemsByTypeId.set(typeId, type);
	}

	setWallItemType(typeId: number, type: string): void
	{
		this._wallItems.set(type, typeId);
		this._wallItemsByTypeId.set(typeId, type);
	}

	setPetType(typeId: number, type: string): void
	{
		this._pets.set(type, typeId);
	}

	/**
	 * Resolve the asset URL for a content type.
	 * Special types (placeholders, tile_cursor, selection_arrow) use generic.asset.url.
	 * Regular furniture uses furniture.asset.url.
	 * Based on AS3 RoomContentLoader.getObjectContentURLs()
	 */
	private getContentUrl(type: string): string | null
	{
		if (RoomContentLoader.SPECIAL_CONTENT_TYPES.has(type))
		{
			// Special types use generic.asset.url (same base as room.nitro)
			if (this._configurationManager)
			{
				const url = this._configurationManager.getProperty('generic.asset.url', {libname: type});

				if (url)
				{
					return url;
				}
			}

			return null;
		}

		// Regular furniture uses furniture.asset.url
		if (!this._furnitureAssetUrl)
		{
			return null;
		}

		return this._furnitureAssetUrl.replace('%className%', type);
	}

	/**
	 * Populate internal maps from furniture data.
	 *
	 * @see AS3 RoomContentLoader.populateFurniData (line 818)
	 */
	private populateFurniData(data: IFurnitureData[]): void
	{
		for (const item of data)
		{
			const typeId = item.id;
			let className = item.className;

			// Handle indexed color suffix
			if (item.hasIndexedColor)
			{
				className = className + '*' + item.colourIndex;
			}

			if (item.type === 's')
			{
				// Floor item
				this._floorItems.set(className, typeId);
				this._floorItemsByTypeId.set(typeId, className);
			}
			else if (item.type === 'i')
			{
				// Wall item - handle special post.it cases
				if (className === 'post.it')
				{
					className = 'post_it';
				}
				else if (className === 'post.it.vd')
				{
					className = 'post_it_vd';
				}

				this._wallItems.set(className, typeId);
				this._wallItemsByTypeId.set(typeId, className);
			}
		}
	}

	/**
	 * Load a .nitro furniture bundle and parse it.
	 */
	private async loadFurnitureBundle(type: string, url: string, events: EventEmitter): Promise<void>
	{
		return new Promise<void>((resolve) =>
		{
			const loader = this._assetLibrary!.loadAssetFromFile(type, url);

			if (!loader)
			{
				log.warn(`Failed to start loading furniture: ${type}`);
				this._loadingTypes.delete(type);
				resolve();
				return;
			}

			loader.events.on('event', (event: AssetLoaderEvent) =>
			{
				if (event.type === AssetLoaderEventType.COMPLETE)
				{
					this.onFurnitureLoaded(type, events);
					resolve();
				}
				else if (event.type === AssetLoaderEventType.ERROR)
				{
					log.warn(`Failed to load furniture bundle: ${type}`);
					this._loadingTypes.delete(type);
					resolve();
				}
			});
		});
	}

	/**
	 * Process a loaded furniture bundle: extract assets, create visualization data.
	 */
	private onFurnitureLoaded(type: string, events: EventEmitter): void
	{
		const asset = this._assetLibrary!.getAssetByName(type) as NitroAsset | null;

		if (!asset)
		{
			log.warn(`Furniture asset not found after load: ${type}`);
			this._loadingTypes.delete(type);
			return;
		}

		const jsonData = asset.jsonData;

		if (!jsonData)
		{
			log.warn(`Furniture bundle has no JSON data: ${type}`);
			this._loadingTypes.delete(type);
			return;
		}

		// Extract visualization and logic types from bundle JSON
		const vizType = jsonData.visualizationType || 'furniture_static';
		const logicType = jsonData.logicType || 'furniture_multistate';

		this._visualizationTypeMap.set(type, vizType);
		this._logicTypeMap.set(type, logicType);

		// Create GraphicAssetCollection from bundle textures and asset definitions
		const collection = new GraphicAssetCollection();
		const textures = asset.textures;
		const assetDefs = (jsonData.assets ?? null) as Record<string, Record<string, unknown>> | null;

		if (textures && assetDefs)
		{
			collection.defineFromSpritesheet(textures, assetDefs, type);
		}
		else if (textures)
		{
			// If no asset definitions, at least register the textures
			for (const [name, texture] of textures)
			{
				collection.addAsset(name, texture, false);
			}
		}

		this._assetCollections.set(type, collection);

		// Store the raw visualization config JSON for the visualization factory to consume.
		// The factory handles creating and caching the appropriate
		// FurnitureVisualizationData / AnimatedFurnitureVisualizationData instances.
		this._visualizationConfigMap.set(type, jsonData);

		// Mark as loaded
		this._loadedTypes.set(type, true);
		this._loadingTypes.delete(type);

		// log.debug(`Loaded ${type}: vizType=${vizType}, logicType=${logicType}`);

		// Emit success event (AS3: new RoomContentLoadedEvent("RCLE_SUCCESS", type))
		events.emit(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, type);
	}
}
