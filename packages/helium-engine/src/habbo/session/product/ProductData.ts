import type {IProductData} from './IProductData';

/**
 * Product data implementation
 *
 * @see source_as_win63/habbo/session/product/ProductData.as
 * @see source_as_flash/com/sulake/habbo/session/product/ProductData.as
 */
export class ProductData implements IProductData
{
	private _type: string;
	private _name: string;
	private _description: string;

	constructor(type: string, name: string, description: string = '')
	{
		this._type = type;
		this._name = name;
		this._description = description;
	}

	get type(): string
	{
		return this._type;
	}

	get name(): string
	{
		return this._name;
	}

	get description(): string
	{
		return this._description;
	}
}
