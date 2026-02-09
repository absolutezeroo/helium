import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ErrorReportEventParser} from '../../parser/error/ErrorReportEventParser';

/**
 * Error report event from server
 *
 * @see source_as_win63/habbo/communication/messages/incoming/error/ErrorReportEvent.as
 */
export class ErrorReportEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ErrorReportEventParser);
	}
}
