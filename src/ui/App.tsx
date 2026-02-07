import {Component, createMemo, Show} from 'solid-js';
import {ModuleId, useModule} from './bridge';
import {LandingView} from './components/landing/LandingView';
import {Toolbar} from './components/toolbar/Toolbar';
import {LoadingScreen} from './common/LoadingScreen';
import {NavigatorView} from './components/navigator';
import {Inventory} from './components/inventory';
import {Room} from './components/room';

export const App: Component = () =>
{
	const {state: connection} = useModule(ModuleId.Connection);
	const {state: room} = useModule(ModuleId.Room);

	const isAuthenticated = createMemo(() => connection().state === 'authenticated');

	// Show landing view when authenticated AND not in a room
	const showLanding = createMemo(() =>
		isAuthenticated() && room().currentRoom === null
	);

	// Show room view when in a room (currentRoom is set or session is active)
	const isInRoom = createMemo(() =>
		isAuthenticated() && room().currentRoom !== null
	);

	const showLoading = createMemo(() =>
	{
		return connection().state === 'connecting' || connection().state === 'connected';
	});

	return (
		<div class="helium-ui">
			<Show when={showLoading()}>
				<LoadingScreen/>
			</Show>

			<Show when={isAuthenticated()}>
				{/* Landing view - hidden when in a room */}
				<Show when={showLanding()}>
					<LandingView/>
				</Show>

				{/* Always show toolbar, navigator, inventory when authenticated */}
				<Toolbar/>
				<NavigatorView/>
				<Inventory/>

				{/* Room UI - shown when in a room */}
				<Room/>
			</Show>

			<Show when={connection().state === 'error'}>
				<div class="error-screen">
					<div class="error-content">
						<h2>Connection Error</h2>
						<p>{connection().error}</p>
					</div>
				</div>
			</Show>
		</div>
	);
};
