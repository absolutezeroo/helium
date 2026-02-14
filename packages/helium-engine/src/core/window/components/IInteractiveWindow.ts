import type { IWindow } from '../IWindow';

/**
 * Interface for interactive windows with tooltip and mouse cursor support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IInteractiveWindow.as
 */
export interface IInteractiveWindow extends IWindow
{
    toolTipCaption: string;
    toolTipDelay: number;
    toolTipIsDynamic: boolean;

    showToolTip(toolTip: IToolTipWindow): void;
    hideToolTip(): void;
    setMouseCursorForState(state: number, cursor: number): number;
    getMouseCursorByState(state: number): number;
}

// Forward declaration to avoid circular dependency
import type { IToolTipWindow } from './IToolTipWindow';
