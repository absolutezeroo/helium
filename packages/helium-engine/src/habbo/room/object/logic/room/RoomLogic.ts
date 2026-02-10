/**
 * RoomLogic
 *
 * @see source_as_win63/habbo/room/object/logic/room/RoomLogic.as
 *
 * Logic for the room object itself. Handles room update messages that change
 * floor/wall types, masks, visibility, colors, and floor holes.
 * Also dispatches mouse events for tile and wall interaction.
 */
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectRoomUpdateMessage} from '@habbo/room/messages/RoomObjectRoomUpdateMessage';
import {RoomObjectRoomMaskUpdateMessage} from '@habbo/room/messages/RoomObjectRoomMaskUpdateMessage';
import {RoomObjectRoomPlaneVisibilityUpdateMessage} from '@habbo/room/messages/RoomObjectRoomPlaneVisibilityUpdateMessage';
import {RoomObjectRoomPlanePropertyUpdateMessage} from '@habbo/room/messages/RoomObjectRoomPlanePropertyUpdateMessage';
import {RoomObjectRoomFloorHoleUpdateMessage} from '@habbo/room/messages/RoomObjectRoomFloorHoleUpdateMessage';
import {RoomObjectRoomColorUpdateMessage} from '@habbo/room/messages/RoomObjectRoomColorUpdateMessage';
import {RoomPlaneBitmapMaskParser} from '@habbo/room/object/RoomPlaneBitmapMaskParser';
import type {RoomPlaneParser} from '@habbo/room/object/RoomPlaneParser';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class RoomLogic extends ObjectLogicBase
{
	private _planeParser: RoomPlaneParser | null = null;
	private _planeMaskParser: RoomPlaneBitmapMaskParser;
	private _needsFloorHoleUpdate: boolean = false;
	private _colorTransitionTarget: number = 0xFFFFFF;
	private _colorTransitionCurrent: number = 0xFFFFFF;
	private _colorTransitionStart: number = 0;
	private _colorTransitionDuration: number = 500;
	private _isTransitioning: boolean = false;

	constructor()
	{
		super();
		this._planeMaskParser = new RoomPlaneBitmapMaskParser();
	}

	override getEventTypes(): string[]
	{
		const types = ['ROE_MOUSE_MOVE', 'ROE_MOUSE_CLICK'];
		return this.getAllEventTypes(super.getEventTypes(), types);
	}

	/**
	 * Initialize room logic with config data.
	 * Based on AS3 RoomLogic.initialize()
	 */
	override initialize(data: unknown): void
	{
		if (data === null || this.object === null)
		{
			return;
		}

		const model = this.object.getModelController();

		if (model)
		{
			// Set default values for room visualization
			model.setNumber(RoomObjectVariableEnum.ROOM_BACKGROUND_COLOR, 0xFFFFFF);
			model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_VISIBILITY, 1);
			model.setNumber(RoomObjectVariableEnum.ROOM_WALL_VISIBILITY, 1);
			model.setNumber(RoomObjectVariableEnum.ROOM_LANDSCAPE_VISIBILITY, 1);
		}
	}

	/**
	 * Periodic update. Handles background color transitions and floor hole updates.
	 * Based on AS3 RoomLogic.update()
	 */
	override update(time: number): void
	{
		super.update(time);
		this.updateBackgroundColor(time);

		// Floor hole update: regenerate plane XML when holes change
		if (this._needsFloorHoleUpdate)
		{
			if (this.object !== null && this._planeParser !== null)
			{
				const model = this.object.getModelController();

				if (model)
				{
					model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_HOLE_UPDATE_TIME, time);
				}
			}

			this._needsFloorHoleUpdate = false;
		}
	}

	/**
	 * Process room-specific update messages.
	 * Routes to specific handlers based on message type.
	 * Based on AS3 RoomLogic.processUpdateMessage() lines 93-130
	 */
	override processUpdateMessage(message: RoomObjectUpdateMessage): void
	{
		if (message === null || this.object === null)
		{
			return;
		}

		const model = this.object.getModelController();

		if (model === null)
		{
			return;
		}

		// Room type updates (floor/wall/landscape textures)
		if (message instanceof RoomObjectRoomUpdateMessage)
		{
			this.updatePlaneTypes(message, model);
			return;
		}

		// Mask updates (door/window masks)
		if (message instanceof RoomObjectRoomMaskUpdateMessage)
		{
			this.updatePlaneMasks(message, model);
			return;
		}

		// Plane visibility updates
		if (message instanceof RoomObjectRoomPlaneVisibilityUpdateMessage)
		{
			this.updatePlaneVisibilities(message, model);
			return;
		}

		// Plane property updates (thickness)
		if (message instanceof RoomObjectRoomPlanePropertyUpdateMessage)
		{
			this.updatePlaneProperties(message, model);
			return;
		}

		// Floor hole updates
		if (message instanceof RoomObjectRoomFloorHoleUpdateMessage)
		{
			this.updateFloorHoles(message);
		}

		// Color/lighting updates
		if (message instanceof RoomObjectRoomColorUpdateMessage)
		{
			this.updateColors(message, model);
		}

		// Fall through to base class for location/direction updates
		super.processUpdateMessage(message);
	}

	/**
	 * Set the plane parser reference (from RoomEngine when room is created).
	 */
	set planeParser(parser: RoomPlaneParser | null)
	{
		this._planeParser = parser;
	}

	/**
	 * Handle background color smooth transitions.
	 * Based on AS3 RoomLogic.updateBackgroundColor()
	 */
	private updateBackgroundColor(time: number): void
	{
		if (!this._isTransitioning || this.object === null)
		{
			return;
		}

		const elapsed = time - this._colorTransitionStart;
		const progress = Math.min(1, elapsed / this._colorTransitionDuration);

		if (progress >= 1)
		{
			this._colorTransitionCurrent = this._colorTransitionTarget;
			this._isTransitioning = false;
		}
		else
		{
			// Interpolate color channels
			const srcR = (this._colorTransitionCurrent >> 16) & 0xFF;
			const srcG = (this._colorTransitionCurrent >> 8) & 0xFF;
			const srcB = this._colorTransitionCurrent & 0xFF;
			const dstR = (this._colorTransitionTarget >> 16) & 0xFF;
			const dstG = (this._colorTransitionTarget >> 8) & 0xFF;
			const dstB = this._colorTransitionTarget & 0xFF;

			const r = Math.round(srcR + (dstR - srcR) * progress);
			const g = Math.round(srcG + (dstG - srcG) * progress);
			const b = Math.round(srcB + (dstB - srcB) * progress);

			this._colorTransitionCurrent = (r << 16) | (g << 8) | b;
		}

		const model = this.object.getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.ROOM_BACKGROUND_COLOR, this._colorTransitionCurrent);
		}
	}

	/**
	 * Update floor/wall/landscape texture types.
	 * Based on AS3 RoomLogic.updatePlaneTypes() lines 251-262
	 */
	private updatePlaneTypes(message: RoomObjectRoomUpdateMessage, model: IRoomObjectModelController): void
	{
		switch (message.type)
		{
			case RoomObjectRoomUpdateMessage.ROOM_FLOOR_UPDATE:
				model.setString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE, message.value);
				break;
			case RoomObjectRoomUpdateMessage.ROOM_WALL_UPDATE:
				model.setString(RoomObjectVariableEnum.ROOM_WALL_TYPE, message.value);
				break;
			case RoomObjectRoomUpdateMessage.ROOM_LANDSCAPE_UPDATE:
				model.setString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE, message.value);
				break;
		}
	}

	/**
	 * Update plane masks (add/remove doors, windows).
	 * Based on AS3 RoomLogic.updatePlaneMasks() lines 264-286
	 */
	private updatePlaneMasks(message: RoomObjectRoomMaskUpdateMessage, model: IRoomObjectModelController): void
	{
		let changed = false;

		switch (message.type)
		{
			case RoomObjectRoomMaskUpdateMessage.ADD_MASK:
			{
				const category = message.maskCategory === 'hole' ? 'hole' : 'window';

				if (message.maskType !== null && message.maskLocation !== null)
				{
					this._planeMaskParser.addMask(message.maskId, message.maskType, message.maskLocation, category);
					changed = true;
				}
				break;
			}
			case RoomObjectRoomMaskUpdateMessage.REMOVE_MASK:
				changed = this._planeMaskParser.removeMask(message.maskId);
				break;
		}

		if (changed)
		{
			const xml = this._planeMaskParser.getXML();
			model.setString(RoomObjectVariableEnum.ROOM_PLANE_MASK_XML, xml);
		}
	}

	/**
	 * Update floor/wall/landscape visibility.
	 * Based on AS3 RoomLogic.updatePlaneVisibilities() lines 288-301
	 */
	private updatePlaneVisibilities(message: RoomObjectRoomPlaneVisibilityUpdateMessage, model: IRoomObjectModelController): void
	{
		const value = message.visible ? 1 : 0;

		switch (message.type)
		{
			case RoomObjectRoomPlaneVisibilityUpdateMessage.FLOOR_VISIBILITY:
				model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_VISIBILITY, value);
				break;
			case RoomObjectRoomPlaneVisibilityUpdateMessage.WALL_VISIBILITY:
				model.setNumber(RoomObjectVariableEnum.ROOM_WALL_VISIBILITY, value);
				model.setNumber(RoomObjectVariableEnum.ROOM_LANDSCAPE_VISIBILITY, value);
				break;
		}
	}

	/**
	 * Update plane properties (thickness).
	 * Based on AS3 RoomLogic.updatePlaneProperties() lines 303-311
	 */
	private updatePlaneProperties(message: RoomObjectRoomPlanePropertyUpdateMessage, model: IRoomObjectModelController): void
	{
		switch (message.type)
		{
			case RoomObjectRoomPlanePropertyUpdateMessage.FLOOR_THICKNESS:
				model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_THICKNESS_MULTIPLIER, message.value);
				break;
			case RoomObjectRoomPlanePropertyUpdateMessage.WALL_THICKNESS:
				model.setNumber(RoomObjectVariableEnum.ROOM_WALL_THICKNESS_MULTIPLIER, message.value);
				break;
		}
	}

	/**
	 * Update floor holes (add/remove).
	 * Based on AS3 RoomLogic.updateFloorHoles() lines 313-323
	 */
	private updateFloorHoles(message: RoomObjectRoomFloorHoleUpdateMessage): void
	{
		if (this._planeParser === null) return;

		switch (message.type)
		{
			case RoomObjectRoomFloorHoleUpdateMessage.ADD_HOLE:
				this._planeParser.addFloorHole(message.id, message.x, message.y, message.width, message.height, message.invert);
				this._needsFloorHoleUpdate = true;
				break;
			case RoomObjectRoomFloorHoleUpdateMessage.REMOVE_HOLE:
				this._planeParser.removeFloorHole(message.id);
				this._needsFloorHoleUpdate = true;
				break;
		}
	}

	/**
	 * Update room colors/lighting.
	 * Based on AS3 RoomLogic.updateColors() lines 325-341
	 */
	private updateColors(message: RoomObjectRoomColorUpdateMessage, model: IRoomObjectModelController): void
	{
		let targetColor: number;
		let targetLight: number;

		model.setNumber('room_colorize_bg_only', message.bgOnly ? 1 : 0);

		if (message.bgOnly)
		{
			targetColor = message.color;
			targetLight = message.light;
		}
		else
		{
			targetColor = 0xFFFFFF;
			targetLight = 255;
		}

		// Apply light as a multiplier to the color
		const r = Math.round(((targetColor >> 16) & 0xFF) * targetLight / 255);
		const g = Math.round(((targetColor >> 8) & 0xFF) * targetLight / 255);
		const b = Math.round((targetColor & 0xFF) * targetLight / 255);

		this._colorTransitionTarget = (r << 16) | (g << 8) | b;
		this._colorTransitionStart = performance.now();
		this._isTransitioning = true;
	}

	override dispose(): void
	{
		if (this._planeMaskParser)
		{
			this._planeMaskParser.dispose();
		}

		this._planeParser = null;
		super.dispose();
	}
}
