import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

/**
 * NavigatorRoomInfoView - Room info popup from navigator.
 */
export function NavigatorRoomInfoView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<HeliumCardView uniqueKey="room-info" width={350} height={400}>
				<HeliumCardHeaderView title="Room Info" onClose={() => setIsOpen(false)}/>
				<HeliumCardContentView>
					<p class="text-muted text-center py-5">Coming Soon</p>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
