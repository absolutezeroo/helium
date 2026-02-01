import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for collapsed categories message
 *
 * Based on AS3 class_1590
 */
export class NavigatorCollapsedCategoriesMessageParser implements IMessageParser
{
	private _collapsedCategories: string[] = [];

	get collapsedCategories(): string[]
	{
		return this._collapsedCategories;
	}

	flush(): boolean
	{
		this._collapsedCategories = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._collapsedCategories.push(wrapper.readString());
		}
		return true;
	}
}
