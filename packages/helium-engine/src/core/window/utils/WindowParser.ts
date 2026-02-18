import type {IWindowParser} from './IWindowParser';
import type {IWindow} from '../IWindow';
import type {IStaticBitmapWrapperWindow} from '../components/IStaticBitmapWrapperWindow';
import type {BoxSizerController} from '../components/BoxSizerController';
import {PropertyStruct} from './PropertyStruct';
import {WindowType} from '../enum/WindowType';

/**
 * JSON-based window parser.
 *
 * Faithful port of AS3 `WindowParser`. Parses JSON layout definitions
 * (converted from the original XML layouts) to construct window trees.
 *
 * The AS3 version parsed XML via `parseSingleWindowEntity()`. This
 * TypeScript port parses JSON nodes with the same attribute handling,
 * property application order, and child routing logic.
 *
 * Key behaviors ported from AS3:
 * - Size limits (`width_min`, `width_max`, `height_min`, `height_max`)
 *   are applied post-creation and enforced via `limits.limit()`.
 * - `blend` (opacity), `treshold` (mouse threshold), `background`,
 *   `clipping`, and `color` are only set when they differ from defaults.
 * - Caption inherits from parent when the `inherit_caption` flag
 *   (`0x80000000`) is set in params.
 * - Layout-level filters (e.g. DropShadowFilter) are applied to the
 *   parent window in `parseAndConstruct()`.
 * - BoxSizer children disable auto-rearrange during child parsing
 *   to avoid redundant layout passes.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/WindowParser.as
 */
export class WindowParser implements IWindowParser
{
	/**
	 * Localization resolver callback.
	 *
	 * When set, `${key}` tokens in captions and string properties
	 * are resolved through this function. If the function returns null
	 * for a key, the raw key is used as fallback.
	 */
	public static localizationResolver: ((key: string) => string | null) | null = null;

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Parses a JSON layout definition and constructs a window tree.
	 *
	 * Port of AS3 `WindowParser.parseAndConstruct()`.
	 *
	 * Handles three entry formats:
	 * 1. **Top-level layout**: `{ name, window: { ... }, filters: [...] }`
	 *    — the "layout" wrapper. Filters at this level are applied to
	 *    the parent window. The `window` child is then parsed.
	 * 2. **Virtual root**: `{ tag: "window", typeId: -1, children: [...] }`
	 *    — skips creation, attaches children directly to parent.
	 * 3. **Concrete node**: `{ tag: "frame", typeId: 35, ... }`
	 *    — creates a single window via `parseSingleWindowEntity()`.
	 *
	 * @param layout - The JSON layout definition
	 * @param parent - The parent window to attach children to
	 * @param namedWindows - Optional map to collect named windows by name
	 * @returns The last created window, or null if nothing was created
	 */
	public parseAndConstruct(
		layout: Record<string, unknown>,
		parent: IWindow,
		namedWindows: Map<string, IWindow> | null
	): IWindow | null
	{
		if (!layout) return null;

		// ── Top-level layout wrapper ────────────────────────────────
		// AS3 lines 167-208: if localName == "layout"
		if (layout.window)
		{
			// Apply layout-level filters to the parent window.
			// AS3 lines 182-192: filters defined at layout level
			// (e.g. DropShadowFilter on frame_3) are set on the parent.
			const filters = layout.filters as LayoutFilter[] | undefined;

			if (filters && filters.length > 0 && parent)
			{
				parent.filters = filters.map(buildDropShadowFilterFromJSON);
			}

			const rootNode = layout.window as LayoutNode;

			return this.parseNode(rootNode, parent, namedWindows);
		}

		// ── Already a concrete or virtual node ──────────────────────
		if (layout.tag !== undefined || layout.typeId !== undefined)
		{
			return this.parseNode(layout as unknown as LayoutNode, parent, namedWindows);
		}

		// ── Legacy flat format fallback ─────────────────────────────
		return this.parseFlatNode(layout, parent, namedWindows);
	}

	/**
	 * Serializes a window tree to a JSON layout string.
	 *
	 * @param window - The root window to serialize
	 * @returns JSON string representation
	 */
	public windowToLayoutString(window: IWindow): string
	{
		const layout: Record<string, unknown> = {
			name: window.name,
			type: window.type,
			style: window.style,
			param: window.param,
			x: window.x,
			y: window.y,
			width: window.width,
			height: window.height,
		};

		if (window.caption)
		{
			layout.caption = window.caption;
		}

		if (window.tags && window.tags.length > 0)
		{
			layout.tags = window.tags;
		}

		return JSON.stringify(layout);
	}

	public dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;
		}
	}

	/**
	 * Parses a single JSON node and constructs the corresponding window.
	 *
	 * Faithful port of AS3 `parseSingleWindowEntity()` (lines 227-414).
	 *
	 * The method follows this exact order (matching AS3):
	 * 1. Parse basic attributes (name, style, params, rect, visible, id)
	 * 2. Parse caption with `inherit_caption` flag support
	 * 3. Split and trim tags
	 * 4. Create the window via `context.create()`
	 * 5. Apply size limits (`width_min/max`, `height_min/max`) + `limit()`
	 * 6. Parse and apply: background, blend, clipping, color, treshold
	 * 7. Set each property only if it differs from the window's default
	 * 8. Parse per-window filters (DropShadowFilter)
	 * 9. Recurse into children (with BoxSizer auto-rearrange guard)
	 * 10. Apply vars as PropertyStruct array
	 *
	 * @param node - The JSON layout node
	 * @param parent - The parent window
	 * @param namedWindows - Optional map to collect named windows
	 * @returns The created window, or null
	 */
	private parseNode(
		node: LayoutNode,
		parent: IWindow,
		namedWindows: Map<string, IWindow> | null
	): IWindow | null
	{
		if (!node) return null;

		const typeId = node.typeId ?? 0;
		const attrs = node.attributes ?? {};
		const children = node.children ?? [];

		// ── Virtual root (typeId -1): skip creation ─────────────────
		// AS3 lines 210-223: if localName == "window"
		if (typeId < 0)
		{
			let lastChild: IWindow | null = null;

			for (const child of children)
			{
				const created = this.parseNode(child, parent, namedWindows);

				if (created)
				{
					lastChild = created;
				}
			}

			return lastChild;
		}

		// ── 1. Parse basic attributes ───────────────────────────────
		// AS3 lines 249-265
		const name = attrs.name ?? '';
		const style = attrs.style !== undefined ? parseIntSafe(attrs.style) : (parent ? parent.style : 0);
		const param = parseIntSafe(attrs.params);
		const dynamicStyle = attrs.dynamic_style ?? '';
		const x = parseNumberSafe(attrs.x);
		const y = parseNumberSafe(attrs.y);
		const width = parseNumberSafe(attrs.width);
		const height = parseNumberSafe(attrs.height);
		const visible = attrs.visible !== 'false';
		const id = parseIntSafe(attrs.id);

		// ── 2. Parse caption with inherit_caption support ────────────
		// AS3 lines 282-283: if param flag 0x80000000 (inherit_caption)
		// is set AND parent exists, default caption is parent's caption.
		const INHERIT_CAPTION = 0x80000000;
		let caption = '';

		if ((param & INHERIT_CAPTION) !== 0 && parent)
		{
			caption = parent.caption ?? '';
		}

		if (attrs.caption !== undefined)
		{
			caption = attrs.caption;
		}

		caption = resolveLocalizationTokens(caption);

		// ── 3. Split and trim tags ──────────────────────────────────
		// AS3 lines 284-292
		let tags: string[] | null = null;

		if (attrs.tags)
		{
			tags = attrs.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
		}

		const rect = {x, y, width, height};

		// ── 4. Create the window ────────────────────────────────────
		// AS3 line 294: context.create(...)
		const window = parent.context.create(
			'', name, typeId, style, param, rect,
			null, parent, id, tags, dynamicStyle, null
		);

		if (!window) return null;

		// ── 5. Apply size limits ────────────────────────────────────
		// AS3 lines 295-311: only set if attribute exists, then limit()
		const limits = window.limits;

		if (attrs.width_min !== undefined)
		{
			limits.minWidth = parseIntSafe(attrs.width_min);
		}

		if (attrs.width_max !== undefined)
		{
			limits.maxWidth = parseIntSafe(attrs.width_max);
		}

		if (attrs.height_min !== undefined)
		{
			limits.minHeight = parseIntSafe(attrs.height_min);
		}

		if (attrs.height_max !== undefined)
		{
			limits.maxHeight = parseIntSafe(attrs.height_max);
		}

		if (attrs.width_min !== undefined || attrs.width_max !== undefined ||
			attrs.height_min !== undefined || attrs.height_max !== undefined)
		{
			(limits as unknown as { limit(): void }).limit();
		}

		// ── 6. Parse rendering attributes ───────────────────────────
		// AS3 lines 312-316: parse with window defaults as fallback
		const background = attrs.background === 'true';
		const blend = attrs.blend !== undefined ? parseNumberSafe(attrs.blend) : window.blend;
		const clipping = attrs.clipping !== undefined ? (attrs.clipping === 'true') : window.clipping;
		const color = attrs.color !== undefined ? parseColorSafe(attrs.color) : window.color;
		const threshold = attrs.treshold !== undefined ? parseIntSafe(attrs.treshold) : window.mouseThreshold;

		// ── 7. Apply only if different from defaults ────────────────
		// AS3 lines 317-345: each property is guarded by an inequality check
		if (window.caption !== caption)
		{
			window.caption = caption;
		}

		if (window.blend !== blend)
		{
			window.blend = blend;
		}

		if (window.visible !== visible)
		{
			window.visible = visible;
		}

		if (window.clipping !== clipping)
		{
			window.clipping = clipping;
		}

		if (window.background !== background)
		{
			window.background = background;
		}

		if (window.mouseThreshold !== threshold)
		{
			window.mouseThreshold = threshold;
		}

		if (window.color !== color)
		{
			window.color = color;
		}

		// ── 8. Per-window filters ───────────────────────────────────
		// AS3 lines 346-358: parse <filters> children on the element
		if (node.filters && node.filters.length > 0)
		{
			const builtFilters = (node.filters as LayoutFilter[])
				.map(buildDropShadowFilterFromJSON)
				.filter(Boolean);

			if (builtFilters.length > 0)
			{
				window.filters = builtFilters;
			}
		}

		// ── Static bitmap asset URI ─────────────────────────────────
		// Custom TypeScript extension (no AS3 equivalent): set assetUri
		// on STATIC_BITMAP_WRAPPER windows for ResourceManager loading.
		if (window.type === WindowType.STATIC_BITMAP_WRAPPER)
		{
			const vars = node.vars;
			const assetUri = vars?.asset_uri as string | undefined;

			if (assetUri)
			{
				(window as unknown as IStaticBitmapWrapperWindow).assetUri = assetUri;
			}
			else if (name)
			{
				(window as unknown as IStaticBitmapWrapperWindow).assetUri = name + '_normal';
			}
		}

		// ── Collect named windows ───────────────────────────────────
		if (namedWindows && name)
		{
			namedWindows.set(name, window);
		}

		// ── 9. Parse children recursively ───────────────────────────
		// AS3 lines 395-412
		//
		// Compound elements (frames) redirect children to their content
		// container via getLayoutChildTarget(), matching AS3 behavior
		// where FrameController.buildFromXML() passes `content` to
		// parseAndConstruct() (AS3 FrameController.as line 127).
		//
		// BoxSizer windows disable auto-rearrange during child parsing
		// to prevent redundant layout passes (AS3 lines 398-411).
		const childTarget = window.getLayoutChildTarget();
		const isBoxSizer = typeof (window as unknown as BoxSizerController).setAutoRearrange === 'function';

		if (isBoxSizer)
		{
			(window as unknown as BoxSizerController).setAutoRearrange(false);
		}

		for (const child of children)
		{
			this.parseNode(child, childTarget, namedWindows);
		}

		if (isBoxSizer)
		{
			(window as unknown as BoxSizerController).setAutoRearrange(true);
		}

		// ── 10. Apply vars as PropertyStruct ────────────────────────
		// AS3 line 294 passes parseProperties(variables) to create().
		// In TypeScript, vars are applied post-creation as PropertyStruct
		// array via the `properties` setter.
		if (node.vars)
		{
			const props: PropertyStruct[] = [];

			for (const [key, val] of Object.entries(node.vars))
			{
				if (val === null || val === undefined) continue;

				switch (key)
				{
					case 'item_array':
					{
						const resolved = Array.isArray(val)
							? val.map(item => typeof item === 'string' ? resolveLocalizationTokens(item) : item)
							: val;

						props.push(new PropertyStruct(key, resolved));
						break;
					}
					case 'open_upward':
					case 'keep_open_on_deactivate':
					case 'bold':
					case 'italic':
					case 'underline':
					case 'font_face':
					case 'font_size':
					case 'text_color':
					case 'text_style':
					case 'multiline':
					case 'word_wrap':
					case 'max_chars':
					case 'max_lines':
					case 'overflow_replace':
					case 'auto_size':
					case 'spacing':
					case 'leading':
					case 'margin_left':
					case 'margin_top':
					case 'margin_right':
					case 'margin_bottom':
					case 'etching_color':
					case 'etching_position':
					case 'background':
					case 'background_color':
					case 'pivot_point':
					case 'stretched_x':
					case 'stretched_y':
					case 'fit_size_to_contents':
					case 'zoom_x':
					case 'zoom_y':
					case 'wrap_x':
					case 'wrap_y':
					case 'greyscale':
					case 'rotation':
						props.push(new PropertyStruct(key, val));
						break;
					case 'margins':
					{
						const m = val as Record<string, number>;

						if(m.left !== undefined) props.push(new PropertyStruct('margin_left', m.left));
						if(m.top !== undefined) props.push(new PropertyStruct('margin_top', m.top));
						if(m.right !== undefined) props.push(new PropertyStruct('margin_right', m.right));
						if(m.bottom !== undefined) props.push(new PropertyStruct('margin_bottom', m.bottom));
						break;
					}
				}
			}

			if (props.length > 0)
			{
				window.properties = props;
			}
		}

		return window;
	}

	/**
	 * Legacy flat format parser (original parseAndConstruct logic).
	 *
	 * Used for programmatically created layouts that are already in
	 * object form (not the compiled XML→JSON format).
	 */
	private parseFlatNode(
		layout: Record<string, unknown>,
		parent: IWindow,
		namedWindows: Map<string, IWindow> | null
	): IWindow | null
	{
		const name = (layout.name as string) ?? '';
		const type = (layout.type as number) ?? 0;
		const style = (layout.style as number) ?? 0;
		const param = (layout.param as number) ?? 0;
		const layoutTags = (layout.tags as string[]) ?? [];
		const dynamicStyle = (layout.dynamicStyle as string) ?? '';
		const x = (layout.x as number) ?? 0;
		const y = (layout.y as number) ?? 0;
		const width = (layout.width as number) ?? 0;
		const height = (layout.height as number) ?? 0;
		const caption = (layout.caption as string) ?? '';
		const id = (layout.id as number) ?? 0;
		const visible = layout.visible !== false;
		const color = (layout.color as number) ?? 0;
		const clipping = (layout.clipping as boolean) ?? false;
		const background = (layout.background as boolean) ?? false;

		const rect = {x, y, width, height};

		const window = parent.context.create(
			'', name, type, style, param, rect,
			null, parent, id,
			layoutTags.length > 0 ? layoutTags : null,
			dynamicStyle || undefined, null
		);

		if (!window) return null;

		window.caption = caption;
		window.visible = visible;
		window.color = color;
		window.clipping = clipping;
		window.background = background;

		if (namedWindows && name)
		{
			namedWindows.set(name, window);
		}

		const children = layout.children as Record<string, unknown>[] | undefined;

		if (children)
		{
			for (const childLayout of children)
			{
				this.parseFlatNode(childLayout, window, namedWindows);
			}
		}

		return window;
	}
}

// ── JSON layout node type ───────────────────────────────────────────

interface LayoutNode
{
	tag?: string;
	typeId?: number;
	attributes?: Record<string, string>;
	children?: LayoutNode[];
	vars?: Record<string, unknown>;
	filters?: LayoutFilter[];
}

/**
 * JSON representation of a bitmap filter (from compile-window-layouts).
 *
 * Currently only DropShadowFilter is supported, matching AS3
 * `WindowParser.buildBitmapFilter()` which only handles
 * DropShadowFilter and returns null for all other types.
 */
interface LayoutFilter
{
	type: string;
	attributes: Record<string, string>;
}

// ── Utility helpers ─────────────────────────────────────────────────

/**
 * Parses a string to an integer, returns 0 for invalid values.
 *
 * Equivalent of AS3 `uint(parseAttribute(...))` or `int(parseAttribute(...))`.
 */
function parseIntSafe(value: string | undefined): number
{
	if (!value) return 0;

	const n = parseInt(value, 10);

	return isNaN(n) ? 0 : n;
}

/**
 * Parses a string to a floating-point number, returns 0 for invalid values.
 *
 * Equivalent of AS3 `Number(parseAttribute(...))`.
 * Used for `blend` (opacity) and position attributes.
 */
function parseNumberSafe(value: string | undefined): number
{
	if (!value) return 0;

	const n = Number(value);

	return isNaN(n) ? 0 : n;
}

/**
 * Parses a color string to a numeric value.
 *
 * Handles both hex (`"0xff418db0"`) and decimal formats.
 * Matches AS3 color parsing (line 341):
 * `uint(_loc5_.charAt(1) == "x" ? parseInt(_loc5_, 16) : uint(_loc5_))`
 *
 * @param value - The color string
 * @returns The parsed color as an unsigned integer
 */
function parseColorSafe(value: string | undefined): number
{
	if (!value) return 0;

	if (value.length > 1 && value.charAt(1) === 'x')
	{
		const n = parseInt(value, 16);

		return isNaN(n) ? 0 : n >>> 0;
	}

	const n = parseInt(value, 10);

	return isNaN(n) ? 0 : n >>> 0;
}

/**
 * Builds a DropShadowFilter-like object from a JSON filter definition.
 *
 * Port of AS3 `WindowParser.buildBitmapFilter()` (lines 535-545).
 * Only DropShadowFilter is supported; other types return null.
 *
 * @param filter - The JSON filter definition
 * @returns A filter descriptor object, or null for unsupported types
 */
function buildDropShadowFilterFromJSON(filter: LayoutFilter): Record<string, unknown> | null
{
	if (!filter || filter.type !== 'DropShadowFilter') return null;

	const a = filter.attributes;

	return {
		type: 'DropShadowFilter',
		distance: parseNumberSafe(a.distance),
		angle: parseNumberSafe(a.angle) || 45,
		color: parseIntSafe(a.color),
		alpha: a.alpha !== undefined ? parseNumberSafe(a.alpha) : 1,
		blurX: parseNumberSafe(a.blurX),
		blurY: parseNumberSafe(a.blurY),
		strength: a.strength !== undefined ? parseNumberSafe(a.strength) : 1,
		quality: a.quality !== undefined ? parseIntSafe(a.quality) : 1,
		inner: a.inner === 'true',
		knockout: a.knockout === 'true',
		hideObject: a.hideObject === 'true'
	};
}

/**
 * Resolves `${key}` localization tokens in a string.
 *
 * Exported for use by window controllers that need to resolve
 * tokens in dynamic property assignments (e.g. `window.caption =
 * '${navigator.title}'`).
 *
 * @param value - The string potentially containing `${key}` tokens
 * @returns The resolved string, or the original if no resolver or no match
 */
export function resolveLocalizationTokens(value: string): string
{
	if (!value || !WindowParser.localizationResolver) return value;

	return value.replace(/\$\{([^}]+)\}/g, (_match, key) =>
	{
		const resolved = WindowParser.localizationResolver!(key);

		return resolved ?? key;
	});
}
