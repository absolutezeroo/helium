import type {JSX} from 'solid-js';
import {createMemo} from 'solid-js';
import {inventory} from '@/features';
import {InventoryCategory} from '@habbo/inventory';
import {InventoryWindow} from './InventoryWindow';
import type {InventoryTab} from './tabs';
import type {FurniGridItem} from './furni';
import type {BadgeData} from './badges';

/**
 * Inventory - Connects the feature to InventoryWindow
 *
 * Feature provides reactive state + actions
 */
export function Inventory(): JSX.Element
{
	// Define tabs (reactive)
	const tabs = createMemo((): InventoryTab[] => [
		{id: 'furni', label: 'Furniture', icon: 'furni', unseenCount: inventory.furniUnseenCount()},
		{id: 'badges', label: 'Badges', icon: 'badges', unseenCount: inventory.badgesUnseenCount()},
		{id: 'pets', label: 'Pets', icon: 'pets', unseenCount: inventory.petsUnseenCount()},
		{id: 'bots', label: 'Bots', icon: 'bots', unseenCount: inventory.botsUnseenCount()},
	]);

	// Transform feature data to UI format
	const furniItems = createMemo((): FurniGridItem[] =>
	{
		return inventory.furniGroups().map((group) => ({
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
		const group = inventory.selectedFurniGroup();
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
		return inventory.badges().map((badge) => ({
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
		return inventory.activeBadges().map((badge) => ({
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
		const badge = inventory.selectedBadge();
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

	// Handlers - use feature actions
	const handleTabChange = (id: string) =>
	{
		inventory.switchCategory(id as typeof InventoryCategory[keyof typeof InventoryCategory]);
	};

	const handleFurniSelect = (id: number) =>
	{
		const group = inventory.furniGroups().find(g => g.getFurniIds().includes(id));
		if (group)
		{
			inventory.selectFurniGroup(group);
		}
	};

	const handleFurniPlace = (id: number) =>
	{
		// TODO: Implement furniture placement
		console.log('Place furni:', id);
	};

	const handleBadgeSelect = (badgeId: string) =>
	{
		const badge = inventory.badges().find(b => b.badgeId === badgeId);
		if (badge)
		{
			inventory.selectBadge(badge);
		}
	};

	const handleBadgeToggle = (badgeId: string) =>
	{
		inventory.toggleBadgeWearing(badgeId);
	};

	return (
		<InventoryWindow
			isOpen={inventory.isOpen()}
			activeTab={inventory.currentCategory()}
			tabs={tabs()}
			loading={inventory.isLoading()}
			furniItems={furniItems()}
			selectedFurni={selectedFurni()}
			badges={badges()}
			activeBadges={activeBadges()}
			selectedBadge={selectedBadge()}
			onClose={() => inventory.close()}
			onTabChange={handleTabChange}
			onFurniSelect={handleFurniSelect}
			onFurniPlace={handleFurniPlace}
			onBadgeSelect={handleBadgeSelect}
			onBadgeToggle={handleBadgeToggle}
		/>
	);
}
