import {createMemo, createSignal, For, JSX, Show} from 'solid-js';
import {WindowContext} from '../../windowing/WindowContext';
import {getAllCompiledLayouts, getCompiledLayout, registerAllLayouts} from '../../windowing/loaders/layoutRegistry';
import type {IWindowContainer} from '../../windowing/interfaces/IWindowContainer';
import {WindowRenderer} from './WindowRenderer';

export function WindowPreview(): JSX.Element
{
	const initialLayout = getAllCompiledLayouts()[0]?.name ?? '';
	const [layoutName, setLayoutName] = createSignal<string>(initialLayout);

	const context = new WindowContext('preview');
	registerAllLayouts(context);

	const built = createMemo<IWindowContainer | null>(() =>
	{
		const layout = getCompiledLayout(layoutName());
		if (!layout) return null;
		return context.build(layout);
	});

	return (
		<div class="window-preview">
			<div style={{display: 'flex', gap: '8px', 'margin-bottom': '12px', 'align-items': 'center'}}>
				<label for="layout-select">Layout</label>
				<select
					id="layout-select"
					value={layoutName()}
					onInput={(event) => setLayoutName((event.currentTarget as HTMLSelectElement).value)}
				>
					<For each={getAllCompiledLayouts()}>
						{(layout) => <option value={layout.name}>{layout.name}</option>}
					</For>
				</select>
			</div>

			<div
				style={{
					position: 'relative',
					"min-height": '400px',
					border: '1px solid #ccc',
					background: '#f9f9f9',
					overflow: 'auto',
					padding: '16px'
				}}
			>
				<Show when={built()} fallback={<div style={{color: '#777'}}>No layout selected.</div>}>
					{(root) => (
						<div
							style={{
								position: 'relative',
								width: `${root().width}px`,
								height: `${root().height}px`
							}}
						>
							<WindowRenderer window={root()} />
						</div>
					)}
				</Show>
			</div>
		</div>
	);
}
