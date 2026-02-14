import type { IWindowContainer } from '../IWindowContainer';

/**
 * Interface for item list windows.
 *
 * An item list arranges children in a single-axis layout
 * (horizontal or vertical) with optional spacing.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IItemListWindow.as
 */
export interface IItemListWindow extends IWindowContainer
{
    autoArrangeItems: boolean;
    spacing: number;

    arrangeItems(): void;
}
