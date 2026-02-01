import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {NavigatorIcon} from '../common';

export interface RoomInfoHeaderProps {
    name: string;
    ownerName: string;
    ownerId?: number;
    thumbnail?: string;
    isGroupRoom?: boolean;
    isStaffPick?: boolean;
    doorMode?: 'open' | 'doorbell' | 'password' | 'invisible';
    onOwnerClick?: (ownerId: number) => void;
    class?: string;
}

/**
 * Room info header - displays room name, owner, and thumbnail
 */
export function RoomInfoHeader(props: RoomInfoHeaderProps): JSX.Element {
    const handleOwnerClick = () => {
        if (props.ownerId && props.onOwnerClick) {
            props.onOwnerClick(props.ownerId);
        }
    };

    return (
        <div class={`flex gap-4 ${props.class ?? ''}`}>
            {/* Thumbnail */}
            <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-700">
                <Show
                    when={props.thumbnail}
                    fallback={
                        <div class="w-full h-full flex items-center justify-center">
                            <NavigatorIcon name="room" size="xl" class="text-slate-500" />
                        </div>
                    }
                >
                    <img
                        src={props.thumbnail}
                        alt={props.name}
                        class="w-full h-full object-cover"
                    />
                </Show>
            </div>

            {/* Info */}
            <div class="flex-1 min-w-0">
                <div class="flex items-start gap-2">
                    <h2 class="text-lg font-semibold text-slate-100 truncate">
                        {props.name}
                    </h2>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <Show when={props.isStaffPick}>
                            <NavigatorIcon name="star" size="sm" class="text-yellow-400" title="Staff Pick" />
                        </Show>
                        <Show when={props.isGroupRoom}>
                            <NavigatorIcon name="group" size="sm" class="text-blue-400" title="Group Room" />
                        </Show>
                    </div>
                </div>

                <button
                    type="button"
                    class={`
                        flex items-center gap-1 mt-1
                        text-sm text-slate-400
                        ${props.onOwnerClick ? 'hover:text-blue-400 cursor-pointer' : ''}
                        transition-colors
                    `}
                    onClick={handleOwnerClick}
                    disabled={!props.onOwnerClick}
                >
                    <NavigatorIcon name="user" size="sm" />
                    <span>{props.ownerName}</span>
                </button>

                <div class="flex items-center gap-2 mt-2">
                    <Show when={props.doorMode === 'doorbell'}>
                        <span class="flex items-center gap-1 text-xs text-orange-400">
                            <NavigatorIcon name="doorbell" size="xs" />
                            Doorbell
                        </span>
                    </Show>
                    <Show when={props.doorMode === 'password'}>
                        <span class="flex items-center gap-1 text-xs text-red-400">
                            <NavigatorIcon name="lock" size="xs" />
                            Locked
                        </span>
                    </Show>
                    <Show when={props.doorMode === 'invisible'}>
                        <span class="flex items-center gap-1 text-xs text-slate-400">
                            <NavigatorIcon name="hidden" size="xs" />
                            Invisible
                        </span>
                    </Show>
                    <Show when={!props.doorMode || props.doorMode === 'open'}>
                        <span class="flex items-center gap-1 text-xs text-green-400">
                            <NavigatorIcon name="door" size="xs" />
                            Open
                        </span>
                    </Show>
                </div>
            </div>
        </div>
    );
}
