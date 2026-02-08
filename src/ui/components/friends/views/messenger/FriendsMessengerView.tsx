import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

export function FriendsMessengerView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<HeliumCardView uniqueKey="messenger" width={400} height={500}>
				<HeliumCardHeaderView title="Messenger" onClose={() => setIsOpen(false)}/>
				<HeliumCardContentView>
					<p class="text-muted text-center py-5">Coming Soon</p>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
