import type { IWindow } from '../interfaces/IWindow';

export class WindowEvent
{
    public static readonly DESTROY: string = 'WE_DESTROY';
    public static readonly DESTROYED: string = 'WE_DESTROYED';
    public static readonly OPEN: string = 'WE_OPEN';
    public static readonly OPENED: string = 'WE_OPENED';
    public static readonly CLOSE: string = 'WE_CLOSE';
    public static readonly CLOSED: string = 'WE_CLOSED';
    public static readonly FOCUS: string = 'WE_FOCUS';
    public static readonly FOCUSED: string = 'WE_FOCUSED';
    public static readonly UNFOCUS: string = 'WE_UNFOCUS';
    public static readonly UNFOCUSED: string = 'WE_UNFOCUSED';
    public static readonly ACTIVATE: string = 'WE_ACTIVATE';
    public static readonly ACTIVATED: string = 'WE_ACTIVATED';
    public static readonly DEACTIVATE: string = 'WE_DEACTIVATE';
    public static readonly DEACTIVATED: string = 'WE_DEACTIVATED';
    public static readonly SELECT: string = 'WE_SELECT';
    public static readonly SELECTED: string = 'WE_SELECTED';
    public static readonly UNSELECT: string = 'WE_UNSELECT';
    public static readonly UNSELECTED: string = 'WE_UNSELECTED';
    public static readonly LOCK: string = 'WE_LOCK';
    public static readonly LOCKED: string = 'WE_LOCKED';
    public static readonly UNLOCK: string = 'WE_UNLOCK';
    public static readonly UNLOCKED: string = 'WE_UNLOCKED';
    public static readonly ENABLE: string = 'WE_ENABLE';
    public static readonly ENABLED: string = 'WE_ENABLED';
    public static readonly DISABLE: string = 'WE_DISABLE';
    public static readonly DISABLED: string = 'WE_DISABLED';
    public static readonly RELOCATE: string = 'WE_RELOCATE';
    public static readonly RELOCATED: string = 'WE_RELOCATED';
    public static readonly RESIZE: string = 'WE_RESIZE';
    public static readonly RESIZED: string = 'WE_RESIZED';
    public static readonly MINIMIZE: string = 'WE_MINIMIZE';
    public static readonly MINIMIZED: string = 'WE_MINIMIZED';
    public static readonly MAXIMIZE: string = 'WE_MAXIMIZE';
    public static readonly MAXIMIZED: string = 'WE_MAXIMIZED';
    public static readonly RESTORE: string = 'WE_RESTORE';
    public static readonly RESTORED: string = 'WE_RESTORED';
    public static readonly EXPANDED: string = 'WE_EXPANDED';
    public static readonly COLLAPSE: string = 'WE_COLLAPSE';
    public static readonly CHILD_ADDED: string = 'WE_CHILD_ADDED';
    public static readonly CHILD_REMOVED: string = 'WE_CHILD_REMOVED';
    public static readonly CHILD_RELOCATED: string = 'WE_CHILD_RELOCATED';
    public static readonly CHILD_RESIZED: string = 'WE_CHILD_RESIZED';
    public static readonly CHILD_ACTIVATED: string = 'WE_CHILD_ACTIVATED';
    public static readonly CHILD_VISIBILITY: string = 'WE_CHILD_VISIBILITY';
    public static readonly PARENT_ADDED: string = 'WE_PARENT_ADDED';
    public static readonly PARENT_REMOVED: string = 'WE_PARENT_REMOVED';
    public static readonly PARENT_RELOCATED: string = 'WE_PARENT_RELOCATED';
    public static readonly PARENT_RESIZED: string = 'WE_PARENT_RESIZED';
    public static readonly PARENT_ACTIVATED: string = 'WE_PARENT_ACTIVATED';
    public static readonly OK: string = 'WE_OK';
    public static readonly CANCEL: string = 'WE_CANCEL';
    public static readonly CHANGE: string = 'WE_CHANGE';
    public static readonly SCROLL: string = 'WE_SCROLL';
    public static readonly UNKNOWN: string = '';

    public readonly type: string;
    public readonly window: IWindow | null;
    public readonly related: IWindow | null;
    public readonly cancelable: boolean;

    private _defaultPrevented: boolean;
    private _operationPrevented: boolean;

    public constructor(type: string, window: IWindow | null, related: IWindow | null = null, cancelable = false)
    {
        this.type = type;
        this.window = window;
        this.related = related;
        this.cancelable = cancelable;
        this._defaultPrevented = false;
        this._operationPrevented = false;
    }

    public preventDefault(): void
    {
        this.preventWindowOperation();
    }

    public preventWindowOperation(): void
    {
        if (this.cancelable)
        {
            this._defaultPrevented = true;
            this._operationPrevented = true;
            return;
        }

        throw new Error('Attempted to prevent window operation that is not cancelable.');
    }

    public stopPropagation(): void
    {
        this._defaultPrevented = true;
    }

    public stopImmediatePropagation(): void
    {
        this._defaultPrevented = true;
    }

    public isDefaultPrevented(): boolean
    {
        return this._defaultPrevented;
    }

    public isWindowOperationPrevented(): boolean
    {
        return this._operationPrevented;
    }

    public clone(): WindowEvent
    {
        return new WindowEvent(this.type, this.window, this.related, this.cancelable);
    }

    public toString(): string
    {
        return `WindowEvent { type: ${this.type} cancelable: ${this.cancelable} window: ${this.window?.name ?? 'null'} }`;
    }
}
