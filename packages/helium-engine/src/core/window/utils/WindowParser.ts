import type {IWindowParser} from './IWindowParser';
import type {IWindow} from '../IWindow';
import type {IStaticBitmapWrapperWindow} from '../components/IStaticBitmapWrapperWindow';
import {PropertyStruct} from './PropertyStruct';
import {WindowType} from '../enum/WindowType';

/**
 * JSON-based window parser.
 *
 * In AS3, the WindowParser parsed XML layout definitions to construct
 * window trees. In TypeScript, we parse JSON layout objects instead.
 *
 * The JSON layout format (produced by the flash2html converter):
 * ```json
 * {
 *   "name": "layout_name",
 *   "window": {
 *     "tag": "window",
 *     "typeId": -1,
 *     "attributes": {},
 *     "children": [
 *       {
 *         "tag": "frame",
 *         "typeId": 35,
 *         "attributes": { "x": "1", "y": "1", "width": "578", ... },
 *         "children": [...]
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/WindowParser.as
 */
export class WindowParser implements IWindowParser
{
	/**
	 * Localization resolver callback.
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
	 * Handles two formats:
	 * 1. Top-level layout: `{ name, window: { tag, typeId, attributes, children } }`
	 * 2. Node-level: `{ tag, typeId, attributes, children }`
	 *
	 * The root `window` node (typeId -1) is virtual — its children are
	 * attached directly to the parent.
	 *
	 * @param layout - The JSON layout definition
	 * @param parent - The parent window to attach children to
	 * @param namedWindows - Optional map to collect named windows
	 * @returns The root window of the constructed tree, or null
	 */
	public parseAndConstruct(
		layout: Record<string, unknown>,
		parent: IWindow,
		namedWindows: Map<string, IWindow> | null
	): IWindow | null
	{
		if (!layout) return null;

		// Top-level layout with "window" wrapper
		if (layout.window)
		{
			const rootNode = layout.window as LayoutNode;

			return this.parseNode(rootNode, parent, namedWindows);
		}

		// Already a node
		if (layout.tag !== undefined || layout.typeId !== undefined)
		{
			return this.parseNode(layout as unknown as LayoutNode, parent, namedWindows);
		}

		// Legacy flat format fallback
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
	 * Parses a node in the `{ tag, typeId, attributes, children }` format.
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

		// Virtual root (typeId -1): skip creation, attach children to parent
		if (typeId < 0)
		{
			let firstChild: IWindow | null = null;

			for (const child of children)
			{
				const created = this.parseNode(child, parent, namedWindows);

				if (!firstChild && created)
				{
					firstChild = created;
				}
			}

			return firstChild;
		}

		// Parse attributes
		const name = attrs.name ?? '';
		const style = parseIntSafe(attrs.style);
		const param = parseIntSafe(attrs.params);
		const x = parseIntSafe(attrs.x);
		const y = parseIntSafe(attrs.y);
		const width = parseIntSafe(attrs.width);
		const height = parseIntSafe(attrs.height);
		const caption = attrs.caption ?? '';
		const id = parseIntSafe(attrs.id);
		const visible = attrs.visible !== 'false';
		const color = parseColorSafe(attrs.color);
		const clipping = attrs.clipping === 'true';
		const background = attrs.background === 'true';
		const dynamicStyle = attrs.dynamic_style ?? '';

		// Parse tags (pre-decoded in the JSON by compile-window-layouts)
		let tags: string[] | null = null;

		if (attrs.tags)
		{
			tags = attrs.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
		}

		const rect = {x, y, width, height};

		// Create the window via the context factory
		const window = parent.context.create(
			'', name, typeId, style, param, rect,
			null, parent, id, tags, dynamicStyle, null
		);

		if (!window) return null;

		// Apply post-creation properties
		if (caption) window.caption = resolveLocalizationTokens(caption);
		window.visible = visible;
		if (color !== 0) window.color = color;
		window.clipping = clipping;
		window.background = background;

		// Set assetUri on static_bitmap windows to trigger ResourceManager loading.
		// Use the per-window asset_uri variable if present (from XML <variables>),
		// otherwise fall back to name + '_normal'.
		// Note: asset_uri from variables is the COMPLETE name (e.g. "bottom_bar_home"),
		// no suffix needed. The name + '_normal' fallback appends the suffix for
		// backward compatibility when no variable is specified.
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

		// Collect named windows
		if (namedWindows && name)
		{
			namedWindows.set(name, window);
		}

		// Parse children recursively
		for (const child of children)
		{
			this.parseNode(child, window, namedWindows);
		}

		// Apply specific vars as properties (AS3 <variables> → PropertyStruct).
		// Only vars that map to known property keys are applied here.
		// Other vars (tool_tip_caption, asset_uri, etc.) are metadata
		// handled by other systems.
		//
		// NOTE: margin_left/top/right/bottom are intentionally excluded because
		// FrameController.set properties handles them differently and crashes
		// when content is null during construction. Text margins are set via
		// text style system instead.
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
						// Resolve localization tokens in string array items
						const resolved = Array.isArray(val)
							? val.map(item => typeof item === 'string' ? resolveLocalizationTokens(item) : item)
							: val;

						props.push(new PropertyStruct(key, resolved));
						break;
					}
					// Drop menu / interactive vars
					case 'open_upward':
					case 'keep_open_on_deactivate':
					// Text formatting vars (TextController property setters)
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
						props.push(new PropertyStruct(key, val));
						break;
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
	filters?: unknown[];
}

// ── Utility helpers ─────────────────────────────────────────────────

/**
 * Parses a string to an integer, returns 0 for invalid values.
 */
function parseIntSafe(value: string | undefined): number
{
	if (!value) return 0;

	const n = parseInt(value, 10);

	return isNaN(n) ? 0 : n;
}

/**
 * Parses a color string (e.g. "0xff418db0") to a number.
 */
function parseColorSafe(value: string | undefined): number
{
	if (!value) return 0;

	if (value.startsWith('0x') || value.startsWith('0X'))
	{
		const n = parseInt(value.substring(2), 16);

		return isNaN(n) ? 0 : n;
	}

	const n = parseInt(value, 10);

	return isNaN(n) ? 0 : n;
}

/**
 * Resolves `${key}` localization tokens in a string.
 *
 * Exported as a standalone function for use by window controllers
 * that need to resolve tokens in dynamic property assignments
 * (e.g. `window.caption = '${navigator.title}'`).
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
