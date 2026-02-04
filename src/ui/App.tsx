import {Component, createMemo, Show} from 'solid-js';
import {useModule, ModuleId} from './bridge';
import {LandingView} from './components/landing/LandingView';
import {Toolbar} from './components/toolbar/Toolbar';
import {LoadingScreen} from './components/common/LoadingScreen';
import {Navigator} from './components/navigator';
import {Inventory} from './components/inventory';
import {Room} from './components/room';

export const App: Component = () =>
{
	const {state: connection} = useModule(ModuleId.Connection);

	const showLanding = createMemo(() => connection().state === 'authenticated');

	const showLoading = createMemo(() =>
	{
		return connection().state === 'connecting' || connection().state === 'connected';
	});

	return (
		<div class="helium-ui">
			<Show when={showLoading()}>
				<LoadingScreen/>
			</Show>

			<Show when={showLanding()}>
				<LandingView/>
				<Toolbar/>
				<Navigator/>
				<Inventory/>
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
