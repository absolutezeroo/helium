import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IIterator } from '../utils/IIterator';
import type { IWidgetWindow } from './IWidgetWindow';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';
import { PropertyStruct } from '../utils/PropertyStruct';

/**
 * Controller for widget windows.
 *
 * Hosts an IWidget that provides custom rendering and behavior.
 * The widget type is configured through properties and created via
 * the context's widget factory.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/WidgetWindowController.as
 */
export class WidgetWindowController extends WindowController implements IWidgetWindow
{
    private _widgetType: string = '';
    private _widget: unknown = null;

    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
    }

    /**
     * The hosted widget.
     */
    public get widget(): unknown
    {
        return this._widget;
    }

    /**
     * The root window of the widget.
     */
    public get rootWindow(): IWindow | null
    {
        return this.getChildAt(0);
    }

    public set rootWindow(value: IWindow | null)
    {
        this.removeChildAt(0);

        if(value === null)
        {
            return;
        }

        this.addChild(value);

        if(value.tags.indexOf('_EXCLUDE') < 0)
        {
            value.tags.push('_EXCLUDE');
        }
    }

    /**
     * Returns an iterator from the widget, or an empty iterator.
     */
    public iterator(): IIterator
    {
        return {
            next: () => null,
            reset: () => {},
            count: () => 0
        };
    }

    public override set color(value: number)
    {
        super.color = value;

        const colorized: IWindow[] = [];
        this.groupChildrenWithTag('_COLORIZE', colorized, -1);

        for(const child of colorized)
        {
            child.color = value;
        }
    }

    public override get color(): number
    {
        return super.color;
    }

    public override get properties(): unknown[]
    {
        const widgetProps: unknown[] = [];
        widgetProps.unshift(this.createProperty('widget_type', this._widgetType));

        return super.properties.concat(widgetProps);
    }

    public override set properties(value: unknown[])
    {
        for(const item of value)
        {
            const prop = item as PropertyStruct;

            if(prop.key === 'widget_type')
            {
                const newType = String(prop.value);

                if(this._widgetType !== newType)
                {
                    this._widgetType = newType;
                }

                break;
            }
        }

        super.properties = value;
    }

    public override dispose(): void
    {
        if(!this.disposed)
        {
            this._widget = null;
            super.dispose();
        }
    }
}
