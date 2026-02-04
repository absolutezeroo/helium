/**
 * IRoomCreator
 *
 * Based on AS3: com.sulake.habbo.room.IRoomCreator
 *
 * Interface for room creation and object management.
 * Used by RoomMessageHandler to communicate with the room engine.
 */
import type {IVector3d} from '@room/utils/IVector3d';
import type {IStuffData} from './object/data/IStuffData';

export interface IRoomCreator
{
	/**
	 * Dispose a room instance.
	 */
	disposeRoom(roomId: number): void;

	/**
	 * Set the world type for a room.
	 */
	setWorldType(roomId: number, worldType: string): void;

	/**
	 * Initialize a room with configuration data.
	 */
	initializeRoom(roomId: number, data: unknown): void;

	/**
	 * Add floor furniture to a room.
	 */
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
	): boolean;

	/**
	 * Add floor furniture by class name (for static furniture).
	 */
	addObjectFurnitureByName(
		roomId: number,
		id: number,
		className: string,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		data: IStuffData | null,
		extra: number
	): boolean;

	/**
	 * Update floor furniture.
	 */
	updateObjectFurniture(
		roomId: number,
		id: number,
		location: IVector3d | null,
		direction: IVector3d | null,
		state: number,
		data: IStuffData | null,
		extra?: number
	): boolean;

	/**
	 * Update floor furniture location for sliding.
	 */
	updateObjectFurnitureLocation(
		roomId: number,
		id: number,
		location: IVector3d,
		direction: IVector3d | null,
		target: IVector3d,
		animationTime?: number
	): boolean;

	/**
	 * Dispose floor furniture.
	 */
	disposeObjectFurniture(
		roomId: number,
		id: number,
		pickerId?: number,
		refresh?: boolean
	): boolean;

	/**
	 * Add wall item to a room.
	 */
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
	): boolean;

	/**
	 * Update wall item.
	 */
	updateObjectWallItem(
		roomId: number,
		id: number,
		location: IVector3d | null,
		direction: IVector3d | null,
		state: number,
		data: string
	): boolean;

	/**
	 * Dispose wall item.
	 */
	disposeObjectWallItem(
		roomId: number,
		id: number,
		pickerId?: number
	): boolean;

	/**
	 * Add user/avatar to a room.
	 */
	addObjectUser(
		roomId: number,
		roomIndex: number,
		location: IVector3d,
		direction: IVector3d,
		headDirection: number,
		userType: number,
		figure: string
	): boolean;

	/**
	 * Update user position/movement.
	 */
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
	): boolean;

	/**
	 * Update user figure.
	 */
	updateObjectUserFigure(
		roomId: number,
		roomIndex: number,
		figure: string,
		sex: string,
		subType?: string,
		isRiding?: boolean
	): boolean;

	/**
	 * Dispose user.
	 */
	disposeObjectUser(
		roomId: number,
		roomIndex: number
	): boolean;

	/**
	 * Set the own user ID for a room.
	 */
	setOwnUserId(roomId: number, roomIndex: number): void;

	/**
	 * Set a furniture type alias.
	 * Maps a furniture type name to an alias name.
	 */
	setRoomObjectAlias(name: string, alias: string): void;
}
