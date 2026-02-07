import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';
import {RoomSessionDimmerPresetsEventPresetItem} from './RoomSessionDimmerPresetsEventPresetItem';

/**
 * Room session dimmer presets event
 *
 * @see source_as/habbo/session/events/RoomSessionDimmerPresetsEvent.as
 */
export class RoomSessionDimmerPresetsEvent extends RoomSessionEvent
{
	public static readonly ROOM_DIMMER_PRESETS = 'RSDPE_PRESETS';

	private _selectedPresetId: number = 0;
	private _presets: RoomSessionDimmerPresetsEventPresetItem[] = [];
	private _itemId: number = 0;
	private _isOn: boolean = false;

	constructor(type: string, session: IRoomSession, openLandingPage: boolean = false)
	{
		super(type, session, openLandingPage);
	}

	get selectedPresetId(): number
	{
		return this._selectedPresetId;
	}

	set selectedPresetId(value: number)
	{
		this._selectedPresetId = value;
	}

	get presetCount(): number
	{
		return this._presets.length;
	}

	get itemId(): number
	{
		return this._itemId;
	}

	set itemId(value: number)
	{
		this._itemId = value;
	}

	get isOn(): boolean
	{
		return this._isOn;
	}

	set isOn(value: boolean)
	{
		this._isOn = value;
	}

	storePreset(id: number, type: number, color: number, light: number): void
	{
		const preset = new RoomSessionDimmerPresetsEventPresetItem(id, type, color, light);
		this._presets[id - 1] = preset;
	}

	getPreset(index: number): RoomSessionDimmerPresetsEventPresetItem | null
	{
		if (index < 0 || index >= this._presets.length)
		{
			return null;
		}
		return this._presets[index];
	}
}
