import { createEffect, createSignal, For, JSX, Show } from 'solid-js';
import type { IWindow } from '../../windowing/interfaces/IWindow';
import type { IWindowContainer } from '../../windowing/interfaces/IWindowContainer';
import { WindowMouseEvent } from '../../windowing/events/WindowMouseEvent';
import { BitmapSkinRenderer } from '../../windowing/skins/BitmapSkinRenderer';
import type { SkinContainer } from '../../windowing/skins/SkinContainer';

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

function nodeStyle(win: IWindow, useSkin: boolean): JSX.CSSProperties
{
    const color = win.color ?? 0xffffff;
    const rgb = color & 0xffffff;
    const alpha = color > 0xffffff ? ((color >>> 24) & 0xff) / 255 : 1;
    const red = (rgb >> 16) & 0xff;
    const green = (rgb >> 8) & 0xff;
    const blue = rgb & 0xff;

    const style: JSX.CSSProperties =
    {
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        opacity: win.blend ?? 1,
        overflow: win.clipping ? 'hidden' : 'visible',
        pointerEvents: win.visible ? 'auto' : 'none',
        display: win.visible ? 'block' : 'none'
    };

    if (win.background && !useSkin)
    {
        style.background = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    return style;
}

function SkinLayer(props: { window: IWindow; renderer: BitmapSkinRenderer; skinContainer: SkinContainer }): JSX.Element
{
    let canvasRef: HTMLCanvasElement | undefined;
    const [version, setVersion] = createSignal(0);

    const requestRedraw = () => setVersion((value) => value + 1);

    createEffect(() =>
    {
        version();
        if (!canvasRef)
        {
            return;
        }

        const width = Math.max(1, Math.round(props.window.width));
        const height = Math.max(1, Math.round(props.window.height));

        if (canvasRef.width !== width)
        {
            canvasRef.width = width;
        }

        if (canvasRef.height !== height)
        {
            canvasRef.height = height;
        }

        const state = props.skinContainer.getTheActualState(props.window.type, props.window.style, props.window.state);
        props.renderer.draw(props.window, canvasRef, state, requestRedraw);
    });

    return <canvas ref={canvasRef} class="win-skin" />;
}

export function WindowRenderer(props: { window: IWindowContainer; skinContainer?: SkinContainer | null }): JSX.Element
{
    const win = props.window;
    const children = (win as IWindowContainer).children ?? [];

    const tag = win.tag;
    const isText = tag === 'text' || tag === 'label' || tag === 'link';
    const isInput = tag === 'input';
    const isBitmap = tag === 'bitmap' || tag === 'static_bitmap';
    const isFrame = tag === 'frame';
    const isTabContext = tag === 'tab_context';
    const isTabButton = tag.startsWith('tab_') || tag === 'tab_container_button';
    const isDropMenu = tag === 'dropmenu' || tag === 'droplist';
    const isItemList = tag.startsWith('itemlist') || tag.startsWith('scrollable_itemlist');
    const isItemGrid = tag.startsWith('itemgrid') || tag.startsWith('scrollable_itemgrid');
    const isRegion = tag === 'region';
    const isContainer = tag === 'container' || isRegion || tag === 'widget' || tag === 'window' || isItemList || isItemGrid || isTabContext;
    const isButton = tag.includes('button') && !isTabButton;
    const isBorder = tag.startsWith('border');

    const assetName = win.attributes?.asset_uri || win.attributes?.bitmap_asset_name || win.attributes?.asset;
    const content = win.caption ?? '';
    const label = win.name || content || tag;
    const renderer = props.skinContainer?.getSkinRendererByTypeAndStyle(win.type, win.style);
    const skinRenderer = renderer instanceof BitmapSkinRenderer ? renderer : null;
    const useSkin = !!(skinRenderer && props.skinContainer);
    const childNodes = (
        <For each={children}>
            {(child) => <WindowRenderer window={child as IWindowContainer} skinContainer={props.skinContainer} />}
        </For>
    );
    const className = [
        'window-node',
        isFrame ? 'win-frame' : '',
        isTabContext ? 'win-tab-context' : '',
        isTabButton ? 'win-tab-button' : '',
        isItemList ? 'win-itemlist' : '',
        isItemGrid ? 'win-itemgrid' : '',
        isBitmap ? 'win-bitmap' : '',
        isBorder ? 'win-border' : '',
        isRegion ? 'win-region' : '',
        isDropMenu ? 'win-dropmenu' : '',
        useSkin ? 'win-skin-enabled' : ''
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            class={className}
            style={nodeStyle(win, useSkin)}
            data-tag={tag}
            data-name={label}
            data-asset={assetName ?? ''}
            onMouseEnter={(e) => handleMouse(win, WindowMouseEvent.OVER, e)}
            onMouseLeave={(e) => handleMouse(win, WindowMouseEvent.OUT, e)}
            onMouseDown={(e) => handleMouse(win, WindowMouseEvent.DOWN, e)}
            onMouseUp={(e) => handleMouse(win, WindowMouseEvent.UP, e)}
            onClick={(e) => handleMouse(win, WindowMouseEvent.CLICK, e)}
            onDblClick={(e) => handleMouse(win, WindowMouseEvent.DOUBLE_CLICK, e)}
            onMouseMove={(e) => handleMouse(win, WindowMouseEvent.MOVE, e)}
            onWheel={(e) => handleMouse(win, WindowMouseEvent.WHEEL, e)}
        >
            <Show when={useSkin && skinRenderer && props.skinContainer}>
                <SkinLayer window={win} renderer={skinRenderer} skinContainer={props.skinContainer!} />
            </Show>

            <div class="win-content">
            <Show when={isFrame && !useSkin}>
                <div class="win-header">
                    <span class="win-header-title">{content || win.name || tag}</span>
                    <span class="win-header-controls">
                        <span class="win-control" />
                        <span class="win-control" />
                        <span class="win-control" />
                    </span>
                </div>
                <div class="win-body">{childNodes}</div>
            </Show>

            <Show when={!isFrame || useSkin}>
                <Show when={isText}>
                    <div class="win-text" style={{ padding: '2px 4px' }}>
                        {content || win.name}
                    </div>
                </Show>

                <Show when={isInput}>
                    <input class="win-input" value={content} placeholder={win.name} />
                </Show>

                <Show when={isButton}>
                    <button class="win-button">{content || win.name}</button>
                </Show>

                <Show when={isTabButton}>
                    <div class="win-tab">{content || win.name}</div>
                </Show>

                <Show when={isDropMenu}>
                    <div class="win-dropmenu-label">
                        <span>{content || win.name}</span>
                        <span class="win-caret" />
                    </div>
                    <Show when={children.length > 0}>
                        <div class="win-dropmenu-list">{childNodes}</div>
                    </Show>
                </Show>

                <Show when={isBitmap}>
                    <div class="win-bitmap-placeholder">
                        <span>{assetName || win.name || 'bitmap'}</span>
                    </div>
                </Show>

                <Show when={isContainer && !isFrame && !isDropMenu && !isBitmap && !isTabButton}>
                    {childNodes}
                </Show>

                <Show when={!isText && !isInput && !isButton && !isFrame && !isContainer && !isDropMenu && !isBitmap && !isTabButton}>
                    {childNodes}
                </Show>
            </Show>
            </div>
        </div>
    );
}
