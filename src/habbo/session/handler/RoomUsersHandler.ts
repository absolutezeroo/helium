import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Message events
import {UsersMessageEvent} from '../../communication/messages/incoming/room/engine/UsersMessageEvent';
import {UserRemoveMessageEvent} from '../../communication/messages/incoming/room/engine/UserRemoveMessageEvent';
import {DoorbellMessageEvent} from '../../communication/messages/incoming/navigator/DoorbellMessageEvent';

// Parsers
import type {UsersMessageParser} from '../../communication/messages/parser/room/engine/UsersMessageParser';
import type {UserRemoveMessageParser} from '../../communication/messages/parser/room/engine/UserRemoveMessageParser';
import type {DoorbellMessageParser} from '../../communication/messages/parser/navigator/DoorbellMessageParser';

// Events
import {RoomSessionUserDataUpdateEvent} from '../events/RoomSessionUserDataUpdateEvent';
import {RoomSessionDoorbellEvent} from '../events/RoomSessionDoorbellEvent';

/**
 * Room users handler
 *
 * Based on AS3: com.sulake.habbo.session.handler.RoomUsersHandler
 *
 * Handles user-related messages and manages user data in the session.
 * This is a simplified implementation focusing on core functionality.
 *
 * TODO: Implement additional handlers:
 * - HabboUserBadgesMessageEvent (user badges)
 * - UserChangeMessageEvent (figure updates)
 * - UserNameChangedMessageEvent
 * - PetInfoMessageEvent, PetCommandsMessageEvent, etc. (pet-related)
 * - DanceMessageEvent
 * - FavoriteMembershipUpdateMessageEvent
 */
export class RoomUsersHandler extends BaseHandler
{
	private _messageEvents: IMessageEvent[] = [];

	constructor(connection: IConnection | null, listener: IRoomHandlerListener)
	{
		super(connection, listener);

		if (connection === null)
		{
			return;
		}

		// Register core message events
		this.addMessageEvent(connection, new UsersMessageEvent(this.onUsers.bind(this)));
		this.addMessageEvent(connection, new UserRemoveMessageEvent(this.onUserRemove.bind(this)));
		this.addMessageEvent(connection, new DoorbellMessageEvent(this.onDoorbell.bind(this)));

		// TODO: Register additional message events when implemented
		// this.addMessageEvent(connection, new HabboUserBadgesMessageEvent(this.onUserBadges.bind(this)));
		// this.addMessageEvent(connection, new UserChangeMessageEvent(this.onUserChange.bind(this)));
		// this.addMessageEvent(connection, new DanceMessageEvent(this.onDance.bind(this)));
	}

	override dispose(): void
	{
		if (this.connection)
		{
			for (const event of this._messageEvents)
			{
				this.connection.removeMessageEvent(event);
			}
		}
		this._messageEvents = [];

		super.dispose();
	}

	private addMessageEvent(connection: IConnection, event: IMessageEvent): void
	{
		connection.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	/**
	 * Handle users entering the room
	 */
	private onUsers(event: IMessageEvent): void
	{
		const usersEvent = event as UsersMessageEvent;
		if (usersEvent === null)
		{
			return;
		}

		const parser = usersEvent.parser as UsersMessageParser;
		if (parser === null)
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);
		if (session === null)
		{
			return;
		}

		// Collect added users for the event
		const addedUsers: unknown[] = [];

		for (let i = 0; i < parser.userCount; i++)
		{
			const userData = parser.getUser(i);
			if (userData !== null)
			{
				// TODO: Create UserData objects and add to session.userDataManager
				// For now, just collect the raw data
				addedUsers.push({
					roomIndex: userData.roomIndex,
					name: userData.name,
					figure: userData.figure,
					userType: userData.userType,
					webID: userData.webID,
					sex: userData.sex,
				});
			}
		}

		// Dispatch user data update event
		if (this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionUserDataUpdateEvent.RSUDUE_USER_DATA_UPDATE,
				new RoomSessionUserDataUpdateEvent(session, addedUsers)
			);
		}
	}

	/**
	 * Handle user leaving the room
	 */
	private onUserRemove(event: IMessageEvent): void
	{
		const removeEvent = event as UserRemoveMessageEvent;
		if (removeEvent === null)
		{
			return;
		}

		const parser = removeEvent.parser as UserRemoveMessageParser;
		if (parser === null)
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);
		if (session === null)
		{
			return;
		}

		// TODO: Remove user from session.userDataManager
		// session.userDataManager.removeUserDataByRoomIndex(parser.roomIndex);
	}

	/**
	 * Handle doorbell ring
	 */
	private onDoorbell(event: IMessageEvent): void
	{
		const doorbellEvent = event as DoorbellMessageEvent;
		if (doorbellEvent === null)
		{
			return;
		}

		const userName = (doorbellEvent.parser as DoorbellMessageParser)?.userName;
		if (!userName || userName === '')
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);
		if (session === null)
		{
			return;
		}

		if (this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionDoorbellEvent.RSDE_DOORBELL,
				new RoomSessionDoorbellEvent(RoomSessionDoorbellEvent.RSDE_DOORBELL, session, userName)
			);
		}
	}

	// TODO: Implement additional handlers

	// private onUserBadges(event: IMessageEvent): void { ... }
	// private onUserChange(event: IMessageEvent): void { ... }
	// private onDance(event: IMessageEvent): void { ... }
}
