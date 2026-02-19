/**
 * RoomContentLoader
 *
 * Based on AS3: com.sulake.habbo.room.RoomContentLoader
 *
 * Loader for room content (furniture, pets, room assets).
 * Loads .nitro bundles, creates GraphicAssetCollections and caches them.
 *
 * @see sources/win63_version/habbo/room/RoomContentLoader.as
 */
import type {Texture} from 'pixi.js';
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
import type {PetColorResult} from './PetColorResult';
import {Logger} from '@core';

const log = Logger.getLogger('RoomContentLoader');

/**
 * RoomContentLoader states.
 *
 * @see AS3 RoomContentLoader lines 42-46
 */
const STATE_CREATED = 0;
const STATE_INITIALIZING = 1;
const STATE_READY = 2;

export class RoomContentLoader implements IRoomContentLoader, IFurniDataListener
{
	/**
	 * Event emitted on stateEvents when content loader is ready.
	 *
	 * @see AS3 RoomContentLoader.CONTENT_LOADER_READY line 38
	 */
	public static readonly CONTENT_LOADER_READY = 'RCL_LOADER_READY';

	// --- Static placeholder constants (AS3 lines 48-60) ---
	private static readonly PLACE_HOLDER_FURNITURE = 'place_holder';
	private static readonly PLACE_HOLDER_WALL_ITEM = 'wall_place_holder';
	private static readonly PLACE_HOLDER_PET = 'pet_place_holder';
	private static readonly PLACE_HOLDER_DEFAULT = 'place_holder';
	private static readonly ROOM_CONTENT = 'room';
	private static readonly TILE_CURSOR = 'tile_cursor';
	private static readonly SELECTION_ARROW = 'selection_arrow';

	/**
	 * @see AS3 RoomContentLoader.PLACE_HOLDER_TYPES line 62
	 */
	private static readonly PLACE_HOLDER_TYPES: string[] = [
		'place_holder',
		'wall_place_holder',
		'pet_place_holder',
		'room',
		'tile_cursor',
		'selection_arrow'
	];

	// --- AS3 var_2179: typeId -> className (floor items) ---
	private _activeObjectTypes: Map<number, string> = new Map();

	// --- AS3 var_2532: className -> typeId (floor items) ---
	private _activeObjectTypeIds: Map<string, number> = new Map();

	// --- AS3 var_2100: Dictionary of floor item classNames ---
	private _floorItems: Map<string, number> = new Map();

	// --- AS3 var_2552: typeId -> className (wall items) ---
	private _wallItemTypes: Map<number, string> = new Map();

	// --- AS3 var_2816: className -> typeId (wall items) ---
	private _wallItemTypeIds: Map<string, number> = new Map();

	// --- AS3 _wallItems: Dictionary of wall item classNames ---
	private _wallItems: Map<string, number> = new Map();

	// --- AS3 var_2887: typeId -> petType ---
	private _petTypes: Map<number, string> = new Map();

	// --- AS3 var_2094: Dictionary petName -> typeId ---
	private _petTypeIds: Map<string, number> = new Map();

	// --- AS3 _petColors: typeId -> (colorId -> PetColorResult) ---
	private _petColors: Map<number, Map<number | string, PetColorResult>> | null = null;

	// --- AS3 _petLayers: typeId -> (size -> (tag -> layerId)) ---
	private _petLayers: Map<number, Map<string, Map<string, number>>> | null = null;

	// --- AS3 var_2442: className -> revision ---
	private _revisions: Map<string, number> = new Map();

	// --- AS3 var_2291: alias -> original ---
	private _aliases: Map<string, string> = new Map();

	// --- AS3 var_2370: original -> alias ---
	private _reverseAliases: Map<string, string> = new Map();

	// --- AS3 var_2748: className -> adUrl ---
	private _adUrls: Map<string, string> = new Map();

	// --- AS3 var_1827: contentType -> GraphicAssetCollection ---
	private _graphicAssetCollections: Map<string, IGraphicAssetCollection> = new Map();
	// --- AS3 _stateEvents: IEventDispatcher ---
	private _stateEvents: EventEmitter | null = null;
	// --- AS3 var_4558: furniDataReady ---
	private _furniDataReady: boolean = false;
	// --- AS3 var_3642: pendingFurniData ---
	private _pendingFurniData: boolean = false;
	// --- Configuration URLs (AS3 var_4646, var_4721, var_4542, var_4243, var_4790) ---
	private _furnitureDownloadUrl: string = '';
	private _furnitureDownloadNameTemplate: string = '';
	private _furnitureIconDownloadNameTemplate: string = '';
	private _petDownloadUrl: string = '';
	private _petDownloadNameTemplate: string = '';
	// --- TS-specific: Nitro bundle loading ---
	private _assetLibrary: IAssetLibrary | null = null;
	private _configurationManager: IHabboConfigurationManager | null = null;
	private _loadedTypes: Map<string, boolean> = new Map();
	private _loadingTypes: Map<string, Promise<void>> = new Map();
	private _visualizationConfigMap: Map<string, unknown> = new Map();
	private _visualizationTypeMap: Map<string, string> = new Map();
	private _logicTypeMap: Map<string, string> = new Map();

	// --- AS3 var_149: state ---
	private _state: number = STATE_CREATED;

	get state(): number
	{
		return this._state;
	}

	// --- AS3 var_318: disposed ---
	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _sessionDataManager: ISessionDataManager | null = null;

	/**
	 * @see AS3 RoomContentLoader.set sessionDataManager (line 157)
	 */
	set sessionDataManager(manager: ISessionDataManager)
	{
		this._sessionDataManager = manager;

		if(this._pendingFurniData)
		{
			this._pendingFurniData = false;
			this.initFurnitureData();
		}
	}

	get isFurniDataReady(): boolean
	{
		return this._furniDataReady;
	}

	/**
	 * Initialize the content loader with dependencies.
	 *
	 * @param stateEvents EventEmitter to emit CONTENT_LOADER_READY when ready
	 * @param assetLibrary Asset library for loading Nitro bundles
	 * @param configurationManager Configuration manager for URL templates
	 *
	 * @see AS3 RoomContentLoader.initialize() lines 181-192
	 */
	initialize(stateEvents: EventEmitter, assetLibrary: IAssetLibrary, configurationManager: IHabboConfigurationManager): void
	{
		this._stateEvents = stateEvents;
		this._assetLibrary = assetLibrary;
		this._configurationManager = configurationManager;

		this._furnitureDownloadUrl = configurationManager.getProperty('furniture.asset.url') ?? '';
		this._furnitureDownloadNameTemplate = configurationManager.getProperty('furniture.asset.name.template') ?? '';
		this._furnitureIconDownloadNameTemplate = configurationManager.getProperty('furniture.asset.icon.template') ?? '';
		this._petDownloadUrl = configurationManager.getProperty('pet.asset.url') ?? '';
		this._petDownloadNameTemplate = configurationManager.getProperty('pet.asset.name.template') ?? '';

		this._state = STATE_INITIALIZING;

		this.initFurnitureData();
		this.initPetData(configurationManager);
	}

	/**
	 * @see AS3 RoomContentLoader.dispose() lines 194-299
	 */
	dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		this._activeObjectTypes.clear();
		this._activeObjectTypeIds.clear();
		this._floorItems.clear();
		this._wallItemTypes.clear();
		this._wallItemTypeIds.clear();
		this._wallItems.clear();
		this._petTypes.clear();
		this._petTypeIds.clear();
		this._revisions.clear();
		this._aliases.clear();
		this._reverseAliases.clear();
		this._adUrls.clear();

		if(this._petColors !== null)
		{
			this._petColors.clear();
			this._petColors = null;
		}

		if(this._petLayers !== null)
		{
			this._petLayers.clear();
			this._petLayers = null;
		}

		for(const collection of this._graphicAssetCollections.values())
		{
			collection.dispose();
		}

		this._graphicAssetCollections.clear();
		this._visualizationConfigMap.clear();
		this._visualizationTypeMap.clear();
		this._logicTypeMap.clear();
		this._loadedTypes.clear();
		this._loadingTypes.clear();

		this._stateEvents = null;
		this._sessionDataManager = null;
		this._configurationManager = null;
	}

	/**
	 * @see AS3 RoomContentLoader.setRoomObjectAlias() lines 301-310
	 */
	setRoomObjectAlias(alias: string, original: string): void
	{
		this._aliases.set(alias, original);
		this._reverseAliases.set(original, alias);
	}

	/**
	 * @see AS3 RoomContentLoader.getObjectCategory() lines 312-347
	 */
	getObjectCategory(type: string): number
	{
		if(type === null)
		{
			return RoomObjectCategoryEnum.MINIMUM;
		}

		if(this._floorItems.has(type))
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
		}

		if(this._wallItems.has(type))
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
		}

		if(this._petTypeIds.has(type))
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
		}

		if(type.indexOf('poster') === 0)
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
		}

		if(type === 'room')
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM;
		}

		if(type === 'user' || type === 'pet' || type === 'bot' || type === 'rentable_bot')
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
		}

		if(type === 'tile_cursor' || type === 'selection_arrow')
		{
			return RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR;
		}

		return RoomObjectCategoryEnum.MINIMUM;
	}

	/**
	 * @see AS3 RoomContentLoader.getPlaceHolderType() lines 349-360
	 */
	getPlaceHolderType(type: string): string
	{
		if(this._floorItems.has(type))
		{
			return RoomContentLoader.PLACE_HOLDER_FURNITURE;
		}

		if(this._wallItems.has(type))
		{
			return RoomContentLoader.PLACE_HOLDER_WALL_ITEM;
		}

		if(this._petTypeIds.has(type))
		{
			return RoomContentLoader.PLACE_HOLDER_PET;
		}

		return RoomContentLoader.PLACE_HOLDER_DEFAULT;
	}

	/**
	 * @see AS3 RoomContentLoader.getPlaceHolderTypes() lines 362-364
	 */
	getPlaceHolderTypes(): string[]
	{
		return RoomContentLoader.PLACE_HOLDER_TYPES;
	}

	/**
	 * @see AS3 RoomContentLoader.getActiveObjectType() lines 366-372
	 */
	getActiveObjectType(typeId: number): string | null
	{
		const className = this._activeObjectTypes.get(typeId) ?? null;

		if(className === null)
		{
			log.warn(`Could not find type for id: ${typeId}`);
		}

		return this.getObjectType(className);
	}

	/**
	 * @see AS3 RoomContentLoader.getActiveObjectTypeId() lines 374-376
	 */
	getActiveObjectTypeId(type: string): number
	{
		return this._activeObjectTypeIds.get(type) ?? -1;
	}

	/**
	 * @see AS3 RoomContentLoader.getWallItemType() lines 378-384
	 */
	getWallItemType(typeId: number, posterType: string | null = null): string | null
	{
		let className = this._wallItemTypes.get(typeId) ?? null;

		if(className === 'poster' && posterType !== null)
		{
			className = className + posterType;
		}

		return this.getObjectType(className);
	}

	/**
	 * @see AS3 RoomContentLoader.getWallItemTypeId() lines 386-388
	 */
	getWallItemTypeId(type: string): number
	{
		return this._wallItemTypeIds.get(type) ?? -1;
	}

	/**
	 * @see AS3 RoomContentLoader.getPetType() lines 390-392
	 */
	getPetType(typeId: number): string | null
	{
		return this._petTypes.get(typeId) ?? null;
	}

	/**
	 * @see AS3 RoomContentLoader.getPetTypeId() lines 394-396
	 */
	getPetTypeId(type: string): number
	{
		return this._petTypeIds.get(type) ?? -1;
	}

	/**
	 * @see AS3 RoomContentLoader.getPetColor() lines 398-404
	 */
	getPetColor(typeId: number, colorId: number): PetColorResult | null
	{
		if(this._petColors === null) return null;

		const colorMap = this._petColors.get(typeId);

		if(colorMap !== undefined)
		{
			return colorMap.get(colorId) ?? null;
		}

		return null;
	}

	/**
	 * @see AS3 RoomContentLoader.getPetColorsByTag() lines 406-417
	 */
	getPetColorsByTag(typeId: number, tag: string): PetColorResult[]
	{
		const results: PetColorResult[] = [];

		if(this._petColors === null) return results;

		const colorMap = this._petColors.get(typeId);

		if(colorMap !== undefined)
		{
			for(const result of colorMap.values())
			{
				if(result.tag === tag)
				{
					results.push(result);
				}
			}
		}

		return results;
	}

	/**
	 * @see AS3 RoomContentLoader.getPetLayerIdForTag() lines 419-428
	 */
	getPetLayerIdForTag(typeId: number, tag: string, size: number = 64): number
	{
		if(this._petLayers === null) return -1;

		const sizeMap = this._petLayers.get(typeId);

		if(sizeMap !== undefined)
		{
			const tagMap = sizeMap.get(size.toString());

			if(tagMap !== undefined)
			{
				return tagMap.get(tag) ?? -1;
			}
		}

		return -1;
	}

	/**
	 * @see AS3 RoomContentLoader.getPetDefaultPalette() lines 430-440
	 */
	getPetDefaultPalette(typeId: number, tag: string): PetColorResult | null
	{
		if(this._petColors === null) return null;

		const colorMap = this._petColors.get(typeId);

		if(colorMap !== undefined)
		{
			for(const result of colorMap.values())
			{
				if(result.layerTags.indexOf(tag) > -1 && result.isMaster)
				{
					return result;
				}
			}
		}

		return null;
	}

	/**
	 * @see AS3 RoomContentLoader.getActiveObjectColorIndex() lines 442-445
	 */
	getActiveObjectColorIndex(typeId: number): number
	{
		const className = this._activeObjectTypes.get(typeId) ?? null;

		return this.getObjectColorIndex(className);
	}

	/**
	 * @see AS3 RoomContentLoader.getWallItemColorIndex() lines 447-450
	 */
	getWallItemColorIndex(typeId: number): number
	{
		const className = this._wallItemTypes.get(typeId) ?? null;

		return this.getObjectColorIndex(className);
	}

	/**
	 * @see AS3 RoomContentLoader.getRoomObjectAdURL() lines 452-457
	 */
	getRoomObjectAdURL(type: string): string
	{
		return this._adUrls.get(type) ?? '';
	}

	/**
	 * @see AS3 RoomContentLoader.getContentType() lines 459-461
	 */
	getContentType(type: string): string
	{
		return type;
	}

	/**
	 * @see AS3 RoomContentLoader.hasInternalContent() lines 463-469
	 */
	hasInternalContent(type: string): boolean
	{
		type = getVisualizationType(type);

		return type === 'user' || type === 'game_snowball' || type === 'game_snowsplash';
	}

	/**
	 * Load content for a furniture type.
	 *
	 * @param type The furniture className
	 * @param events EventEmitter to emit RCLE_SUCCESS/RCLE_FAILURE when loaded
	 * @returns true if loading started or already loaded
	 *
	 * @see AS3 RoomContentLoader.loadObjectContent() lines 558-602
	 */
	loadObjectContent(type: string, events: EventEmitter): boolean
	{
		if(!type || type === '')
		{
			log.warn('Cannot load content, object type unknown!');
			return false;
		}

		// Handle comma-separated types (AS3 line 569)
		if(type.indexOf(',') >= 0)
		{
			type = type.split(',')[0];
		}

		if(this._loadedTypes.get(type))
		{
			// Already loaded - emit success immediately
			events.emit(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, type);
			return true;
		}

		if(this._loadingTypes.has(type))
		{
			// Already loading - wait for it to finish then emit
			this._loadingTypes.get(type)!.then(() =>
			{
				events.emit(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, type);
			});

			return true;
		}

		if(!this._assetLibrary)
		{
			return false;
		}

		const url = this.getContentUrl(type);

		if(!url)
		{
			log.warn(`Cannot resolve URL for content type: ${type}`);
			return false;
		}

		log.debug(`Loading content: ${type} from ${url}`);

		const loadPromise = this.loadFurnitureBundle(type, url, events);
		this._loadingTypes.set(type, loadPromise);

		return true;
	}

	/**
	 * @see AS3 RoomContentLoader.getVisualizationType() lines 614-634
	 */
	getVisualizationType(type: string): string | null
	{
		return this._visualizationTypeMap.get(type) ?? null;
	}

	/**
	 * @see AS3 RoomContentLoader.getLogicType() lines 636-656
	 */
	getLogicType(type: string): string | null
	{
		return this._logicTypeMap.get(type) ?? null;
	}

	/**
	 * @see AS3 RoomContentLoader.addGraphicAsset() lines 682-688
	 */
	addGraphicAsset(type: string, assetName: string, texture: Texture, override: boolean): boolean
	{
		const collection = this.getGraphicAssetCollection(type);

		if(collection !== null)
		{
			return collection.addAsset(assetName, texture, override);
		}

		return false;
	}

	/**
	 * @see AS3 RoomContentLoader.getGraphicAssetCollection() lines 690-693
	 */
	getGraphicAssetCollection(type: string): IGraphicAssetCollection | null
	{
		const contentType = this.getContentType(type);

		return this._graphicAssetCollections.get(contentType) ?? null;
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
	 * @see AS3 RoomContentLoader.roomObjectCreated() lines 695-700
	 */
	roomObjectCreated(object: IRoomObject, roomId: string): void
	{
		const controller = object as IRoomObjectController;

		if(controller && controller.getModelController())
		{
			controller.getModelController().setString('object_room_id', roomId, true);
		}
	}

	/**
	 * Called by SessionDataManager when furniture data becomes available.
	 *
	 * @see AS3 RoomContentLoader.furniDataReady() lines 702-704
	 */
	furniDataReady(): void
	{
		this.initFurnitureData();
	}

	/**
	 * @see AS3 RoomContentLoader.setActiveObjectType() lines 706-709
	 */
	setActiveObjectType(typeId: number, type: string): void
	{
		this._activeObjectTypes.delete(typeId);
		this._activeObjectTypes.set(typeId, type);
	}

	/**
	 * Get the className for a furniture typeId (combines getActiveObjectType + getWallItemType).
	 */
	getClassName(typeId: number, category: number): string | null
	{
		if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
		{
			return this._wallItemTypes.get(typeId) ?? null;
		}

		return this._activeObjectTypes.get(typeId) ?? null;
	}

	/**
	 * Check if content is loaded for a given type.
	 */
	isLoaded(type: string): boolean
	{
		return this._loadedTypes.get(type) === true;
	}

	/**
	 * @see AS3 RoomContentLoader.getRoomObjectAlias() lines 876-885
	 */
	private getRoomObjectAlias(type: string): string
	{
		return this._aliases.get(type) ?? type;
	}

	/**
	 * @see AS3 RoomContentLoader.getRoomObjectOriginalName() lines 887-896
	 */
	private getRoomObjectOriginalName(type: string): string
	{
		return this._reverseAliases.get(type) ?? type;
	}

	/**
	 * @see AS3 RoomContentLoader.initFurnitureData() lines 783-797
	 */
	private initFurnitureData(): void
	{
		if(this._sessionDataManager === null)
		{
			this._pendingFurniData = true;
			return;
		}

		const furniData = this._sessionDataManager.getFurniData(this);

		// AS3: getFurniData returns null when data isn't ready.
		// Our TS version returns [] (empty array, truthy in JS).
		// Check length to avoid treating empty data as "ready".
		if(!furniData || furniData.length === 0)
		{
			return;
		}

		this._sessionDataManager.removeFurniDataListener(this);

		this.populateFurniData(furniData);

		this._furniDataReady = true;

		log.debug(`Furniture data initialized: ${this._floorItems.size} floor items, ${this._wallItems.size} wall items`);

		this.continueInitilization();
	}

	/**
	 * @see AS3 RoomContentLoader.initPetData() lines 771-781
	 */
	private initPetData(configurationManager: IHabboConfigurationManager): void
	{
		const petConfig = configurationManager.getProperty('pet.configuration');

		if(petConfig)
		{
			const petTypes = petConfig.split(',');
			let typeId = 0;

			for(const petType of petTypes)
			{
				const trimmed = petType.trim();
				this._petTypeIds.set(trimmed, typeId);
				this._petTypes.set(typeId, trimmed);
				typeId++;
			}
		}

		this._petColors = new Map();
		this._petLayers = new Map();
	}

	/**
	 * @see AS3 RoomContentLoader.continueInitilization() lines 867-874
	 */
	private continueInitilization(): void
	{
		if(this._furniDataReady)
		{
			this._state = STATE_READY;

			if(this._stateEvents !== null)
			{
				this._stateEvents.emit(RoomContentLoader.CONTENT_LOADER_READY);
			}
		}
	}

	/**
	 * @see AS3 RoomContentLoader.populateFurniData() lines 818-865
	 */
	private populateFurniData(data: IFurnitureData[]): void
	{
		for(const item of data)
		{
			const typeId = item.id;
			let className = item.className;
			const baseClassName = className;

			// Handle indexed color suffix (AS3 lines 829-831)
			if(item.hasIndexedColor)
			{
				className = className + '*' + item.colourIndex;
			}

			const revision = item.revision;
			const adUrl = item.adUrl;

			// Track ad URLs (AS3 lines 833-836)
			if(adUrl !== null && adUrl.length > 0)
			{
				this._adUrls.set(className, adUrl);
			}

			if(item.type === 's')
			{
				// Floor item (AS3 lines 838-843)
				this._activeObjectTypes.set(typeId, className);
				this._activeObjectTypeIds.set(className, typeId);

				if(!this._floorItems.has(baseClassName))
				{
					this._floorItems.set(baseClassName, 1);
				}
			}
			else if(item.type === 'i')
			{
				// Wall item (AS3 lines 844-857)
				if(className === 'post.it')
				{
					className = 'post_it';
				}
				else if(className === 'post.it.vd')
				{
					className = 'post_it_vd';
				}

				this._wallItemTypes.set(typeId, className);
				this._wallItemTypeIds.set(className, typeId);

				const wallBaseClassName = className.indexOf('*') >= 0
					? className.substring(0, className.indexOf('*'))
					: className;

				if(!this._wallItems.has(wallBaseClassName))
				{
					this._wallItems.set(wallBaseClassName, 1);
				}
			}

			// Track revisions (AS3 lines 859-863)
			const existingRevision = this._revisions.get(baseClassName) ?? 0;

			if(revision > existingRevision)
			{
				this._revisions.set(baseClassName, revision);
			}
		}
	}

	/**
	 * Strip the color index suffix from a className.
	 *
	 * @see AS3 RoomContentLoader.getObjectType() lines 898-907
	 */
	private getObjectType(className: string | null): string | null
	{
		if(className === null)
		{
			return null;
		}

		const starIndex = className.indexOf('*');

		if(starIndex >= 0)
		{
			return className.substring(0, starIndex);
		}

		return className;
	}

	/**
	 * Extract the color index from a className with `*N` suffix.
	 *
	 * @see AS3 RoomContentLoader.getObjectColorIndex() lines 909-919
	 */
	private getObjectColorIndex(className: string | null): number
	{
		if(className === null)
		{
			return -1;
		}

		const starIndex = className.indexOf('*');

		if(starIndex >= 0)
		{
			return parseInt(className.substring(starIndex + 1), 10) || 0;
		}

		return 0;
	}

	/**
	 * Get the revision number for a content type.
	 *
	 * @see AS3 RoomContentLoader.getObjectRevision() lines 921-931
	 */
	private getObjectRevision(type: string): number
	{
		const category = this.getObjectCategory(type);

		if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE || category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
		{
			if(type.indexOf('poster') === 0)
			{
				type = 'poster';
			}

			return this._revisions.get(type) ?? 0;
		}

		return 0;
	}

	/**
	 * Resolve the asset URL for a content type.
	 *
	 * @see AS3 RoomContentLoader.getObjectContentURLs() lines 933-971
	 */
	private getContentUrl(type: string): string | null
	{
		const contentType = this.getContentType(type);

		switch(contentType)
		{
			case RoomContentLoader.PLACE_HOLDER_FURNITURE:
			case RoomContentLoader.PLACE_HOLDER_WALL_ITEM:
			case RoomContentLoader.PLACE_HOLDER_PET:
			case RoomContentLoader.ROOM_CONTENT:
			case RoomContentLoader.TILE_CURSOR:
			case RoomContentLoader.SELECTION_ARROW:
			{
				// Special types use generic.asset.url
				if(this._configurationManager)
				{
					return this._configurationManager.getProperty('generic.asset.url', {libname: contentType}) ?? null;
				}

				return null;
			}
			default:
			{
				const category = this.getObjectCategory(contentType);

				if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE || category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
				{
					// Regular furniture uses furniture.asset.url
					if(!this._furnitureDownloadUrl)
					{
						return null;
					}

					const alias = this.getRoomObjectAlias(contentType);

					return this._furnitureDownloadUrl.replace('%className%', alias);
				}

				if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_USER)
				{
					// Pet types use pet.asset.url
					if(!this._petDownloadUrl)
					{
						return null;
					}

					return this._petDownloadUrl.replace('%type%', contentType);
				}

				return null;
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

			if(!loader)
			{
				log.warn(`Failed to start loading furniture: ${type}`);
				this._loadingTypes.delete(type);
				events.emit(RoomContentLoadedEvent.CONTENT_LOAD_FAILURE, type);
				resolve();
				return;
			}

			loader.events.on('event', (event: AssetLoaderEvent) =>
			{
				if(event.type === AssetLoaderEventType.COMPLETE)
				{
					this.processLoadedBundle(type, events);
					resolve();
				}
				else if(event.type === AssetLoaderEventType.ERROR)
				{
					log.warn(`Failed to load furniture bundle: ${type}`);
					this._loadingTypes.delete(type);
					events.emit(RoomContentLoadedEvent.CONTENT_LOAD_FAILURE, type);
					resolve();
				}
			});
		});
	}

	/**
	 * Process a loaded Nitro bundle: extract assets, create visualization data.
	 *
	 * @see AS3 RoomContentLoader.processLoadedLibrary() lines 981-1000
	 */
	private processLoadedBundle(type: string, events: EventEmitter): void
	{
		const asset = this._assetLibrary!.getAssetByName(type) as NitroAsset | null;

		if(!asset)
		{
			log.warn(`Furniture asset not found after load: ${type}`);
			this._loadingTypes.delete(type);
			events.emit(RoomContentLoadedEvent.CONTENT_LOAD_FAILURE, type);
			return;
		}

		const jsonData = asset.jsonData;

		if(!jsonData)
		{
			log.warn(`Furniture bundle has no JSON data: ${type}`);
			this._loadingTypes.delete(type);
			events.emit(RoomContentLoadedEvent.CONTENT_LOAD_FAILURE, type);
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

		if(textures && assetDefs)
		{
			collection.defineFromSpritesheet(textures, assetDefs, type);
		}
		else if(textures)
		{
			for(const [name, texture] of textures)
			{
				collection.addAsset(name, texture, false);
			}
		}

		this._graphicAssetCollections.set(type, collection);

		// Store the raw visualization config JSON
		this._visualizationConfigMap.set(type, jsonData);

		// Mark as loaded
		this._loadedTypes.set(type, true);
		this._loadingTypes.delete(type);

		// Emit success event (AS3: new RoomContentLoadedEvent("RCLE_SUCCESS", type))
		events.emit(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, type);
	}
}
