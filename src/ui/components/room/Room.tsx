import {Component, Show} from 'solid-js';
import {ModuleId, useModule} from '../../bridge';
import {RoomSessionPanel} from './RoomSessionPanel';
import {RoomUserList} from './RoomUserList';

/**
 * Room
 *
 * Main room UI container that shows room-related panels
 * when the user is inside a room.
 */
export const Room: Component = () =>
{
	const {state} = useModule(ModuleId.Room);

	return (
		<Show when={state().currentRoom !== null}>
			<div class="absolute top-0 right-0 bottom-[var(--spacing-toolbar)] flex justify-end p-4 pointer-events-none">
				<div class="flex flex-col gap-4 w-[280px] max-h-full overflow-y-auto pointer-events-auto">
					<RoomSessionPanel/>
					<RoomUserList/>
				</div>
			</div>
		</Show>
	);
};
