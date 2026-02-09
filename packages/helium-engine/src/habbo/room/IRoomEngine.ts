/**
 * IRoomEngine Interface
 *
 * Based on AS3: com.sulake.habbo.room.IRoomEngine
 *
 * Main interface for the Habbo room engine.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IVector3d} from '@room/utils/IVector3d';

export interface IRoomEngine extends IDisposable
{
	// Event emitter
	readonly events: EventEmitter;

	// Room lifecycle
	createRoomInstance(roomId: number): IRoomInstance | null;

	disposeRoomInstance(roomId: number): void;

	getRoomInstance(roomId: number): IRoomInstance | null;

	setActiveRoom(roomId: number): void;

	getActiveRoomId(): number;

	// Object management
	addRoomObjectUser(roomId: number, id: number, location: IVector3d, direction: IVector3d, type: string): boolean;

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
		synchronize?: boolean
	): boolean;

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
	): boolean;

	getRoomObject(roomId: number, objectId: number, category: number): IRoomObject | null;

	disposeRoomObject(roomId: number, objectId: number, category: number): boolean;

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
	): boolean;

	updateRoomObjectUserFigure(
		roomId: number,
		objectId: number,
		figure: string,
		gender: string | null,
		clubLevel: string | null,
		isRiding: boolean
	): boolean;

	updateRoomObjectUserPosture(roomId: number, objectId: number, posture: string, parameter: string): boolean;

	updateRoomObjectUserGesture(roomId: number, objectId: number, gesture: number): boolean;

	updateRoomObjectUserEffect(roomId: number, objectId: number, effect: number, delay?: number): boolean;

	updateRoomObjectUserChat(roomId: number, objectId: number, numberOfWords: number): boolean;

	updateRoomObjectUserTyping(roomId: number, objectId: number, isTyping: boolean): boolean;

	updateRoomObjectUserDance(roomId: number, objectId: number, danceStyle: number): boolean;

	updateRoomObjectUserSleep(roomId: number, objectId: number, isSleeping: boolean): boolean;

	updateRoomObjectUserCarryObject(roomId: number, objectId: number, itemType: number): boolean;

	updateRoomObjectUserSign(roomId: number, objectId: number, signType: number): boolean;

	setRoomObjectUserOwnUser(roomId: number, objectId: number): boolean;

	// Rendering
	update(time: number): void;

	initializeRoomVisuals(roomId: number, floorType: string, wallType: string, landscapeType: string, worldType: number): void;

	// Room data
	getRoomOwnObjectId(roomId: number): number;

	setRoomOwnObjectId(roomId: number, objectId: number): void;
}
