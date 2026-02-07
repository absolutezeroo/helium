import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {HeliumCardView, HeliumCardHeaderView, HeliumCardContentView} from '@ui/common/card';

export function CatalogView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<HeliumCardView uniqueKey="catalog" width={600} height={500}>
				<HeliumCardHeaderView title="Catalog" onClose={() => setIsOpen(false)}/>
				<HeliumCardContentView>
					<p class="text-text-muted text-center py-12">Coming Soon</p>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
