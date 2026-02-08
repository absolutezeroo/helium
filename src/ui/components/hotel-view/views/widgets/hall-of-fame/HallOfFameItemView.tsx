import type {JSX} from 'solid-js';
import {useLocalizationWithParams} from '@ui/common/Text';
import {LayoutAvatarImageView} from '@ui/common/layout/LayoutAvatarImageView';
import type {HallOfFameEntryData} from '@habbo/communication/messages/parser/quest/HallOfFameEntryData';

export interface HallOfFameItemViewProps
{
	data: HallOfFameEntryData;
	level: number;
}

/**
 * HallOfFameItemView - Displays a single hall of fame entry with avatar and tooltip.
 * @see source_nitro_react/components/hotel-view/views/widgets/hall-of-fame-item/HallOfFameItemView.tsx
 */
export function HallOfFameItemView(props: HallOfFameItemViewProps): JSX.Element
{
	const tp = useLocalizationWithParams();

	return (
		<div class="hof-user-container">
			<div class="hof-tooltip">
				<div class="hof-header">
					{props.level}. {props.data.userName}
				</div>
				<div class="small text-center text-white">
					{tp('landing.view.competition.hof.points', {points: props.data.currentScore.toLocaleString()}, 'Score: %points%')}
				</div>
			</div>
			<LayoutAvatarImageView figure={props.data.figure} direction={2} />
		</div>
	);
}
