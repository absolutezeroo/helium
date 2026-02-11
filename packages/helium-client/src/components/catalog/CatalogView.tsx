import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {WindowFrame, WindowHeader, WindowContent} from '@ui/common/window';

export function CatalogView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<WindowFrame uniqueKey="catalog" title="Catalog" width={600} height={500} onClose={() => setIsOpen(false)}>
				<WindowHeader title="Catalog" onClose={() => setIsOpen(false)}/>
				<WindowContent>
					<p class="text-muted text-center">Coming Soon</p>
				</WindowContent>
			</WindowFrame>
		</Show>
	);
}
