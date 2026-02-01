import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for FurniListInvalidate message (inventory needs refresh)
 *
 * Based on AS3 com.sulake.habbo.communication.messages.parser.inventory.furni.FurniListInvalidateEventParser
 */
export class FurniListInvalidateMessageParser implements IMessageParser
{
	flush(): boolean
	{
		return true;
	}

	parse(_wrapper: IMessageDataWrapper): boolean
	{
		// No data to parse
		return true;
	}
}
