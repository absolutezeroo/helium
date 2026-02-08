import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {ModuleId, useActions, useModule} from '../../bridge';
import Helium from '@/Helium';
import {LayoutAvatarImageView} from '@ui/common/layout/LayoutAvatarImageView';
import {WidgetSlotView} from './views/widgets/WidgetSlotView';

/**
 * HotelView - The main hotel landing page shown when not in a room.
 * Displays configurable background layers, 7 widget slots, and optional avatar.
 *
 * @see source_nitro_react/components/hotel-view/HotelView.tsx
 */
export function HotelView(): JSX.Element
{
	const {state: session} = useModule(ModuleId.Session);
	const configActions = useActions(ModuleId.Config);

	const interpolate = (val: string | undefined): string =>
	{
		if (!val || !val.length) return '';

		return Helium.instance.configuration.interpolate(val);
	};

	const backgroundColor = () => configActions.get('hotelview.images.background.colour');
	const background = () => interpolate(configActions.get('hotelview.images.background'));
	const sun = () => interpolate(configActions.get('hotelview.images.sun'));
	const drape = () => interpolate(configActions.get('hotelview.images.drape'));
	const left = () => interpolate(configActions.get('hotelview.images.left'));
	const rightRepeat = () => interpolate(configActions.get('hotelview.images.right.repeat'));
	const right = () => interpolate(configActions.get('hotelview.images.right'));

	const widgetType = (slot: number) => configActions.get(`hotelview.widgets.slot.${slot}.widget`);
	const widgetConf = (slot: number) =>
	{
		const raw = configActions.get(`hotelview.widgets.slot.${slot}.conf`);
		if (!raw) return null;

		try
		{
			return typeof raw === 'string' ? JSON.parse(raw) : raw;
		}
		catch
		{
			return raw;
		}
	};

	const showAvatar = () => configActions.getBoolean('hotelview.show.avatar');
	const userFigure = () => session().userData?.figure ?? '';

	return (
		<div class="helium-hotel-view" style={backgroundColor() ? {background: backgroundColor()} : {}}>
			<div class="container h-100 py-3 overflow-hidden landing-widgets">
				<div class="row h-100">
					<div class="col-9 h-100 d-flex flex-column">
						<WidgetSlotView
							widgetSlot={1}
							widgetType={widgetType(1)}
							widgetConf={widgetConf(1)}
							class="col-6"
						/>
						<div class="col-12 row mx-0">
							<WidgetSlotView
								widgetSlot={2}
								widgetType={widgetType(2)}
								widgetConf={widgetConf(2)}
								class="col-7"
							/>
							<WidgetSlotView
								widgetSlot={3}
								widgetType={widgetType(3)}
								widgetConf={widgetConf(3)}
								class="col-5"
							/>
							<WidgetSlotView
								widgetSlot={4}
								widgetType={widgetType(4)}
								widgetConf={widgetConf(4)}
								class="col-7"
							/>
							<WidgetSlotView
								widgetSlot={5}
								widgetType={widgetType(5)}
								widgetConf={widgetConf(5)}
								class="col-5"
							/>
						</div>
						<WidgetSlotView
							widgetSlot={6}
							widgetType={widgetType(6)}
							widgetConf={widgetConf(6)}
							class="mt-auto"
						/>
					</div>
					<div class="col-3 h-100">
						<WidgetSlotView
							widgetSlot={7}
							widgetType={widgetType(7)}
							widgetConf={widgetConf(7)}
						/>
					</div>
				</div>
			</div>
			<div class="background position-absolute" style={background().length ? {'background-image': `url(${background()})`} : {}} />
			<div class="sun position-absolute" style={sun().length ? {'background-image': `url(${sun()})`} : {}} />
			<div class="drape position-absolute" style={drape().length ? {'background-image': `url(${drape()})`} : {}} />
			<div class="left position-absolute" style={left().length ? {'background-image': `url(${left()})`} : {}} />
			<div class="right-repeat position-absolute" style={rightRepeat().length ? {'background-image': `url(${rightRepeat()})`} : {}} />
			<div class="right position-absolute" style={right().length ? {'background-image': `url(${right()})`} : {}} />
			<Show when={showAvatar()}>
				<div class="avatar-image">
					<LayoutAvatarImageView figure={userFigure()} direction={2} />
				</div>
			</Show>
		</div>
	);
}
