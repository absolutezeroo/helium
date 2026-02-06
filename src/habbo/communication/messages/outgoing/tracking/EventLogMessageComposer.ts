import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send event log for tracking
 * Message ID: 2297
 *
 * @see source_as/habbo/communication/messages/outgoing/tracking/class_955.as (EventLogMessageComposer)
 */
export class EventLogMessageComposer extends MessageComposer<ConstructorParameters<typeof EventLogMessageComposer>>
{
	private _data: ConstructorParameters<typeof EventLogMessageComposer>;

	constructor(
		public category: string,
		public type: string,
		public action: string,
		public extraString: string = '',
		public extraInt: number = 0
	)
	{
		super();

		this._data = [category, type, action, extraString, extraInt];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
