import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import { InteractiveController } from './InteractiveController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for button windows.
 *
 * An interactive component with visual content that responds
 * to mouse events and state changes (normal, hover, pressed, disabled).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ButtonController.as
 */
export class ButtonController extends InteractiveController
{
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
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

        this._hasVisualContent = true;
    }
}
