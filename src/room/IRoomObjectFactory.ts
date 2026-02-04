/**
 * IRoomObjectFactory Interface
 *
 * Based on AS3: com.sulake.room.IRoomObjectFactory
 *
 * Factory interface for creating room object logic, visualization and managers.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IRoomObjectEventHandler} from './object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from './IRoomObjectManager';
import type {IRoomObjectVisualization} from './object/visualization/IRoomObjectVisualization';

export interface IRoomObjectFactory
{
	readonly events: EventEmitter;

	addObjectEventListener(callback: (event: unknown) => void): void;
	removeObjectEventListener(callback: (event: unknown) => void): void;
	createRoomObjectLogic(type: string): IRoomObjectEventHandler | null;
	createRoomObjectVisualization(type: string): IRoomObjectVisualization | null;
	createRoomObjectManager(): IRoomObjectManager;
}
