import {Component, For} from 'solid-js';
import {inventoryStore, navigatorStore, sessionStore} from '../../stores';

interface ToolbarIcon
{
	id: string;
	label: string;
	icon: string;
}

export const Toolbar: Component = () =>
{
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
				if (navigatorStore.isOpen())
				{
					navigatorStore.closeNavigator();
				} else
				{
					navigatorStore.openNavigator();
				}
				break;
			case 'hotel':
				// TODO: Implement hotel view
				console.log('Hotel view clicked');
				break;
			case 'catalog':
				// TODO: Implement catalog
				console.log('Catalog clicked');
				break;
			case 'inventory':
				inventoryStore.toggleInventory();
				break;
			case 'friends':
				// TODO: Implement friends
				console.log('Friends clicked');
				break;
			case 'me':
				// TODO: Implement me menu
				console.log('Me menu clicked');
				break;
			default:
				console.log('Toolbar icon clicked:', iconId);
		}
	};

	return (
		<div class="toolbar">
			<div class="toolbar-left">
				<div class="toolbar-logo">Helium</div>
			</div>

			<div class="toolbar-center">
				<For each={icons}>
					{(icon) => (
						<button
							class={`toolbar-icon ${
								(icon.id === 'navigator' && navigatorStore.isOpen()) ||
								(icon.id === 'inventory' && inventoryStore.isOpen())
									? 'active'
									: ''
							}`}
							title={icon.label}
							onClick={() => handleIconClick(icon.id)}
						>
							<span class="icon-emoji">{icon.icon}</span>
						</button>
					)}
				</For>
			</div>

			<div class="toolbar-right">
				<div class="user-info">
                    <span class="user-credits">
                        {sessionStore.activityPoints().get(0) || 0} Credits
                    </span>
				</div>
			</div>
		</div>
	);
};
