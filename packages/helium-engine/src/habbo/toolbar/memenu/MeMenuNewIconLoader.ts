import type {HabboToolbar} from '../HabboToolbar';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuNewIconLoader');

/**
 * Icon loading for the new me menu variant
 *
 * Implements IAvatarImageListener. Listens for UserObjectEvent and
 * FigureUpdateEvent to update the me-menu avatar icon. Creates cropped
 * avatar images via AvatarRenderManager and sets them as the toolbar
 * icon bitmap.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as
 */
export class MeMenuNewIconLoader implements IAvatarImageListener
{
	private static readonly MAX_ICON_HEIGHT: number = 50;
	private static readonly HEAD_MARGIN: number = 3;

	private _toolbar: HabboToolbar | null;
	private _fullBitmap: ImageBitmap | null = null;
	private _headBitmap: ImageBitmap | null = null;

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		// In AS3: registers UserObjectEvent and FigureUpdateEvent handlers
		// and calls setMeMenuToolbarIcon() to initialize the icon
		this.setMeMenuToolbarIcon();

		log.debug('MeMenuNewIconLoader constructed');
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
	 * Called when the avatar image becomes ready (IAvatarImageListener)
	 *
	 * @param _key The avatar image key
	 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as avatarImageReady()
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
		if (this.disposed) return;

		this.setMeMenuToolbarIcon(figure);
	}

	/**
	 * Dispose of this icon loader
	 *
	 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as dispose()
	 */
	public dispose(): void
	{
		if (this.disposed) return;

		if (this._fullBitmap)
		{
			this._fullBitmap.close();
			this._fullBitmap = null;
		}

		if (this._headBitmap)
		{
			this._headBitmap.close();
			this._headBitmap = null;
		}

		// In AS3: removes UserObjectEvent and FigureUpdateEvent handlers
		this._toolbar = null;
	}

	/**
	 * Render the avatar and set it as the toolbar icon bitmap.
	 *
	 * Uses AvatarRenderManager to create a cropped avatar image,
	 * converts it to ImageBitmap, and passes it to toolbar.setIconBitmap().
	 * If the avatar is taller than MAX_ICON_HEIGHT, crops from the top.
	 *
	 * @param figure Optional figure string override
	 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewIconLoader.as setMeMenuToolbarIcon()
	 */
	private setMeMenuToolbarIcon(figure?: string): void
	{
		if (!this._toolbar) return;

		const avatarRenderManager = this._toolbar.avatarRenderManager;
		const currentFigure = figure ?? this._toolbar.sessionDataManager?.figure ?? '';

		if (!currentFigure) return;

		let fullBitmap: ImageBitmap | null = null;
		let headBitmap: ImageBitmap | null = null;

		if (avatarRenderManager)
		{
			if (currentFigure !== this._currentFigure)
			{
				const gender = this._toolbar.sessionDataManager?.gender ?? '';
				const avatarImage = avatarRenderManager.createAvatarImage(currentFigure, 'h', gender, this, null);

				if (avatarImage)
				{
					avatarImage.setDirection('full', 2);

					// Get cropped full and head images (returns Texture with OffscreenCanvas source)
					const fullTexture = avatarImage.getCroppedImage('full');
					const headTexture = avatarImage.getCroppedImage('head');

					if (fullTexture?.source?.resource instanceof OffscreenCanvas)
					{
						fullBitmap = this.offscreenToImageBitmap(fullTexture.source.resource);
					}

					if (headTexture?.source?.resource instanceof OffscreenCanvas)
					{
						headBitmap = this.offscreenToImageBitmap(headTexture.source.resource);
					}

					avatarImage.dispose();
				}

				this._currentFigure = currentFigure;

				if (this._fullBitmap)
				{
					this._fullBitmap.close();
				}

				this._fullBitmap = fullBitmap;

				if (this._headBitmap)
				{
					this._headBitmap.close();
				}

				this._headBitmap = headBitmap;
			}
			else
			{
				fullBitmap = this._fullBitmap;
				headBitmap = this._headBitmap;
			}
		}

		if (!this._toolbar) return;

		let iconBitmap: ImageBitmap | null = null;

		if (fullBitmap && headBitmap)
		{
			if (fullBitmap.height > MeMenuNewIconLoader.MAX_ICON_HEIGHT)
			{
				// Crop to MAX_ICON_HEIGHT from the top, adjusting for head
				const cropped = new OffscreenCanvas(fullBitmap.width, MeMenuNewIconLoader.MAX_ICON_HEIGHT);
				const ctx = cropped.getContext('2d')!;

				let sy = 0;

				if (headBitmap.height > MeMenuNewIconLoader.MAX_ICON_HEIGHT - MeMenuNewIconLoader.HEAD_MARGIN)
				{
					sy = headBitmap.height - MeMenuNewIconLoader.MAX_ICON_HEIGHT + MeMenuNewIconLoader.HEAD_MARGIN;
				}

				ctx.drawImage(
					fullBitmap,
					0, sy, fullBitmap.width, MeMenuNewIconLoader.MAX_ICON_HEIGHT,
					0, 0, fullBitmap.width, MeMenuNewIconLoader.MAX_ICON_HEIGHT
				);

				iconBitmap = this.offscreenToImageBitmap(cropped);
			}
			else
			{
				iconBitmap = this.cloneImageBitmap(fullBitmap);
			}
		}

		this._toolbar.setIconBitmap('HTIE_ICON_MEMENU', iconBitmap);
	}

	/**
	 * Synchronously create an ImageBitmap from an OffscreenCanvas.
	 *
	 * Uses transferToImageBitmap() for zero-copy transfer.
	 */
	private offscreenToImageBitmap(canvas: OffscreenCanvas): ImageBitmap | null
	{
		try
		{
			return canvas.transferToImageBitmap();
		}
		catch
		{
			return null;
		}
	}

	/**
	 * Clone an ImageBitmap by drawing it to an OffscreenCanvas and transferring.
	 */
	private cloneImageBitmap(bitmap: ImageBitmap): ImageBitmap | null
	{
		try
		{
			const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(bitmap, 0, 0);
			return canvas.transferToImageBitmap();
		}
		catch
		{
			return null;
		}
	}
}
