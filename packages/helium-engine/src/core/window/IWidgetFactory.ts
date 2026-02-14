import type { IWidget } from './IWidget';
import type { IWindow } from './IWindow';

/**
 * Widget factory interface.
 *
 * Creates widget instances by type identifier.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWidgetFactory.as
 */
export interface IWidgetFactory
{
    createWidget(type: number, window: IWindow): IWidget | null;
    destroyWidget(widget: IWidget): void;
}
