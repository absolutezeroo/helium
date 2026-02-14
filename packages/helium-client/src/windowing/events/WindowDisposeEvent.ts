import type { IWindow } from '../interfaces/IWindow';
import { WindowEvent } from './WindowEvent';

export class WindowDisposeEvent extends WindowEvent
{
    public static readonly TYPE: string = 'WINDOW_DISPOSE_EVENT';

    public constructor(window: IWindow | null)
    {
        super(WindowDisposeEvent.TYPE, window, null, false);
    }

    public clone(): WindowDisposeEvent
    {
        return new WindowDisposeEvent(this.window);
    }

    public toString(): string
    {
        return `WindowDisposeEvent { type: ${this.type} window: ${this.window?.name ?? 'null'} }`;
    }
}
