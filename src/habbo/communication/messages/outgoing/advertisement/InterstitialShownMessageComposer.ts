import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notify server that interstitial ad was shown
 *
 * @see source_as/habbo/communication/messages/outgoing/advertisement/InterstitialShownMessageComposer.as
 */
export class InterstitialShownMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
