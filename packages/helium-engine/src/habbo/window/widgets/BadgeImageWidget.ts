import type {IBadgeImageWidget} from './IBadgeImageWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Badge image rendering widget.
 *
 * Renders a badge image (normal, group, or perk) from a badge identifier.
 * Supports group badge live-refresh via message events.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow for rendering
 * and listens for GroupDetailsChangedMessageEvent / HabboGroupBadgesMessageEvent.
 * In the TypeScript port, badge data is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/BadgeImageWidget.as
 */
export class BadgeImageWidget implements IBadgeImageWidget
{
	public static readonly TYPE: string = 'badge_image';

	private static readonly TYPE_KEY: string = 'badge_image:type';
	private static readonly BADGE_ID_KEY: string = 'badge_image:badge_id';
	private _batchUpdate: boolean = false;

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _type: string = 'normal';

	public get type(): string
	{
		return this._type;
	}

	public set type(value: string)
	{
		this._type = value;
	}

	private _badgeId: string = '';

	public get badgeId(): string
	{
		return this._badgeId;
	}

	public set badgeId(value: string)
	{
		this._badgeId = value;
	}

	private _groupId: number = 0;

	public get groupId(): number
	{
		return this._groupId;
	}

	public set groupId(value: number)
	{
		this._groupId = value;
	}

	/**
	 * Compute the asset URI for the current badge.
	 */
	public get assetUri(): string
	{
		if(!this._badgeId || this._badgeId.length === 0) return '';

		switch(this._type)
		{
			case 'normal':
				return '${image.library.url}album1584/' + this._badgeId + '.png';
			case 'group':
				return this._badgeId;
			case 'perk':
				return '${image.library.url}perk/' + this._badgeId + '.png';
			default:
				return '';
		}
	}

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(BadgeImageWidget.TYPE_KEY, this._type),
			new PropertyStruct(BadgeImageWidget.BADGE_ID_KEY, this._badgeId),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		this._batchUpdate = true;

		for(const prop of values)
		{
			switch(prop.key)
			{
				case BadgeImageWidget.TYPE_KEY:
					this.type = String(prop.value);
					break;
				case BadgeImageWidget.BADGE_ID_KEY:
					this.badgeId = String(prop.value);
					break;
			}
		}

		this._batchUpdate = false;
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._groupId = 0;
		this._disposed = true;
	}
}
