import type { IIlluminaBorderWidget } from './IIlluminaBorderWidget';
import type { IWidgetProperty } from './IWidget';

/**
 * Illumina theme border widget.
 *
 * Renders a 9-slice border from named assets, with configurable
 * content padding, side padding, child margin, and named child
 * positioning in top/bottom slots.
 *
 * In the AS3 version, uses BitmapData drawing with Matrix transforms
 * for the 9-slice rendering. In the TypeScript port, border configuration
 * is stored for CSS-based rendering by the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/IlluminaBorderWidget.as
 */
export class IlluminaBorderWidget implements IIlluminaBorderWidget
{
    public static readonly TYPE: string = 'illumina_border';

    public static readonly BORDER_STYLE_ILLUMINA_LIGHT: string = 'illumina_light';
    public static readonly BORDER_STYLE_ILLUMINA_DARK: string = 'illumina_dark';
    public static readonly BORDER_STYLES: string[] = ['illumina_light', 'illumina_dark'];

    private static readonly BORDER_STYLE_KEY: string = 'illumina_border:border_style';
    private static readonly CONTENT_CHILD_KEY: string = 'illumina_border:content_child';
    private static readonly CONTENT_PADDING_KEY: string = 'illumina_border:content_padding';
    private static readonly SIDE_PADDING_KEY: string = 'illumina_border:side_padding';
    private static readonly CHILD_MARGIN_KEY: string = 'illumina_border:child_margin';
    private static readonly TOP_LEFT_CHILD_KEY: string = 'illumina_border:top_left_child';
    private static readonly TOP_CENTER_CHILD_KEY: string = 'illumina_border:top_center_child';
    private static readonly TOP_RIGHT_CHILD_KEY: string = 'illumina_border:top_right_child';
    private static readonly BOTTOM_LEFT_CHILD_KEY: string = 'illumina_border:bottom_left_child';
    private static readonly BOTTOM_CENTER_CHILD_KEY: string = 'illumina_border:bottom_center_child';
    private static readonly BOTTOM_RIGHT_CHILD_KEY: string = 'illumina_border:bottom_right_child';
    private static readonly LANDING_VIEW_MODE_KEY: string = 'illumina_border:landing_view_mode';

    private static readonly BORDER_PIECES: string[] = [
        'top_left', 'top_center', 'top_right', 'center_right',
        'bottom_right', 'bottom_center', 'bottom_left', 'center_left'
    ];

    private _disposed: boolean = false;
    private _batchUpdate: boolean = false;
    private _borderStyle: string = '';
    private _contentChild: string = '';
    private _contentPadding: number = 5;
    private _sidePadding: number = 15;
    private _childMargin: number = 3;
    private _topLeftChild: string = '';
    private _topCenterChild: string = '';
    private _topRightChild: string = '';
    private _bottomLeftChild: string = '';
    private _bottomCenterChild: string = '';
    private _bottomRightChild: string = '';
    private _landingViewMode: boolean = false;

    constructor()
    {
    }

    public get borderStyle(): string
    {
        return this._borderStyle;
    }

    public set borderStyle(value: string)
    {
        this._borderStyle = value;
    }

    public get contentChild(): string
    {
        return this._contentChild;
    }

    public set contentChild(value: string)
    {
        this._contentChild = value ?? '';
    }

    public get contentPadding(): number
    {
        return this._contentPadding;
    }

    public set contentPadding(value: number)
    {
        this._contentPadding = value;
    }

    public get sidePadding(): number
    {
        return this._sidePadding;
    }

    public set sidePadding(value: number)
    {
        this._sidePadding = value;
    }

    public get childMargin(): number
    {
        return this._childMargin;
    }

    public set childMargin(value: number)
    {
        this._childMargin = value;
    }

    public get topLeftChild(): string
    {
        return this._topLeftChild;
    }

    public set topLeftChild(value: string)
    {
        this._topLeftChild = value ?? '';
    }

    public get topCenterChild(): string
    {
        return this._topCenterChild;
    }

    public set topCenterChild(value: string)
    {
        this._topCenterChild = value ?? '';
    }

    public get topRightChild(): string
    {
        return this._topRightChild;
    }

    public set topRightChild(value: string)
    {
        this._topRightChild = value ?? '';
    }

    public get bottomLeftChild(): string
    {
        return this._bottomLeftChild;
    }

    public set bottomLeftChild(value: string)
    {
        this._bottomLeftChild = value ?? '';
    }

    public get bottomCenterChild(): string
    {
        return this._bottomCenterChild;
    }

    public set bottomCenterChild(value: string)
    {
        this._bottomCenterChild = value ?? '';
    }

    public get bottomRightChild(): string
    {
        return this._bottomRightChild;
    }

    public set bottomRightChild(value: string)
    {
        this._bottomRightChild = value ?? '';
    }

    public get landingViewMode(): boolean
    {
        return this._landingViewMode;
    }

    public set landingViewMode(value: boolean)
    {
        this._landingViewMode = value;
    }

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: IlluminaBorderWidget.BORDER_STYLE_KEY, value: this._borderStyle, type: 'String' },
            { key: IlluminaBorderWidget.CONTENT_CHILD_KEY, value: this._contentChild, type: 'String' },
            { key: IlluminaBorderWidget.CONTENT_PADDING_KEY, value: this._contentPadding, type: 'uint' },
            { key: IlluminaBorderWidget.SIDE_PADDING_KEY, value: this._sidePadding, type: 'uint' },
            { key: IlluminaBorderWidget.CHILD_MARGIN_KEY, value: this._childMargin, type: 'uint' },
            { key: IlluminaBorderWidget.TOP_LEFT_CHILD_KEY, value: this._topLeftChild, type: 'String' },
            { key: IlluminaBorderWidget.TOP_CENTER_CHILD_KEY, value: this._topCenterChild, type: 'String' },
            { key: IlluminaBorderWidget.TOP_RIGHT_CHILD_KEY, value: this._topRightChild, type: 'String' },
            { key: IlluminaBorderWidget.BOTTOM_LEFT_CHILD_KEY, value: this._bottomLeftChild, type: 'String' },
            { key: IlluminaBorderWidget.BOTTOM_CENTER_CHILD_KEY, value: this._bottomCenterChild, type: 'String' },
            { key: IlluminaBorderWidget.BOTTOM_RIGHT_CHILD_KEY, value: this._bottomRightChild, type: 'String' },
            { key: IlluminaBorderWidget.LANDING_VIEW_MODE_KEY, value: this._landingViewMode, type: 'Boolean' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
    {
        this._batchUpdate = true;

        for(const prop of values)
        {
            switch(prop.key)
            {
                case IlluminaBorderWidget.BORDER_STYLE_KEY:
                    this.borderStyle = String(prop.value);
                    break;
                case IlluminaBorderWidget.CONTENT_CHILD_KEY:
                    this.contentChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.CONTENT_PADDING_KEY:
                    this.contentPadding = Number(prop.value);
                    break;
                case IlluminaBorderWidget.SIDE_PADDING_KEY:
                    this.sidePadding = Number(prop.value);
                    break;
                case IlluminaBorderWidget.CHILD_MARGIN_KEY:
                    this.childMargin = Number(prop.value);
                    break;
                case IlluminaBorderWidget.TOP_LEFT_CHILD_KEY:
                    this.topLeftChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.TOP_CENTER_CHILD_KEY:
                    this.topCenterChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.TOP_RIGHT_CHILD_KEY:
                    this.topRightChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.BOTTOM_LEFT_CHILD_KEY:
                    this.bottomLeftChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.BOTTOM_CENTER_CHILD_KEY:
                    this.bottomCenterChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.BOTTOM_RIGHT_CHILD_KEY:
                    this.bottomRightChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.LANDING_VIEW_MODE_KEY:
                    this.landingViewMode = Boolean(prop.value);
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

