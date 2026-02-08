import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {ModuleId, useModule} from '../../bridge';

/**
 * HotelView - The main hotel landing page shown when not in a room.
 *
 * @see source_nitro_react/components/hotel-view/HotelView.tsx
 */
export function HotelView(): JSX.Element
{
	const {state: session} = useModule(ModuleId.Session);

	return (
		<div class="helium-hotel-view">
			<div class="container h-100 py-3 overflow-hidden landing-widgets">
				<div class="row h-100">
					<div class="col-12 d-flex flex-column align-items-center justify-content-center">
						<Show when={session().userData}>
							{(user) => (
								<div class="text-center mb-4">
									<h2 class="fs-4 fw-semibold text-white mb-2">Welcome back, {user().name}!</h2>
									<p class="small text-muted fst-italic">{user().motto || 'No motto set'}</p>
								</div>
							)}
						</Show>
						<div class="text-center text-muted small">
							<p>Hotel View</p>
							<p>Coming soon...</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
