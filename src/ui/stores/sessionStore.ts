import {createStore} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {FigureUpdateMessageEvent} from '@habbo/communication/messages/incoming/avatar/FigureUpdateMessageEvent';
import {AvailabilityStatusMessageEvent} from '@habbo/communication/messages/incoming/availability/AvailabilityStatusMessageEvent';
import {UserRightsMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserRightsMessageEvent';
import {NavigatorSettingsMessageEvent} from '@habbo/communication/messages/incoming/navigator/NavigatorSettingsMessageEvent';
import {FavouritesMessageEvent} from '@habbo/communication/messages/incoming/navigator/FavouritesMessageEvent';
import {AchievementsScoreMessageEvent} from '@habbo/communication/messages/incoming/inventory/AchievementsScoreMessageEvent';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {FigureUpdateMessageParser} from '@habbo/communication/messages/parser/avatar/FigureUpdateMessageParser';
import type {AvailabilityStatusMessageParser} from '@habbo/communication/messages/parser/availability/AvailabilityStatusMessageParser';
import type {UserRightsMessageParser} from '@habbo/communication/messages/parser/handshake/UserRightsMessageParser';
import type {NavigatorSettingsMessageParser} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {AchievementsScoreMessageParser} from '@habbo/communication/messages/parser/inventory/AchievementsScoreMessageParser';

/**
 * Session Store
 *
 * Tracks the current user's session data including identity, rights,
 * availability status, home room, favourite rooms, and achievement score.
 *
 * State is updated by incoming server messages registered in init().
 */

interface UserData
{
	userId: number;
	name: string;
	figure: string;
	gender: string;
	motto: string;
	respectsReceived: number;
	respectsRemaining: number;
	respectsPetRemaining: number;
}

interface SessionStoreState
{
	userData: UserData | null;
	availability: number;
	clubLevel: number;
	securityLevel: number;
	achievementScore: number;
	isAmbassador: boolean;
	activityPoints: Record<number, number>;
	homeRoomId: number;
	favouriteRooms: number[];
}

const [state, setState] = createStore<SessionStoreState>({
	userData: null,
	availability: 0,
	clubLevel: 0,
	securityLevel: 0,
	achievementScore: 0,
	isAmbassador: false,
	activityPoints: {},
	homeRoomId: 0,
	favouriteRooms: [],
});

const actions = {
	reset()
	{
		setState({
			userData: null,
			availability: 0,
			clubLevel: 0,
			securityLevel: 0,
			achievementScore: 0,
			isAmbassador: false,
			activityPoints: {},
			homeRoomId: 0,
			favouriteRooms: [],
		});
	},
};

function init(): void
{
	registerMessageEvent(UserObjectMessageEvent, (event) =>
	{
		const parser = event.getParser<UserObjectMessageParser>();

		setState('userData', {
			userId: parser.id,
			name: parser.name,
			figure: parser.figure,
			gender: parser.sex,
			motto: parser.customData,
			respectsReceived: parser.respectTotal,
			respectsRemaining: parser.respectLeft,
			respectsPetRemaining: parser.petRespectLeft,
		});
	});

	registerMessageEvent(FigureUpdateMessageEvent, (event) =>
	{
		const parser = event.getParser<FigureUpdateMessageParser>();

		setState('userData', (prev) => prev
			? {...prev, figure: parser.figure, gender: parser.gender}
			: prev
		);
	});

	registerMessageEvent(AvailabilityStatusMessageEvent, (event) =>
	{
		const parser = event.getParser<AvailabilityStatusMessageParser>();

		setState('availability', parser.isOpen ? 1 : 0);
	});

	registerMessageEvent(UserRightsMessageEvent, (event) =>
	{
		const parser = event.getParser<UserRightsMessageParser>();

		setState({
			clubLevel: parser.clubLevel,
			securityLevel: parser.securityLevel,
			isAmbassador: parser.isAmbassador,
		});
	});

	registerMessageEvent(NavigatorSettingsMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorSettingsMessageParser>();

		setState('homeRoomId', parser.homeRoomId);
	});

	registerMessageEvent(FavouritesMessageEvent, (event) =>
	{
		const parser = event.getParser<FavouritesMessageParser>();

		setState('favouriteRooms', parser.favouriteRoomIds);
	});

	registerMessageEvent(AchievementsScoreMessageEvent, (event) =>
	{
		const parser = event.getParser<AchievementsScoreMessageParser>();

		setState('achievementScore', parser.score);
	});
}

export const sessionStore = {state, actions, init};
