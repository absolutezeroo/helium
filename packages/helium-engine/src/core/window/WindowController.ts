import type {IWindow} from './IWindow';
import type {IWindowContext} from './IWindowContext';
import type {IGraphicContext} from './graphics/IGraphicContext';
import type {IGraphicContextHost} from './graphics/IGraphicContextHost';
import type {IRectLimiter} from './utils/IRectLimiter';
import type {IPropertyMap} from './theme/IPropertyMap';
import {WindowModel} from './WindowModel';
import {WindowEvent} from './events/WindowEvent';
import {WindowMouseEvent} from './events/WindowMouseEvent';
import {WindowDisposeEvent} from './events/WindowDisposeEvent';
import {WindowEventDispatcher} from './events/WindowEventDispatcher';
import {WindowRectLimits} from './utils/WindowRectLimits';
import {PropertyStruct} from './utils/PropertyStruct';
import {WindowParam} from './enum/WindowParam';
import {DynamicStyleManager} from './dynamicstyle/DynamicStyleManager';
import {resolveLocalizationTokens} from './utils/WindowParser';

/**
 * Core window controller implementing the full IWindow API.
 *
 * Extends {@link WindowModel} with behavior: event dispatch, coordinate
 * conversion, hit testing, child management, and state transitions.
 * In AS3 this also extended Sprite; in TypeScript we are engine-only
 * and expose rendering metadata through an optional {@link IGraphicContext}.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/WindowController.as
 */
export class WindowController extends WindowModel implements IWindow, IGraphicContextHost
{
	// ── Static constants ─────────────────────────────────────────────

	public static readonly TAG_EXCLUDE: string = '_EXCLUDE';
	public static readonly TAG_INTERNAL: string = '_INTERNAL';
	public static readonly TAG_COLORIZE: string = '_COLORIZE';
	public static readonly TAG_IGNORE_INHERITED_STYLE: string = '_IGNORE_INHERITED_STYLE';

	// ── Static state ─────────────────────────────────────────────────

	private static _nextUniqueId: number = 0;
	private static readonly _tempRect: { x: number; y: number; width: number; height: number } = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};

	// ── Instance fields ──────────────────────────────────────────────

	protected _eventDispatcher: WindowEventDispatcher | null = null;
	protected _graphicContext: IGraphicContext | null = null;
	protected _hasVisualContent: boolean = true;
	protected _rectLimits: WindowRectLimits | null = null;
	private _parentRect: { x: number; y: number; width: number; height: number } = {x: 0, y: 0, width: 0, height: 0};
	private _uniqueId: number;
	private _propertyMap: IPropertyMap | null = null;
	private _graphicsSetup: boolean = false;

	constructor(
		name: string,
		type: number,
		style: number,
		param: number,
		context: IWindowContext,
		rect: { x: number; y: number; width: number; height: number },
		parent: IWindow | null = null,
		procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
		tags: string[] | null = null,
		properties: unknown[] | null = null,
		id: number = 0,
		dynamicStyle: string = ''
	)
	{
		super(id, name, type, style, param, context, rect, tags, dynamicStyle);

		this._uniqueId = WindowController._nextUniqueId++;
		this._parentRect = {x: 0, y: 0, width: 0, height: 0};

		// Apply default attributes from factory if available
		try
		{
			const factory = context.getWindowFactory();

			if (factory)
			{
				const themeManager = factory.getThemeManager();

				if (themeManager)
				{
					this._propertyMap = themeManager.getPropertyDefaults(style) ?? null;
				}

				const defaults = factory.getDefaultsByTypeAndStyle(type, style);

				if (defaults)
				{
					this._blend = defaults.blend;
					this._mouseThreshold = defaults.threshold;

					if (this._background !== defaults.background)
					{
						this.background = defaults.background;
					}

					if (this._fillColor !== defaults.color)
					{
						this.color = defaults.color;
					}

					if (defaults.hasRectLimits())
					{
						(this.limits as WindowRectLimits).assign(
							defaults.width_min,
							defaults.width_max,
							defaults.height_min,
							defaults.height_max
						);
					}
				}
			}
		}
		catch (_)
		{
			// Factory/theme not available yet during bootstrap
		}

		this._procedure = procedure;

		if (parent !== null)
		{
			this._parent = parent as WindowController;
			(parent as WindowController).addChild(this);
		}
	}

	protected _procedure: ((event: WindowEvent, window: IWindow) => void) | null = null;

	/** The window procedure, bubbles up to parent if not set locally. */
	public get procedure(): ((event: WindowEvent, window: IWindow) => void) | null
	{
		if (this._procedure !== null) return this._procedure;
		if (this._parent !== null) return this._parent.procedure;

		return WindowController._nullEventProc;
	}

	public set procedure(value: ((event: WindowEvent, window: IWindow) => void) | null)
	{
		this._procedure = value;
	}

	protected _parent: WindowController | null = null;

	// ── Constructor ──────────────────────────────────────────────────

	/** The parent window. */
	public get parent(): IWindow | null
	{
		return this._parent;
	}

	// ── Static helpers ───────────────────────────────────────────────

	public set parent(value: IWindow | null)
	{
		if (value === this)
		{
			throw new Error('Attempted to assign self as parent!');
		}

		if (value !== null && value.context !== this._context)
		{
			this._context = value.context as IWindowContext;

			if (this._children)
			{
				for (const child of this._children)
				{
					(child as WindowController).parent = this;
				}
			}
		}

		const oldParent: IWindow | null = this._parent;

		if (this._parent !== value)
		{
			if (this._parent !== null)
			{
				this._parent.removeChild(this);
			}

			this._parent = value as WindowController | null;

			let event: WindowEvent;

			if (this._parent !== null)
			{
				const parentRect = this._parent.rectangle;
				this._parentRect.x = parentRect.x;
				this._parentRect.y = parentRect.y;
				this._parentRect.width = parentRect.width;
				this._parentRect.height = parentRect.height;
				this._previousRect.x = this._x;
				this._previousRect.y = this._y;
				this._previousRect.width = this._width;
				this._previousRect.height = this._height;
				event = WindowEvent.allocate(WindowEvent.WE_PARENT_ADDED, this, this._parent);
				this.update(this, event);
			}
			else
			{
				this._parentRect.x = 0;
				this._parentRect.y = 0;
				this._parentRect.width = 0;
				this._parentRect.height = 0;
				event = WindowEvent.allocate(WindowEvent.WE_PARENT_REMOVED, this, oldParent);
				this.update(this, event);
			}

			event.recycle();
		}
	}

	protected _children: IWindow[] | null = null;

	// ── Getters & setters ────────────────────────────────────────────

	/** Direct access to the children array. */
	public get children(): IWindow[] | null
	{
		return this._children;
	}

	protected _debug: boolean = false;

	/** Debug mode flag. */
	public get debug(): boolean
	{
		return this._debug;
	}

	public set debug(value: boolean)
	{
		this._debug = value;
	}

	protected _immediateClickMode: boolean = false;

	/** Whether immediate click mode is enabled. */
	public get immediateClickMode(): boolean
	{
		return this._immediateClickMode;
	}

	public set immediateClickMode(value: boolean)
	{
		if (value !== this._immediateClickMode)
		{
			this._immediateClickMode = value;
		}
	}

	/** Rectangle limits for the window. Created lazily. */
	public get limits(): IRectLimiter
	{
		if (!this._rectLimits)
		{
			this._rectLimits = new WindowRectLimits(this);
		}

		return this._rectLimits;
	}

	/** The host window (topmost non-desktop ancestor). */
	public get host(): IWindow
	{
		const desktop = this.desktop;

		return (this._parent === desktop) ? this : (this._parent as WindowController).host;
	}

	/** The desktop window of this context. */
	public get desktop(): IWindow | null
	{
		return this._context.getDesktopWindow();
	}

	/** Filters (delegated to graphic context). */
	public get filters(): unknown[]
	{
		return this.hasGraphicsContext() ? (this.getGraphicContext(true)!.filters ?? []) : [];
	}

	public set filters(value: unknown[])
	{
		if (this.hasGraphicsContext())
		{
			this.getGraphicContext(true)!.filters = value;
		}
	}

	/** Properties array (stub for compatibility). */
	public get properties(): unknown[]
	{
		return [];
	}

	public set properties(_value: unknown[])
	{
		// Stub: properties are handled via PropertyStruct
	}

	/** Etching (stub for compatibility). */
	public get etching(): unknown[]
	{
		return [];
	}

	public set etching(_value: unknown[])
	{
		// Stub: etching is a visual feature not needed in engine
	}

	public get x(): number
	{
		return this._x;
	}

	// ── Position & size ─────────────────────────────────────────────
	//
	// Getters MUST be redeclared here alongside setters.
	// In JavaScript, defining only a setter on a subclass prototype
	// creates a descriptor { set, get: undefined } that shadows the
	// parent's getter. The lookup stops at this prototype level and
	// returns undefined instead of continuing to WindowModel.

	public set x(value: number)
	{
		if (value !== this._x)
		{
			this.setRectangle(value, this._y, this._width, this._height);
		}
	}

	public get y(): number
	{
		return this._y;
	}

	public set y(value: number)
	{
		if (value !== this._y)
		{
			this.setRectangle(this._x, value, this._width, this._height);
		}
	}

	public get width(): number
	{
		return this._width;
	}

	public set width(value: number)
	{
		if (value !== this._width)
		{
			this.setRectangle(this._x, this._y, value, this._height);
		}
	}

	public get height(): number
	{
		return this._height;
	}

	public set height(value: number)
	{
		if (value !== this._height)
		{
			this.setRectangle(this._x, this._y, this._width, value);
		}
	}

	public get position(): { x: number; y: number }
	{
		return {x: this._x, y: this._y};
	}

	public set position(value: { x: number; y: number })
	{
		this.setRectangle(value.x, value.y, this._width, this._height);
	}

	public get rectangle(): { x: number; y: number; width: number; height: number }
	{
		return {x: this._x, y: this._y, width: this._width, height: this._height};
	}

	public set rectangle(value: { x: number; y: number; width: number; height: number })
	{
		this.setRectangle(value.x, value.y, value.width, value.height);
	}

	// ── Visual properties ────────────────────────────────────────────

	public get background(): boolean
	{
		return this._background;
	}

	public set background(value: boolean)
	{
		this._background = value;
		this._fillColor = value ? (this._fillColor | this._alphaColor) : (this._fillColor & 0xFFFFFF);
		this._hasVisualContent = this._hasVisualContent || value;
		this._context.invalidate(this, null, 1);
	}

	public get color(): number
	{
		return this._fillColor;
	}

	public set color(value: number)
	{
		this._alphaColor = value & 0xFF000000;
		this._fillColor = this._background ? value : (value & 0xFFFFFF);
		this._context.invalidate(this, null, 1);
	}

	public get alpha(): number
	{
		return this._alphaColor >>> 24;
	}

	public set alpha(value: number)
	{
		this._alphaColor = value << 24;
		this._fillColor = this._background ? (this._alphaColor | this._fillColor) : (0xFFFFFF & this._fillColor);
		this._context.invalidate(this, null, 1);
	}

	public get blend(): number
	{
		return this._blend;
	}

	public set blend(value: number)
	{
		value = value > 1 ? 1 : (value < 0 ? 0 : value);

		if (value !== this._blend)
		{
			this._blend = value;
			this._context.invalidate(this, null, 16);
		}
	}

	public get visible(): boolean
	{
		return this._visible;
	}

	public set visible(value: boolean)
	{
		if (value !== this._visible)
		{
			this._visible = value;

			if (this._graphicContext && !value)
			{
				this._graphicContext.visible = false;
			}

			this._context.invalidate(this, null, 1);

			const event = WindowEvent.allocate(WindowEvent.WE_CHILD_VISIBILITY, this, this);
			this.update(this, event);
			event.recycle();
		}
	}

	// ── Identity & type properties ──────────────────────────────────

	public get type(): number
	{
		return this._type;
	}

	public set type(value: number)
	{
		if (value !== this._type)
		{
			this._type = value;
			this._context.invalidate(this, null, 1);
		}
	}

	public get caption(): string
	{
		return this._caption;
	}

	public set caption(value: string)
	{
		value = resolveLocalizationTokens(value ?? '');

		if(value !== this._caption)
		{
			this._caption = value;
			this._context.invalidate(this, null, 1);
		}
	}

	public get tags(): string[]
	{
		if (!this._tags) this._tags = [];

		return this._tags;
	}

	public set tags(value: string[])
	{
		if (value !== null)
		{
			this._tags = value;
		}
	}

	public get mouseThreshold(): number
	{
		return this._mouseThreshold;
	}

	public set mouseThreshold(value: number)
	{
		this._mouseThreshold = value > 0xFF ? 0xFF : value;
	}

	public get state(): number
	{
		return this._state;
	}

	public set state(value: number)
	{
		if (value !== this._state)
		{
			this._state = value;
			this._context.invalidate(this, null, 8);
		}
	}

	public get style(): number
	{
		return this._style;
	}

	public set style(value: number)
	{
		if (value !== this._style)
		{
			this._style = value;

			// Propagate style to internal children
			const internalChildren: IWindow[] = [];
			this.groupChildrenWithTag(WindowController.TAG_INTERNAL, internalChildren);

			for (let i = internalChildren.length - 1; i >= 0; i--)
			{
				const child = internalChildren[i] as WindowController;

				if (child.tags.indexOf(WindowController.TAG_IGNORE_INHERITED_STYLE) === -1)
				{
					child.style = this._style;
				}
			}

			this._context.invalidate(this, null, 1);

			// Update property map from theme
			try
			{
				this._propertyMap = this._context.getWindowFactory().getThemeManager().getPropertyDefaults(this._style) ?? null;
			}
			catch (_)
			{
				// Theme manager not available
			}
		}
	}

	public get param(): number
	{
		return this._param;
	}

	public set param(value: number)
	{
		this._param = value;
	}

	public get dynamicStyle(): string
	{
		return this._dynamicStyleName;
	}

	public set dynamicStyle(value: string)
	{
		this._dynamicStyleName = value;
		this._context.invalidate(this, null, 1);
	}

	public get dynamicStyleColor(): {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	} | null
	{
		return this._dynamicStyleColorTransform;
	}

	public set dynamicStyleColor(value: {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	} | null)
	{
		this._dynamicStyleColorTransform = value;
	}

	public get clipping(): boolean
	{
		return this._clipping;
	}

	public set clipping(value: boolean)
	{
		if (value !== this._clipping)
		{
			this._clipping = value;
			this._context.invalidate(this, null, 1);
		}
	}

	public get id(): number
	{
		return this._id;
	}

	public set id(value: number)
	{
		this._id = value;
	}

	public get name(): string
	{
		return this._name;
	}

	public set name(value: string)
	{
		this._name = value;
	}

	public get offsetX(): number
	{
		return this._offsetX;
	}

	public set offsetX(value: number)
	{
		this._offsetX = value;
	}

	public get offsetY(): number
	{
		return this._offsetY;
	}

	public set offsetY(value: number)
	{
		this._offsetY = value;
	}

	/** The number of children. */
	public get numChildren(): number
	{
		return this._children ? this._children.length : 0;
	}

	// ── IGraphicContextHost ──────────────────────────────────────────

	/**
	 * Expands the parent to accommodate a child that extends beyond its bounds.
	 *
	 * @param parent - The parent window to expand
	 * @param child - The child window that may exceed bounds
	 */
	public static expandToAccommodateChild(parent: WindowController, child: IWindow): void
	{
		let offsetX: number = 0;
		let offsetY: number = 0;
		let newWidth: number = parent.width;
		let newHeight: number = parent.height;
		let changed: boolean = false;

		if (child.x < 0)
		{
			offsetX = child.x;
			newWidth = newWidth - offsetX;
			child.x = 0;
			changed = true;
		}

		if (child.right > newWidth)
		{
			newWidth = child.x + child.width;
			changed = true;
		}

		if (child.y < 0)
		{
			offsetY = child.y;
			newHeight = newHeight - offsetY;
			child.y = 0;
			changed = true;
		}

		if (child.bottom > newHeight)
		{
			newHeight = child.y + child.height;
			changed = true;
		}

		if (changed)
		{
			const savedParam: number = parent.param & (0x020000 | 0x024000);

			if (savedParam)
			{
				parent.setParamFlag(savedParam, false);
			}

			parent.setRectangle(parent.x + offsetX, parent.y + offsetY, newWidth, newHeight);

			if (offsetY !== 0 || offsetX !== 0)
			{
				const numKids: number = parent.numChildren;

				for (let i = 0; i < numKids; i++)
				{
					const kid = parent.getChildAt(i);

					if (kid)
					{
						kid.offset(-offsetX, -offsetY);
					}
				}
			}

			if (savedParam)
			{
				parent.setParamFlag(savedParam, true);
			}
		}
	}

	/**
	 * Resizes the parent window to the maximum extent of its children.
	 *
	 * @param parent - The parent window to resize
	 */
	public static resizeToAccommodateChildren(parent: WindowController): void
	{
		let maxRight: number = -2147483648;
		let maxBottom: number = -2147483648;
		let changed: boolean = false;
		const numKids: number = parent.numChildren;

		for (let i = 0; i < numKids; i++)
		{
			const child = parent.getChildAt(i);

			if (!child) continue;

			if (child.x + child.width > maxRight)
			{
				maxRight = child.x + child.width;
				changed = true;
			}

			if (child.y + child.height > maxBottom)
			{
				maxBottom = child.y + child.height;
				changed = true;
			}
		}

		if (changed)
		{
			const savedParam: number = parent.param & (0x020000 | 0x024000);

			if (savedParam)
			{
				parent.setParamFlag(savedParam, false);
			}

			parent.width = maxRight;
			parent.height = maxBottom;

			if (savedParam)
			{
				parent.setParamFlag(savedParam, true);
			}
		}
	}

	// ── Core layout methods ──────────────────────────────────────────

	/**
	 * No-op event procedure used as fallback when no procedure is set.
	 */
	private static _nullEventProc(_event: WindowEvent, _window: IWindow): void
	{
		// Intentionally empty
	}

	/** Returns whether a graphic context exists or can be created. */
	public hasGraphicsContext(): boolean
	{
		return this._graphicContext !== null || !this.testParamFlag(16);
	}

	/**
	 * Gets or lazily creates the graphic context.
	 *
	 * @param createIfMissing - Whether to create one if it does not exist
	 * @returns The graphic context, or null
	 */
	public getGraphicContext(createIfMissing: boolean): IGraphicContext | null
	{
		if (createIfMissing && !this._graphicContext)
		{
			// In the engine-only environment we do not create actual GraphicContext
			// objects. The rendering layer (client) provides these if needed.
			return null;
		}

		return this._graphicContext;
	}

	/**
	 * Sets position and/or size, dispatching appropriate events.
	 *
	 * This is the core method for all geometry changes. All individual
	 * setters for x, y, width, height delegate here.
	 *
	 * @param newX - New x position
	 * @param newY - New y position
	 * @param newWidth - New width
	 * @param newHeight - New height
	 */
	public setRectangle(newX: number, newY: number, newWidth: number, newHeight: number): void
	{
		// Apply rect limits
		if (this._rectLimits)
		{
			newHeight = Math.max(this._rectLimits.minHeight, newHeight);
			newHeight = Math.min(this._rectLimits.maxHeight, newHeight);
			newWidth = Math.max(this._rectLimits.minWidth, newWidth);
			newWidth = Math.min(this._rectLimits.maxWidth, newWidth);
		}

		let relocated: boolean = (newX !== this._x) || (newY !== this._y);
		let resized: boolean = (newWidth !== this._width) || (newHeight !== this._height);

		// Handle anchor-based repositioning on resize (param bits for resize origin)
		if (resized && !relocated)
		{
			const hAnchor: number = this._param & 0x0C0000;

			if (hAnchor === 0xC0000)
			{
				// Center horizontally
				newX = Math.floor(newX - ((newWidth - this._width) / 2));
				relocated = true;
			}
			else if (hAnchor === 0x40000)
			{
				// Anchor right
				newX = newX - (newWidth - this._width);
				relocated = true;
			}

			const vAnchor: number = this._param & 0x300000;

			if (vAnchor === 0x300000)
			{
				// Center vertically
				newY = Math.floor(newY - ((newHeight - this._height) / 2));
				relocated = true;
			}
			else if (vAnchor === 0x100000)
			{
				// Anchor bottom
				newY = newY - (newHeight - this._height);
				relocated = true;
			}
		}

		// Clamp to parent if constrained (param flag 32 = constrain to parent)
		if (this.testParamFlag(32))
		{
			if (this._parent !== null)
			{
				newX = newX < 0 ? 0 : newX;
				newY = newY < 0 ? 0 : newY;

				if (relocated)
				{
					newX = newX - ((newX + newWidth > this._parent.width) ? (newX + newWidth - this._parent.width) : 0);
					newY = newY - ((newY + newHeight > this._parent.height) ? (newY + newHeight - this._parent.height) : 0);
					relocated = (newX !== this._x) || (newY !== this._y);
				}
				else
				{
					newWidth = newWidth - ((newX + newWidth > this._parent.width) ? (newX + newWidth - this._parent.width) : 0);
					newHeight = newHeight - ((newY + newHeight > this._parent.height) ? (newY + newHeight - this._parent.height) : 0);
					resized = (newWidth !== this._width) || (newHeight !== this._height);
				}
			}
		}

		if (relocated || resized)
		{
			let event: WindowEvent;

			// Dispatch pre-events (cancelable)
			if (relocated)
			{
				event = WindowEvent.allocate(WindowEvent.WE_RELOCATE, this, null, true);
				this.update(this, event);

				if (event.isWindowOperationPrevented())
				{
					relocated = false;
				}

				event.recycle();
			}

			if (resized)
			{
				event = WindowEvent.allocate(WindowEvent.WE_RESIZE, this, null, true);
				this.update(this, event);

				if (event.isWindowOperationPrevented())
				{
					resized = false;
				}

				event.recycle();
			}

			// Apply changes
			if (relocated)
			{
				this._previousRect.x = this._x;
				this._previousRect.y = this._y;
				this._previousRect.width = this._width;
				this._previousRect.height = this._height;
				this._x = newX;
				this._y = newY;
			}

			if (resized)
			{
				this._previousRect.width = this._width;
				this._previousRect.height = this._height;
				this._width = newWidth;
				this._height = newHeight;
			}

			// Dispatch post-events
			if (relocated)
			{
				event = WindowEvent.allocate(WindowEvent.WE_RELOCATED, this, null);
				this.update(this, event);
				event.recycle();
			}

			if (resized)
			{
				event = WindowEvent.allocate(WindowEvent.WE_RESIZED, this, null);
				this.update(this, event);
				event.recycle();
			}
		}
	}

	public override invalidate(rect: { x: number; y: number; width: number; height: number } | null = null): void
	{
		this._context.invalidate(this, rect, 1);
	}

	/** Resolves the layout. Override in subclasses. */
	public resolve(): number
	{
		return 0;
	}

	// ── Build from JSON (adapted from AS3 buildFromXML) ──────────────

	/** Centers this window within its parent. */
	public center(): void
	{
		if (this._parent !== null)
		{
			this.x = Math.floor(this._parent.width / 2) - Math.floor(this._width / 2);
			this.y = Math.floor(this._parent.height / 2) - Math.floor(this._height / 2);
		}
	}

	// ── Draw buffer ──────────────────────────────────────────────────

	/**
	 * Offsets the window position by the given deltas.
	 *
	 * @param dx - Horizontal offset
	 * @param dy - Vertical offset
	 */
	public offset(dx: number, dy: number): void
	{
		this.setRectangle(this._x + dx, this._y + dy, this._width, this._height);
	}

	/**
	 * Scales the window by the given deltas (adds to current size).
	 *
	 * @param sx - Horizontal scale delta
	 * @param sy - Vertical scale delta
	 */
	public scale(sx: number, sy: number): void
	{
		this.setRectangle(this._x, this._y, this._width + sx, this._height + sy);
	}

	// ── Core event routing ───────────────────────────────────────────

	/**
	 * Builds child windows from a JSON layout definition.
	 *
	 * @param layout - The JSON layout object
	 * @param namedWindows - Optional map to collect named windows
	 * @returns `true` if construction succeeded
	 */
	public buildFromJSON(layout: Record<string, unknown>, namedWindows: Map<string, IWindow> | null = null): boolean
	{
		try
		{
			const parser = this._context.getWindowParser();

			return parser.parseAndConstruct(layout, this, namedWindows) !== null;
		}
		catch (_)
		{
			return false;
		}
	}

	// ── Coordinate conversion ────────────────────────────────────────

	/**
	 * Returns the draw buffer for rendering.
	 * If this window shares its parent's graphic context (param flag 16),
	 * delegates to the parent.
	 */
	public fetchDrawBuffer(): unknown
	{
		if (this.testParamFlag(16))
		{
			return this._parent !== null ? this._parent.fetchDrawBuffer() : null;
		}

		const gc = this.getGraphicContext(true);

		return gc ? gc.fetchDrawBuffer() : null;
	}

	/**
	 * Gets the draw region for this window.
	 *
	 * @param out - The rectangle to populate
	 */
	public getDrawRegion(out: { x: number; y: number; width: number; height: number }): void
	{
		if (!this.testParamFlag(16))
		{
			out.x = 0;
			out.y = 0;
			out.width = this._width;
			out.height = this._height;
		}
		else
		{
			if (this._parent !== null)
			{
				this._parent.getDrawRegion(out);
				out.x = out.x + this._x;
				out.y = out.y + this._y;
				out.width = this._width;
				out.height = this._height;
			}
			else
			{
				out.x = 0;
				out.y = 0;
				out.width = 0;
				out.height = 0;
			}
		}
	}

	/**
	 * Routes an event through the window procedure and event listeners,
	 * then handles built-in state transitions for mouse and window events.
	 *
	 * @param source - The originating window controller
	 * @param event - The event to route
	 * @returns `true` if the event was handled
	 */
	public update(source: WindowController, event: WindowEvent): boolean
	{
		// Param flag 9 = ignore events
		if (!this.testParamFlag(9))
		{
			const proc = this.procedure;

			if (proc)
			{
				proc(event, this);
			}

			if (this._disposed)
			{
				return true;
			}

			if (!event.isWindowOperationPrevented())
			{
				if (this.hasEventListener(event.type))
				{
					this._eventDispatcher!.dispatchEvent(event);

					if (this._disposed)
					{
						return true;
					}
				}
			}

			if (event.cancelable)
			{
				if (event.isWindowOperationPrevented())
				{
					return true;
				}
			}
		}

		// Handle mouse events
		if (event instanceof WindowMouseEvent)
		{
			switch (event.type)
			{
				case WindowMouseEvent.DOWN:
					if (this.activate())
					{
						if (event.cancelable)
						{
							event.preventDefault();
						}
					}

					if (this.disposed) return true;

					this.setStateFlag(16, true);

					// Mouse services: listener, dragger, scaler
					try
					{
						const services = this._context.getWindowServices();

						// Mouse listener
						const mouseListener = services.getMouseListenerService();
						mouseListener.begin(this);
						mouseListener.eventTypes.push(WindowMouseEvent.UP);
						mouseListener.areaLimit = 3;

						// Drag initiation: walk up to find DRAGGING_TARGET
						if (this.testParamFlag(WindowParam.MOUSE_DRAGGING_TRIGGER))
						{
							let target: IWindow | null = this;

							while (target !== null)
							{
								if (target.testParamFlag(WindowParam.MOUSE_DRAGGING_TARGET))
								{
									services.getMouseDraggingService().begin(target);
									break;
								}

								target = target.parent;
							}
						}

						// Scale initiation: walk up to find SCALING_TARGET
						if ((this._param & WindowParam.MOUSE_SCALING_TRIGGER) > 0)
						{
							let target: IWindow | null = this;

							while (target !== null)
							{
								if (target.testParamFlag(WindowParam.MOUSE_SCALING_TARGET))
								{
									services.getMouseScalingService().begin(target, this._param & WindowParam.MOUSE_SCALING_TRIGGER);
									break;
								}

								target = target.parent;
							}
						}
					}
					catch (_)
					{
						// Services may not be available
					}
					break;

				case WindowMouseEvent.UP:
					if (this.testStateFlag(16))
					{
						this.setStateFlag(16, false);
					}

					try
					{
						const services = this._context.getWindowServices();
						services.getMouseListenerService().end(this);

						// End drag
						if (this.testParamFlag(WindowParam.MOUSE_DRAGGING_TARGET))
						{
							services.getMouseDraggingService().end(this);
						}

						// End scale
						if (this.testParamFlag(WindowParam.MOUSE_SCALING_TARGET))
						{
							services.getMouseScalingService().end(this);
						}
					}
					catch (_)
					{
						// Services may not be available
					}
					break;

				case WindowMouseEvent.OUT:
					if (this.testStateFlag(4))
					{
						this.setStateFlag(4, false);
					}

					if (this.testStateFlag(16))
					{
						this.setStateFlag(16, false);
					}
					break;

				case WindowMouseEvent.OVER:
					if (!this.testStateFlag(4))
					{
						this.setStateFlag(4, true);
					}
					break;

				case WindowMouseEvent.WHEEL:
					return false;
			}
		}
		else if (event instanceof WindowEvent)
		{
			let childEvent: WindowEvent;

			switch (event.type)
			{
				case WindowEvent.WE_RESIZED:
					if (source === this)
					{
						// Compute invalidation region
						const tempRect = WindowController._tempRect;
						tempRect.x = Math.min(this._x, this._previousRect.x);
						tempRect.y = Math.min(this._y, this._previousRect.y);
						const tempRight = Math.max(this._x + this._width, this._previousRect.x + this._previousRect.width);
						const tempBottom = Math.max(this._y + this._height, this._previousRect.y + this._previousRect.height);
						tempRect.width = tempRight - tempRect.x;
						tempRect.height = tempBottom - tempRect.y;
						tempRect.x -= this._x;
						tempRect.y -= this._y;
						this._context.invalidate(this, tempRect, 2);

						// Notify children
						childEvent = WindowEvent.allocate(WindowEvent.WE_PARENT_RESIZED, this, null);
						this.notifyChildren(childEvent);
						childEvent.recycle();

						// Scale relative to parent if param flags indicate
						if (this.testParamFlag(192, 192) || this.testParamFlag(0x0C00, 0x0C00))
						{
							this.updateScaleRelativeToParent();
						}

						// Propagate to parent
						if (this._parent !== null)
						{
							const savedParam = this._param;
							this._param = this._param & 0xFFFFF33F;

							if (this.testParamFlag(0x400000))
							{
								this._parent.width = this._parent.width + (this._width - this._previousRect.width);
							}

							if (this.testParamFlag(0x800000))
							{
								this._parent.height = this._parent.height + (this._height - this._previousRect.height);
							}

							this._param = savedParam;

							childEvent = WindowEvent.allocate(WindowEvent.WE_CHILD_RESIZED, this._parent, this);
							this._parent.update(this, childEvent);
							childEvent.recycle();
						}
					}
					break;

				case WindowEvent.WE_RELOCATED:
					if (source === this)
					{
						// Compute invalidation region
						const tempRectR = WindowController._tempRect;
						tempRectR.x = Math.min(this._x, this._previousRect.x);
						tempRectR.y = Math.min(this._y, this._previousRect.y);
						const tempRightR = Math.max(this._x + this._width, this._previousRect.x + this._previousRect.width);
						const tempBottomR = Math.max(this._y + this._height, this._previousRect.y + this._previousRect.height);
						tempRectR.width = tempRightR - tempRectR.x;
						tempRectR.height = tempBottomR - tempRectR.y;
						tempRectR.x -= this._x;
						tempRectR.y -= this._y;
						this._context.invalidate(this, tempRectR, 4);

						// Notify children
						childEvent = WindowEvent.allocate(WindowEvent.WE_PARENT_RELOCATED, this, null);
						this.notifyChildren(childEvent);
						childEvent.recycle();

						// Propagate to parent
						if (this._parent !== null)
						{
							childEvent = WindowEvent.allocate(WindowEvent.WE_CHILD_RELOCATED, this._parent, this);
							this._parent.update(this, childEvent);
							childEvent.recycle();
						}
					}
					break;

				case WindowEvent.WE_ACTIVATED:
					if (source === this)
					{
						childEvent = WindowEvent.allocate(WindowEvent.WE_PARENT_ACTIVATED, this, null);
						this.notifyChildren(childEvent);
						childEvent.recycle();

						if (this._parent !== null)
						{
							childEvent = WindowEvent.allocate(WindowEvent.WE_CHILD_ACTIVATED, this._parent, this);
							this._parent.update(this, childEvent);
							childEvent.recycle();
						}
					}
					break;

				case WindowEvent.WE_PARENT_ADDED:
					if (this.testParamFlag(192, 192) || this.testParamFlag(0x0C00, 0x0C00))
					{
						this.updateScaleRelativeToParent();
					}

					this._context.invalidate(this, null, 1);
					break;

				case WindowEvent.WE_PARENT_RESIZED:
					if (this._parent)
					{
						this._parent.getRegionProperties(null, this._parentRect);
					}

					this.updateScaleRelativeToParent();
					break;

				case WindowEvent.WE_CHILD_ADDED:
					if (this.testParamFlag(147456))
					{
						this.scaleToAccommodateChildren();
					}
					else if (this.testParamFlag(0x20000))
					{
						WindowController.expandToAccommodateChild(this, event.related!);
					}
					break;

				case WindowEvent.WE_CHILD_REMOVED:
					if (this.testParamFlag(147456))
					{
						this.scaleToAccommodateChildren();
					}
					break;

				case WindowEvent.WE_CHILD_ACTIVATED:
					this.activate();
					break;

				case WindowEvent.WE_CHILD_RESIZED:
					if (this.testParamFlag(147456))
					{
						this.scaleToAccommodateChildren();
					}
					else if (this.testParamFlag(0x20000))
					{
						WindowController.expandToAccommodateChild(this, event.related!);
					}
					break;

				case WindowEvent.WE_CHILD_RELOCATED:
					if (this.testParamFlag(147456))
					{
						this.scaleToAccommodateChildren();
					}
					else if (this.testParamFlag(0x20000))
					{
						WindowController.expandToAccommodateChild(this, event.related!);
					}
					break;

				case WindowEvent.WE_CHILD_VISIBILITY:
					if (source === this)
					{
						if (this._parent !== null)
						{
							childEvent = WindowEvent.allocate(WindowEvent.WE_CHILD_VISIBILITY, this._parent, this);
							this._parent.update(this, childEvent);
							childEvent.recycle();
						}
					}
					break;
			}
		}

		return true;
	}

	/**
	 * Gets the local position of this window.
	 *
	 * @param out - Point to populate
	 */
	public getLocalPosition(out: { x: number; y: number }): void
	{
		out.x = this._x;
		out.y = this._y;
	}

	/**
	 * Gets the local rectangle of this window.
	 *
	 * @param out - Rectangle to populate
	 */
	public getLocalRectangle(out: { x: number; y: number; width: number; height: number }): void
	{
		out.x = this._x;
		out.y = this._y;
		out.width = this._width;
		out.height = this._height;
	}

	/**
	 * Tests whether a local-space point is within this window's bounds.
	 *
	 * @param point - The point in local coordinates
	 * @returns `true` if the point is inside the window
	 */
	public hitTestLocalPoint(point: { x: number; y: number }): boolean
	{
		return (
			point.x >= this._x &&
			point.x < (this._x + this._width) &&
			point.y >= this._y &&
			point.y < (this._y + this._height)
		);
	}

	/**
	 * Tests whether a local-space rectangle intersects this window's bounds.
	 *
	 * @param rect - The rectangle in local coordinates
	 * @returns `true` if the rectangles intersect
	 */
	public hitTestLocalRectangle(rect: { x: number; y: number; width: number; height: number }): boolean
	{
		return !(
			rect.x >= this._x + this._width ||
			rect.x + rect.width <= this._x ||
			rect.y >= this._y + this._height ||
			rect.y + rect.height <= this._y
		);
	}

	/**
	 * Gets the global position of this window by accumulating parent positions.
	 *
	 * @param out - Point to populate
	 */
	public getGlobalPosition(out: { x: number; y: number }): void
	{
		if (this._parent !== null)
		{
			this._parent.getGlobalPosition(out);
			out.x = out.x + this._x;
			out.y = out.y + this._y;
		}
		else
		{
			out.x = this._x;
			out.y = this._y;
		}
	}

	/**
	 * Sets the position so that the global position matches the given point.
	 *
	 * @param point - The desired global position
	 */
	public setGlobalPosition(point: { x: number; y: number }): void
	{
		const current: { x: number; y: number } = {x: 0, y: 0};

		if (this._parent !== null)
		{
			this._parent.getGlobalPosition(current);
			current.x = current.x + this._x;
			current.y = current.y + this._y;
		}
		else
		{
			current.x = this._x;
			current.y = this._y;
		}

		this.x = this._x + (point.x - current.x);
		this.y = this._y + (point.y - current.y);
	}

	/**
	 * Gets the global rectangle of this window.
	 *
	 * @param out - Rectangle to populate
	 */
	public getGlobalRectangle(out: { x: number; y: number; width: number; height: number }): void
	{
		if (this._parent !== null)
		{
			this._parent.getGlobalRectangle(out);
			out.x = out.x + this._x;
			out.y = out.y + this._y;
		}
		else
		{
			out.x = this._x;
			out.y = this._y;
		}

		out.width = this._width;
		out.height = this._height;
	}

	/**
	 * Sets position and size so that the global rectangle matches.
	 *
	 * @param rect - The desired global rectangle
	 */
	public setGlobalRectangle(rect: { x: number; y: number; width: number; height: number }): void
	{
		const current: { x: number; y: number } = {x: 0, y: 0};

		if (this._parent !== null)
		{
			this._parent.getGlobalPosition(current);
			current.x = current.x + this._x;
			current.y = current.y + this._y;
		}
		else
		{
			current.x = this._x;
			current.y = this._y;
		}

		this.setRectangle(
			this._x + (rect.x - current.x),
			this._y + (rect.y - current.y),
			rect.width,
			rect.height
		);
	}

	/**
	 * Tests whether a global-space point is within this window's global bounds.
	 *
	 * @param point - The point in global coordinates
	 * @returns `true` if the point is inside
	 */
	public hitTestGlobalPoint(point: { x: number; y: number }): boolean
	{
		const rect: { x: number; y: number; width: number; height: number } = {x: 0, y: 0, width: 0, height: 0};
		this.getGlobalRectangle(rect);

		return (
			point.x >= rect.x &&
			point.x < rect.x + rect.width &&
			point.y >= rect.y &&
			point.y < rect.y + rect.height
		);
	}

	/**
	 * Tests whether a global-space rectangle intersects this window's global bounds.
	 *
	 * @param rect - The rectangle in global coordinates
	 * @returns `true` if they intersect
	 */
	public hitTestGlobalRectangle(rect: { x: number; y: number; width: number; height: number }): boolean
	{
		const global: { x: number; y: number; width: number; height: number } = {x: 0, y: 0, width: 0, height: 0};
		this.getGlobalRectangle(global);

		return !(
			rect.x >= global.x + global.width ||
			rect.x + rect.width <= global.x ||
			rect.y >= global.y + global.height ||
			rect.y + rect.height <= global.y
		);
	}

	/**
	 * Converts a point from local space to global space.
	 *
	 * @param point - The point to convert (modified in place)
	 */
	public convertPointFromLocalToGlobalSpace(point: { x: number; y: number }): void
	{
		const localX: number = point.x;
		const localY: number = point.y;

		if (this._parent === null)
		{
			point.x = this._x;
			point.y = this._y;
		}
		else
		{
			this._parent.getGlobalPosition(point);
			point.x = point.x + this._x;
			point.y = point.y + this._y;
		}

		point.x = point.x + localX;
		point.y = point.y + localY;
	}

	// ── Mouse methods ────────────────────────────────────────────────

	/**
	 * Converts a point from global space to local space.
	 *
	 * @param point - The point to convert (modified in place)
	 */
	public convertPointFromGlobalToLocalSpace(point: { x: number; y: number }): void
	{
		const globalX: number = point.x;
		const globalY: number = point.y;

		if (this._parent === null)
		{
			point.x = this._x;
			point.y = this._y;
		}
		else
		{
			this._parent.getGlobalPosition(point);
			point.x = point.x + this._x;
			point.y = point.y + this._y;
		}

		point.x = globalX - point.x;
		point.y = globalY - point.y;
	}

	/** Returns the vertical scale relative to the initial size. */
	public resolveVerticalScale(): number
	{
		return this._height / this._initialRect.height;
	}

	/** Returns the horizontal scale relative to the initial size. */
	public resolveHorizontalScale(): number
	{
		return this._width / this._initialRect.width;
	}

	// ── Hierarchy search ─────────────────────────────────────────────

	/**
	 * Gets the relative mouse position within this window.
	 *
	 * @param out - Point to populate with relative coordinates
	 */
	public getRelativeMousePosition(out: { x: number; y: number }): void
	{
		this.getGlobalPosition(out);
		const desktop = this._context.getDesktopWindow();

		if (desktop)
		{
			out.x = (desktop as WindowController)._x - out.x;
			out.y = (desktop as WindowController)._y - out.y;
		}
	}

	// ── State flag operations ────────────────────────────────────────

	/**
	 * Gets the absolute mouse position from the desktop.
	 *
	 * @param out - Point to populate with absolute coordinates
	 */
	public getAbsoluteMousePosition(out: { x: number; y: number }): void
	{
		const desktop = this._context.getDesktopWindow();

		if (desktop)
		{
			out.x = (desktop as WindowController)._x;
			out.y = (desktop as WindowController)._y;
		}
	}

	/**
	 * Gets the mouse interaction region for this window.
	 *
	 * @param out - Rectangle to populate
	 */
	public getMouseRegion(out: { x: number; y: number; width: number; height: number }): void
	{
		this.getGlobalRectangle(out);

		if (out.width < 0) out.width = 0;
		if (out.height < 0) out.height = 0;

		// If sharing parent graphic context, clip to parent mouse region
		if (this.testParamFlag(16) && this._parent !== null)
		{
			const parentRegion: { x: number; y: number; width: number; height: number } = {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};
			(this._parent as IWindow).getMouseRegion(parentRegion);

			if (out.x < parentRegion.x) out.x = parentRegion.x;
			if (out.y < parentRegion.y) out.y = parentRegion.y;

			const outRight = out.x + out.width;
			const outBottom = out.y + out.height;
			const parentRight = parentRegion.x + parentRegion.width;
			const parentBottom = parentRegion.y + parentRegion.height;

			if (outRight > parentRight) out.width = parentRight - out.x;
			if (outBottom > parentBottom) out.height = parentBottom - out.y;
		}
	}

	/**
	 * Finds an ancestor (or self) by name.
	 *
	 * @param name - The name to search for
	 * @returns The matching window, or null
	 */
	public findParentByName(name: string): IWindow | null
	{
		if (this._name === name) return this;

		if (this._parent !== null)
		{
			if (this._parent.name === name) return this._parent;

			return this._parent.findParentByName(name);
		}

		return null;
	}

	/**
	 * Gets whether a state flag is set.
	 *
	 * @param flag - The flag bitmask
	 * @returns `true` if the flag is set
	 */
	public getStateFlag(flag: number): boolean
	{
		return (this._state & flag) !== 0;
	}

	/**
	 * Sets or clears a state flag.
	 *
	 * @param flag - The flag bitmask
	 * @param value - Whether to set (true) or clear (false)
	 */
	public setStateFlag(flag: number, value: boolean = true): void
	{
		const previous: number = this._state;

		this._state = value ? (this._state | flag) : (this._state & ~flag);

		if (this._state !== previous)
		{
			// Apply dynamic style offsets for hover (4) or pressed (16)
			if (this._dynamicStyleName && (flag === 4 || flag === 16))
			{
				this.applyDynamicStyleForState();
			}

			this._context.invalidate(this, null, 8);
		}
	}

	/**
	 * Gets whether a style flag is set.
	 *
	 * @param flag - The flag bitmask
	 * @returns `true` if the flag is set
	 */
	public getStyleFlag(flag: number): boolean
	{
		return (this._style & flag) !== 0;
	}

	/**
	 * Sets or clears a style flag.
	 *
	 * @param flag - The flag bitmask
	 * @param value - Whether to set (true) or clear (false)
	 */
	public setStyleFlag(flag: number, value: boolean = true): void
	{
		const previous: number = this._style;

		this._style = value ? (this._style | flag) : (this._style & ~flag);

		if (this._style !== previous)
		{
			// Propagate to internal children
			const internalChildren: IWindow[] = [];
			this.groupChildrenWithTag(WindowController.TAG_INTERNAL, internalChildren);

			for (let i = internalChildren.length - 1; i >= 0; i--)
			{
				const child = internalChildren[i] as WindowController;

				if (child.tags.indexOf(WindowController.TAG_IGNORE_INHERITED_STYLE) === -1)
				{
					child.style = this._style;
				}
			}

			this._context.invalidate(this, null, 1);
		}
	}

	// ── Window state operations ──────────────────────────────────────

	/**
	 * Gets whether a param flag is set.
	 *
	 * @param flag - The flag bitmask
	 * @returns `true` if the flag is set
	 */
	public getParamFlag(flag: number): boolean
	{
		return (this._param & flag) !== 0;
	}

	/**
	 * Sets or clears a param flag.
	 *
	 * @param flag - The flag bitmask
	 * @param value - Whether to set (true) or clear (false)
	 */
	public setParamFlag(flag: number, value: boolean = true): void
	{
		const previous: number = this._param;

		this._param = value ? (this._param | flag) : (this._param & ~flag);

		if (this._param !== previous)
		{
			// Handle graphic context creation/destruction based on param flag 0x10
			if (!(this._param & 0x10))
			{
				if (!this._graphicContext)
				{
					// Graphic context needed but not present
					this._context.invalidate(this, null, 1);
				}
			}
			else
			{
				if (this._graphicContext)
				{
					this._context.invalidate(this, null, 1);
				}
			}
		}
	}

	/**
	 * Activates this window.
	 *
	 * @returns `true` if activation succeeded
	 */
	public activate(): boolean
	{
		let event = WindowEvent.allocate(WindowEvent.WE_ACTIVATE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(1, true);

		event = WindowEvent.allocate(WindowEvent.WE_ACTIVATED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Deactivates this window.
	 *
	 * @returns `true` if deactivation succeeded
	 */
	public deactivate(): boolean
	{
		if (!this.getStateFlag(1))
		{
			return true;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_DEACTIVATE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(1, false);

		event = WindowEvent.allocate(WindowEvent.WE_DEACTIVATED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Minimizes this window.
	 *
	 * @returns `true` if minimization succeeded
	 */
	public minimize(): boolean
	{
		if (this._state & 0x40)
		{
			return false;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_MINIMIZE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(64, true);

		event = WindowEvent.allocate(WindowEvent.WE_MINIMIZED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Maximizes this window.
	 *
	 * @returns `true` if maximization succeeded
	 */
	public maximize(): boolean
	{
		if (this._state & 0x40)
		{
			return false;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_MAXIMIZE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(64, true);

		event = WindowEvent.allocate(WindowEvent.WE_MAXIMIZED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Restores this window from minimized/maximized state.
	 *
	 * @returns `true` if restoration succeeded
	 */
	public restore(): boolean
	{
		let event = WindowEvent.allocate(WindowEvent.WE_RESTORE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(64, false);

		event = WindowEvent.allocate(WindowEvent.WE_RESTORED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Locks this window.
	 *
	 * @returns `true` if locking succeeded
	 */
	public lock(): boolean
	{
		if (this.getStateFlag(64))
		{
			return true;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_LOCK, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(64, true);

		event = WindowEvent.allocate(WindowEvent.WE_LOCKED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Unlocks this window.
	 *
	 * @returns `true` if unlocking succeeded
	 */
	public unlock(): boolean
	{
		if (!this.getStateFlag(64))
		{
			return true;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_UNLOCK, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(64, false);

		event = WindowEvent.allocate(WindowEvent.WE_UNLOCKED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Enables this window (clears disabled state).
	 *
	 * @returns `true` if enabling succeeded
	 */
	public enable(): boolean
	{
		if (!this.getStateFlag(32))
		{
			return true;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_ENABLE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(32, false);

		event = WindowEvent.allocate(WindowEvent.WE_ENABLED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	/**
	 * Disables this window.
	 *
	 * @returns `true` if disabling succeeded
	 */
	public disable(): boolean
	{
		if (this.getStateFlag(32))
		{
			return true;
		}

		let event = WindowEvent.allocate(WindowEvent.WE_DISABLE, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		this.setStateFlag(32, true);

		event = WindowEvent.allocate(WindowEvent.WE_DISABLED, this, null);
		this.update(this, event);
		event.recycle();

		return true;
	}

	// ── Event listener management ────────────────────────────────────

	/** Returns whether this window is enabled (not disabled). */
	public isEnabled(): boolean
	{
		return !this.getStateFlag(32);
	}

	/**
	 * Destroys this window, dispatching destroy events and disposing.
	 *
	 * @returns `true` if destruction succeeded
	 */
	public destroy(): boolean
	{
		if (this._state === 0x40000000)
		{
			return true;
		}

		this._state = 0x40000000;

		let event = WindowEvent.allocate(WindowEvent.WE_DESTROY, this, null);
		this.update(this, event);

		if (event.isDefaultPrevented())
		{
			event.recycle();

			return false;
		}

		event.recycle();

		event = WindowEvent.allocate(WindowEvent.WE_DESTROYED, this, null);
		this.update(this, event);
		event.recycle();

		this.dispose();

		return true;
	}

	/**
	 * Registers an event listener.
	 *
	 * @param type - The event type string
	 * @param listener - The callback function
	 * @param priority - Listener priority (higher = first)
	 */
	public addEventListener(type: string, listener: Function, priority: number = 0): void
	{
		if (!this._disposed)
		{
			if (!this._eventDispatcher)
			{
				this._eventDispatcher = new WindowEventDispatcher();
			}

			this._eventDispatcher.addEventListener(type, listener, priority);
		}
	}

	// ── Property management ──────────────────────────────────────────

	/**
	 * Returns whether any listener is registered for the given type.
	 *
	 * @param type - The event type string
	 * @returns `true` if a listener exists
	 */
	public hasEventListener(type: string): boolean
	{
		if (this._disposed || !this._eventDispatcher) return false;

		return this._eventDispatcher.hasEventListener(type);
	}

	/**
	 * Removes a previously registered event listener.
	 *
	 * @param type - The event type string
	 * @param listener - The callback function to remove
	 */
	public removeEventListener(type: string, listener: Function): void
	{
		if (!this._disposed && this._eventDispatcher)
		{
			this._eventDispatcher.removeEventListener(type, listener);
		}
	}

	// ── Child utility methods ────────────────────────────────────────

	/**
	 * Creates a property struct with a custom value.
	 *
	 * @param key - The property key
	 * @param value - The property value
	 * @returns A new PropertyStruct
	 */
	public createProperty(key: string, value: unknown): PropertyStruct
	{
		if (this._propertyMap)
		{
			const defaultValue = this._propertyMap.getValue(key);

			if (defaultValue instanceof PropertyStruct)
			{
				const cloned = defaultValue.clone();
				cloned.value = value;

				return cloned;
			}
		}

		return new PropertyStruct(key, value);
	}

	/**
	 * Gets the default property for the given key from the theme.
	 *
	 * @param key - The property key
	 * @returns The default PropertyStruct, or null
	 */
	public getDefaultProperty(key: string): PropertyStruct | null
	{
		if (this._propertyMap)
		{
			const value = this._propertyMap.getValue(key);

			if (value instanceof PropertyStruct)
			{
				return value;
			}
		}

		return null;
	}

	/**
	 * Enables or disables children by name.
	 *
	 * @param doEnable - Whether to enable (true) or disable (false)
	 * @param exceptions - Names of children to target
	 */
	public enableChildren(doEnable: boolean, exceptions: string[]): void
	{
		for (const name of exceptions)
		{
			const child = this.findChildByName(name);

			if (child !== null)
			{
				if (doEnable)
				{
					child.enable();
				}
				else
				{
					child.disable();
				}
			}
		}
	}

	// ── Child management ─────────────────────────────────────────────

	/**
	 * Activates or deactivates children by name.
	 *
	 * @param doActivate - Whether to activate (true) or deactivate (false)
	 * @param exceptions - Names of children to target
	 */
	public activateChildren(doActivate: boolean, exceptions: string[]): void
	{
		for (const name of exceptions)
		{
			const child = this.findChildByName(name);

			if (child !== null)
			{
				if (doActivate)
				{
					child.activate();
				}
				else
				{
					child.deactivate();
				}
			}
		}
	}

	/**
	 * Sets visibility of children by name.
	 *
	 * @param isVisible - Whether to make visible (true) or hide (false)
	 * @param exceptions - Names of children to target
	 */
	public setVisibleChildren(isVisible: boolean, exceptions: string[]): void
	{
		for (const name of exceptions)
		{
			const child = this.findChildByName(name);

			if (child !== null)
			{
				child.visible = isVisible;
			}
		}
	}

	/**
	 * Adds a child window. Removes it from its previous parent first.
	 *
	 * @param child - The window to add
	 * @returns The added window
	 */
	public addChild(child: IWindow): IWindow
	{
		const wc = child as WindowController;

		if (wc.parent !== null)
		{
			(wc.parent as WindowController).removeChild(wc);
		}

		if (!this._children)
		{
			this._children = [];
		}

		this._children.push(wc);
		wc.parent = this;

		const event = WindowEvent.allocate(WindowEvent.WE_CHILD_ADDED, this, child);
		this.update(this, event);
		event.recycle();

		return child;
	}

	/**
	 * Adds a child window at a specific index.
	 *
	 * @param child - The window to add
	 * @param index - The position to insert at
	 * @returns The added window
	 */
	public addChildAt(child: IWindow, index: number): IWindow
	{
		const wc = child as WindowController;

		if (wc.parent !== null)
		{
			(wc.parent as WindowController).removeChild(wc);
		}

		if (!this._children)
		{
			this._children = [];
		}

		this._children.splice(index, 0, wc);
		wc.parent = this;

		const event = WindowEvent.allocate(WindowEvent.WE_CHILD_ADDED, this, child);
		this.update(this, event);
		event.recycle();

		return child;
	}

	/**
	 * Gets the child at the given index.
	 *
	 * @param index - The child index
	 * @returns The child window, or null if out of range
	 */
	public getChildAt(index: number): IWindow | null
	{
		if (!this._children) return null;

		return (index < this._children.length && index >= 0) ? this._children[index] : null;
	}

	/**
	 * Gets a child by its ID.
	 *
	 * @param id - The child ID
	 * @returns The matching child, or null
	 */
	public getChildByID(id: number): IWindow | null
	{
		if (this._children)
		{
			for (const child of this._children)
			{
				if (child.id === id) return child;
			}
		}

		return null;
	}

	/**
	 * Gets a direct child by name (shallow search).
	 *
	 * @param name - The child name
	 * @returns The matching child, or null
	 */
	public getChildByName(name: string): IWindow | null
	{
		if (this._children)
		{
			for (const child of this._children)
			{
				if (child.name === name) return child;
			}
		}

		return null;
	}

	/**
	 * Finds a child by name recursively (deep search).
	 *
	 * @param name - The child name to find
	 * @returns The matching window, or null
	 */
	public findChildByName(name: string): IWindow | null
	{
		if (this._children)
		{
			// First pass: direct children
			for (const child of this._children)
			{
				if (child.name === name) return child;
			}

			// Second pass: recurse
			for (const child of this._children)
			{
				const found = (child as WindowController).findChildByName(name);

				if (found) return found;
			}
		}

		return null;
	}

	/**
	 * Gets a direct child by tag (shallow search).
	 *
	 * @param tag - The tag to search for
	 * @returns The matching child, or null
	 */
	public getChildByTag(tag: string): IWindow | null
	{
		if (this._children)
		{
			for (const child of this._children)
			{
				if (child.tags.indexOf(tag) > -1) return child;
			}
		}

		return null;
	}

	/**
	 * Finds a child by tag recursively (deep search).
	 *
	 * @param tag - The tag to search for
	 * @returns The matching window, or null
	 */
	public findChildByTag(tag: string): IWindow | null
	{
		if (this._tags && this._tags.indexOf(tag) > -1)
		{
			return this;
		}

		let found = this.getChildByTag(tag) as WindowController | null;

		if (found === null && this._children)
		{
			for (const child of this._children)
			{
				found = (child as WindowController).findChildByTag(tag) as WindowController | null;

				if (found !== null) break;
			}
		}

		return found;
	}

	/**
	 * Gets the index of a child window.
	 *
	 * @param child - The child to find
	 * @returns The index, or -1 if not found
	 */
	public getChildIndex(child: IWindow): number
	{
		return this._children ? this._children.indexOf(child) : -1;
	}

	/**
	 * Removes a child window.
	 *
	 * @param child - The window to remove
	 * @returns The removed window, or null if not found
	 */
	public removeChild(child: IWindow): IWindow | null
	{
		if (!this._children) return null;

		const index: number = this._children.indexOf(child);

		if (index < 0) return null;

		this._children.splice(index, 1);
		child.parent = null;

		const event = WindowEvent.allocate(WindowEvent.WE_CHILD_REMOVED, this, child);
		this.update(this, event);
		event.recycle();

		return child;
	}

	/**
	 * Removes a child at the given index.
	 *
	 * @param index - The index of the child to remove
	 * @returns The removed window, or null
	 */
	public removeChildAt(index: number): IWindow | null
	{
		const child = this.getChildAt(index);

		return child ? this.removeChild(child) : null;
	}

	/**
	 * Sets the display index of a child window.
	 *
	 * @param child - The child to reindex
	 * @param index - The new index
	 */
	public setChildIndex(child: IWindow, index: number): void
	{
		if (!this._children) return;

		const currentIndex: number = this._children.indexOf(child);

		if (currentIndex > -1 && index !== currentIndex)
		{
			this._children.splice(currentIndex, 1);
			this._children.splice(index, 0, child);
		}
	}

	/**
	 * Swaps the positions of two child windows.
	 *
	 * @param childA - First child
	 * @param childB - Second child
	 */
	public swapChildren(childA: IWindow, childB: IWindow): void
	{
		if (!this._children) return;
		if (!childA || !childB || childA === childB) return;

		let indexA: number = this._children.indexOf(childA);
		let indexB: number = this._children.indexOf(childB);

		if (indexA < 0 || indexB < 0) return;

		// Ensure indexA < indexB for correct splicing
		if (indexB < indexA)
		{
			const temp = childA;
			childA = childB;
			childB = temp;
			const tempIdx = indexA;
			indexA = indexB;
			indexB = tempIdx;
		}

		this._children.splice(indexB, 1);
		this._children.splice(indexA, 1);
		this._children.splice(indexA, 0, childB);
		this._children.splice(indexB, 0, childA);
	}

	/**
	 * Swaps two children by their indices.
	 *
	 * @param indexA - First child index
	 * @param indexB - Second child index
	 */
	public swapChildrenAt(indexA: number, indexB: number): void
	{
		if (!this._children) return;

		const childA = this._children[indexA];
		const childB = this._children[indexB];

		if (childA && childB)
		{
			this.swapChildren(childA, childB);
		}
	}

	/**
	 * Collects children matching an ID into the result array.
	 *
	 * @param id - The ID to match
	 * @param result - The array to populate
	 * @param depth - How many levels deep to search (0 = this level only, -1 = infinite)
	 * @returns The number of matches found
	 */
	public groupChildrenWithID(id: number, result: IWindow[], depth: number = 0): number
	{
		if (!this._children) return 0;

		let count: number = 0;

		for (const child of this._children)
		{
			if (child.id === id)
			{
				result.push(child);
				count++;
			}

			if (depth > 0 || depth < 0)
			{
				count += (child as WindowController).groupChildrenWithID(id, result, depth - 1);
			}
		}

		return count;
	}

	/**
	 * Collects children matching a tag into the result array.
	 *
	 * @param tag - The tag to match
	 * @param result - The array to populate
	 * @param depth - How many levels deep to search (0 = this level only, -1 = infinite)
	 * @returns The number of matches found
	 */
	public groupChildrenWithTag(tag: string, result: IWindow[], depth: number = 0): number
	{
		if (!this._children) return 0;

		let count: number = 0;

		for (const child of this._children)
		{
			if (child.tags.indexOf(tag) > -1)
			{
				result.push(child);
				count++;
			}

			if (depth > 0 || depth < 0)
			{
				count += (child as WindowController).groupChildrenWithTag(tag, result, depth - 1);
			}
		}

		return count;
	}

	/**
	 * Populates the window with an array of child windows.
	 *
	 * @param children - The children to add
	 */
	public populate(children: IWindow[]): void
	{
		if (!this._children)
		{
			this._children = [];
		}

		for (const child of children)
		{
			const wc = child as WindowController;

			if (wc && wc.parent !== this)
			{
				this._children.push(wc);
				wc.parent = this;
			}
		}
	}

	// ── Region properties ────────────────────────────────────────────

	/**
	 * Gets region property rectangles.
	 *
	 * @param current - Receives the current rectangle
	 * @param previous - Receives the previous rectangle
	 * @param minimized - Receives the minimized rectangle
	 * @param maximized - Receives the maximized rectangle
	 */
	public getRegionProperties(
		current: { x: number; y: number; width: number; height: number } | null = null,
		previous: { x: number; y: number; width: number; height: number } | null = null,
		minimized: { x: number; y: number; width: number; height: number } | null = null,
		maximized: { x: number; y: number; width: number; height: number } | null = null
	): void
	{
		if (current !== null)
		{
			current.x = this._x;
			current.y = this._y;
			current.width = this._width;
			current.height = this._height;
		}

		if (previous !== null)
		{
			previous.x = this._previousRect.x;
			previous.y = this._previousRect.y;
			previous.width = this._previousRect.width;
			previous.height = this._previousRect.height;
		}

		if (minimized !== null && this._minimizedRect !== null)
		{
			minimized.x = this._minimizedRect.x;
			minimized.y = this._minimizedRect.y;
			minimized.width = this._minimizedRect.width;
			minimized.height = this._minimizedRect.height;
		}

		if (maximized !== null && this._maximizedRect !== null)
		{
			maximized.x = this._maximizedRect.x;
			maximized.y = this._maximizedRect.y;
			maximized.width = this._maximizedRect.width;
			maximized.height = this._maximizedRect.height;
		}
	}

	/**
	 * Sets region property rectangles.
	 *
	 * @param current - New current rectangle (applied via setRectangle)
	 * @param minimized - New minimized rectangle
	 * @param maximized - New maximized rectangle
	 */
	public setRegionProperties(
		current: { x: number; y: number; width: number; height: number } | null = null,
		minimized: { x: number; y: number; width: number; height: number } | null = null,
		maximized: { x: number; y: number; width: number; height: number } | null = null
	): void
	{
		if (maximized !== null)
		{
			if (maximized.width < 0 || maximized.height < 0)
			{
				throw new Error('Invalid rectangle; maximized size cannot be less than zero!');
			}

			if (!this._maximizedRect)
			{
				this._maximizedRect = {x: 0, y: 0, width: 0, height: 0};
			}

			this._maximizedRect.x = maximized.x;
			this._maximizedRect.y = maximized.y;
			this._maximizedRect.width = maximized.width;
			this._maximizedRect.height = maximized.height;
		}

		if (minimized !== null)
		{
			if (minimized.width < 0 || minimized.height < 0)
			{
				throw new Error('Invalid rectangle; minimized size cannot be less than zero!');
			}

			if (!this._minimizedRect)
			{
				this._minimizedRect = {x: 0, y: 0, width: 0, height: 0};
			}

			this._minimizedRect.x = minimized.x;
			this._minimizedRect.y = minimized.y;
			this._minimizedRect.width = minimized.width;
			this._minimizedRect.height = minimized.height;
		}

		if (current !== null)
		{
			this.setRectangle(current.x, current.y, current.width, current.height);
		}
	}

	// ── Clone ────────────────────────────────────────────────────────

	/**
	 * Creates a deep clone of this window and its children.
	 *
	 * @returns A new WindowController with the same properties
	 */
	public clone(): IWindow
	{
		const cloned = new (this.constructor as typeof WindowController)(
			this._name,
			this._type,
			this._style,
			this._param,
			this._context,
			{x: this._x, y: this._y, width: this._width, height: this._height},
			null,
			this._procedure,
			this._tags ? this._tags.concat() : null,
			null,
			this._id,
			this._dynamicStyleName
		);

		cloned._mouseThreshold = this._mouseThreshold;
		cloned._hasVisualContent = this._hasVisualContent;
		cloned._debug = this._debug;
		cloned._parentRect = {...this._parentRect};
		cloned._x = this._x;
		cloned._y = this._y;
		cloned._width = this._width;
		cloned._height = this._height;
		cloned._initialRect = {...this._initialRect};
		cloned._previousRect = {...this._previousRect};
		cloned._minimizedRect = this._minimizedRect ? {...this._minimizedRect} : null;
		cloned._maximizedRect = this._maximizedRect ? {...this._maximizedRect} : null;
		cloned._rectLimits = this._rectLimits ? this._rectLimits.clone(cloned) as WindowRectLimits : null;
		cloned._context = this._context;
		cloned._fillColor = this._fillColor;
		cloned._alphaColor = this._alphaColor;
		cloned._clipping = this._clipping;
		cloned._visible = this._visible;
		cloned._blend = this._blend;
		cloned._param = this._param;
		cloned._state = this._state;
		cloned._name = this._name;
		cloned._id = this._id;
		cloned._caption = this._caption;
		cloned._background = this._background;

		this.cloneChildWindows(cloned);

		return cloned;
	}

	// ── Protected methods ────────────────────────────────────────────

	public override toString(): string
	{
		return `[Window ${this.constructor.name} ${this._name} ${this._uniqueId}]`;
	}

	/**
	 * Disposes this window and all its children, releasing all resources.
	 */
	public override dispose(): void
	{
		if (!this._disposed)
		{
			this._immediateClickMode = false;
			this._procedure = null;

			// Deactivate if not a child window and context is still alive
			if (!this._context.disposed)
			{
				if (!this.isChildWindow())
				{
					if (this.getStateFlag(1))
					{
						this.deactivate();
					}
				}
			}

			// Dispose all children
			if (this._children)
			{
				while (this._children.length > 0)
				{
					const child = this._children.pop();

					if (child)
					{
						child.dispose();
					}
				}
			}

			this._children = null;

			// Remove from parent
			if (this.parent)
			{
				this.parent = null;
			}

			// Dispatch dispose event and clean up dispatcher
			if (this._eventDispatcher)
			{
				const disposeEvent = WindowDisposeEvent.allocateDispose(this);
				this._eventDispatcher.dispatchEvent(disposeEvent);
				disposeEvent.recycle();
				this._eventDispatcher.dispose();
				this._eventDispatcher = null;
			}

			// Clean up graphic context
			if (this._graphicContext !== null)
			{
				this._graphicContext.dispose();
				this._graphicContext = null;
			}

			super.dispose();
		}
	}

	/**
	 * Clones child windows into the target controller.
	 *
	 * @param target - The controller to clone children into
	 */
	protected cloneChildWindows(target: WindowController): void
	{
		if (this._children)
		{
			for (const child of this._children)
			{
				if (child.tags.indexOf(WindowController.TAG_EXCLUDE) === -1)
				{
					target.addChild(child.clone());
				}
			}
		}
	}

	/**
	 * Updates the position/size relative to the parent based on param flags.
	 * Handles horizontal and vertical anchoring, centering, and stretching.
	 */
	protected updateScaleRelativeToParent(): void
	{
		if (this._parent === null) return;

		const hasHorizontal: boolean = !this.testParamFlag(0, 192);
		const hasVertical: boolean = !this.testParamFlag(0, 0x0C00);

		let newX: number = this._x;
		let newY: number = this._y;
		let newWidth: number = this._width;
		let newHeight: number = this._height;

		if (hasHorizontal || hasVertical)
		{
			if (hasHorizontal)
			{
				const deltaX: number = this._parent.width - this._parentRect.width;
				const hMode: number = this._param & 0xC0;

				if (hMode === 128)
				{
					// Stretch width
					newWidth = newWidth + deltaX;
				}
				else if (hMode === 64)
				{
					// Move right
					newX = newX + deltaX;
				}
				else if (hMode === 192)
				{
					// Center
					if (this._parent.width < newWidth && this.getParamFlag(16))
					{
						newX = 0;
					}
					else
					{
						newX = Math.floor(this._parent.width / 2) - Math.floor(newWidth / 2);
					}
				}
			}

			if (hasVertical)
			{
				const deltaY: number = this._parent.height - this._parentRect.height;
				const vMode: number = this._param & 0x0C00;

				if (vMode === 0x0800)
				{
					// Stretch height
					newHeight = newHeight + deltaY;
				}
				else if (vMode === 0x0400)
				{
					// Move down
					newY = newY + deltaY;
				}
				else if (vMode === 0x0C00)
				{
					// Center
					if (this._parent.height < newHeight && this.getParamFlag(16))
					{
						newY = 0;
					}
					else
					{
						newY = Math.floor(this._parent.height / 2) - Math.floor(newHeight / 2);
					}
				}
			}

			// Temporarily remove scaling params to avoid recursion
			const savedParam: number = this._param;
			this._param = this._param & 0xFF3FF33F;
			this.setRectangle(newX, newY, newWidth, newHeight);
			this._param = savedParam;
		}
		else
		{
			// Clamp to parent only (param flag 32)
			if (this.testParamFlag(32))
			{
				if (this._parent !== null)
				{
					newX = newX < 0 ? 0 : newX;
					newY = newY < 0 ? 0 : newY;
					newX = newX - ((newX + newWidth > this._parent.width) ? (newX + newWidth - this._parent.width) : 0);
					newY = newY - ((newY + newHeight > this._parent.height) ? (newY + newHeight - this._parent.height) : 0);
					newWidth = newWidth - ((newX + newWidth > this._parent.width) ? (newX + newWidth - this._parent.width) : 0);
					newHeight = newHeight - ((newY + newHeight > this._parent.height) ? (newY + newHeight - this._parent.height) : 0);

					if (newX !== this._x || newY !== this._y || newWidth !== this._width || newHeight !== this._height)
					{
						const savedParam2: number = this._param;
						this._param = this._param & 0xFF3FF33F;
						this.setRectangle(newX, newY, newWidth, newHeight);
						this._param = savedParam2;
					}
				}
			}
		}
	}

	// ── String representation ────────────────────────────────────────

	/**
	 * Scales this window to accommodate all of its children.
	 */
	protected scaleToAccommodateChildren(): void
	{
		if (!this._children) return;

		let minX: number = 0;
		let minY: number = 0;
		let maxRight: number = 0;
		let maxBottom: number = 0;
		let changed: boolean = false;
		const savedChildParams: number[] = [];

		const savedParam: number = this._param & (0x020000 | 0x024000);

		for (const child of this._children)
		{
			if (child.x < minX)
			{
				maxRight = maxRight - (child.x - minX);
				minX = child.x;
				changed = true;
			}

			if (child.x + child.width > maxRight)
			{
				maxRight = child.x + child.width;
				changed = true;
			}

			if (child.y < minY)
			{
				maxBottom = maxBottom - (child.y - minY);
				minY = child.y;
				changed = true;
			}

			if (child.y + child.height > maxBottom)
			{
				maxBottom = child.y + child.height;
				changed = true;
			}
		}

		if (changed)
		{
			// Save and clear child scaling params
			for (const child of this._children)
			{
				const childParam = child.param & (0xC0 | 0x0C00);
				child.setParamFlag(childParam, false);
				savedChildParams.push(childParam);
			}

			if (savedParam)
			{
				this.setParamFlag(savedParam, false);
			}

			this.setRectangle(this._x + minX, this._y + minY, maxRight, maxBottom);

			// Restore child params
			let i = 0;

			for (const child of this._children)
			{
				child.offset(-minX, -minY);
				child.setParamFlag(savedChildParams[i++], true);
			}

			if (savedParam)
			{
				this.setParamFlag(savedParam, true);
			}
		}
	}

	// ── Dispose ──────────────────────────────────────────────────────

	/**
	 * Returns whether this is a child window (not directly under desktop).
	 */
	protected isChildWindow(): boolean
	{
		return this._parent !== this._context.getDesktopWindow();
	}

	// ── Private helpers ──────────────────────────────────────────────

	/**
	 * Dispatches an event through the procedure and event listeners (no built-in handling).
	 *
	 * @param event - The event to dispatch
	 */
	protected notifyEventListeners(event: WindowEvent): void
	{
		const proc = this.procedure;

		if (proc)
		{
			proc(event, this);
		}

		if (!event.isWindowOperationPrevented())
		{
			if (this.hasEventListener(event.type))
			{
				this._eventDispatcher!.dispatchEvent(event);
			}
		}
	}

	/**
	 * Applies dynamic style offsets based on current state.
	 *
	 * Reads the dynamic style and applies offset properties for the
	 * active state (pressed > hover > default). Also applies child
	 * styles for tagged children (e.g. #icon, #bg).
	 */
	private applyDynamicStyleForState(): void
	{
		if (!this._dynamicStyleName) return;

		const dynStyle = DynamicStyleManager.getStyle(this._dynamicStyleName);

		// Determine active state: pressed > hover > default
		let activeState = 0;

		if (this._state & 16)
		{
			activeState = 16;
		}
		else if (this._state & 4) activeState = 4;

		const props = dynStyle.getStyleByWindowState(activeState);

		this._offsetX = (props.offsetX as number) ?? 0;
		this._offsetY = (props.offsetY as number) ?? 0;

		// Apply child dynamic styles (#icon tagged children)
		if (this._children)
		{
			for (const child of this._children)
			{
				const childStyle = dynStyle.getChildStyleByTags(child.tags);

				if (childStyle)
				{
					const childProps = childStyle.getStyleByWindowState(activeState);

					child.offsetX = (childProps.offsetX as number) ?? 0;
					child.offsetY = (childProps.offsetY as number) ?? 0;
				}
			}
		}
	}

	/**
	 * Notifies all children with an event.
	 *
	 * @param event - The event to dispatch to children
	 */
	private notifyChildren(event: WindowEvent): void
	{
		if (this._children)
		{
			for (const child of this._children)
			{
				(child as WindowController).update(this, event);
			}
		}
	}
}
