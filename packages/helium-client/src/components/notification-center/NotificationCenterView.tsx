import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {WindowFrame, WindowHeader, WindowContent} from '@ui/common/window';

export function NotificationCenterView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<WindowFrame uniqueKey="notification-center" title="Notifications" width={380} height={450} onClose={() => setIsOpen(false)}>
				<WindowHeader title="Notifications" onClose={() => setIsOpen(false)}/>
				<WindowContent>
					<p class="text-muted text-center">Coming Soon</p>
				</WindowContent>
			</WindowFrame>
		</Show>
	);
}
