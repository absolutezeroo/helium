import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {RoomInfoHeader} from './RoomInfoHeader';
import {RoomInfoDetails} from './RoomInfoDetails';
import {RoomInfoActions} from './RoomInfoActions';
import {NavigatorHeader} from '../common';

export interface RoomInfoData {
    id: number;
    name: string;
    ownerName: string;
    ownerId?: number;
    description?: string;
    userCount: number;
    maxUserCount: number;
    thumbnail?: string;
    score?: number;
    categoryName?: string;
    tags?: string[];
    isGroupRoom?: boolean;
    isStaffPick?: boolean;
    doorMode?: 'open' | 'doorbell' | 'password' | 'invisible';
    tradeMode?: number;
    allowPets?: boolean;
    allowPetsEating?: boolean;
    isFavourite?: boolean;
    isHome?: boolean;
    canRate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export interface RoomInfoPanelProps {
    room: RoomInfoData | null;
    loading?: boolean;
    onClose?: () => void;
    onOwnerClick?: (ownerId: number) => void;
    onTagClick?: (tag: string) => void;
    onEnterRoom?: (roomId: number) => void;
    onToggleFavourite?: (roomId: number) => void;
    onSetHome?: (roomId: number) => void;
    onRate?: (roomId: number, rating: number) => void;
    onEdit?: (roomId: number) => void;
    onDelete?: (roomId: number) => void;
    onReport?: (roomId: number) => void;
    class?: string;
}

/**
 * Complete room info panel - combines header, details, and actions
 */
export function RoomInfoPanel(props: RoomInfoPanelProps): JSX.Element {
    return (
        <div
            class={`
                flex flex-col
                bg-slate-900 border border-slate-700
                rounded-lg shadow-xl
                overflow-hidden
                ${props.class ?? ''}
            `}
        >
            {/* Header */}
            <NavigatorHeader
                title="Room Info"
                onClose={props.onClose}
            />

            {/* Content */}
            <div class="flex-1 overflow-y-auto p-4">
                <Show
                    when={!props.loading && props.room}
                    fallback={
                        <div class="flex items-center justify-center py-12">
                            <Show
                                when={props.loading}
                                fallback={
                                    <p class="text-slate-400">Select a room to view details</p>
                                }
                            >
                                <div class="flex items-center gap-2 text-slate-400">
                                    <span class="animate-spin">⟳</span>
                                    Loading room info...
                                </div>
                            </Show>
                        </div>
                    }
                >
                    <div class="space-y-6">
                        {/* Header section */}
                        <RoomInfoHeader
                            name={props.room!.name}
                            ownerName={props.room!.ownerName}
                            ownerId={props.room!.ownerId}
                            thumbnail={props.room!.thumbnail}
                            isGroupRoom={props.room!.isGroupRoom}
                            isStaffPick={props.room!.isStaffPick}
                            doorMode={props.room!.doorMode}
                            onOwnerClick={props.onOwnerClick}
                        />

                        {/* Details section */}
                        <RoomInfoDetails
                            description={props.room!.description}
                            userCount={props.room!.userCount}
                            maxUserCount={props.room!.maxUserCount}
                            score={props.room!.score}
                            categoryName={props.room!.categoryName}
                            tags={props.room!.tags}
                            tradeMode={props.room!.tradeMode}
                            allowPets={props.room!.allowPets}
                            allowPetsEating={props.room!.allowPetsEating}
                            onTagClick={props.onTagClick}
                        />

                        {/* Actions section */}
                        <RoomInfoActions
                            roomId={props.room!.id}
                            isFavourite={props.room!.isFavourite}
                            isHome={props.room!.isHome}
                            canRate={props.room!.canRate}
                            canEdit={props.room!.canEdit}
                            canDelete={props.room!.canDelete}
                            onEnterRoom={props.onEnterRoom}
                            onToggleFavourite={props.onToggleFavourite}
                            onSetHome={props.onSetHome}
                            onRate={props.onRate}
                            onEdit={props.onEdit}
                            onDelete={props.onDelete}
                            onReport={props.onReport}
                        />
                    </div>
                </Show>
            </div>
        </div>
    );
}
