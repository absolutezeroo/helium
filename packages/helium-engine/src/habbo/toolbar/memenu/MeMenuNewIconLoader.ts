import type {HabboToolbar} from '../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuNewIconLoader');

/**
 * Icon loading for the new me menu variant
 *
 * In AS3 this implements IAvatarImageListener, listens for UserObjectEvent
 * and FigureUpdateEvent to update the me-menu avatar icon. Creates cropped
 * avatar images and sets them as the toolbar icon bitmap.
 * In Helium, avatar rendering is handled by the UI layer.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as
 */
export class MeMenuNewIconLoader
{
	private static readonly MAX_ICON_HEIGHT: number = 50;
	private static readonly HEAD_MARGIN: number = 3;

	private _toolbar: HabboToolbar | null;
	private _currentFigure: string = '';

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		// In AS3: registers UserObjectEvent and FigureUpdateEvent handlers
		// and calls setMeMenuToolbarIcon() to initialize the icon
		this.setMeMenuToolbarIcon();

		log.debug('MeMenuNewIconLoader constructed');
	}

	/**
	 * Whether the loader is disposed
	 */
	get disposed(): boolean
	{
		return this._toolbar == null;
	}

	/**
	 * The current figure string being displayed
	 */
	get currentFigure(): string
	{
		return this._currentFigure;
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
	 * Handle figure update event
	 *
	 * @param figure The new figure string
	 */
	public onFigureUpdate(figure: string): void
	{
		if(this.disposed) return;

		this.setMeMenuToolbarIcon(figure);
	}

	private setMeMenuToolbarIcon(figure?: string): void
	{
		if(!this._toolbar) return;

		const currentFigure = figure ?? this._toolbar.sessionDataManager?.figure ?? '';

		if(currentFigure === this._currentFigure) return;

		this._currentFigure = currentFigure;

		// In AS3: creates avatar image, crops it, and calls toolbar.setIconBitmap
		// In Helium, the UI layer renders the avatar based on the figure string
		this._toolbar.setIconBitmap('HTIE_ICON_MEMENU', this._currentFigure);
	}

	/**
	 * Dispose of this icon loader
	 */
	public dispose(): void
	{
		if(this.disposed) return;

		// In AS3: removes UserObjectEvent and FigureUpdateEvent handlers
		this._toolbar = null;
	}
}
