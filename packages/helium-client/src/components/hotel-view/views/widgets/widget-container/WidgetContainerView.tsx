import type {JSX} from 'solid-js';
import {useLocalization} from '@ui/common/Text';
import {Helium} from 'helium-engine';

export interface WidgetContainerViewProps
{
	conf: any;
}

/**
 * WidgetContainerView - Generic promotional widget with image, text and button.
 * @see source_nitro_react/components/hotel-view/views/widgets/widget-container/WidgetContainerView.tsx
 */
export function WidgetContainerView(props: WidgetContainerViewProps): JSX.Element
{
	const t = useLocalization();

	const getOption = (key: string): string | null =>
	{
		if (!props.conf) return null;

		const option = props.conf[key];

		if (!option) return null;

		if (key === 'image')
		{
			return Helium.instance.configuration.interpolate(option);
		}

		return option;
	};

	return (
		<div class="widgetcontainer widget d-flex flex-row overflow-hidden">
			<div
				class="widgetcontainer-image flex-shrink-0"
				style={{'background-image': `url(${getOption('image')})`}}
			/>
			<div class="d-flex flex-column align-self-center">
				<h3 class="my-0">{t(`landing.view.${getOption('texts')}.header`)}</h3>
				<i>{t(`landing.view.${getOption('texts')}.body`)}</i>
				<button
					class="btn btn-sm btn-gainsboro align-self-start px-3 mt-auto"
					onClick={() =>
					{
						const link = getOption('btnLink');
						if (link) window.open(link);
					}}
				>
					{t(`landing.view.${getOption('texts')}.button`)}
				</button>
			</div>
		</div>
	);
}
