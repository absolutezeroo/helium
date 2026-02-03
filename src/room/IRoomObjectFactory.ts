/**
 * IRoomObjectFactory Interface
 *
 * Based on AS3: com.sulake.room.IRoomObjectFactory
 *
 * Factory interface for creating room object logic and managers.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IRoomObjectEventHandler} from './object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from './IRoomObjectManager';

export interface IRoomObjectFactory
{
	readonly events: EventEmitter;

	addObjectEventListener(callback: (event: unknown) => void): void;
	removeObjectEventListener(callback: (event: unknown) => void): void;
	createRoomObjectLogic(type: string): IRoomObjectEventHandler | null;
	createRoomObjectManager(): IRoomObjectManager;
}
