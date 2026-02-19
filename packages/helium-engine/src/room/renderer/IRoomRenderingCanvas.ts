/**
 * IRoomRenderingCanvas
 *
 * Based on AS3: com.sulake.room.renderer.IRoomRenderingCanvas
 *
 * Interface for a rendering canvas that displays room objects as sprites.
 * Handles rendering, mouse events, scaling, and viewport management.
 *
 * @see sources/win63_version/room/renderer/IRoomRenderingCanvas.as
 */
import type {IRoomGeometry} from '../utils/IRoomGeometry';
import type {IRoomRenderingCanvasMouseListener} from './IRoomRenderingCanvasMouseListener';

export interface IRoomRenderingCanvas
{
	readonly width: number;

	readonly height: number;

	screenOffsetX: number;

	screenOffsetY: number;

	readonly scale: number;

	readonly geometry: IRoomGeometry;

	mouseListener: IRoomRenderingCanvasMouseListener | null;

	initialize(width: number, height: number): void;

	render(time: number, force?: boolean): void;

	handleMouseEvent(
		x: number,
		y: number,
		type: string,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		buttonDown: boolean
	): boolean;

	setScale(scale: number): void;

	getId(): number;

	update(): void;

	dispose(): void;
}
