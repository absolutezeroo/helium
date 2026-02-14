import type { IWidget, IWidgetProperty } from './IWidget';

/**
 * Balloon / speech bubble widget.
 *
 * Renders a balloon shape with an arrow pointer positioned relative to
 * the balloon body. Supports arrow pivot placement (up/down/left/right,
 * minimum/middle/maximum) and displacement offset.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow for arrow rendering
 * and IWindowContainer for the border. In the TypeScript port, balloon
 * layout metadata is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/BalloonWidget.as
 */
export class BalloonWidget implements IWidget
{
    public static readonly TYPE: string = 'balloon';

    private static readonly ARROW_PIVOT_KEY: string = 'balloon:arrow_pivot';
    private static readonly ARROW_DISPLACEMENT_KEY: string = 'balloon:arrow_displacement';
    private static readonly ARROW_FREE_PADDING: number = 6;
    private static readonly ARROW_LENGTH: number = 6;
    private static readonly ARROW_WIDTH: number = 9;

    private _disposed: boolean = false;
    private _arrowPivot: string = 'up, center';
    private _arrowDisplacement: number = 0;
    private _batchUpdate: boolean = false;

    constructor()
    {
    }

    public get arrowPivot(): string
    {
        return this._arrowPivot;
    }

    public set arrowPivot(value: string)
    {
        this._arrowPivot = value;
    }

    public get arrowDisplacement(): number
    {
        return this._arrowDisplacement;
    }

    public set arrowDisplacement(value: number)
    {
        this._arrowDisplacement = value;
    }

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: BalloonWidget.ARROW_PIVOT_KEY, value: this._arrowPivot, type: 'String' },
            { key: BalloonWidget.ARROW_DISPLACEMENT_KEY, value: this._arrowDisplacement, type: 'int' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
    {
        this._batchUpdate = true;

        for(const prop of values)
        {
            switch(prop.key)
            {
                case BalloonWidget.ARROW_PIVOT_KEY:
                    this.arrowPivot = String(prop.value);
                    break;
                case BalloonWidget.ARROW_DISPLACEMENT_KEY:
                    this.arrowDisplacement = Number(prop.value);
                    break;
            }
        }

        this._batchUpdate = false;
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

