import { WINDOW_STATE, type WindowStateFlag } from './enum/WindowState';
import type { IWindow } from './interfaces/IWindow';
import type { IWindowContainer } from './interfaces/IWindowContainer';
import { WindowEventDispatcher } from './WindowEventDispatcher';
import { WindowDisposeEvent } from './events/WindowDisposeEvent';
import type { WindowEvent } from './events/WindowEvent';
import type { WindowMouseEvent } from './events/WindowMouseEvent';

export interface WindowInit
{
    id?: number;
    name?: string;
    tag?: string;
    type?: number;
    style?: number;
    param?: number;
    caption?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
    background?: boolean;
    blend?: number;
    color?: number;
    tags?: string[];
    attributes?: Record<string, string>;
    layoutVars?: Record<string, unknown>;
}

export class Window implements IWindow
{
    public id: number;
    public name: string;
    public tag: string;
    public type: number;
    public style: number;
    public param: number;
    public caption: string;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public visible: boolean;
    public background: boolean;
    public blend: number;
    public color: number;
    public tags: string[];
    public state: WindowStateFlag;
    public parent: IWindow | null;
    public attributes: Record<string, string>;
    public layoutVars?: Record<string, unknown>;

    protected _dispatcher: WindowEventDispatcher;
    protected _children: IWindow[];
    protected _disposed: boolean;

    public constructor(options: WindowInit = {}, parent: IWindow | null = null)
    {
        this.id = options.id ?? 0;
        this.name = options.name ?? '';
        this.tag = options.tag ?? '';
        this.type = options.type ?? 0;
        this.style = options.style ?? 0;
        this.param = options.param ?? 0;
        this.caption = options.caption ?? '';
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 0;
        this.height = options.height ?? 0;
        this.visible = options.visible ?? true;
        this.background = options.background ?? false;
        this.blend = options.blend ?? 1;
        this.color = options.color ?? 0xffffff;
        this.tags = options.tags ?? [];
        this.state = WINDOW_STATE.DEFAULT;
        this.parent = parent;
        this.attributes = options.attributes ?? {};
        this.layoutVars = options.layoutVars;
        this._dispatcher = new WindowEventDispatcher();
        this._children = [];
        this._disposed = false;
    }

    public get children(): IWindow[]
    {
        return this._children;
    }

    public setStateFlag(flag: WindowStateFlag, enabled: boolean = true): void
    {
        if (enabled)
        {
            this.state |= flag;
        }
        else
        {
            this.state &= ~flag;
        }
    }

    public testStateFlag(flag: WindowStateFlag): boolean
    {
        return (this.state & flag) === flag;
    }

    public addEventListener(type: string, listener: (event: WindowEvent | WindowMouseEvent) => void, priority = 0): void
    {
        this._dispatcher.addEventListener(type, listener as (event: WindowEvent) => void, priority);
    }

    public removeEventListener(type: string, listener: (event: WindowEvent | WindowMouseEvent) => void): void
    {
        this._dispatcher.removeEventListener(type, listener as (event: WindowEvent) => void);
    }

    public hasEventListener(type: string): boolean
    {
        return this._dispatcher.hasEventListener(type);
    }

    public dispatch(event: WindowEvent | WindowMouseEvent): void
    {
        this._dispatcher.dispatchEvent(event as WindowEvent);
    }

    public dispose(): void
    {
        if (this._disposed)
        {
            return;
        }

        this._disposed = true;
        this.dispatch(new WindowDisposeEvent(this));
        this._children.forEach((child) => child.dispose());
        this._children.length = 0;
        this.parent = null;
    }

    public findChildByName(name: string): IWindow | null
    {
        for (const child of this._children)
        {
            if (child.name === name)
            {
                return child;
            }
        }

        for (const child of this._children)
        {
            const found = child.findChildByName(name);

            if (found)
            {
                return found;
            }
        }

        return null;
    }

    public findChildByTag(tag: string): IWindow | null
    {
        if (this.tags.includes(tag))
        {
            return this;
        }

        for (const child of this._children)
        {
            const match = child.findChildByTag(tag);

            if (match)
            {
                return match;
            }
        }

        return null;
    }
}

export class WindowContainer extends Window implements IWindowContainer
{
    public constructor(options: WindowInit = {}, parent: IWindow | null = null)
    {
        super(options, parent);
    }

    public addChild(child: IWindow): IWindow
    {
        if (this._children.includes(child))
        {
            return child;
        }

        this._children.push(child);
        child.parent = this;
        return child;
    }

    public addChildAt(child: IWindow, index: number): IWindow
    {
        if (this._children.includes(child))
        {
            return child;
        }

        this._children.splice(index, 0, child);
        child.parent = this;
        return child;
    }

    public removeChild(child: IWindow): IWindow | null
    {
        const idx = this._children.indexOf(child);

        if (idx === -1)
        {
            return null;
        }

        this._children.splice(idx, 1);
        child.parent = null;
        return child;
    }

    public getChildAt(index: number): IWindow | null
    {
        return this._children[index] ?? null;
    }

    public getChildIndex(child: IWindow): number
    {
        return this._children.indexOf(child);
    }

    public swapChildren(a: IWindow, b: IWindow): void
    {
        const idxA = this._children.indexOf(a);
        const idxB = this._children.indexOf(b);

        if (idxA === -1 || idxB === -1)
        {
            return;
        }

        this._children[idxA] = b;
        this._children[idxB] = a;
    }
}
