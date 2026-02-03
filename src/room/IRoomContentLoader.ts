/**
 * IRoomContentLoader Interface
 *
 * Based on AS3: com.sulake.room.IRoomContentLoader
 *
 * Interface for loading room content (furniture, pets, room assets).
 */
import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomObject} from './object/IRoomObject';

export interface IRoomContentLoader extends IDisposable
{
	getPlaceHolderType(type: string): string;
	getPlaceHolderTypes(): string[];
	getContentType(type: string): string;
	hasInternalContent(type: string): boolean;
	loadObjectContent(type: string, events: EventEmitter): boolean;
	getVisualizationType(type: string): string | null;
	getLogicType(type: string): string | null;
	roomObjectCreated(object: IRoomObject, roomId: string): void;
}
