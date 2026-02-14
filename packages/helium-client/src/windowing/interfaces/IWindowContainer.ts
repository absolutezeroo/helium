import type { IWindow } from './IWindow';

export interface IWindowContainer extends IWindow
{
    children: IWindow[];

    addChild(child: IWindow): IWindow;
    addChildAt(child: IWindow, index: number): IWindow;
    removeChild(child: IWindow): IWindow | null;
    getChildAt(index: number): IWindow | null;
    getChildIndex(child: IWindow): number;
    swapChildren(a: IWindow, b: IWindow): void;
}
