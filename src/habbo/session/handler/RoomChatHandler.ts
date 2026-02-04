import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Events
import {RoomSessionChatEvent} from '../events/RoomSessionChatEvent';

/**
 * Room chat handler
 *
 * Based on AS3: com.sulake.habbo.session.handler.RoomChatHandler
 *
 * Handles chat messages (ChatMessageEvent, WhisperMessageEvent, ShoutMessageEvent)
 * and dispatches RoomSessionChatEvent.
 *
 * TODO: Chat message events need to be implemented first:
 * - ChatMessageEvent
 * - WhisperMessageEvent
 * - ShoutMessageEvent
 * - RespectNotificationMessageEvent
 * - FloodControlMessageEvent
 */
export class RoomChatHandler extends BaseHandler
{
	private _messageEvents: IMessageEvent[] = [];

	constructor(connection: IConnection | null, listener: IRoomHandlerListener)
	{
		super(connection, listener);

		if (connection === null)
		{
			return;
		}

		// TODO: Register message events when they are implemented
		// this.addMessageEvent(connection, new ChatMessageEvent(this.onRoomChat.bind(this)));
		// this.addMessageEvent(connection, new WhisperMessageEvent(this.onRoomWhisper.bind(this)));
		// this.addMessageEvent(connection, new ShoutMessageEvent(this.onRoomShout.bind(this)));
		// this.addMessageEvent(connection, new RespectNotificationMessageEvent(this.onRespectNotification.bind(this)));
		// this.addMessageEvent(connection, new FloodControlMessageEvent(this.onFloodControl.bind(this)));
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
	 * Helper method to dispatch a chat event
	 */
	private dispatchChatEvent(
		userId: number,
		text: string,
		chatType: number,
		styleId: number,
		links: string[] | null = null,
		extraParam: number = -1
	): void
	{
		const session = this.listener.getSession(this.roomId);
		if (session === null)
		{
			return;
		}

		if (this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionChatEvent.RSCE_CHAT_EVENT,
				new RoomSessionChatEvent(
					RoomSessionChatEvent.RSCE_CHAT_EVENT,
					session,
					userId,
					text,
					chatType,
					styleId,
					links,
					extraParam
				)
			);
		}
	}

	// Note: The following handlers will be implemented when the message events are added

	// private onRoomChat(event: IMessageEvent): void
	// {
	//     const parser = event.parser as ChatMessageEventParser;
	//     this.dispatchChatEvent(
	//         parser.userId,
	//         parser.text,
	//         RoomSessionChatEvent.CHAT_TYPE_SPEAK,
	//         parser.styleId,
	//         parser.links
	//     );
	// }

	// private onRoomWhisper(event: IMessageEvent): void
	// {
	//     const parser = event.parser as ChatMessageEventParser;
	//     this.dispatchChatEvent(
	//         parser.userId,
	//         parser.text,
	//         RoomSessionChatEvent.CHAT_TYPE_WHISPER,
	//         parser.styleId,
	//         parser.links
	//     );
	// }

	// private onRoomShout(event: IMessageEvent): void
	// {
	//     const parser = event.parser as ChatMessageEventParser;
	//     this.dispatchChatEvent(
	//         parser.userId,
	//         parser.text,
	//         RoomSessionChatEvent.CHAT_TYPE_SHOUT,
	//         parser.styleId,
	//         parser.links
	//     );
	// }

	// private onFloodControl(event: IMessageEvent): void
	// {
	//     const parser = event.parser as FloodControlMessageEventParser;
	//     const session = this.listener.getSession(this.roomId);
	//     if (session && this.listener.sessionEvents)
	//     {
	//         this.listener.sessionEvents.emit(
	//             RoomSessionChatEvent.RSCE_FLOOD_EVENT,
	//             new RoomSessionChatEvent(
	//                 RoomSessionChatEvent.RSCE_FLOOD_EVENT,
	//                 session,
	//                 -1,
	//                 parser.seconds.toString(),
	//                 0,
	//                 0
	//             )
	//         );
	//     }
	// }
}
