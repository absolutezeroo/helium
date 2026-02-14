import {createMemo, createSignal, For, JSX, Show} from 'solid-js';
import {WindowContext} from '../../windowing/WindowContext';
import {getAllCompiledLayouts, getCompiledLayout, registerAllLayouts} from '../../windowing/loaders/layoutRegistry';
import {getElementDescription, getSkinMap} from '../../windowing/loaders/skinRegistry';
import {buildSkinContainer} from '../../windowing/skins/buildSkinContainer';
import type {IWindowContainer} from '../../windowing/interfaces/IWindowContainer';
import type {SkinContainer} from '../../windowing/skins/SkinContainer';
import {WindowRenderer} from './WindowRenderer';

export function WindowPreview(): JSX.Element
{
	const layouts = getAllCompiledLayouts();
	const initialLayout = layouts.find((layout) => layout.name === 'inventory')?.name ?? layouts[0]?.name ?? '';
	const [layoutName, setLayoutName] = createSignal<string>(initialLayout);
	const [showLabels, setShowLabels] = createSignal<boolean>(false);
	const [useSkin, setUseSkin] = createSignal<boolean>(true);

	const context = new WindowContext('preview');
	registerAllLayouts(context);
	const skinContainer = createMemo<SkinContainer | null>(() =>
	{
		const description = getElementDescription();
		if (!description)
		{
			return null;
		}

		return buildSkinContainer(description, getSkinMap());
	});

	const built = createMemo<IWindowContainer | null>(() =>
	{
		const layout = getCompiledLayout(layoutName());
		if (!layout) return null;
		return context.build(layout);
	});

	return (
		<div class={`window-preview ${showLabels() ? 'show-labels' : ''} ${useSkin() ? 'skin-ubuntu' : ''}`}>
			<div class="window-preview-controls">
				<label for="layout-select">Layout</label>
				<select
					id="layout-select"
					value={layoutName()}
					onInput={(event) => setLayoutName((event.currentTarget as HTMLSelectElement).value)}
				>
					<For each={layouts}>
						{(layout) => <option value={layout.name}>{layout.name}</option>}
					</For>
				</select>
				<label class="window-preview-toggle">
					<input
						type="checkbox"
						checked={showLabels()}
						onInput={(event) => setShowLabels((event.currentTarget as HTMLInputElement).checked)}
					/>
					Show names
				</label>
				<label class="window-preview-toggle">
					<input
						type="checkbox"
						checked={useSkin()}
						onInput={(event) => setUseSkin((event.currentTarget as HTMLInputElement).checked)}
					/>
					Ubuntu skin
				</label>
			</div>

			<div class="window-stage">
				<Show when={built()} fallback={<div style={{color: '#777'}}>No layout selected.</div>}>
					{(root) => (
						<div
							class={`window-root ${useSkin() ? 'skin-enabled' : ''}`}
							style={{
								width: `${root().width}px`,
								height: `${root().height}px`
							}}
						>
							<WindowRenderer window={root()} skinContainer={useSkin() ? skinContainer() : null} />
						</div>
					)}
				</Show>
			</div>
		</div>
	);
}
