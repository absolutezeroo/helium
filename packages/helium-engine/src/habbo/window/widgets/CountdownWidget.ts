import type { IWidget, IWidgetProperty } from './IWidget';

/**
 * Countdown timer widget.
 *
 * Displays a countdown timer with configurable number of digit groups
 * (weeks, days, hours, minutes, seconds). Supports start/stop, color
 * styles, and live updates.
 *
 * In the AS3 version, implements IUpdateReceiver for per-frame updates.
 * In the TypeScript port, state is stored for the UI layer to render.
 *
 * @see sources/win63_version/habbo/window/widgets/CountdownWidget.as
 */
export class CountdownWidget implements IWidget
{
    public static readonly TYPE: string = 'countdown';

    private static readonly RUNNING_KEY: string = 'countdown:running';
    private static readonly DIGITS_KEY: string = 'countdown:digits';
    private static readonly SECONDS_KEY: string = 'countdown:seconds';
    private static readonly COLOR_STYLE_KEY: string = 'countdown:color_style';

    private static readonly UNIT_NAMES: string[] = ['weeks', 'days', 'hours', 'minutes', 'seconds'];
    private static readonly UNIT_SECONDS: number[] = [604800, 86400, 3600, 60, 1];
    private static readonly UNIT_MAX_VALUES: number[] = [100, 7, 24, 60, 60];

    private _disposed: boolean = false;
    private _running: boolean = false;
    private _startSeconds: number = 0;
    private _startTime: number = Date.now();
    private _digits: number = 3;
    private _colorStyle: number = 0;
    private _displayedTime: number = -1;

    constructor()
    {
    }

    /**
     * Determine the maximum unit index for the given digit count and total seconds.
     */
    private static getMaxUnitIndex(digits: number, totalSeconds: number): number
    {
        for(let i = 0; i < CountdownWidget.UNIT_SECONDS.length - digits; i++)
        {
            if(totalSeconds >= CountdownWidget.UNIT_SECONDS[i])
            {
                return i;
            }
        }

        return CountdownWidget.UNIT_SECONDS.length - digits;
    }

    public get running(): boolean
    {
        return this._running;
    }

    public set running(value: boolean)
    {
        if(this._running && !value)
        {
            this._startSeconds = this.seconds;
        }

        if(!this._running && value)
        {
            this._startTime = Date.now();
        }

        this._running = value;
    }

    public get digits(): number
    {
        return this._digits;
    }

    public set digits(value: number)
    {
        this._digits = Math.max(2, Math.min(4, value));
    }

    public get seconds(): number
    {
        if(this._running)
        {
            return Math.max(0, this._startSeconds - (Date.now() - this._startTime) / 1000);
        }

        return this._startSeconds;
    }

    public set seconds(value: number)
    {
        this._startSeconds = value;
        this._startTime = Date.now();
    }

    public get colorStyle(): number
    {
        return this._colorStyle;
    }

    public set colorStyle(value: number)
    {
        this._colorStyle = value;
    }

    /**
     * Get the breakdown of the countdown for display.
     *
     * @returns Array of { value, unit } pairs for each digit group
     */
    public getDisplayValues(): { value: number; unit: string }[]
    {
        const totalSeconds = Math.floor(this.seconds);
        const maxUnitIndex = CountdownWidget.getMaxUnitIndex(this._digits, totalSeconds);
        const result: { value: number; unit: string }[] = [];

        for(let i = 0; i < this._digits; i++)
        {
            const unitIndex = maxUnitIndex + i;
            const unitValue = Math.floor(totalSeconds / CountdownWidget.UNIT_SECONDS[unitIndex]) % CountdownWidget.UNIT_MAX_VALUES[unitIndex];

            result.push({
                value: unitValue,
                unit: CountdownWidget.UNIT_NAMES[unitIndex],
            });
        }

        return result;
    }

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: CountdownWidget.RUNNING_KEY, value: this._running, type: 'Boolean' },
            { key: CountdownWidget.DIGITS_KEY, value: this._digits, type: 'uint' },
            { key: CountdownWidget.SECONDS_KEY, value: this.seconds, type: 'int' },
            { key: CountdownWidget.COLOR_STYLE_KEY, value: this._colorStyle, type: 'int' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case CountdownWidget.RUNNING_KEY:
                    this.running = Boolean(prop.value);
                    break;
                case CountdownWidget.DIGITS_KEY:
                    this.digits = Number(prop.value);
                    break;
                case CountdownWidget.SECONDS_KEY:
                    this.seconds = Number(prop.value);
                    break;
                case CountdownWidget.COLOR_STYLE_KEY:
                    this.colorStyle = Number(prop.value);
                    break;
            }
        }
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}

