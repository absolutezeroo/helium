import { MessageEvent } from '@core/communication/messages/MessageEvent';
import type { IMessageEvent } from '@core/communication/messages/IMessageEvent';
import { EpicPopupMessageParser } from '../../parser/quest/EpicPopupMessageParser';

/**
 * Event fired when an epic popup is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/EpicPopupMessageEvent.as
 */
export class EpicPopupMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, EpicPopupMessageParser);
    }

    get parser(): EpicPopupMessageParser
    {
        return this.getParser() as EpicPopupMessageParser;
    }
}
