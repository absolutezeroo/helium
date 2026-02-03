import {Component, Show} from 'solid-js';
import {useModule, ModuleId} from '../../bridge';
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
	const {actions} = useModule(ModuleId.Room);

	return (
		<Show when={actions.isInRoom()}>
			<div class="room-ui">
				<div class="room-sidebar">
					<RoomSessionPanel/>
					<RoomUserList/>
				</div>
			</div>
		</Show>
	);
};
