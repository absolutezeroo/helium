import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {WindowFrame, WindowHeader, WindowContent} from '@ui/common/window';

export function FriendsMessengerView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<WindowFrame uniqueKey="messenger" title="Messenger" width={400} height={500} onClose={() => setIsOpen(false)}>
				<WindowHeader title="Messenger" onClose={() => setIsOpen(false)}/>
				<WindowContent>
					<p class="text-muted text-center">Coming Soon</p>
				</WindowContent>
			</WindowFrame>
		</Show>
	);
}
