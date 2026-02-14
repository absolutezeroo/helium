import type { IWindow } from '../interfaces/IWindow';
import { WindowEvent } from './WindowEvent';

export class WindowMouseEvent extends WindowEvent
{
    public static readonly CLICK: string = 'WME_CLICK';
    public static readonly DOUBLE_CLICK: string = 'WME_DOUBLE_CLICK';
    public static readonly DOWN: string = 'WME_DOWN';
    public static readonly MIDDLE_CLICK: string = 'WME_MIDDLE_CLICK';
    public static readonly MIDDLE_DOWN: string = 'WME_MIDDLE_DOWN';
    public static readonly MIDDLE_UP: string = 'WME_MIDDLE_UP';
    public static readonly MOVE: string = 'WME_MOVE';
    public static readonly OUT: string = 'WME_OUT';
    public static readonly OVER: string = 'WME_OVER';
    public static readonly UP: string = 'WME_UP';
    public static readonly UP_OUTSIDE: string = 'WME_UP_OUTSIDE';
    public static readonly WHEEL: string = 'WME_WHEEL';
    public static readonly RIGHT_CLICK: string = 'WME_RIGHT_CLICK';
    public static readonly RIGHT_DOWN: string = 'WME_RIGHT_DOWN';
    public static readonly RIGHT_UP: string = 'WME_RIGHT_UP';
    public static readonly ROLL_OUT: string = 'WME_ROLL_OUT';
    public static readonly ROLL_OVER: string = 'WME_ROLL_OVER';
    public static readonly HOVERING: string = 'WME_HOVERING';
    public static readonly CLICK_AWAY: string = 'WME_CLICK_AWAY';

    public readonly delta: number;
    public readonly localX: number;
    public readonly localY: number;
    public readonly stageX: number;
    public readonly stageY: number;
    public readonly altKey: boolean;
    public readonly ctrlKey: boolean;
    public readonly shiftKey: boolean;
    public readonly buttonDown: boolean;

    public constructor(
        type: string,
        window: IWindow | null,
        related: IWindow | null,
        localX: number,
        localY: number,
        stageX: number,
        stageY: number,
        altKey: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        buttonDown: boolean,
        delta: number
    )
    {
        super(type, window, related, true);
        this.localX = localX;
        this.localY = localY;
        this.stageX = stageX;
        this.stageY = stageY;
        this.altKey = altKey;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.buttonDown = buttonDown;
        this.delta = delta;
    }

    public clone(): WindowMouseEvent
    {
        return new WindowMouseEvent(
            this.type,
            this.window,
            this.related,
            this.localX,
            this.localY,
            this.stageX,
            this.stageY,
            this.altKey,
            this.ctrlKey,
            this.shiftKey,
            this.buttonDown,
            this.delta
        );
    }

    public toString(): string
    {
        return `WindowMouseEvent { type: ${this.type} cancelable: ${this.cancelable} window: ${this.window?.name ?? 'null'} localX: ${this.localX} localY: ${this.localY} }`;
    }
}
