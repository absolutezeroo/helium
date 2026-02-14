import type { IWidget, IWidgetProperty } from './IWidget';

/**
 * Progress bar widget.
 *
 * Displays a row of progress indicator disks that can operate in
 * "position" mode (single active disk) or "progress" mode (filled bar).
 * Supports configurable size, style, and position.
 *
 * In the AS3 version, uses IItemListWindow with IStaticBitmapWrapperWindow
 * items. In the TypeScript port, progress state is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/ProgressIndicatorWidget.as
 */
export class ProgressIndicatorWidget implements IWidget
{
    public static readonly TYPE: string = 'progress_indicator';

    private static readonly STYLE_KEY: string = 'progress_indicator:style';
    private static readonly SIZE_KEY: string = 'progress_indicator:size';
    private static readonly POSITION_KEY: string = 'progress_indicator:position';
    private static readonly MODE_KEY: string = 'progress_indicator:mode';

    private static readonly MAXIMUM_SIZE: number = 1000;

    private _disposed: boolean = false;
    private _style: string = 'flat';
    private _size: number = 1;
    private _position: number = 0;
    private _mode: string = 'position';

    constructor()
    {
    }

    public get style(): string
    {
        return this._style;
    }

    public set style(value: string)
    {
        this._style = value;
    }

    public get size(): number
    {
        return this._size;
    }

    public set size(value: number)
    {
        this._size = Math.min(Math.max(value, 1), ProgressIndicatorWidget.MAXIMUM_SIZE);
    }

    public get position(): number
    {
        return this._position;
    }

    public set position(value: number)
    {
        this._position = value;
    }

    public get mode(): string
    {
        return this._mode;
    }

    public set mode(value: string)
    {
        this._mode = value;
    }

    /**
     * Get the active state of each disk for rendering.
     *
     * @returns Array of booleans, one per disk
     */
    public getDiskStates(): boolean[]
    {
        const states: boolean[] = [];

        for(let i = 0; i < this._size; i++)
        {
            switch(this._mode)
            {
                case 'position':
                    states.push(i + 1 === this._position);
                    break;
                case 'progress':
                    states.push(i < this._position);
                    break;
                default:
                    states.push(false);
            }
        }

        return states;
    }

    /**
     * Get the asset name for a disk at the given index.
     */
    public getDiskAssetName(index: number): string
    {
        const active = this.getDiskStates()[index] ?? false;

        return 'progress_disk_' + this._style + (active ? '_on' : '_off');
    }

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: ProgressIndicatorWidget.STYLE_KEY, value: this._style, type: 'String' },
            { key: ProgressIndicatorWidget.SIZE_KEY, value: this._size, type: 'uint' },
            { key: ProgressIndicatorWidget.POSITION_KEY, value: this._position, type: 'uint' },
            { key: ProgressIndicatorWidget.MODE_KEY, value: this._mode, type: 'String' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case ProgressIndicatorWidget.STYLE_KEY:
                    this.style = String(prop.value);
                    break;
                case ProgressIndicatorWidget.SIZE_KEY:
                    this.size = Number(prop.value);
                    break;
                case ProgressIndicatorWidget.POSITION_KEY:
                    this.position = Number(prop.value);
                    break;
                case ProgressIndicatorWidget.MODE_KEY:
                    this.mode = String(prop.value);
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

