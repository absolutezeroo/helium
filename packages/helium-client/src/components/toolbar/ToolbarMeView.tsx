import type {JSX, Setter} from 'solid-js';
import {onCleanup, onMount} from 'solid-js';
import {useLocalization} from '@ui/common';

import achievementsColor from '@/assets/images/toolbar_memenu_achievements_color.png';
import achievementsWhite from '@/assets/images/toolbar_memenu_achievements_white.png';
import profileColor from '@/assets/images/toolbar_memenu_profile_color.png';
import profileWhite from '@/assets/images/toolbar_memenu_profile_white.png';
import roomsColor from '@/assets/images/toolbar_memenu_rooms_color.png';
import roomsWhite from '@/assets/images/toolbar_memenu_rooms_white.png';
import clothesColor from '@/assets/images/toolbar_memenu_clothes_color.png';
import clothesWhite from '@/assets/images/toolbar_memenu_clothes_white.png';
import settingsColor from '@/assets/images/toolbar_memenu_settings_color.png';
import settingsWhite from '@/assets/images/toolbar_memenu_settings_white.png';

interface ToolbarMeViewProps
{
	setMeExpanded: Setter<boolean>;
}

/**
 * ToolbarMeView - "Me" popup menu above the bottom bar.
 *
 * Each item shows a grey (white) icon by default, color icon on hover.
 *
 * @see source_as_win63/habbo/toolbar/memenu/MeMenuNewController.as
 * @see HabboToolbarCom_me_menu_new_view_xml.bin
 */
export function ToolbarMeView(props: ToolbarMeViewProps): JSX.Element
{
	const t = useLocalization();

	onMount(() =>
	{
		const onClick = () => props.setMeExpanded(false);

		document.addEventListener('click', onClick);

		onCleanup(() => document.removeEventListener('click', onClick));
	});

	return (
		<div class="helium-toolbar-me" onClick={(e) => e.stopPropagation()}>
			{/* Achievements */}
			<div class="memenu-item">
				<div class="memenu-icon">
					<img class="memenu-icon-color" src={achievementsColor} alt="" />
					<img class="memenu-icon-grey" src={achievementsWhite} alt="" />
				</div>
				<span class="memenu-label">{t('widget.memenu.achievements', 'Achievements')}</span>
			</div>

			{/* Profile */}
			<div class="memenu-item">
				<div class="memenu-icon">
					<img class="memenu-icon-color" src={profileColor} alt="" />
					<img class="memenu-icon-grey" src={profileWhite} alt="" />
				</div>
				<span class="memenu-label">{t('widget.memenu.profile', 'Profile')}</span>
			</div>

			{/* My Rooms */}
			<div class="memenu-item">
				<div class="memenu-icon">
					<img class="memenu-icon-color" src={roomsColor} alt="" />
					<img class="memenu-icon-grey" src={roomsWhite} alt="" />
				</div>
				<span class="memenu-label">{t('widget.memenu.myrooms', 'My Rooms')}</span>
			</div>

			{/* Clothes / Avatar Editor */}
			<div class="memenu-item">
				<div class="memenu-icon">
					<img class="memenu-icon-color" src={clothesColor} alt="" />
					<img class="memenu-icon-grey" src={clothesWhite} alt="" />
				</div>
				<span class="memenu-label">{t('widget.memenu.editavatar', 'Clothes')}</span>
			</div>

			{/* Settings */}
			<div class="memenu-item">
				<div class="memenu-icon">
					<img class="memenu-icon-color" src={settingsColor} alt="" />
					<img class="memenu-icon-grey" src={settingsWhite} alt="" />
				</div>
				<span class="memenu-label">{t('widget.memenu.settings', 'Settings')}</span>
			</div>
		</div>
	);
}
