/**
 * Session data preferences event
 *
 * @see source_as/habbo/session/events/SessionDataPreferencesEvent.as
 */
export class SessionDataPreferencesEvent
{
	public static readonly PREFERENCES_UPDATED = 'APUE_UPDATED';

	private _uiFlags: number;

	get uiFlags(): number
	{
		return this._uiFlags;
	}

	constructor(uiFlags: number)
	{
		this._uiFlags = uiFlags;
	}
}
