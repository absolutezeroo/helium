/**
 * Event for interstitial ad state changes
 *
 * @see source_as/habbo/advertisement/events/InterstitialEvent.as
 */
export class InterstitialEvent
{
	static readonly INTERSTITIAL_SHOW = 'AE_INTERSTITIAL_SHOW';
	static readonly INTERSTITIAL_NOT_SHOWN = 'AE_INTERSTITIAL_NOT_SHOWN';
	static readonly INTERSTITIAL_COMPLETE = 'AE_INTERSTITIAL_COMPLETE';

	private _type: string;
	private _status: string;

	constructor(type: string, status: string = '')
	{
		this._type = type;
		this._status = status;
	}

	get type(): string
	{
		return this._type;
	}

	get status(): string
	{
		return this._status;
	}
}
