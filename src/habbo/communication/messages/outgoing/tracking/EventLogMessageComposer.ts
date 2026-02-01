import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send event log for tracking
 * Message ID: 2297
 *
 * @see source_as/habbo/communication/messages/outgoing/tracking/class_955.as (EventLogMessageComposer)
 */
export class EventLogMessageComposer implements IMessageComposer<ConstructorParameters<typeof EventLogMessageComposer>>
{
	private _data: ConstructorParameters<typeof EventLogMessageComposer>;

	constructor(
		category: string,
		type: string,
		action: string,
		extraString: string = '',
		extraInt: number = 0
	)
	{
		this._data = [category, type, action, extraString, extraInt];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
