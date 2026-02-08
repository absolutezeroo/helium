import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import clsx from 'clsx';
import {ModuleId, useActions, useModule} from '../../bridge';
import {ToolbarMeView} from './ToolbarMeView';

/**
 * Toolbar - Bottom toolbar with navigation icons.
 *
 * @see source_nitro_react/components/toolbar/ToolbarView.tsx
 */
export function Toolbar(): JSX.Element
{
	const {state: navigator} = useModule(ModuleId.Navigator);
	const {state: inventory} = useModule(ModuleId.Inventory);
	const {state: room} = useModule(ModuleId.Room);

	const navActions = useActions(ModuleId.Navigator);
	const invActions = useActions(ModuleId.Inventory);
	const roomActions = useActions(ModuleId.Room);

	const [isMeExpanded, setMeExpanded] = createSignal(false);

	const isInRoom = () => room().currentRoom !== null;

	return (
		<>
			<Show when={isMeExpanded()}>
				<ToolbarMeView setMeExpanded={setMeExpanded} />
			</Show>
			<div class="helium-toolbar d-flex align-items-center justify-content-between gap-2 py-1 px-3">
				<div class="d-flex gap-2 align-items-center">
					<div class="d-flex align-items-center gap-2">
						{/* Avatar / Me button */}
						<div
							class={clsx('navigation-item item-avatar cursor-pointer', isMeExpanded() && 'active')}
							onClick={(e) =>
							{
								e.stopPropagation();
								setMeExpanded(prev => !prev);
							}}
						>
							<div class="avatar-image position-absolute" />
						</div>
						{/* Home / Hotel view */}
						<Show
							when={isInRoom()}
							fallback={
								<div
									class="navigation-item icon icon-house cursor-pointer"
									onClick={() => navActions.search('myworld_view', '')}
								/>
							}
						>
							<div
								class="navigation-item icon icon-habbo cursor-pointer"
								onClick={() => roomActions.goToDesktop()}
							/>
						</Show>
						{/* Navigator */}
						<div
							class="navigation-item icon icon-rooms cursor-pointer"
							onClick={() => navActions.toggle()}
						/>
						{/* Catalog */}
						<div
							class="navigation-item icon icon-catalog cursor-pointer"
						/>
						{/* Inventory */}
						<div
							class="navigation-item icon icon-inventory cursor-pointer"
							onClick={() => invActions.toggle()}
						/>
						{/* Camera (only in room) */}
						<Show when={isInRoom()}>
							<div class="navigation-item icon icon-camera cursor-pointer" />
						</Show>
					</div>
					<div id="toolbar-chat-input-container" class="d-flex align-items-center" />
				</div>
				<div class="d-flex align-items-center gap-2">
					<div class="d-flex gap-2">
						{/* Friends */}
						<div
							class="navigation-item icon icon-friendall cursor-pointer"
						/>
						{/* Messenger */}
						<div
							class="navigation-item icon icon-message cursor-pointer"
						/>
					</div>
					<div id="toolbar-friend-bar-container" class="d-none d-lg-block" />
				</div>
			</div>
		</>
	);
}
