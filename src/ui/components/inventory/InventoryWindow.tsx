import type {JSX} from 'solid-js';
import {Match, Show, Switch} from 'solid-js';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';
import type {InventoryTab} from './tabs';
import {InventoryTabs} from './tabs';
import type {FurniGridItem} from './furni';
import {FurniDetails, FurniGrid} from './furni';
import type {BadgeData} from './badges';
import {BadgesView} from './badges';

export interface InventoryWindowProps
{
	isOpen: boolean;
	activeTab: string;
	tabs: InventoryTab[];
	loading?: boolean;

	// Furni
	furniItems: FurniGridItem[];
	selectedFurni: FurniGridItem | null;

	// Badges
	badges: BadgeData[];
	activeBadges: BadgeData[];
	selectedBadge: BadgeData | null;

	// Callbacks
	onClose?: () => void;
	onTabChange?: (id: string) => void;
	onFurniSelect?: (id: number) => void;
	onFurniPlace?: (id: number) => void;
	onBadgeSelect?: (badgeId: string) => void;
	onBadgeToggle?: (badgeId: string) => void;
}

export function InventoryWindow(props: InventoryWindowProps): JSX.Element
{
	return (
		<Show when={props.isOpen}>
			<HeliumCardView uniqueKey="inventory" width={480} height={520}>
				{/* Header */}
				<HeliumCardHeaderView
					title="Inventory"
					icon={
						<svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
					}
					onClose={props.onClose}
				/>

				{/* Tabs */}
				<InventoryTabs
					tabs={props.tabs}
					activeTab={props.activeTab}
					onTabChange={props.onTabChange}
				/>

				{/* Content */}
				<HeliumCardContentView overflow="hidden" class="flex overflow-hidden">
					<Switch>
						{/* Furni View */}
						<Match when={props.activeTab === 'furni' || props.activeTab === 'rentables'}>
							<div class="flex-1 flex flex-col">
								<FurniGrid
									items={props.furniItems}
									loading={props.loading}
									onItemSelect={props.onFurniSelect}
									onItemPlace={props.onFurniPlace}
								/>
								<Show when={props.selectedFurni}>
									<FurniDetails
										name={props.selectedFurni!.name}
										count={props.selectedFurni!.count}
										tradeable={true}
										recyclable={true}
										onPlace={() => props.onFurniPlace?.(props.selectedFurni!.id)}
									/>
								</Show>
							</div>
						</Match>

						{/* Badges View */}
						<Match when={props.activeTab === 'badges'}>
							<div class="flex-1 w-full">
								<BadgesView
									badges={props.badges}
									activeBadges={props.activeBadges}
									selectedBadge={props.selectedBadge}
									loading={props.loading}
									onBadgeSelect={props.onBadgeSelect}
									onBadgeToggle={props.onBadgeToggle}
								/>
							</div>
						</Match>

						{/* Effects View */}
						<Match when={props.activeTab === 'effects'}>
							<div class="flex-1 flex items-center justify-center text-slate-500">
								<div class="text-center">
									<svg class="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24"
										 stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
											  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
									</svg>
									<span class="text-sm">Effects</span>
								</div>
							</div>
						</Match>

						{/* Pets View */}
						<Match when={props.activeTab === 'pets'}>
							<div class="flex-1 flex items-center justify-center text-slate-500">
								<div class="text-center">
									<svg class="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24"
										 stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
											  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
									<span class="text-sm">Pets</span>
								</div>
							</div>
						</Match>

						{/* Bots View */}
						<Match when={props.activeTab === 'bots'}>
							<div class="flex-1 flex items-center justify-center text-slate-500">
								<div class="text-center">
									<svg class="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24"
										 stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
											  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
									</svg>
									<span class="text-sm">Bots</span>
								</div>
							</div>
						</Match>
					</Switch>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
