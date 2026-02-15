import type {IAvatarImageWidget} from './IAvatarImageWidget';
import type {IWidgetProperty} from './IWidget';

/**
 * Avatar image rendering widget.
 *
 * Renders an avatar figure with configurable direction, scale, cropping,
 * and head-only mode. Clicking the avatar opens the extended profile if
 * a userId is set.
 *
 * In the AS3 version, this widget uses BitmapData and IAvatarImageListener
 * for asynchronous avatar rendering. In the TypeScript port, rendering
 * metadata is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/AvatarImageWidget.as
 */
export class AvatarImageWidget implements IAvatarImageWidget
{
	public static readonly TYPE: string = 'avatar_image';

	private static readonly FIGURE_KEY: string = 'avatar_image:figure';
	private static readonly SCALE_KEY: string = 'avatar_image:scale';
	private static readonly ONLY_HEAD_KEY: string = 'avatar_image:only_head';
	private static readonly CROPPED_KEY: string = 'avatar_image:cropped';
	private static readonly DIRECTION_KEY: string = 'avatar_image:direction';

	private static readonly DIRECTIONS: string[] = [
		'northeast', 'east', 'southeast', 'south',
		'southwest', 'west', 'northwest', 'north'
	];

	private static readonly FIGURE_DEFAULT: string = 'hd-180-1.ch-210-66.lg-270-82.sh-290-81';
	private static readonly SCALE_DEFAULT: string = 'h';
	private static readonly ONLY_HEAD_DEFAULT: boolean = false;
	private static readonly CROPPED_DEFAULT: boolean = false;
	private static readonly DIRECTION_DEFAULT: number = 2;

	constructor()
	{
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _figure: string = AvatarImageWidget.FIGURE_DEFAULT;

	public get figure(): string
	{
		return this._figure;
	}

	public set figure(value: string)
	{
		if (value !== this._figure)
		{
			this._figureEmpty = !value || value.length === 0;
			this._figure = AvatarImageWidget.cleanupAvatarString(value);
		}
	}

	private _scale: string = AvatarImageWidget.SCALE_DEFAULT;

	public get scale(): string
	{
		return this._scale;
	}

	public set scale(value: string)
	{
		if (value !== this._scale)
		{
			this._scale = value;
		}
	}

	private _onlyHead: boolean = AvatarImageWidget.ONLY_HEAD_DEFAULT;

	public get onlyHead(): boolean
	{
		return this._onlyHead;
	}

	public set onlyHead(value: boolean)
	{
		if (value !== this._onlyHead)
		{
			this._onlyHead = value;
		}
	}

	private _cropped: boolean = AvatarImageWidget.CROPPED_DEFAULT;

	public get cropped(): boolean
	{
		return this._cropped;
	}

	public set cropped(value: boolean)
	{
		if (value !== this._cropped)
		{
			this._cropped = value;
		}
	}

	private _direction: number = AvatarImageWidget.DIRECTION_DEFAULT;

	public get direction(): number
	{
		return this._direction;
	}

	public set direction(value: number)
	{
		if (value !== this._direction)
		{
			this._direction = value;
		}
	}

	private _userId: number = 0;

	public get userId(): number
	{
		return this._userId;
	}

	public set userId(value: number)
	{
		if (this._userId !== value)
		{
			this._userId = value;
		}
	}

	private _figureEmpty: boolean = false;

	/**
	 * Whether the figure string was set to an empty/null value.
	 */
	public get figureEmpty(): boolean
	{
		return this._figureEmpty;
	}

	public get properties(): IWidgetProperty[]
	{
		if (this._disposed) return [];

		return [
			{key: AvatarImageWidget.FIGURE_KEY, value: this._figure, type: 'String'},
			{key: AvatarImageWidget.SCALE_KEY, value: this._scale, type: 'String'},
			{key: AvatarImageWidget.ONLY_HEAD_KEY, value: this._onlyHead, type: 'Boolean'},
			{key: AvatarImageWidget.CROPPED_KEY, value: this._cropped, type: 'Boolean'},
			{
				key: AvatarImageWidget.DIRECTION_KEY,
				value: AvatarImageWidget.DIRECTIONS[this._direction],
				type: 'String'
			},
		];
	}

	/**
	 * Clean up a figure string, replacing NaN values and defaulting empty strings.
	 */
	private static cleanupAvatarString(figure: string): string
	{
		if (!figure || figure.length === 0)
		{
			return AvatarImageWidget.FIGURE_DEFAULT;
		}

		return figure.replace(/NaN/g, '');
	}

	public setProperties(values: IWidgetProperty[]): void
	{
		for (const prop of values)
		{
			switch (prop.key)
			{
				case AvatarImageWidget.FIGURE_KEY:
					this.figure = String(prop.value);
					break;
				case AvatarImageWidget.SCALE_KEY:
					this.scale = String(prop.value);
					break;
				case AvatarImageWidget.ONLY_HEAD_KEY:
					this.onlyHead = Boolean(prop.value);
					break;
				case AvatarImageWidget.CROPPED_KEY:
					this.cropped = Boolean(prop.value);
					break;
				case AvatarImageWidget.DIRECTION_KEY:
					this.direction = AvatarImageWidget.DIRECTIONS.indexOf(String(prop.value));
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

