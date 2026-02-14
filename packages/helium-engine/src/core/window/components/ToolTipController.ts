import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IToolTipWindow } from './IToolTipWindow';
import { WindowEvent } from '../events/WindowEvent';
import { ContainerController } from './ContainerController';

/**
 * Controller for tooltip windows.
 *
 * A container-based tooltip that sets the top-level param flag to
 * ensure it floats above other content.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ToolTipController.as
 */
export class ToolTipController extends ContainerController implements IToolTipWindow
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
        id: number = 0
    )
    {
        param = param | 0x020000;
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
    }
}
