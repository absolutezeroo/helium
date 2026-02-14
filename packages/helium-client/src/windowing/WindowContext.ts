import { getWindowParamFlag } from './enum/WindowParam';
import { getWindowTypeId } from './enum/WindowType';
import type { IWindow } from './interfaces/IWindow';
import type { IWindowContainer } from './interfaces/IWindowContainer';
import { Window, WindowContainer, type WindowInit } from './Window';
import type { CompiledLayout, LayoutNode } from './types/Layout';

export interface BuildOptions
{
    overrides?: Record<string, unknown>;
}

export class WindowContext
{
    private readonly _name: string;
    private readonly _layouts: Map<string, CompiledLayout>;

    public constructor(name: string)
    {
        this._name = name;
        this._layouts = new Map();
    }

    public registerLayout(layout: CompiledLayout): void
    {
        this._layouts.set(layout.name, layout);
    }

    public getLayout(name: string): CompiledLayout | undefined
    {
        return this._layouts.get(name);
    }

    public build(layout: CompiledLayout, options?: BuildOptions): IWindowContainer
    {
        const vars = {
            ...(layout.vars || {}),
            ...(options?.overrides || {})
        };

        const root = this.createWindowFromNode(layout.window, vars, null);
        return root as IWindowContainer;
    }

    private createWindowFromNode(node: LayoutNode, vars: Record<string, unknown>, parent: IWindowContainer | null): IWindowContainer
    {
        const attributes = node.attributes || {};
        const windowInit: WindowInit = {};

        windowInit.name = this.resolveString(attributes.name, vars);
        windowInit.type = this.resolveType(node.tag, attributes.type);
        windowInit.style = this.resolveNumber(attributes.style, 0);
        windowInit.param = this.resolveParam(attributes.params);
        windowInit.caption = this.decodeCaption(attributes.caption);
        windowInit.x = this.resolveNumber(attributes.x, 0);
        windowInit.y = this.resolveNumber(attributes.y, 0);
        windowInit.width = this.resolveNumber(attributes.width, 0);
        windowInit.height = this.resolveNumber(attributes.height, 0);
        windowInit.visible = this.resolveBoolean(attributes.visible, true);
        windowInit.background = this.resolveBoolean(attributes.background, false);
        windowInit.blend = this.resolveNumber(attributes.blend, 1);
        windowInit.color = this.resolveColor(attributes.color, 0xffffff);
        windowInit.tags = this.resolveTags(attributes.tags);
        windowInit.id = this.resolveNumber(attributes.id, 0);

        windowInit.attributes = { ...attributes };
        windowInit.layoutVars = vars;

        const window = new WindowContainer(windowInit, parent);

        if (parent)
        {
            parent.addChild(window);
        }

        if (node.children && node.children.length > 0)
        {
            node.children.forEach((child) =>
            {
                this.createWindowFromNode(child, vars, window);
            });
        }

        return window;
    }

    private resolveType(tag: string, explicit?: string): number
    {
        if (explicit !== undefined)
        {
            return this.resolveNumber(explicit, 0);
        }

        const resolved = getWindowTypeId(tag);
        return resolved ?? 0;
    }

    private resolveParam(value?: string): number
    {
        if (!value)
        {
            return 0;
        }

        // Params can be numeric or comma-separated flag names
        const numeric = this.resolveNumber(value, NaN);

        if (!Number.isNaN(numeric))
        {
            return numeric;
        }

        return value
            .split(',')
            .map((entry) => entry.trim())
            .reduce((acc, name) =>
            {
                const flag = getWindowParamFlag(name);
                return acc | (flag ?? 0);
            }, 0);
    }

    private resolveNumber(value: unknown, fallback: number): number
    {
        if (value === undefined || value === null)
        {
            return fallback;
        }

        if (typeof value === 'number')
        {
            return value;
        }

        const str = String(value);

        if (str.startsWith('0x') || str.startsWith('0X'))
        {
            return Number.parseInt(str, 16);
        }

        const parsed = Number(str);
        return Number.isNaN(parsed) ? fallback : parsed;
    }

    private resolveBoolean(value: unknown, fallback: boolean): boolean
    {
        if (value === undefined || value === null)
        {
            return fallback;
        }

        if (typeof value === 'boolean')
        {
            return value;
        }

        const str = String(value).toLowerCase();
        return str === 'true' ? true : str === 'false' ? false : fallback;
    }

    private resolveColor(value: unknown, fallback: number): number
    {
        if (value === undefined || value === null)
        {
            return fallback;
        }

        if (typeof value === 'number')
        {
            return value;
        }

        const str = String(value);

        if (str.startsWith('0x') || str.startsWith('0X'))
        {
            return Number.parseInt(str, 16);
        }

        return this.resolveNumber(str, fallback);
    }

    private resolveTags(value: unknown): string[]
    {
        if (!value)
        {
            return [];
        }

        return String(value)
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
    }

    private resolveString(value: unknown, vars: Record<string, unknown>): string
    {
        if (typeof value === 'string' && value.startsWith('$'))
        {
            const key = value.slice(1);
            const varValue = vars[key];
            return varValue !== undefined ? String(varValue) : '';
        }

        return value !== undefined && value !== null ? String(value) : '';
    }

    private decodeCaption(value?: string): string
    {
        if (value === undefined)
        {
            return '';
        }

        try
        {
            return decodeURIComponent(value);
        }
        catch
        {
            return value;
        }
    }
}
