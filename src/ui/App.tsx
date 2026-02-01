import {Component, createMemo, Show} from 'solid-js';
import {connectionStore, localizationStore, navigatorStore} from './stores';
import {LandingView} from './components/landing/LandingView';
import {Toolbar} from './components/toolbar/Toolbar';
import {LoadingScreen} from './components/common/LoadingScreen';
import type {RoomListRoom} from './components/navigator';
import {Navigator} from './components/navigator';

export const App: Component = () =>
{
	const showLanding = createMemo(() =>
	{
		return connectionStore.isAuthenticated();
	});

	const showLoading = createMemo(() =>
	{
		const state = connectionStore.state();
		return state === 'connecting' || state === 'connected';
	});

	// Convert search results to RoomListRoom format
	const rooms = createMemo((): RoomListRoom[] =>
	{
		const results = navigatorStore.searchResults();
		if (!results?.rooms) return [];

		return results.rooms.map((room) => ({
			id: room.flatId,
			name: room.roomName,
			ownerName: room.ownerName,
			description: room.description,
			userCount: room.userCount,
			maxUserCount: room.maxUserCount,
			tags: room.tags,
			score: room.score,
			categoryId: room.categoryId,
			doorMode: room.doorMode === 0 ? 'open' as const :
				room.doorMode === 1 ? 'doorbell' as const :
					room.doorMode === 2 ? 'password' as const : 'invisible' as const,
			isGroupRoom: room.habboGroupId > 0,
		}));
	});

	// Convert flat categories to Category format with localization
	const categories = createMemo(() =>
	{
		return navigatorStore.flatCategories().map((cat) =>
		{
			// Try localization key, fallback to node name
			const locKey = `navigator.flatcategory.${cat.nodeName}`;
			const name = localizationStore.get(locKey, cat.nodeName);
			return {
				id: cat.nodeId,
				name,
			};
		});
	});

	// Convert popular tags
	const popularTags = createMemo(() =>
	{
		const tags = navigatorStore.popularTags();
		if (!tags?.tags) return [];
		return tags.tags.map((t) => ({
			tag: t.tagName,
			count: t.userCount,
		}));
	});

	// Navigator handlers
	const handleNavigatorClose = () =>
	{
		navigatorStore.closeNavigator();
	};

	const handleRoomClick = (roomId: number) =>
	{
		navigatorStore.goToPrivateRoom(roomId);
	};

	const handleSearch = (query: string) =>
	{
		navigatorStore.searchRooms(query);
	};

	const handleTagClick = (tag: string) =>
	{
		navigatorStore.searchByTag(tag);
	};

	const handleTabChange = (searchCode: string) =>
	{
		navigatorStore.performSearch(searchCode);
	};

	// Convert topLevelContexts to tabs format with localization
	const tabs = createMemo(() =>
	{
		return navigatorStore.topLevelContexts().map(ctx =>
		{
			// Try localization key, fallback to formatted searchCode
			const locKey = `navigator.toplevelview.${ctx.searchCode}`;
			const fallback = ctx.searchCode.replace('_view', '').replace(/_/g, ' ');
			const label = localizationStore.get(locKey, fallback);
			return {
				searchCode: ctx.searchCode,
				label,
			};
		});
	});

	return (
		<div class="helium-ui">
			<Show when={showLoading()}>
				<LoadingScreen/>
			</Show>

			<Show when={showLanding()}>
				<LandingView/>
				<Toolbar/>

				{/* Navigator */}
				<div class="fixed top-16 left-4 z-50">
					<Navigator
						isOpen={navigatorStore.isOpen()}
						isCreateModalOpen={navigatorStore.isCreateModalOpen()}
						currentSearchCode={navigatorStore.currentSearchCode()}
						tabs={tabs()}
						rooms={rooms()}
						categories={categories()}
						popularTags={popularTags()}
						onClose={handleNavigatorClose}
						onTabChange={handleTabChange}
						onRoomClick={handleRoomClick}
						onRoomEnter={handleRoomClick}
						onSearch={handleSearch}
						onTagClick={handleTagClick}
						onFavouriteToggle={(roomId) => console.log('Toggle favourite:', roomId)}
						onOpenCreateModal={() => navigatorStore.startRoomCreation()}
						onCloseCreateModal={() => navigatorStore.closeCreateModal()}
						roomCategories={[]}
						roomModels={[]}
					/>
				</div>
			</Show>

			<Show when={connectionStore.state() === 'error'}>
				<div class="error-screen">
					<div class="error-content">
						<h2>Connection Error</h2>
						<p>{connectionStore.error()}</p>
					</div>
				</div>
			</Show>
		</div>
	);
};
