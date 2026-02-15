import type {IAvatarImageWidget} from './IAvatarImageWidget';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

/**
 * Avatar image rendering widget.
 *
 * Renders an avatar figure with configurable direction, scale, cropping,
 * and head-only mode. Clicking the avatar opens the extended profile if
 * a userId is set.
 *
 * Uses the IAvatarRenderManager to create avatar images and renders them
 * to a bitmap wrapper window. Implements IAvatarImageListener to get
 * notified when asynchronous avatar downloads complete.
 *
 * @see sources/win63_version/habbo/window/widgets/AvatarImageWidget.as
 */
export class AvatarImageWidget implements IAvatarImageWidget, IAvatarImageListener
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

	private static readonly GREYSCALE_FACTOR: number = 1 / 3;

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindowContainer | null = null;
	private _bitmap: IBitmapWrapperWindow | null = null;
	private _region: IWindow | null = null;
	private _onClickBound: Function;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
		this._onClickBound = this.onClick.bind(this);

		const root = this._windowManager.buildWidgetLayout('avatar_image') as IWindowContainer;

		if(root)
		{
			this._root = root;
			this._bitmap = root.findChildByName('bitmap') as IBitmapWrapperWindow | null;
			this._region = root.findChildByName('region');

			if(this._region)
			{
				this._region.addEventListener(WindowMouseEvent.CLICK, this._onClickBound);
			}

			this.refresh();

			this._widgetWindow.rootWindow = root;
			root.width = this._widgetWindow.width;
			root.height = this._widgetWindow.height;
		}
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
		if(value !== this._figure)
		{
			this._figureEmpty = !value || value.length === 0;
			this._figure = AvatarImageWidget.cleanupAvatarString(value);
			this.refresh();
		}
	}

	private _scale: string = AvatarImageWidget.SCALE_DEFAULT;

	public get scale(): string
	{
		return this._scale;
	}

	public set scale(value: string)
	{
		if(value !== this._scale)
		{
			this._scale = value;
			this.refresh();
		}
	}

	private _onlyHead: boolean = AvatarImageWidget.ONLY_HEAD_DEFAULT;

	public get onlyHead(): boolean
	{
		return this._onlyHead;
	}

	public set onlyHead(value: boolean)
	{
		if(value !== this._onlyHead)
		{
			this._onlyHead = value;
			this.refresh();
		}
	}

	private _cropped: boolean = AvatarImageWidget.CROPPED_DEFAULT;

	public get cropped(): boolean
	{
		return this._cropped;
	}

	public set cropped(value: boolean)
	{
		if(value !== this._cropped)
		{
			this._cropped = value;
			this.refresh();
		}
	}

	private _direction: number = AvatarImageWidget.DIRECTION_DEFAULT;

	public get direction(): number
	{
		return this._direction;
	}

	public set direction(value: number)
	{
		if(value !== this._direction)
		{
			this._direction = value;
			this.refresh();
		}
	}

	private _userId: number = 0;

	public get userId(): number
	{
		return this._userId;
	}

	public set userId(value: number)
	{
		if(this._userId !== value)
		{
			this._userId = value;

			if(this._region)
			{
				this._region.visible = (this._userId > 0);
			}
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

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(AvatarImageWidget.FIGURE_KEY, this._figure),
			new PropertyStruct(AvatarImageWidget.SCALE_KEY, this._scale),
			new PropertyStruct(AvatarImageWidget.ONLY_HEAD_KEY, this._onlyHead),
			new PropertyStruct(AvatarImageWidget.CROPPED_KEY, this._cropped),
			new PropertyStruct(AvatarImageWidget.DIRECTION_KEY, AvatarImageWidget.DIRECTIONS[this._direction]),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for(const prop of values)
		{
			switch(prop.key)
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

	/**
	 * Clean up a figure string, replacing NaN values and defaulting empty strings.
	 */
	private static cleanupAvatarString(figure: string): string
	{
		if(!figure || figure.length === 0)
		{
			return AvatarImageWidget.FIGURE_DEFAULT;
		}

		return figure.replace(/NaN/g, '');
	}

	/**
	 * IAvatarImageListener implementation.
	 *
	 * Called when an asynchronous avatar image download completes.
	 * If the completed figure matches our current figure, refresh.
	 *
	 * @param figureString - The completed figure string
	 */
	public avatarImageReady(figureString: string): void
	{
		if(AvatarImageWidget.cleanupAvatarString(figureString) === this._figure)
		{
			this.refresh();
		}
	}

	/**
	 * Refresh the avatar bitmap rendering.
	 *
	 * Creates an avatar image via the renderer, sets direction,
	 * gets the cropped or full image at the appropriate scale,
	 * and applies greyscale if the figure was empty.
	 *
	 * @see AvatarImageWidget.as refresh()
	 */
	private refresh(): void
	{
		if(!this._bitmap || !this._windowManager) return;

		this._bitmap.texture = null;

		const avatarRenderer = this._windowManager.avatarRenderer;

		if(avatarRenderer)
		{
			const scaleFactor = this._scale === 'h' ? 1 : 0.5;
			const setType = this._onlyHead ? 'head' : 'full';

			const avatarImage = avatarRenderer.createAvatarImage(
				this._figure,
				'h',
				'',
				this,
				null
			);

			if(avatarImage)
			{
				avatarImage.setDirection(setType, this._direction);

				if(this._cropped)
				{
					this._bitmap.texture = avatarImage.getCroppedImage(setType, scaleFactor);
				}
				else
				{
					this._bitmap.texture = avatarImage.getImage(setType, true, scaleFactor);
				}

				this._bitmap.disposesBitmap = true;
				avatarImage.dispose();
			}
		}

		this._bitmap.invalidate();

		if(this._bitmap.texture && this._widgetWindow)
		{
			this._widgetWindow.width = this._bitmap.texture.width;
			this._widgetWindow.height = this._bitmap.texture.height;
		}
	}

	/**
	 * Handle click on the avatar region.
	 *
	 * Sends GetExtendedProfileMessageComposer if userId > 0.
	 */
	private onClick(_event: WindowMouseEvent): void
	{
		if(this._userId > 0 && this._windowManager)
		{
			const communication = this._windowManager.communication;

			if(communication?.connection)
			{
				communication.connection.send(new GetExtendedProfileMessageComposer(this._userId));
			}
		}
	}

	public dispose(): void
	{
		if(this._disposed) return;

		if(this._region)
		{
			this._region.removeEventListener(WindowMouseEvent.CLICK, this._onClickBound);
			this._region.dispose();
			this._region = null;
		}

		this._bitmap = null;

		if(this._root)
		{
			this._root.dispose();
			this._root = null;
		}

		if(this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
			this._widgetWindow = null;
		}

		this._windowManager = null;
		this._disposed = true;
	}
}
