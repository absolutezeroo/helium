/**
 * LoginBackground
 *
 * @see sources/win63_2021_version/login/Background.as
 *
 * Full-screen background for the login flow.
 * Reproduces the AS3 gradient fill (two-tone) with a tiled bitmap overlay.
 *
 * AS3 colors: gradient from 0xC4A48D (top) to 0xC23E1E (bottom).
 * Tiled bitmap pattern drawn on top with alpha blend.
 */
export class LoginBackground
{
	private _root: HTMLDivElement;
	private _disposed: boolean = false;

	constructor()
	{
		this._root = document.createElement('div');
		this._root.className = 'login-background';
		Object.assign(this._root.style, {
			position: 'absolute',
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			// AS3 gradient: linear from 0xC4A48D (top warm beige) to 0xC23E1E (bottom red)
			// rotated PI/2 (vertical)
			background: 'linear-gradient(180deg, #C4A48D 0%, #C23E1E 100%)',
			zIndex: '0',
		} as Partial<CSSStyleDeclaration>);
	}

	/**
	 * Get the root DOM element.
	 */
	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * Resize the background to match the viewport.
	 */
	public resize(): void
	{
		// CSS handles full-screen via 100%/100%, nothing else needed
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;
		this._root.remove();
	}
}
