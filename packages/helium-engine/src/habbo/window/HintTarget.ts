import type { IWindow } from '@core/window/IWindow';

/**
 * Data container for a hint target.
 *
 * @see sources/win63_version/habbo/window/HintTarget.as
 */
export class HintTarget
{
    private _key: string;
    private _window: IWindow;
    private _style: number;

    constructor(window: IWindow, key: string, style: number)
    {
        this._window = window;
        this._key = key;
        this._style = style;
    }

    public get window(): IWindow
    {
        return this._window;
    }

    public set window(value: IWindow)
    {
        this._window = value;
    }

    public get key(): string
    {
        return this._key;
    }

    public set key(value: string)
    {
        this._key = value;
    }

    public get style(): number
    {
        return this._style;
    }

    public set style(value: number)
    {
        this._style = value;
    }
}
