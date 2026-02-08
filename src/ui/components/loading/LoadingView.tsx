import type {JSX} from 'solid-js';
import {Show} from 'solid-js';

interface LoadingViewProps
{
	isError: boolean;
	message: string;
	percent: number;
}

/**
 * LoadingView - Loading screen shown during connection/initialization.
 *
 * @see source_nitro_react/components/loading/LoadingView.tsx
 */
export function LoadingView(props: LoadingViewProps): JSX.Element
{
	return (
		<div class="helium-loading d-flex flex-column w-100 h-100 position-relative">
			<div class="container h-100">
				<div class="d-flex flex-column h-100 align-items-center justify-content-end">
					<div class="connecting-duck" />
					<div class="col-6 text-center py-4">
						<Show
							when={!props.isError}
							fallback={
								<div class="fs-4 text-shadow text-white">{props.message}</div>
							}
						>
							<div class="fs-4 text-white text-shadow">{props.percent.toFixed()}%</div>
							<div class="helium-progress-bar mt-2 large">
								<div
									class="helium-progress-bar-inner"
									style={{width: `${props.percent}%`}}
								/>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</div>
	);
}
