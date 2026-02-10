/**
 * IRoomObjectSpriteVisualization Interface
 *
 * Based on AS3: com.sulake.room.object.visualization.IRoomObjectSpriteVisualization
 *
 * Interface for sprite-based room object visualizations.
 */
import type {Container} from 'pixi.js';
import type {IRoomObjectVisualization} from './IRoomObjectVisualization';
import type {IRoomObjectSprite} from './IRoomObjectSprite';
import type {IGraphicAssetCollection} from './utils/IGraphicAssetCollection';

export interface IRoomObjectSpriteVisualization extends IRoomObjectVisualization
{
	spriteCount: number;
	container: Container;
	assetCollection: IGraphicAssetCollection | null;

	getSprite(index: number): IRoomObjectSprite | null;

	getSpriteList(): IRoomObjectSprite[] | null;

	getUpdateID(): number;

	getInstanceId(): number;
}
