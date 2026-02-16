import type {HabboToolbar} from '../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuIconLoader');

/**
 * Icon loading for the legacy me menu
 *
 * In AS3 this implements IAvatarImageListener, listens for UserObjectEvent
 * and UserChangeMessageEvent to update the me-menu avatar icon. Creates
 * cropped avatar images and sets them as the toolbar icon bitmap.
 * In Helium, avatar rendering is handled by the UI layer.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuIconLoader.as
 */
export class MeMenuIconLoader
{
	private static readonly MAX_ICON_HEIGHT: number = 50;
	private static readonly HEAD_MARGIN: number = 3;

	private _toolbar: HabboToolbar | null;

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		// In AS3: registers UserObjectEvent and UserChangeMessageEvent handlers
		// and calls setMeMenuToolbarIcon() to initialize the icon
		this.setMeMenuToolbarIcon();

		log.debug('MeMenuIconLoader constructed');
	}

	private _currentFigure: string = '';

	/**
	 * The current figure string being displayed
	 */
	get currentFigure(): string
	{
		return this._currentFigure;
	}

	/**
	 * Whether the loader is disposed
	 */
	get disposed(): boolean
	{
		return this._toolbar == null;
	}

	/**
	 * Called when the avatar image becomes ready
	 *
	 * @param _key The avatar image key
	 */
	public avatarImageReady(_key: string): void
	{
		this._currentFigure = '';
		this.setMeMenuToolbarIcon();
	}

	/**
	 * Handle user object event (initial login)
	 *
	 * @param figure The user's figure string
	 */
	public onUserObject(figure: string): void
	{
		this.setMeMenuToolbarIcon(figure);
	}

	/**
	 * Handle user change event (figure change in room)
	 *
	 * @param id The user id (-1 means own user)
	 * @param figure The new figure string
	 */
	public onUserChange(id: number, figure: string): void
	{
		if (id === -1)
		{
			this.setMeMenuToolbarIcon(figure);
		}
	}

	/**
	 * Dispose of this icon loader
	 */
	public dispose(): void
	{
		if (this.disposed) return;

		// In AS3: removes UserObjectEvent and UserChangeMessageEvent handlers
		this._toolbar = null;
	}

	private setMeMenuToolbarIcon(figure?: string): void
	{
		if (!this._toolbar) return;

		const currentFigure = figure ?? this._toolbar.sessionDataManager?.figure ?? '';

		if (currentFigure === this._currentFigure) return;

		this._currentFigure = currentFigure;

		// In AS3: creates avatar image, crops it, and calls toolbar.setIconBitmap
		// In Helium, the UI layer renders the avatar based on the figure string
		this._toolbar.setIconBitmap('HTIE_ICON_MEMENU', this._currentFigure);
	}
}
