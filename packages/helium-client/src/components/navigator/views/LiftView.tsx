import type {JSX} from 'solid-js';
import {createSignal, For, onCleanup, onMount, Show} from 'solid-js';
import clsx from 'clsx';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';

/**
 * Auto-cycle interval in milliseconds
 * @see LiftView.as - 8 second cycle
 */
const CYCLE_INTERVAL_MS = 8000;

/**
 * LiftView - Carousel for promoted (lifted) rooms.
 *
 * Auto-cycles through promoted rooms every 8 seconds.
 * Shows pager dots for manual navigation.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/LiftView.as
 */
export function LiftView(): JSX.Element
{
	const {state: nav, actions} = useNavigator();

	const [selectedPage, setSelectedPage] = createSignal(0);

	let cycleInterval: ReturnType<typeof setInterval> | undefined;

	const liftedRooms = () => nav.liftedRooms;

	const advancePage = () =>
	{
		const rooms = liftedRooms();

		if (rooms.length === 0) return;

		setSelectedPage((prev) => (prev + 1) % rooms.length);
	};

	onMount(() =>
	{
		cycleInterval = setInterval(advancePage, CYCLE_INTERVAL_MS);
	});

	onCleanup(() =>
	{
		if (cycleInterval) clearInterval(cycleInterval);
	});

	const currentRoom = () =>
	{
		const rooms = liftedRooms();

		if (rooms.length === 0) return null;

		return rooms[selectedPage()] ?? rooms[0];
	};

	const handleRoomClick = () =>
	{
		const room = currentRoom();

		if (room)
		{
			actions.goToRoom(room.flatId);
		}
	};

	return (
		<Show when={liftedRooms().length > 0}>
			<div class="d-flex flex-column gap-1 border-bottom border-muted pb-1">
				{/* Promotion image */}
				<Show when={currentRoom()}>
					<div
						class="cursor-pointer position-relative overflow-hidden"
						style={{height: '80px', background: '#ccc', 'border-radius': '4px'}}
						onClick={handleRoomClick}
					>
						<Show when={currentRoom()!.image}>
							<img
								src={currentRoom()!.image}
								alt={currentRoom()!.caption}
								style={{width: '100%', height: '100%', 'object-fit': 'cover', 'image-rendering': 'pixelated'}}
							/>
						</Show>
						<div class="position-absolute bottom-0 start-0 w-100 px-2 py-1 bg-dark bg-opacity-50 text-white small">
							{currentRoom()!.caption}
						</div>
					</div>
				</Show>

				{/* Pager dots */}
				<Show when={liftedRooms().length > 1}>
					<div class="d-flex justify-content-center gap-1">
						<For each={liftedRooms()}>
							{(_, index) => (
								<div
									class={clsx(
										'rounded-circle cursor-pointer',
										selectedPage() === index() ? 'bg-primary' : 'bg-secondary'
									)}
									style={{width: '6px', height: '6px'}}
									onClick={() => setSelectedPage(index())}
								/>
							)}
						</For>
					</div>
				</Show>
			</div>
		</Show>
	);
}
