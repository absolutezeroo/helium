/**
 * IRoomContentLoader Interface
 *
 * Based on AS3: com.sulake.room.IRoomContentLoader
 *
 * Interface for loading room content (furniture, pets, room assets).
 *
 * @see sources/win63_version/room/IRoomContentLoader.as
 */
import type {Texture} from 'pixi.js';
import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomObject} from './object/IRoomObject';
import type {IGraphicAssetCollection} from './object/visualization/utils/IGraphicAssetCollection';

export interface IRoomContentLoader extends IDisposable
{
	getPlaceHolderType(type: string): string;

	getPlaceHolderTypes(): string[];

	getContentType(type: string): string;

	hasInternalContent(type: string): boolean;

	loadObjectContent(type: string, events: EventEmitter): boolean;

	getVisualizationType(type: string): string | null;

	getLogicType(type: string): string | null;

	getGraphicAssetCollection(type: string): IGraphicAssetCollection | null;

	addGraphicAsset(type: string, assetName: string, texture: Texture, override: boolean): boolean;

	roomObjectCreated(object: IRoomObject, roomId: string): void;
}
