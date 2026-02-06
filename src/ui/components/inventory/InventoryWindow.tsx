import type {JSX} from 'solid-js';
import {createSignal, Match, onMount, Show, Switch} from 'solid-js';
import clsx from 'clsx';
import {InventoryHeader} from './common';
import type {IInventoryTab} from './tabs';
import {InventoryTabs} from './tabs';
import type {IFurniGridItem} from './furni';
import {FurniDetails, FurniGrid} from './furni';
import type {IBadgeData} from './badges';
import {BadgesView} from './badges';

export interface IInventoryWindowProps
{
	isOpen: boolean;
	activeTab: string;
	tabs: IInventoryTab[];
	loading?: boolean;

	// Furni
	furniItems: IFurniGridItem[];
	selectedFurni: IFurniGridItem | null;

	// Badges
	badges: IBadgeData[];
	activeBadges: IBadgeData[];
	selectedBadge: IBadgeData | null;

	// Callbacks
	onClose?: () => void;
	onTabChange?: (id: string) => void;
	onFurniSelect?: (id: number) => void;
	onFurniPlace?: (id: number) => void;
	onBadgeSelect?: (badgeId: string) => void;
	onBadgeToggle?: (badgeId: string) => void;
}

export function InventoryWindow(props: IInventoryWindowProps): JSX.Element
{
	const [position, setPosition] = createSignal({x: 100, y: 100});
	const [isDragging, setIsDragging] = createSignal(false);
	const [dragOffset, setDragOffset] = createSignal({x: 0, y: 0});

	let windowRef: HTMLDivElement | undefined;

	onMount(() =>
	{
		// Center on mount
		setPosition({
			x: Math.max(20, (window.innerWidth - 480) / 2),
			y: Math.max(20, (window.innerHeight - 520) / 2),
		});
	});

	const handleMouseDown = (e: MouseEvent) =>
	{
		if ((e.target as HTMLElement).closest('button')) return; // cast: type assertion required

		setIsDragging(true);
		setDragOffset({
			x: e.clientX - position().x,
			y: e.clientY - position().y,
		});

		const handleMouseMove = (e: MouseEvent) =>
		{
			setPosition({
				x: Math.max(0, Math.min(window.innerWidth - 480, e.clientX - dragOffset().x)),
				y: Math.max(0, Math.min(window.innerHeight - 520, e.clientY - dragOffset().y)),
			});
		};

		const handleMouseUp = () =>
		{
			setIsDragging(false);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	};

	return (
		<Show when={props.isOpen}>
			<div
				ref={windowRef}
				class={clsx(
					'fixed z-50 flex flex-col w-[480px] h-[520px]',
					'bg-slate-900 border border-slate-700',
					'rounded-xl shadow-2xl overflow-hidden',
					isDragging() && 'select-none cursor-grabbing'
				)}
				style={{
					left: `${position().x}px`,
					top: `${position().y}px`,
				}}
			>
				{/* Header */}
				<div onMouseDown={handleMouseDown} class="cursor-grab">
					<InventoryHeader
						title="Inventory"
						onClose={props.onClose}
					/>
				</div>

				{/* Tabs */}
				<InventoryTabs
					tabs={props.tabs}
					activeTab={props.activeTab}
					onTabChange={props.onTabChange}
				/>

				{/* Content */}
				<div class="flex-1 flex overflow-hidden">
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
				</div>
			</div>
		</Show>
	);
}
