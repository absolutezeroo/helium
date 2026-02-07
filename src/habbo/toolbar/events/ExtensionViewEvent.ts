/**
 * Extension view event
 *
 * Dispatched when the toolbar extension view is resized.
 *
 * @see source_as/habbo/toolbar/events/ExtensionViewEvent.as
 */
export class ExtensionViewEvent
{
	public static readonly EXTENSION_VIEW_RESIZED: string = 'EVE_EXTENSION_VIEW_RESIZED';

	private _type: string;

	constructor(type: string)
	{
		this._type = type;
	}

	/**
	 * The event type
	 */
	get type(): string
	{
		return this._type;
	}
}
