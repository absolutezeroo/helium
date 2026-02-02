import type {MessageHandlers} from '../core/types';
import type {RoomState} from './types';

// Parser types
import type {GetGuestRoomResultMessageParser} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {RoomRatingMessageParser} from '@habbo/communication/messages/parser/navigator/RoomRatingMessageParser';
import type {RoomEventMessageParser} from '@habbo/communication/messages/parser/navigator/RoomEventMessageParser';

export const handlers: MessageHandlers<RoomState> = {

	/**
	 * Room info / entry
	 */
	GetGuestRoomResultMessageEvent: (parser: GetGuestRoomResultMessageParser): Partial<RoomState> =>
	{
		if (parser.enterRoom && parser.data)
		{
			return {
				currentRoom: parser.data,
				isStaffPick: parser.staffPick,
			};
		}

		return {};
	},

	/**
	 * Room rating updated
	 */
	RoomRatingMessageEvent: (parser: RoomRatingMessageParser): Partial<RoomState> => ({
		rating: parser.rating,
		canRate: parser.canRate,
	}),

	/**
	 * Room event started/updated
	 */
	RoomEventMessageEvent: (parser: RoomEventMessageParser): Partial<RoomState> => ({
		roomEvent: parser.data,
	}),

	/**
	 * Room event cancelled
	 */
	RoomEventCancelMessageEvent: (): Partial<RoomState> => ({
		roomEvent: null,
	}),
};
