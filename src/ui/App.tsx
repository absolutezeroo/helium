import {Component, createMemo, Show} from 'solid-js';
import {connectionStore} from './stores';
import {LandingView} from './components/landing/LandingView';
import {Toolbar} from './components/toolbar/Toolbar';
import {LoadingScreen} from './components/common/LoadingScreen';
import {Navigator} from './components/navigator';

export const App: Component = () =>
{
	const showLanding = createMemo(() => connectionStore.isAuthenticated());

	const showLoading = createMemo(() =>
	{
		const state = connectionStore.state();
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
			</Show>

			<Show when={connectionStore.state() === 'error'}>
				<div class="error-screen">
					<div class="error-content">
						<h2>Connection Error</h2>
						<p>{connectionStore.error()}</p>
					</div>
				</div>
			</Show>
		</div>
	);
};
