/**
 * RoomObjectFactory
 *
 * Based on AS3: com.sulake.habbo.room.RoomObjectFactory
 *
 * Factory for creating room object logic and visualization instances based on type.
 */
import {EventEmitter} from 'eventemitter3';
import type {IRoomObjectFactory} from '@room/IRoomObjectFactory';
import type {IRoomObjectEventHandler} from '@room/object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from '@room/IRoomObjectManager';
import type {IRoomObjectVisualization} from '@room/object/visualization/IRoomObjectVisualization';
import {RoomObjectManager} from '@room/RoomObjectManager';
import {RoomObjectLogicEnum} from './object/RoomObjectLogicEnum';
import {MovingObjectLogic} from './object/logic/MovingObjectLogic';
import {AvatarLogic} from './object/logic/AvatarLogic';
import {PetLogic} from './object/logic/PetLogic';

// Furniture Logic
import {FurnitureLogic} from './object/logic/furniture/FurnitureLogic';
import {FurnitureMultiStateLogic} from './object/logic/furniture/FurnitureMultiStateLogic';
import {FurnitureMultiHeightLogic} from './object/logic/furniture/FurnitureMultiHeightLogic';
import {FurniturePlaceholderLogic} from './object/logic/furniture/FurniturePlaceholderLogic';
import {FurnitureDiceLogic} from './object/logic/furniture/FurnitureDiceLogic';
import {FurnitureOneWayDoorLogic} from './object/logic/furniture/FurnitureOneWayDoorLogic';
import {FurnitureStickieLogic} from './object/logic/furniture/FurnitureStickieLogic';
import {FurniturePresentLogic} from './object/logic/furniture/FurniturePresentLogic';
import {FurnitureTrophyLogic} from './object/logic/furniture/FurnitureTrophyLogic';
import {FurnitureMannequinLogic} from './object/logic/furniture/FurnitureMannequinLogic';
import {FurnitureRoomDimmerLogic} from './object/logic/furniture/FurnitureRoomDimmerLogic';
import {FurnitureJukeboxLogic} from './object/logic/furniture/FurnitureJukeboxLogic';

// Room Logic
import {RoomLogic} from './object/logic/room/RoomLogic';
import {RoomTileCursorLogic} from './object/logic/room/RoomTileCursorLogic';

// Visualizations
import {RoomVisualization} from './object/visualization/room/RoomVisualization';
import {TileCursorVisualization} from './object/visualization/room/TileCursorVisualization';
import {RoomObjectVisualizationEnum} from './object/RoomObjectVisualizationEnum';

// Furniture Visualizations
import {FurnitureVisualization} from './object/visualization/furniture/FurnitureVisualization';
import {AnimatedFurnitureVisualization} from './object/visualization/furniture/AnimatedFurnitureVisualization';
import {FurnitureResettingAnimatedVisualization} from './object/visualization/furniture/FurnitureResettingAnimatedVisualization';
import {FurniturePosterVisualization} from './object/visualization/furniture/FurniturePosterVisualization';
import {FurnitureStickieVisualization} from './object/visualization/furniture/FurnitureStickieVisualization';
import {FurnitureBottleVisualization} from './object/visualization/furniture/FurnitureBottleVisualization';
import {FurnitureHabboWheelVisualization} from './object/visualization/furniture/FurnitureHabboWheelVisualization';
import {FurnitureValRandomizerVisualization} from './object/visualization/furniture/FurnitureValRandomizerVisualization';
import {FurnitureQueueTileVisualization} from './object/visualization/furniture/FurnitureQueueTileVisualization';
import {FurniturePartyBeamerVisualization} from './object/visualization/furniture/FurniturePartyBeamerVisualization';
import {FurnitureGiftWrappedVisualization} from './object/visualization/furniture/FurnitureGiftWrappedVisualization';
import {FurnitureCounterClockVisualization} from './object/visualization/furniture/FurnitureCounterClockVisualization';
import {FurnitureScoreBoardVisualization} from './object/visualization/furniture/FurnitureScoreBoardVisualization';
import {FurnitureFireworksVisualization} from './object/visualization/furniture/FurnitureFireworksVisualization';
import {FurnitureGiftWrappedFireworksVisualization} from './object/visualization/furniture/FurnitureGiftWrappedFireworksVisualization';
import {FurnitureSoundblockVisualization} from './object/visualization/furniture/FurnitureSoundblockVisualization';
import {FurnitureVoteCounterVisualization} from './object/visualization/furniture/FurnitureVoteCounterVisualization';
import {FurnitureVoteMajorityVisualization} from './object/visualization/furniture/FurnitureVoteMajorityVisualization';
import {FurnitureBadgeDisplayVisualization} from './object/visualization/furniture/FurnitureBadgeDisplayVisualization';
import {FurnitureGuildCustomizedVisualization} from './object/visualization/furniture/FurnitureGuildCustomizedVisualization';
import {FurnitureGuildIsometricBadgeVisualization} from './object/visualization/furniture/FurnitureGuildIsometricBadgeVisualization';
import {FurnitureRoomBillboardVisualization} from './object/visualization/furniture/FurnitureRoomBillboardVisualization';
import {FurnitureRoomBackgroundVisualization} from './object/visualization/furniture/FurnitureRoomBackgroundVisualization';
import {FurnitureBuilderPlaceholderVisualization} from './object/visualization/furniture/FurnitureBuilderPlaceholderVisualization';
import {FurnitureExternalImageVisualization} from './object/visualization/furniture/FurnitureExternalImageVisualization';
import {FurnitureYoutubeVisualization} from './object/visualization/furniture/FurnitureYoutubeVisualization';
import {FurnitureMannequinVisualization} from './object/visualization/furniture/FurnitureMannequinVisualization';
import {FurnitureWaterAreaVisualization} from './object/visualization/furniture/FurnitureWaterAreaVisualization';
import {FurniturePlanetSystemVisualization} from './object/visualization/furniture/FurniturePlanetSystemVisualization';

type LogicConstructor = new () => IRoomObjectEventHandler;

export class RoomObjectFactory implements IRoomObjectFactory
{
	private _registeredTypes: Map<string, boolean>;
	private _trackedEventTypes: Map<string, boolean>;
	private _objectEventListeners: Array<(event: unknown) => void>;

	constructor()
	{
		this._events = new EventEmitter();
		this._registeredTypes = new Map();
		this._trackedEventTypes = new Map();
		this._objectEventListeners = [];
	}

	private _events: EventEmitter;

	get events(): EventEmitter
	{
		return this._events;
	}

	addObjectEventListener(callback: (event: unknown) => void): void
	{
		if (this._objectEventListeners.indexOf(callback) < 0)
		{
			this._objectEventListeners.push(callback);

			if (callback !== null)
			{
				for (const eventType of this._trackedEventTypes.keys())
				{
					this._events.on(eventType, callback);
				}
			}
		}
	}

	removeObjectEventListener(callback: (event: unknown) => void): void
	{
		const index = this._objectEventListeners.indexOf(callback);

		if (index >= 0)
		{
			this._objectEventListeners.splice(index, 1);

			if (callback !== null)
			{
				for (const eventType of this._trackedEventTypes.keys())
				{
					this._events.off(eventType, callback);
				}
			}
		}
	}

	createRoomObjectLogic(type: string): IRoomObjectEventHandler | null
	{
		let LogicClass: LogicConstructor | null = null;

		switch (type)
		{
			// Basic furniture types
			case RoomObjectLogicEnum.FURNITURE_BASIC:
				LogicClass = FurnitureLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_MULTISTATE:
				LogicClass = FurnitureMultiStateLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_MULTIHEIGHT:
				LogicClass = FurnitureMultiHeightLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_PLACEHOLDER:
				LogicClass = FurniturePlaceholderLogic;
				break;

			// Specific furniture types
			case RoomObjectLogicEnum.FURNITURE_DICE:
				LogicClass = FurnitureDiceLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_ONE_WAY_DOOR:
				LogicClass = FurnitureOneWayDoorLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_STICKIE:
				LogicClass = FurnitureStickieLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_PRESENT:
				LogicClass = FurniturePresentLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_TROPHY:
				LogicClass = FurnitureTrophyLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_MANNEQUIN:
				LogicClass = FurnitureMannequinLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_ROOMDIMMER:
				LogicClass = FurnitureRoomDimmerLogic;
				break;
			case RoomObjectLogicEnum.FURNITURE_JUKEBOX:
				LogicClass = FurnitureJukeboxLogic;
				break;

			// Avatar types
			case RoomObjectLogicEnum.USER:
			case RoomObjectLogicEnum.BOT:
			case RoomObjectLogicEnum.RENTABLE_BOT:
				LogicClass = AvatarLogic;
				break;

			case RoomObjectLogicEnum.PET:
				LogicClass = PetLogic;
				break;

			// Room types
			case RoomObjectLogicEnum.ROOM:
				LogicClass = RoomLogic;
				break;

			case RoomObjectLogicEnum.ROOM_TILE_CURSOR:
				LogicClass = RoomTileCursorLogic;
				break;

			case RoomObjectLogicEnum.SELECTION_ARROW:
				// TODO: SelectionArrowLogic
				LogicClass = MovingObjectLogic;
				break;

			default:
				// Default to basic furniture logic for unknown types
				LogicClass = FurnitureLogic;
				break;
		}

		if (LogicClass === null)
		{
			return null;
		}

		const logic = new LogicClass();

		if (logic !== null)
		{
			logic.eventDispatcher = this._events;

			if (!this._registeredTypes.has(type))
			{
				this._registeredTypes.set(type, true);

				const eventTypes = logic.getEventTypes();

				for (const eventType of eventTypes)
				{
					this.addTrackedEventType(eventType);
				}
			}

			return logic;
		}

		return null;
	}

	createRoomObjectManager(): IRoomObjectManager
	{
		return new RoomObjectManager();
	}

	/**
	 * Create a visualization for a room object type
	 */
	createRoomObjectVisualization(type: string): IRoomObjectVisualization | null
	{
		switch (type)
		{
			// Room
			case RoomObjectVisualizationEnum.ROOM:
				return new RoomVisualization();

			// Tile cursor
			case RoomObjectVisualizationEnum.TILE_CURSOR:
				return new TileCursorVisualization();

			// Furniture - static
			case RoomObjectVisualizationEnum.FURNITURE_STATIC:
				return new FurnitureVisualization();

			// Furniture - animated
			case RoomObjectVisualizationEnum.FURNITURE_ANIMATED:
				return new AnimatedFurnitureVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_RESETTING_ANIMATED:
				return new FurnitureResettingAnimatedVisualization();

			// Furniture - specialized
			case RoomObjectVisualizationEnum.FURNITURE_POSTER:
				return new FurniturePosterVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_STICKIE:
				return new FurnitureStickieVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_BOTTLE:
				return new FurnitureBottleVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_HABBOWHEEL:
				return new FurnitureHabboWheelVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_VAL_RANDOMIZER:
				return new FurnitureValRandomizerVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_QUEUE_TILE:
				return new FurnitureQueueTileVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_PARTY_BEAMER:
				return new FurniturePartyBeamerVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_GIFT_WRAPPED:
				return new FurnitureGiftWrappedVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_COUNTER_CLOCK:
				return new FurnitureCounterClockVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_SCORE_BOARD:
				return new FurnitureScoreBoardVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_FIREWORKS:
				return new FurnitureFireworksVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_GIFT_WRAPPED_FIREWORKS:
				return new FurnitureGiftWrappedFireworksVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_SOUNDBLOCK:
				return new FurnitureSoundblockVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_VOTE_COUNTER:
				return new FurnitureVoteCounterVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_VOTE_MAJORITY:
				return new FurnitureVoteMajorityVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_BADGE_DISPLAY:
				return new FurnitureBadgeDisplayVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_GUILD_CUSTOMIZED:
				return new FurnitureGuildCustomizedVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_GUILD_ISOMETRIC_BADGE:
				return new FurnitureGuildIsometricBadgeVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_BB:
				return new FurnitureRoomBillboardVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_BG:
				return new FurnitureRoomBackgroundVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_BUILDER_PLACEHOLDER:
				return new FurnitureBuilderPlaceholderVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_EXTERNAL_IMAGE:
				return new FurnitureExternalImageVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_YOUTUBE:
				return new FurnitureYoutubeVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_MANNEQUIN:
				return new FurnitureMannequinVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_WATER_AREA:
				return new FurnitureWaterAreaVisualization();

			case RoomObjectVisualizationEnum.FURNITURE_PLANET_SYSTEM:
				return new FurniturePlanetSystemVisualization();

			// Avatar types (deferred - requires AvatarRenderManager)
			// case RoomObjectVisualizationEnum.USER:
			// case RoomObjectVisualizationEnum.BOT:
			// case RoomObjectVisualizationEnum.RENTABLE_BOT:
			// 	return new AvatarVisualization();

			// case RoomObjectVisualizationEnum.PET_ANIMATED:
			// 	return new AnimatedPetVisualization();

			default:
				return null;
		}
	}

	private addTrackedEventType(eventType: string): void
	{
		if (!this._trackedEventTypes.has(eventType))
		{
			this._trackedEventTypes.set(eventType, true);

			for (const listener of this._objectEventListeners)
			{
				if (listener !== null)
				{
					this._events.on(eventType, listener);
				}
			}
		}
	}
}
