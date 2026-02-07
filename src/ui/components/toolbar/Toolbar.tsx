import {Component, For} from 'solid-js';
import clsx from 'clsx';
import {ModuleId, useActions, useModule} from '../../bridge';
import {Logger} from '@core/utils/Logger';

interface ToolbarIcon
{
	id: string;
	label: string;
	icon: string;
}

export const Toolbar: Component = () =>
{
	const {state: navigator} = useModule(ModuleId.Navigator);
	const {state: inventory} = useModule(ModuleId.Inventory);
	const {state: session} = useModule(ModuleId.Session);
	const {state: room} = useModule(ModuleId.Room);

	const navActions = useActions(ModuleId.Navigator);
	const invActions = useActions(ModuleId.Inventory);
	const roomActions = useActions(ModuleId.Room);

	const icons: ToolbarIcon[] = [
		{id: 'hotel', label: 'Hotel View', icon: '🏨'},
		{id: 'navigator', label: 'Navigator', icon: '🧭'},
		{id: 'catalog', label: 'Catalog', icon: '🛒'},
		{id: 'inventory', label: 'Inventory', icon: '📦'},
		{id: 'friends', label: 'Friends', icon: '👥'},
		{id: 'me', label: 'Me Menu', icon: '👤'},
	];

	const handleIconClick = (iconId: string) =>
	{
		switch (iconId)
		{
			case 'navigator':
				navActions.toggle();
				break;
			case 'hotel':
				roomActions.goToDesktop();
				break;
			case 'catalog':
				Logger.getLogger('Toolbar').debug('Catalog clicked');
				break;
			case 'inventory':
				invActions.toggle();
				break;
			case 'friends':
				Logger.getLogger('Toolbar').debug('Friends clicked');
				break;
			case 'me':
				Logger.getLogger('Toolbar').debug('Me menu clicked');
				break;
			default:
				Logger.getLogger('Toolbar').debug('Toolbar icon clicked:', iconId);
		}
	};

	const isActive = (iconId: string) =>
	{
		return (iconId === 'navigator' && navigator().isOpen) ||
			(iconId === 'inventory' && inventory().isOpen);
	};

	return (
		<div class="absolute bottom-0 left-0 right-0 h-[var(--spacing-toolbar)] bg-bg-secondary border-t border-border flex items-center justify-between px-5 backdrop-blur-xl">
			<div class="flex-1 flex items-center">
				<span class="text-xl font-bold bg-gradient-to-br from-accent to-purple-500 bg-clip-text text-transparent">
					Helium
				</span>
			</div>

			<div class="flex gap-2">
				<For each={icons}>
					{(icon) => (
						<button
							class={clsx(
								'w-11 h-11 flex items-center justify-center rounded-[var(--radius-md)] cursor-pointer',
								'border transition-all duration-150',
								isActive(icon.id)
									? 'bg-accent border-accent text-white'
									: 'bg-surface border-border text-text-secondary hover:bg-surface-hover hover:border-border-hover hover:text-text-primary hover:-translate-y-0.5'
							)}
							title={icon.label}
							onClick={() => handleIconClick(icon.id)}
						>
							<span class="text-xl">{icon.icon}</span>
						</button>
					)}
				</For>
			</div>

			<div class="flex-1 flex items-center justify-end">
				<div class="flex items-center gap-3">
					<span class="bg-credits/15 text-credits px-3.5 py-1.5 rounded-full text-sm font-medium border border-credits/25">
						{session().activityPoints.get(0) ?? 0} Credits
					</span>
				</div>
			</div>
		</div>
	);
};
