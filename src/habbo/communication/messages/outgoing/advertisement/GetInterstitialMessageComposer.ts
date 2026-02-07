import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request interstitial ad availability from server
 *
 * @see source_as/habbo/communication/messages/outgoing/advertisement/GetInterstitialMessageComposer.as
 */
export class GetInterstitialMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
