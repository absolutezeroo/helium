import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NavigatorSavedSearch} from '../../incoming/newnavigator';

/**
 * Parser for saved searches message
 *
 * @see source_as/habbo/communication/messages/parser/newnavigator/class_1264.as
 */
export class NavigatorSavedSearchesMessageParser implements IMessageParser
{
	private _savedSearches: NavigatorSavedSearch[] = [];

	get savedSearches(): NavigatorSavedSearch[]
	{
		return this._savedSearches;
	}

	public flush(): boolean
	{
		this._savedSearches = [];
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._savedSearches.push(new NavigatorSavedSearch(wrapper));
		}
		return true;
	}
}
