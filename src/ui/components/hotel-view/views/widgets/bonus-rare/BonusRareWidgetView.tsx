import type {JSX} from 'solid-js';
import {onMount, Show} from 'solid-js';
import {landingViewStore} from '@ui/stores/landingViewStore';

/**
 * BonusRareWidgetView - Displays bonus rare item progress bar.
 * @see source_nitro_react/components/hotel-view/views/widgets/bonus-rare/BonusRareWidgetView.tsx
 */
export function BonusRareWidgetView(): JSX.Element
{
	const landingView = landingViewStore.state;
	const {actions} = landingViewStore;

	onMount(() =>
	{
		actions.requestBonusRare();
	});

	return (
		<Show when={landingView.bonusRare}>
			{(bonusRare) => (
				<div class="bonus-rare widget d-flex">
					{bonusRare().productType}
					<div class="bg-light-dark rounded overflow-hidden position-relative bonus-bar-container">
						<div class="d-flex justify-content-center align-items-center w-100 h-100 position-absolute small top-0">
							{(bonusRare().totalCoinsForBonus - bonusRare().coinsStillRequiredToBuy) + '/' + bonusRare().totalCoinsForBonus}
						</div>
						<div
							class="small bg-info rounded position-absolute top-0 h-100"
							style={{
								width: ((bonusRare().totalCoinsForBonus - bonusRare().coinsStillRequiredToBuy) / bonusRare().totalCoinsForBonus) * 100 + '%'
							}}
						/>
					</div>
				</div>
			)}
		</Show>
	);
}
