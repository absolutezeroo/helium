import {Component, Show} from 'solid-js';
import type {IconTypes} from 'solid-icons';
import clsx from 'clsx';
import {ModuleId, useActions, useModule} from '../../bridge';
import {Logger} from '@core/utils/Logger';
import {FaSolidHouse, FaSolidCompass, FaSolidStore, FaSolidBoxOpen, FaSolidHammer, FaSolidUser, FaSolidChevronRight, FaSolidUserGroup} from 'solid-icons/fa';

const log = Logger.getLogger('Toolbar');

interface ToolbarIconDef
{
	id: string;
	label: string;
	icon: IconTypes;
}

const TOOLBAR_ICONS: ToolbarIconDef[] = [
	{id: 'hotel', label: 'Hotel View', icon: FaSolidHouse},
	{id: 'navigator', label: 'Navigator', icon: FaSolidCompass},
	{id: 'catalog', label: 'Catalog', icon: FaSolidStore},
	{id: 'inventory', label: 'Inventory', icon: FaSolidBoxOpen},
	{id: 'pets', label: 'Pets', icon: FaSolidHammer},
	{id: 'me', label: 'Me', icon: FaSolidUser},
];

export const Toolbar: Component = () =>
{
	const {state: navigator} = useModule(ModuleId.Navigator);
	const {state: inventory} = useModule(ModuleId.Inventory);
	const {state: room} = useModule(ModuleId.Room);

	const navActions = useActions(ModuleId.Navigator);
	const invActions = useActions(ModuleId.Inventory);
	const roomActions = useActions(ModuleId.Room);

	const isInRoom = () => room().currentRoom !== null;

	const isActive = (id: string): boolean =>
	{
		return (id === 'navigator' && navigator().isOpen) ||
			(id === 'inventory' && inventory().isOpen);
	};

	const handleClick = (id: string) =>
	{
		switch (id)
		{
			case 'hotel':
				roomActions.goToDesktop();
				break;
			case 'navigator':
				navActions.toggle();
				break;
			case 'inventory':
				invActions.toggle();
				break;
			case 'catalog':
				log.debug('Catalog clicked');
				break;
			case 'pets':
				log.debug('Pets clicked');
				break;
			case 'me':
				log.debug('Me clicked');
				break;
			case 'friends':
				log.debug('Friends clicked');
				break;
		}
	};

	return (
		<div class="toolbar">
			{/* ---- Left: Icons ---- */}
			<div class="toolbar__left">
				{TOOLBAR_ICONS.map((icon) => (
					<button
						class={clsx(
							'toolbar__icon',
							icon.id === 'hotel' && !isInRoom() && 'toolbar__icon--home-active',
							isActive(icon.id) && 'toolbar__icon--active'
						)}
						title={icon.label}
						onClick={() => handleClick(icon.id)}
					>
						<icon.icon size={20} />
					</button>
				))}
			</div>

			{/* ---- Center: Chat bar (only in room) ---- */}
			<Show when={isInRoom()}>
				<div class="toolbar__center">
					<div class="toolbar__chat">
						<input
							class="toolbar__chat-input"
							type="text"
							placeholder="Clique ici pour chatter..."
						/>
					</div>
				</div>
			</Show>

			{/* ---- Right: Friends ---- */}
			<div class="toolbar__right">
				<button
					class="toolbar__friends-btn"
					onClick={() => handleClick('friends')}
				>
					<FaSolidUserGroup size={14} />
					<span>Plus d'amis</span>
				</button>
				<button class="toolbar__icon toolbar__icon--nav-arrow" title="More">
					<FaSolidChevronRight size={12} />
				</button>
			</div>
		</div>
	);
};
