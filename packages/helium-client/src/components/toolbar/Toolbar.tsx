import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {inventoryStore} from '@ui/stores/inventoryStore';
import {roomStore} from '@ui/stores/roomStore';
import {ToolbarMeView} from './ToolbarMeView';

import logoIcon from '@/assets/images/bottom_bar_logo.png';
import homeIcon from '@/assets/images/bottom_bar_home.png';
import navigatorIcon from '@/assets/images/bottom_bar_navigator.png';
import shopIcon from '@/assets/images/bottom_bar_shop.png';
import inventoryIcon from '@/assets/images/bottom_bar_inventory.png';
import cameraIcon from '@/assets/images/bottom_bar_camera.png';
import dividerIcon from '@/assets/images/bottom_bar_divider_1px.png';
import meMenuPlaceholder from '@/assets/images/icons_toolbar_me_menu_placeholder.png';

/**
 * Toolbar - Bottom bar with navigation icons.
 *
 * @see source_as_win63/habbo/toolbar/BottomBarLeft.as
 * @see HabboToolbarCom_bottom_bar_left_xml.bin
 */
export function Toolbar(): JSX.Element
{
	const {state: room, actions: roomActions} = roomStore;
	const {actions: navActions} = useNavigator();
	const {actions: invActions} = inventoryStore;

	const [isMeExpanded, setMeExpanded] = createSignal(false);

	const isInRoom = () => room.currentRoom !== null;

	return (
		<>
			<Show when={isMeExpanded()}>
				<ToolbarMeView setMeExpanded={setMeExpanded} />
			</Show>
			<div class="helium-toolbar">
				{/* Border accent (left edge) */}
				<div class="toolbar-border-accent" />

				{/* Icon items */}
				<div class="toolbar-items">
					{/* Reception / Hotel view (visible when in room) */}
					<Show when={isInRoom()}>
						<div
							class="toolbar-icon"
							onClick={() => roomActions.goToDesktop()}
							title="Hotel View"
						>
							<img src={logoIcon} alt="" />
						</div>
					</Show>

					{/* Home (visible when in hotel view) */}
					<Show when={!isInRoom()}>
						<div
							class="toolbar-icon"
							onClick={() => navActions.search('myworld_view', '')}
							title="Home"
						>
							<img src={homeIcon} alt="" />
						</div>
					</Show>

					{/* Navigator */}
					<div
						class="toolbar-icon"
						onClick={() => navActions.toggle()}
						title="Navigator"
					>
						<img src={navigatorIcon} alt="" />
					</div>

					{/* Catalogue / Shop */}
					<div
						class="toolbar-icon"
						title="Catalogue"
					>
						<img src={shopIcon} alt="" />
					</div>

					{/* Inventory (visible in room) */}
					<Show when={isInRoom()}>
						<div
							class="toolbar-icon"
							onClick={() => invActions.toggle()}
							title="Inventory"
						>
							<img src={inventoryIcon} alt="" />
						</div>
					</Show>

					{/* Camera (visible in room) */}
					<Show when={isInRoom()}>
						<div
							class="toolbar-icon"
							title="Camera"
						>
							<img src={cameraIcon} alt="" />
						</div>
					</Show>

					{/* Divider */}
					<img class="toolbar-divider" src={dividerIcon} alt="" />

					{/* Me Menu */}
					<div
						class={`toolbar-icon${isMeExpanded() ? ' active' : ''}`}
						onClick={(e) =>
						{
							e.stopPropagation();
							setMeExpanded(prev => !prev);
						}}
						title="Me"
					>
						<img src={meMenuPlaceholder} alt="" />
					</div>
				</div>

				{/* Chat input container (injected externally) */}
				<div id="toolbar-chat-input-container" />
			</div>
		</>
	);
}
