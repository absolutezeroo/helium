import type {JSX} from 'solid-js';
import {Switch, Match} from 'solid-js';
import {PromoArticleWidgetView} from './promo-article/PromoArticleWidgetView';
import {HallOfFameWidgetView} from './hall-of-fame/HallOfFameWidgetView';
import {BonusRareWidgetView} from './bonus-rare/BonusRareWidgetView';
import {WidgetContainerView} from './widget-container/WidgetContainerView';

export interface GetWidgetLayoutProps
{
	widgetType: string;
	slot: number;
	widgetConf: any;
}

/**
 * GetWidgetLayout - Routes widget type to the correct widget component.
 * @see source_nitro_react/components/hotel-view/views/widgets/GetWidgetLayout.tsx
 */
export function GetWidgetLayout(props: GetWidgetLayoutProps): JSX.Element
{
	return (
		<Switch>
			<Match when={props.widgetType === 'promoarticle'}>
				<PromoArticleWidgetView />
			</Match>
			<Match when={props.widgetType === 'achievementcompetition_hall_of_fame'}>
				<HallOfFameWidgetView slot={props.slot} conf={props.widgetConf} />
			</Match>
			<Match when={props.widgetType === 'bonusrare'}>
				<BonusRareWidgetView />
			</Match>
			<Match when={props.widgetType === 'widgetcontainer'}>
				<WidgetContainerView conf={props.widgetConf} />
			</Match>
		</Switch>
	);
}
