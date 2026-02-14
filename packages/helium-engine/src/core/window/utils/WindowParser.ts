import type { IWindowParser } from './IWindowParser';
import type { IWindowContext } from '../IWindowContext';
import type { IWindow } from '../IWindow';

/**
 * JSON-based window parser.
 *
 * In AS3, the WindowParser parsed XML layout definitions to construct
 * window trees. In TypeScript, we parse JSON layout objects instead.
 * The parser walks the JSON tree, creates windows via the context
 * factory, and wires up parent/child relationships.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/WindowParser.as
 */
export class WindowParser implements IWindowParser
{
    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Parses a JSON layout definition and constructs a window tree.
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
        if(!layout)
        {
            return null;
        }

        const name = (layout.name as string) ?? '';
        const type = (layout.type as number) ?? 0;
        const style = (layout.style as number) ?? 0;
        const param = (layout.param as number) ?? 0;
        const tags = (layout.tags as string[]) ?? [];
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

        const rect = { x, y, width, height };

        const window = parent.context.create(
            '',
            name,
            type,
            style,
            param,
            rect,
            null,
            parent,
            id,
            tags.length > 0 ? tags : null,
            dynamicStyle || undefined,
            null
        );

        if(!window)
        {
            return null;
        }

        window.caption = caption;
        window.visible = visible;
        window.color = color;
        window.clipping = clipping;
        window.background = background;

        if(namedWindows && name)
        {
            namedWindows.set(name, window);
        }

        // Parse children recursively
        const children = layout.children as Record<string, unknown>[] | undefined;

        if(children)
        {
            for(const childLayout of children)
            {
                this.parseAndConstruct(childLayout, window, namedWindows);
            }
        }

        return window;
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

        if(window.caption)
        {
            layout.caption = window.caption;
        }

        if(window.tags && window.tags.length > 0)
        {
            layout.tags = window.tags;
        }

        return JSON.stringify(layout);
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
        }
    }
}
