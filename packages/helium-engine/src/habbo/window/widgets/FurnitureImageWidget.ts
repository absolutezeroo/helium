import type {IWidget, IWidgetProperty} from './IWidget';

/**
 * Furniture image widget.
 *
 * Renders a furniture item image with configurable type, direction, and scale.
 * Supports asynchronous image loading via IGetImageListener in the AS3 version.
 * In the TypeScript port, furniture metadata is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/FurnitureImageWidget.as
 */
export class FurnitureImageWidget implements IWidget
{
	public static readonly TYPE: string = 'furniture_image';

	private static readonly FURNITURE_TYPE_KEY: string = 'furniture_image:furnitureType';
	private static readonly SCALE_KEY: string = 'furniture_image:scale';
	private static readonly DIRECTION_KEY: string = 'furniture_image:direction';

	private static readonly DIRECTIONS: string[] = [
		'northeast', 'east', 'southeast', 'south',
		'southwest', 'west', 'northwest', 'north'
	];

	private static readonly SCALES: number[] = [32, 64];

	private static readonly ITEM_TYPE_FLOOR: number = 0;
	private static readonly ITEM_TYPE_WALL: number = 1;

	constructor()
	{
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _furnitureType: string = 'table_plasto_square';

	public get furnitureType(): string
	{
		return this._furnitureType;
	}

	public set furnitureType(value: string)
	{
		this._furnitureType = value;
	}

	private _scale: number = 64;

	public get scale(): number
	{
		return this._scale;
	}

	public set scale(value: number)
	{
		this._scale = value;
	}

	private _direction: number = 2;

	public get direction(): number
	{
		return this._direction;
	}

	public set direction(value: number)
	{
		this._direction = value;
	}

	private _itemType: number = FurnitureImageWidget.ITEM_TYPE_FLOOR;

	/**
	 * The item type: floor (0) or wall (1).
	 */
	public get itemType(): number
	{
		return this._itemType;
	}

	public set itemType(value: number)
	{
		this._itemType = value;
	}

	public get properties(): IWidgetProperty[]
	{
		if (this._disposed) return [];

		return [
			{key: FurnitureImageWidget.FURNITURE_TYPE_KEY, value: this._furnitureType, type: 'String'},
			{key: FurnitureImageWidget.SCALE_KEY, value: this._scale, type: 'int'},
			{
				key: FurnitureImageWidget.DIRECTION_KEY,
				value: FurnitureImageWidget.DIRECTIONS[this._direction],
				type: 'String'
			},
		];
	}

	public setProperties(values: IWidgetProperty[]): void
	{
		for (const prop of values)
		{
			switch (prop.key)
			{
				case FurnitureImageWidget.FURNITURE_TYPE_KEY:
					this.furnitureType = String(prop.value);
					break;
				case FurnitureImageWidget.SCALE_KEY:
					this.scale = Number(prop.value);
					break;
				case FurnitureImageWidget.DIRECTION_KEY:
					this.direction = FurnitureImageWidget.DIRECTIONS.indexOf(String(prop.value));
					break;
			}
		}
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}

