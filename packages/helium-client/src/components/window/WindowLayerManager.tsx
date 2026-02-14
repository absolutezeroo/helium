import {For} from 'solid-js';
import type {JSX} from 'solid-js';
import {useWindowStore} from '../../stores/windowStore';
import {WindowLayoutRenderer} from './WindowLayoutRenderer';
import {WindowContextLayer} from '@habbo/window/enum/WindowContextLayer';

/**
 * Layer names for debugging / CSS class purposes.
 */
const LAYER_NAMES = ['background', 'default', 'dialogs', 'tooltips'];

/**
 * Z-index base for each layer.
 * Each layer uses a z-index range of 100.
 */
const LAYER_Z_INDEX = [0, 100, 200, 300];

/**
 * Renders all open windows across the 4 context layers.
 *
 * Each layer is a positioned div with its own z-index range.
 * Windows within a layer are ordered by their zOrder property.
 *
 * @see sources/win63_version/habbo/window/HabboWindowManagerComponent.as (NUMBER_OF_CONTEXT_LAYERS = 4)
 */
export function WindowLayerManager(): JSX.Element
{
	const store = useWindowStore();

	return (
		<div class="hw-layer-manager">
			<For each={Array.from({length: WindowContextLayer.COUNT}, (_, i) => i)}>
				{(layerIndex) => (
					<div
						class={`hw-layer hw-layer-${LAYER_NAMES[layerIndex]}`}
						style={{
							position: 'absolute',
							inset: '0',
							'z-index': LAYER_Z_INDEX[layerIndex],
							'pointer-events': 'none',
						}}
					>
						<For each={store.layers[layerIndex]}>
							{(instance) => (
								<div
									class="hw-window"
									data-window-id={instance.id}
									data-layout={instance.layoutName}
									style={{
										position: 'absolute',
										'z-index': instance.zOrder,
										'pointer-events': 'auto',
										display: instance.visible ? undefined : 'none',
									}}
								>
									<WindowLayoutRenderer
										node={instance.layoutTree}
										windowId={instance.id}
									/>
								</div>
							)}
						</For>
					</div>
				)}
			</For>
		</div>
	);
}
