import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {ModuleId, useModule} from '../../bridge';
import {HotelView} from '../hotel-view';
import {Toolbar} from '../toolbar';
import {NavigatorView} from '../navigator';
import {Inventory} from '../inventory';
import {Room} from '../room';
import {CatalogView} from '../catalog';
import {FriendsView, FriendsMessengerView} from '../friends';
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
	const {state: room} = useModule(ModuleId.Room);

	const landingViewVisible = () => room().currentRoom === null;

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
