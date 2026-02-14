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
        const vars =
        {
            ...(layout.vars || {}),
            ...(options?.overrides || {})
        };

        const rootNode = this.normalizeRootNode(layout.window);
        const root = this.createWindowFromNode(rootNode, vars, null);
        return root as IWindowContainer;
    }

    private normalizeRootNode(node: LayoutNode): LayoutNode
    {
        if (node.tag !== 'window')
        {
            return node;
        }

        if (node.children.length === 1)
        {
            return node.children[0];
        }

        return {
            tag: 'container',
            attributes: {
                clipping: 'false',
                ...node.attributes
            },
            children: node.children
        };
    }

    private createWindowFromNode(node: LayoutNode, vars: Record<string, unknown>, parent: IWindowContainer | null): IWindowContainer
    {
        const attributes = node.attributes || {};
        const resolvedAttributes = this.resolveAttributes(attributes, vars);
        const windowInit: WindowInit = {};

        windowInit.name = this.resolveString(resolvedAttributes.name, vars);
        windowInit.tag = node.tag;
        windowInit.type = this.resolveType(node.tag, resolvedAttributes.type);
        windowInit.style = this.resolveNumber(resolvedAttributes.style, 0);
        windowInit.param = this.resolveParam(resolvedAttributes.params);
        windowInit.caption = this.decodeCaption(resolvedAttributes.caption);
        windowInit.x = this.resolveNumber(resolvedAttributes.x, 0);
        windowInit.y = this.resolveNumber(resolvedAttributes.y, 0);
        windowInit.width = this.resolveNumber(resolvedAttributes.width, 0);
        windowInit.height = this.resolveNumber(resolvedAttributes.height, 0);
        windowInit.visible = this.resolveBoolean(resolvedAttributes.visible, true);
        windowInit.background = this.resolveBoolean(resolvedAttributes.background, false);
        windowInit.blend = this.resolveNumber(resolvedAttributes.blend, 1);
        windowInit.color = this.resolveColor(resolvedAttributes.color, 0xffffff);
        windowInit.clipping = this.resolveBoolean(resolvedAttributes.clipping, true);
        windowInit.tags = this.resolveTags(resolvedAttributes.tags);
        windowInit.id = this.resolveNumber(resolvedAttributes.id, 0);

        windowInit.attributes = { ...resolvedAttributes };
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

    private resolveAttributes(attributes: Record<string, string>, vars: Record<string, unknown>): Record<string, string>
    {
        const resolved: Record<string, string> = {};

        Object.entries(attributes).forEach(([key, value]) =>
        {
            resolved[key] = this.resolveString(value, vars);
        });

        return resolved;
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

        const numeric = this.resolveNumber(value, Number.NaN);

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
        return str === 'true'
            ? true
            : str === 'false'
                ? false
                : fallback;
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
