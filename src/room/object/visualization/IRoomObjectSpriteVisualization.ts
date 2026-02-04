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

export interface IRoomObjectSpriteVisualization extends IRoomObjectVisualization
{
	spriteCount: number;
	container: Container;

	getSprite(index: number): IRoomObjectSprite | null;
	getSpriteList(): IRoomObjectSprite[] | null;
	getUpdateID(): number;
	getInstanceId(): number;
}
