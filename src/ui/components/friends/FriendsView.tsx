import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {HeliumCardView, HeliumCardHeaderView, HeliumCardContentView} from '@ui/common/card';

export function FriendsView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<HeliumCardView uniqueKey="friends" width={350} height={500}>
				<HeliumCardHeaderView title="Friends" onClose={() => setIsOpen(false)}/>
				<HeliumCardContentView>
					<p class="text-text-muted text-center py-12">Coming Soon</p>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
