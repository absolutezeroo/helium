import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {HeliumCardView, HeliumCardHeaderView, HeliumCardContentView} from '@ui/common/card';

export function UserProfileView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<HeliumCardView uniqueKey="user-profile" width={400} height={450}>
				<HeliumCardHeaderView title="User Profile" onClose={() => setIsOpen(false)}/>
				<HeliumCardContentView>
					<p class="text-text-muted text-center py-12">Coming Soon</p>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
