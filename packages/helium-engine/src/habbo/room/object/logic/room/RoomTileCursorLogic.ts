/**
 * RoomTileCursorLogic
 *
 * @see source_as_win63/habbo/room/object/logic/room/RoomTileCursorLogic.as
 *
 * Logic for the tile cursor (hover indicator on floor tiles).
 * Shows the cursor position and optionally a height number when stacking is high.
 */
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {RoomObjectTileCursorUpdateMessage} from '@habbo/room/messages/RoomObjectTileCursorUpdateMessage';

export class RoomTileCursorLogic extends ObjectLogicBase
{
	private static readonly STATE_ENABLED = 0;
	private static readonly STATE_DISABLED = 1;
	private static readonly STATE_SHOW_TILE_HEIGHT = 6;

	private _lastSourceEventId: string = '';
	private _hiddenOnPurpose: boolean = false;

	override getEventTypes(): string[]
	{
		return [];
	}

	override initialize(data: unknown): void
	{
		const model = this.object?.getModelController();

		if (model)
		{
			model.setNumber('furniture_alpha_multiplier', 1);
		}
	}

	/**
	 * Process tile cursor update messages.
	 * Based on AS3 RoomTileCursorLogic.processUpdateMessage()
	 */
	override processUpdateMessage(message: RoomObjectUpdateMessage): void
	{
		if (message instanceof RoomObjectTileCursorUpdateMessage)
		{
			// Skip duplicate events from the same source
			if (message.sourceEventId === this._lastSourceEventId && !message.toggleVisibility)
			{
				return;
			}

			this._lastSourceEventId = message.sourceEventId;

			// Handle visibility toggle (user pressing hide cursor)
			if (message.toggleVisibility)
			{
				this._hiddenOnPurpose = !this._hiddenOnPurpose;
			}

			if (this._hiddenOnPurpose)
			{
				return;
			}

			if (message.visible && this.object)
			{
				// Set state based on height value
				const model = this.object.getModelController();

				if (model)
				{
					if (message.height > 0.8)
					{
						model.setNumber('furniture_state', RoomTileCursorLogic.STATE_SHOW_TILE_HEIGHT);
					}
					else
					{
						model.setNumber('furniture_state', RoomTileCursorLogic.STATE_ENABLED);
					}
				}

				// Update position
				if (message.loc)
				{
					this.object.setLocation(message.loc);
				}
			}
			else if (this.object)
			{
				const model = this.object.getModelController();

				if (model)
				{
					model.setNumber('furniture_state', RoomTileCursorLogic.STATE_DISABLED);
				}
			}

			return;
		}

		super.processUpdateMessage(message);
	}

	override update(time: number): void
	{
		// Tile cursor visibility is handled via processUpdateMessage
	}
}
