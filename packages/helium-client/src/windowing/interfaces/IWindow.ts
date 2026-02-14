import type {WindowEvent} from '../events/WindowEvent';
import type {WindowMouseEvent} from '../events/WindowMouseEvent';
import type {WindowStateFlag} from '../enum/WindowState';

export interface IWindow
{
    id: number;
    name: string;
    tag: string;
    type: number;
    style: number;
    param: number;
    caption: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    background: boolean;
    blend: number;
    color: number;
    clipping: boolean;
    tags: string[];
    state: WindowStateFlag;
    parent: IWindow | null;
    attributes: Record<string, string>;
    layoutVars?: Record<string, unknown>;

    testStateFlag(flag: WindowStateFlag): boolean;
    addEventListener(type: string, listener: (event: WindowEvent | WindowMouseEvent) => void, priority?: number): void;
    removeEventListener(type: string, listener: (event: WindowEvent | WindowMouseEvent) => void): void;
    hasEventListener(type: string): boolean;
    dispatch(event: WindowEvent | WindowMouseEvent): void;
    dispose(): void;
    findChildByName(name: string): IWindow | null;
    findChildByTag(tag: string): IWindow | null;
}
