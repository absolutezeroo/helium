import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {roomStore} from '@ui/stores/roomStore';
import {HotelView} from '../hotel-view';
import {Toolbar} from '../toolbar';
import {NavigatorView} from '../navigator';
import {Inventory} from '../inventory';
import {Room} from '../room';
import {CatalogView} from '../catalog';
import {FriendsMessengerView, FriendsView} from '../friends';
import {ChatHistoryView} from '../chat-history';
import {UserProfileView} from '../user-profile';
import {NotificationCenterView} from '../notification-center';
import {PurseView} from '../purse';

/**
 * MainView - Main application view containing all UI components.
 * Shown after successful authentication.
 *
 * @see source_nitro_react/components/main/MainView.tsx
 */
export function MainView(): JSX.Element
{
	const {state: room} = roomStore;

	const landingViewVisible = () => room.currentRoom === null;

	return (
		<div class="w-100 h-100">
			<Show when={landingViewVisible()}>
				<HotelView />
			</Show>
			<Toolbar />
			<Room />
			<ChatHistoryView />
			<NavigatorView />
			<Inventory />
			<CatalogView />
			<FriendsView />
			<FriendsMessengerView />
			<UserProfileView />
			<NotificationCenterView />
			<PurseView />
		</div>
	);
}
