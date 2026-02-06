import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for can create room event message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/CanCreateRoomEventEventParser.as
 */
export class CanCreateRoomEventMessageParser implements IMessageParser
{
	private _canCreateEvent: boolean = false;

	get canCreateEvent(): boolean
	{
		return this._canCreateEvent;
	}

	private _errorCode: number = 0;

	get errorCode(): number
	{
		return this._errorCode;
	}

	public flush(): boolean
	{
		this._canCreateEvent = false;
		this._errorCode = 0;
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._canCreateEvent = wrapper.readBoolean();
		this._errorCode = wrapper.readInt();
		return true;
	}
}
