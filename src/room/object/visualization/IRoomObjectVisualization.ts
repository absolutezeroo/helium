/**
 * IRoomObjectVisualization Interface
 *
 * Based on AS3: com.sulake.room.object.visualization.IRoomObjectVisualization
 *
 * Base interface for room object visualizations.
 */
import type {IRoomObject} from '../IRoomObject';

export interface IRoomObjectVisualization
{
	object: IRoomObject | null;

	dispose(): void;
	update(geometry: unknown, time: number, update: boolean, skipUpdate: boolean): void;
}
