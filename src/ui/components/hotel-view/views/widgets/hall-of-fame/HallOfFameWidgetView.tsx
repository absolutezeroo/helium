import type {JSX} from 'solid-js';
import {onMount, Show, For} from 'solid-js';
import {ModuleId, useModule} from '@ui/bridge';
import {HallOfFameItemView} from './HallOfFameItemView';

export interface HallOfFameWidgetViewProps
{
	slot: number;
	conf: any;
}

/**
 * HallOfFameWidgetView - Displays the community goal hall of fame leaderboard.
 * @see source_nitro_react/components/hotel-view/views/widgets/hall-of-fame/HallOfFameWidgetView.tsx
 */
export function HallOfFameWidgetView(props: HallOfFameWidgetViewProps): JSX.Element
{
	const {state: landingView, actions} = useModule(ModuleId.LandingView);

	onMount(() =>
	{
		const campaign: string = props.conf ? props.conf['campaign'] : '';
		actions.requestHallOfFame(campaign);
	});

	return (
		<Show when={landingView().hallOfFame}>
			{(hofData) => (
				<div class="hall-of-fame d-flex">
					<For each={hofData().hof}>
						{(entry, index) => (
							<HallOfFameItemView data={entry} level={index() + 1} />
						)}
					</For>
				</div>
			)}
		</Show>
	);
}
