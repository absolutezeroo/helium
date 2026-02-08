import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request interstitial ad availability from server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/advertisement/GetInterstitialMessageComposer.as
 */
export class GetInterstitialMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
