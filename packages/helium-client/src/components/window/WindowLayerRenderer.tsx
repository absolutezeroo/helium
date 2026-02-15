import type {JSX} from 'solid-js';
import {For} from 'solid-js';
import {getWindowDesktop, getWindowVersion} from '../../stores/windowStore';
import {WindowRenderer} from './WindowRenderer';
import {WindowContextLayer} from '@habbo/window/enum/WindowContextLayer';
import type {IWindow} from '@core/window/IWindow';

/**
 * Layer names for CSS class purposes.
 */
const LAYER_NAMES = ['background', 'default', 'dialogs', 'tooltips'];

/**
 * Z-index base for each IWindow layer (offset from declarative layers).
 */
const LAYER_Z_INDEX = [400, 500, 600, 700];

/**
 * Renders a single desktop layer's children.
 */
function IWindowDesktopLayer(props: { layer: number }): JSX.Element
{
	const version = getWindowVersion(props.layer);

	const desktopChildren = (): IWindow[] =>
	{
		// Read version to subscribe to changes
		const v = version();

		const desktop = getWindowDesktop(props.layer);

		if(!desktop)
		{
			console.debug(`[WindowLayerRenderer] Layer ${props.layer}: no desktop (version=${v})`);
			return [];
		}

		const container = desktop as IWindow & { children?: IWindow[] | null; numChildren?: number };
		const kids = container.children ? [...container.children] : [];

		if(kids.length > 0)
		{
			console.debug(`[WindowLayerRenderer] Layer ${props.layer}: ${kids.length} children (version=${v})`, kids);
		}

		return kids;
	};

	return (
		<div
			class={`hw-iwindow-layer hw-iwindow-layer-${LAYER_NAMES[props.layer]}`}
			style={{
				position: 'absolute',
				inset: '0',
				'z-index': LAYER_Z_INDEX[props.layer],
				'pointer-events': 'none',
			}}
		>
			<For each={desktopChildren()}>
				{(child) => (
					<div style={{'pointer-events': 'auto'}}>
						<WindowRenderer window={child}/>
					</div>
				)}
			</For>
		</div>
	);
}

/**
 * Renders the 4 IWindow desktop layers.
 *
 * Sits alongside WindowLayerManager in the DOM. The two systems coexist:
 * - WindowLayerManager renders declarative IWindowInstance windows (JSON layouts)
 * - IWindowLayerRenderer renders AS3-compatible IWindow trees (engine-created)
 */
export function WindowLayerRenderer(): JSX.Element
{
	return (
		<div class="hw-iwindow-layers">
			<For each={Array.from({length: WindowContextLayer.COUNT}, (_, i) => i)}>
				{(layer) => <IWindowDesktopLayer layer={layer}/>}
			</For>
		</div>
	);
}
