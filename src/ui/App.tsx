import {Component, createMemo, Show} from 'solid-js';
import {connection} from '@/features';
import {LandingView} from './components/landing/LandingView';
import {Toolbar} from './components/toolbar/Toolbar';
import {LoadingScreen} from './components/common/LoadingScreen';
import {Navigator} from './components/navigator';
import {Inventory} from './components/inventory';

export const App: Component = () =>
{
	const showLanding = createMemo(() => connection.isAuthenticated());

	const showLoading = createMemo(() =>
	{
		const state = connection.state();
		return state === 'connecting' || state === 'connected';
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
			</Show>

			<Show when={connection.state() === 'error'}>
				<div class="error-screen">
					<div class="error-content">
						<h2>Connection Error</h2>
						<p>{connection.error()}</p>
					</div>
				</div>
			</Show>
		</div>
	);
};
