import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

export function NotificationCenterView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<HeliumCardView uniqueKey="notification-center" width={380} height={450}>
				<HeliumCardHeaderView title="Notifications" onClose={() => setIsOpen(false)}/>
				<HeliumCardContentView>
					<p class="text-text-muted text-center py-12">Coming Soon</p>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
