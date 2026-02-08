import {createStore, produce} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {SendMessageComposer} from '@ui/api/helium';
import {GetGuestRoomResultMessageEvent} from '@habbo/communication/messages/incoming/navigator/GetGuestRoomResultMessageEvent';
import {RoomRatingMessageEvent} from '@habbo/communication/messages/incoming/navigator/RoomRatingMessageEvent';
import {RoomEventMessageEvent} from '@habbo/communication/messages/incoming/navigator/RoomEventMessageEvent';
import {RoomReadyMessageEvent} from '@habbo/communication/messages/incoming/room/session/RoomReadyMessageEvent';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {CloseConnectionMessageEvent} from '@habbo/communication/messages/incoming/room/session/CloseConnectionMessageEvent';
import {YouAreControllerMessageEvent} from '@habbo/communication/messages/incoming/room/permissions/YouAreControllerMessageEvent';
import {YouAreOwnerMessageEvent} from '@habbo/communication/messages/incoming/room/permissions/YouAreOwnerMessageEvent';
import {UsersMessageEvent} from '@habbo/communication/messages/incoming/room/engine/UsersMessageEvent';
import {UserRemoveMessageEvent} from '@habbo/communication/messages/incoming/room/engine/UserRemoveMessageEvent';
import type {GetGuestRoomResultMessageParser} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {RoomRatingMessageParser} from '@habbo/communication/messages/parser/navigator/RoomRatingMessageParser';
import type {RoomEventMessageParser} from '@habbo/communication/messages/parser/navigator/RoomEventMessageParser';
import type {RoomEntryInfoMessageParser} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';
import type {YouAreControllerMessageParser} from '@habbo/communication/messages/parser/room/permissions/YouAreControllerMessageParser';
import type {UsersMessageParser} from '@habbo/communication/messages/parser/room/engine/UsersMessageParser';
import type {UserRemoveMessageParser} from '@habbo/communication/messages/parser/room/engine/UserRemoveMessageParser';
import {QuitMessageComposer} from '@habbo/communication/messages/outgoing/room/session/QuitMessageComposer';

/**
 * Room Store
 *
 * Tracks the current room's data, session state, permissions,
 * room event info, and the list of users present in the room.
 *
 * State is updated by incoming server messages registered in init().
 */

export const enum RoomUserType
{
	USER = 1,
	PET = 2,
	BOT = 3,
	RENTABLE_BOT = 4,
}

export interface RoomUserData
{
	roomIndex: number;
	name: string;
	type: RoomUserType;
	figure?: string;
	custom?: string;
	petLevel?: number;
	petBreed?: number;
	userId?: number;
}

export type RoomSessionState = 'none' | 'created' | 'started' | 'ended';

interface RoomData
{
	roomId: number;
	roomName: string;
	description: string;
	ownerName: string;
	ownerId: number;
	maxUserCount: number;
	habboGroupId: number;
}

interface RoomEvent
{
	eventName: string;
	eventDescription: string;
}

interface RoomStoreState
{
	currentRoom: RoomData | null;
	rating: number;
	canRate: boolean;
	isStaffPick: boolean;
	roomEvent: RoomEvent | null;
	sessionState: RoomSessionState;
	ownUserRoomIndex: number;
	isRoomOwner: boolean;
	roomControllerLevel: number;
	isSpectator: boolean;
	isGuildRoom: boolean;
	arePetsAllowed: boolean;
	users: Record<number, RoomUserData>;
}

const DEFAULT_STATE: RoomStoreState = {
	currentRoom: null,
	rating: 0,
	canRate: true,
	isStaffPick: false,
	roomEvent: null,
	sessionState: 'none',
	ownUserRoomIndex: -1,
	isRoomOwner: false,
	roomControllerLevel: 0,
	isSpectator: false,
	isGuildRoom: false,
	arePetsAllowed: true,
	users: {},
};

const [state, setState] = createStore<RoomStoreState>({...DEFAULT_STATE});

const actions = {
	clear()
	{
		setState({...DEFAULT_STATE});
	},

	goToDesktop()
	{
		SendMessageComposer(new QuitMessageComposer());
	},
};

function init(): void
{
	registerMessageEvent(GetGuestRoomResultMessageEvent, (event) =>
	{
		const parser = event.getParser<GetGuestRoomResultMessageParser>();
		const data = parser.data;

		if (!data)
		{
			return;
		}

		if (parser.enterRoom)
		{
			setState({
				currentRoom: {
					roomId: data.flatId,
					roomName: data.roomName,
					description: data.description,
					ownerName: data.ownerName,
					ownerId: data.ownerId,
					maxUserCount: data.maxUserCount,
					habboGroupId: data.habboGroupId,
				},
				isStaffPick: parser.staffPick,
				isGuildRoom: data.habboGroupId > 0,
				arePetsAllowed: data.allowPets,
			});
		}
		else
		{
			setState('currentRoom', {
				roomId: data.flatId,
				roomName: data.roomName,
				description: data.description,
				ownerName: data.ownerName,
				ownerId: data.ownerId,
				maxUserCount: data.maxUserCount,
				habboGroupId: data.habboGroupId,
			});
			setState('isStaffPick', parser.staffPick);
			setState('isGuildRoom', data.habboGroupId > 0);
			setState('arePetsAllowed', data.allowPets);
		}
	});

	registerMessageEvent(RoomRatingMessageEvent, (event) =>
	{
		const parser = event.getParser<RoomRatingMessageParser>();

		setState({
			rating: parser.rating,
			canRate: parser.canRate,
		});
	});

	registerMessageEvent(RoomEventMessageEvent, (event) =>
	{
		const parser = event.getParser<RoomEventMessageParser>();
		const data = parser.data;

		if (data && data.eventName.length > 0)
		{
			setState('roomEvent', {
				eventName: data.eventName,
				eventDescription: data.eventDescription,
			});
		}
		else
		{
			setState('roomEvent', null);
		}
	});

	registerMessageEvent(RoomReadyMessageEvent, () =>
	{
		setState('sessionState', 'started');
	});

	registerMessageEvent(RoomEntryInfoMessageEvent, (event) =>
	{
		const parser = event.getParser<RoomEntryInfoMessageParser>();

		setState({
			isRoomOwner: parser.owner,
			sessionState: 'created',
		});
	});

	registerMessageEvent(CloseConnectionMessageEvent, () =>
	{
		actions.clear();
	});

	registerMessageEvent(YouAreControllerMessageEvent, (event) =>
	{
		const parser = event.getParser<YouAreControllerMessageParser>();

		setState('roomControllerLevel', parser.roomControllerLevel);
	});

	registerMessageEvent(YouAreOwnerMessageEvent, () =>
	{
		setState('isRoomOwner', true);
	});

	registerMessageEvent(UsersMessageEvent, (event) =>
	{
		const parser = event.getParser<UsersMessageParser>();

		setState(produce((draft) =>
		{
			for (let i = 0; i < parser.userCount; i++)
			{
				const user = parser.getUser(i);

				if (!user)
				{
					continue;
				}

				draft.users[user.roomIndex] = {
					roomIndex: user.roomIndex,
					name: user.name,
					type: user.userType as RoomUserType,
					figure: user.figure,
					custom: user.custom,
					petLevel: user.petLevel,
					userId: user.webID,
				};
			}
		}));
	});

	registerMessageEvent(UserRemoveMessageEvent, (event) =>
	{
		const parser = event.getParser<UserRemoveMessageParser>();

		setState(produce((draft) =>
		{
			delete draft.users[parser.roomIndex];
		}));
	});
}

export const roomStore = {state, actions, init};
