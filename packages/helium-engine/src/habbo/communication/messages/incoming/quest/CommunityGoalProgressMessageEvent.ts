import { MessageEvent } from '@core/communication/messages/MessageEvent';
import type { IMessageEvent } from '@core/communication/messages/IMessageEvent';
import { CommunityGoalProgressMessageParser } from '../../parser/quest/CommunityGoalProgressMessageParser';

/**
 * Event fired when community goal progress is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/CommunityGoalProgressMessageEvent.as
 */
export class CommunityGoalProgressMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CommunityGoalProgressMessageParser);
    }

    get parser(): CommunityGoalProgressMessageParser
    {
        return this.getParser() as CommunityGoalProgressMessageParser;
    }
}
