import type {JSX} from 'solid-js';
import {createMemo} from 'solid-js';
import {inventoryStore} from '@/ui/stores';
import {InventoryCategory} from '@habbo/inventory';
import {InventoryWindow} from './InventoryWindow';
import type {InventoryTab} from './tabs';
import type {FurniGridItem} from './furni';
import type {BadgeData} from './badges';

/**
 * Inventory - Connects the store to InventoryWindow
 */
export function Inventory(): JSX.Element
{
	// Define tabs
	const tabs: InventoryTab[] = [
		{id: 'furni', label: 'Furniture', icon: 'furni', unseenCount: inventoryStore.furniUnseenCount()},
		{id: 'badges', label: 'Badges', icon: 'badges', unseenCount: inventoryStore.badgesUnseenCount()},
		{id: 'pets', label: 'Pets', icon: 'pets', unseenCount: inventoryStore.petsUnseenCount()},
		{id: 'bots', label: 'Bots', icon: 'bots', unseenCount: inventoryStore.botsUnseenCount()},
	];

	// Transform store data to UI format
	const furniItems = createMemo((): FurniGridItem[] =>
	{
		return inventoryStore.furniGroups().map((group) => ({
			id: group.getFurniIds()[0] ?? 0,
			type: group.type,
			name: group.name || `Furni #${group.type}`,
			count: group.getTotalCount(),
			isSelected: group.isSelected,
			isUnseen: group.hasUnseenItems,
			isLocked: group.isLocked,
		}));
	});

	const selectedFurni = createMemo((): FurniGridItem | null =>
	{
		const group = inventoryStore.selectedFurniGroup();
		if (!group) return null;

		return {
			id: group.getFurniIds()[0] ?? 0,
			type: group.type,
			name: group.name || `Furni #${group.type}`,
			count: group.getTotalCount(),
			isSelected: true,
			isUnseen: group.hasUnseenItems,
			isLocked: group.isLocked,
		};
	});

	const badges = createMemo((): BadgeData[] =>
	{
		return inventoryStore.badges().map((badge) => ({
			badgeId: badge.badgeId,
			name: badge.name,
			description: badge.description,
			isActive: badge.isInUse,
			isSelected: badge.isSelected,
			isUnseen: badge.isUnseen,
		}));
	});

	const activeBadges = createMemo((): BadgeData[] =>
	{
		return inventoryStore.activeBadges().map((badge) => ({
			badgeId: badge.badgeId,
			name: badge.name,
			description: badge.description,
			isActive: true,
			isSelected: false,
			isUnseen: false,
		}));
	});

	const selectedBadge = createMemo((): BadgeData | null =>
	{
		const badge = inventoryStore.selectedBadge();
		if (!badge) return null;

		return {
			badgeId: badge.badgeId,
			name: badge.name,
			description: badge.description,
			isActive: badge.isInUse,
			isSelected: true,
			isUnseen: badge.isUnseen,
		};
	});

	// Handlers
	const handleTabChange = (id: string) =>
	{
		inventoryStore.switchCategory(id as typeof InventoryCategory[keyof typeof InventoryCategory]);
	};

	const handleFurniSelect = (id: number) =>
	{
		const group = inventoryStore.furniGroups().find(g => g.getFurniIds().includes(id));
		if (group)
		{
			inventoryStore.selectFurniGroup(group);
		}
	};

	const handleFurniPlace = (id: number) =>
	{
		// TODO: Implement furniture placement
		console.log('Place furni:', id);
	};

	const handleBadgeSelect = (badgeId: string) =>
	{
		const badge = inventoryStore.badges().find(b => b.badgeId === badgeId);
		if (badge)
		{
			inventoryStore.selectBadge(badge);
		}
	};

	const handleBadgeToggle = (badgeId: string) =>
	{
		inventoryStore.toggleBadgeWearing(badgeId);
	};

	return (
		<InventoryWindow
			isOpen={inventoryStore.isOpen()}
			activeTab={inventoryStore.currentCategory()}
			tabs={tabs}
			loading={inventoryStore.isLoading()}
			furniItems={furniItems()}
			selectedFurni={selectedFurni()}
			badges={badges()}
			activeBadges={activeBadges()}
			selectedBadge={selectedBadge()}
			onClose={() => inventoryStore.closeInventory()}
			onTabChange={handleTabChange}
			onFurniSelect={handleFurniSelect}
			onFurniPlace={handleFurniPlace}
			onBadgeSelect={handleBadgeSelect}
			onBadgeToggle={handleBadgeToggle}
		/>
	);
}
