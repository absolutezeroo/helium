import type {JSX} from 'solid-js';
import {createMemo} from 'solid-js';
import {ModuleId, useActions, useModule} from '../../bridge';
import {InventoryCategory} from '@habbo/inventory';
import {InventoryWindow} from './InventoryWindow';
import type {InventoryTab} from './tabs';
import type {FurniGridItem} from './furni';
import type {BadgeData} from './badges';
import {Logger} from '@core/utils/Logger';

/**
 * Inventory - Connects the module to InventoryWindow
 *
 * Module provides reactive state + actions
 */
export function Inventory(): JSX.Element
{
	const {state: inventory} = useModule(ModuleId.Inventory);
	const invActions = useActions(ModuleId.Inventory);

	// Define tabs (reactive)
	const tabs = createMemo((): InventoryTab[] => [
		{id: 'furni', label: 'Furniture', icon: 'furni', unseenCount: inventory().furniUnseenCount},
		{id: 'badges', label: 'Badges', icon: 'badges', unseenCount: inventory().badgesUnseenCount},
		{id: 'pets', label: 'Pets', icon: 'pets', unseenCount: inventory().petsUnseenCount},
		{id: 'bots', label: 'Bots', icon: 'bots', unseenCount: inventory().botsUnseenCount},
	]);

	// Transform module data to UI format
	const furniItems = createMemo((): FurniGridItem[] =>
	{
		return inventory().furniGroups.map((group) => ({
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
		const group = inventory().selectedFurniGroup;
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
		return inventory().badges.map((badge) => ({
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
		return inventory().activeBadges.map((badge) => ({
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
		const badge = inventory().selectedBadge;
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

	// Handlers - use module actions
	const handleTabChange = (id: string) =>
	{
		invActions.switchCategory(id as typeof InventoryCategory[keyof typeof InventoryCategory]);
	};

	const handleFurniSelect = (id: number) =>
	{
		const group = inventory().furniGroups.find(g => g.getFurniIds().includes(id));
		if (group)
		{
			invActions.selectFurniGroup(group);
		}
	};

	const handleFurniPlace = (id: number) =>
	{
		// TODO: Implement furniture placement
		Logger.getLogger('Inventory').debug('Place furni:', id);
	};

	const handleBadgeSelect = (badgeId: string) =>
	{
		const badge = inventory().badges.find(b => b.badgeId === badgeId);
		if (badge)
		{
			invActions.selectBadge(badge);
		}
	};

	const handleBadgeToggle = (badgeId: string) =>
	{
		invActions.toggleBadgeWearing(badgeId);
	};

	return (
		<InventoryWindow
			isOpen={inventory().isOpen}
			activeTab={inventory().currentCategory}
			tabs={tabs()}
			loading={inventory().isLoading}
			furniItems={furniItems()}
			selectedFurni={selectedFurni()}
			badges={badges()}
			activeBadges={activeBadges()}
			selectedBadge={selectedBadge()}
			onClose={() => invActions.close()}
			onTabChange={handleTabChange}
			onFurniSelect={handleFurniSelect}
			onFurniPlace={handleFurniPlace}
			onBadgeSelect={handleBadgeSelect}
			onBadgeToggle={handleBadgeToggle}
		/>
	);
}
