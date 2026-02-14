import { For, JSX, Show } from 'solid-js';
import { WINDOW_STATE } from '../../windowing/enum';
import type { IWindow } from '../../windowing/interfaces/IWindow';
import type { IWindowContainer } from '../../windowing/interfaces/IWindowContainer';
import { WindowMouseEvent } from '../../windowing/events/WindowMouseEvent';

function handleMouse(win: IWindow, type: string, event: MouseEvent): void
{
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    const mouse = new WindowMouseEvent(
        type,
        win,
        null,
        localX,
        localY,
        event.clientX,
        event.clientY,
        event.altKey,
        event.ctrlKey,
        event.shiftKey,
        event.buttons > 0,
        'deltaY' in event ? (event as WheelEvent).deltaY : 0
    );

    win.dispatch(mouse);
}

function nodeStyle(win: IWindow): JSX.CSSProperties
{
    const style: JSX.CSSProperties =
    {
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        opacity: win.blend ?? 1,
        overflow: 'hidden',
        pointerEvents: win.visible ? 'auto' : 'none',
        display: win.visible ? 'block' : 'none'
    };

    if (win.background)
    {
        const color = win.color.toString(16).padStart(6, '0');
        style.background = `#${color.slice(-6)}`;
    }

    if (win.testStateFlag(WINDOW_STATE.FOCUSED))
    {
        style.outline = '1px solid #2f80ed';
    }

    return style;
}

export function WindowRenderer(props: { window: IWindowContainer }): JSX.Element
{
    const win = props.window;
    const children = (win as IWindowContainer).children ?? [];

    const tag = win.tag;
    const isText = tag === 'text' || tag === 'label' || tag === 'link';
    const isButton = tag.includes('button');
    const isFrame = tag === 'frame';
    const isContainer = tag === 'container' || tag.startsWith('itemlist');

    const content = decodeURIComponent(win.caption ?? '');

    return (
        <div
            class={`window-node ${isFrame ? 'win-frame' : ''}`}
            style={nodeStyle(win)}
            data-tag={tag}
            onMouseEnter={(e) => handleMouse(win, WindowMouseEvent.OVER, e)}
            onMouseLeave={(e) => handleMouse(win, WindowMouseEvent.OUT, e)}
            onMouseDown={(e) => handleMouse(win, WindowMouseEvent.DOWN, e)}
            onMouseUp={(e) => handleMouse(win, WindowMouseEvent.UP, e)}
            onClick={(e) => handleMouse(win, WindowMouseEvent.CLICK, e)}
            onDblClick={(e) => handleMouse(win, WindowMouseEvent.DOUBLE_CLICK, e)}
            onMouseMove={(e) => handleMouse(win, WindowMouseEvent.MOVE, e)}
        >
            <Show when={isFrame}>
                <div class="win-header">{win.caption || win.name || tag}</div>
                <div class="win-body">
                    <For each={children}>{(child) => <WindowRenderer window={child as IWindowContainer} />}</For>
                </div>
            </Show>

            <Show when={!isFrame}>
                <Show when={isText}>
                    <div class="win-text" style={{ padding: '2px 4px' }}>
                        {content || win.name}
                    </div>
                </Show>

                <Show when={isButton}>
                    <button class="win-button">{content || win.name}</button>
                </Show>

                <Show when={isContainer && !isFrame}>
                    <For each={children}>{(child) => <WindowRenderer window={child as IWindowContainer} />}</For>
                </Show>

                <Show when={!isText && !isButton && !isFrame && !isContainer}>
                    <For each={children}>{(child) => <WindowRenderer window={child as IWindowContainer} />}</For>
                </Show>
            </Show>
        </div>
    );
}
