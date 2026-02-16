import type {IWindow} from '../IWindow';
import {WindowEvent} from './WindowEvent';

/**
 * Window link event carrying a URL/link string.
 *
 * Dispatched when a link element within a window is activated.
 * Uses its own object pool separate from the base class.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/events/WindowLinkEvent.as
 */
export class WindowLinkEvent extends WindowEvent
{
	// ── Event type constants ─────────────────────────────────────────

	public static readonly WE_LINK: string = 'WE_LINK';

	// ── Object pool ──────────────────────────────────────────────────

	private static readonly _linkPool: WindowLinkEvent[] = [];

	// ── Instance fields ──────────────────────────────────────────────

	constructor()
	{
		super();

		this._type = WindowLinkEvent.WE_LINK;
	}

	// ── Constructor ──────────────────────────────────────────────────

	private _link: string = '';

	// ── Static factory ───────────────────────────────────────────────

	/** The link URL string. */
	public get link(): string
	{
		return this._link;
	}

	// ── Accessors ────────────────────────────────────────────────────

	/**
	 * Allocates a WindowLinkEvent from the pool or creates a new one.
	 *
	 * @param link - The link URL string
	 * @param window - The target window
	 * @param related - The related window
	 * @returns A pooled or new WindowLinkEvent instance
	 */
	public static allocateLink(link: string, window: IWindow | null, related: IWindow | null): WindowLinkEvent
	{
		const event: WindowLinkEvent = (WindowLinkEvent._linkPool.length > 0)
			? WindowLinkEvent._linkPool.pop()!
			: new WindowLinkEvent();

		event._link = link;
		event._window = window;
		event._related = related;
		event._recycled = false;
		event._poolRef = WindowLinkEvent._linkPool;

		return event;
	}

	// ── Methods ──────────────────────────────────────────────────────

	/**
	 * Creates a clone of this link event via the pool.
	 */
	public override clone(): WindowEvent
	{
		return WindowLinkEvent.allocateLink(this._link, this._window, this._related);
	}

	/**
	 * Returns a string representation of this link event.
	 */
	public override toString(): string
	{
		return `WindowLinkEvent { type: ${this._type} link: ${this._link} cancelable: ${this._cancelable} window: ${this._window} }`;
	}
}
