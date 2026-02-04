import {Component, Show} from 'solid-js';
import {useModule, ModuleId} from '../../bridge';

export const LandingView: Component = () =>
{
	const {state: session} = useModule(ModuleId.Session);

	return (
		<div class="landing-view">
			<div class="landing-content">
				<Show when={session().userData}>
					{(user) => (
						<div class="welcome-section">
							<h2>Welcome back, {user().name}!</h2>
							<p class="user-motto">{user().motto || 'No motto set'}</p>
						</div>
					)}
				</Show>

				<div class="landing-widgets">
					{/* Widget containers will be added here */}
					<div class="widget-placeholder">
						<p>Landing View Widgets</p>
						<p class="widget-info">Coming soon...</p>
					</div>
				</div>
			</div>
		</div>
	);
};
