import type {IIgnoredUsersManager} from './IIgnoredUsersManager';
import {IgnoreResult} from './IIgnoredUsersManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';

/**
 * Ignored users manager
 * Based on AS3 com.sulake.habbo.session.IgnoredUsersManager
 */
export class IgnoredUsersManager implements IIgnoredUsersManager
{
	private _communication: IHabboCommunicationManager | null = null;
	private _sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null = null;
	private _ignoredUserIds: Set<number> = new Set();
	private _messageEvents: IMessageEvent[] = [];

	constructor(communication: IHabboCommunicationManager | null, sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null)
	{
		this._communication = communication;
		this._sendCallback = sendCallback;

		this.registerMessageEvents();
	}

	get disposed(): boolean
	{
		return this._communication === null;
	}

	initIgnoreList(): void
	{
		// TODO: Send GetIgnoredUsersMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new GetIgnoredUsersMessageComposer());
		// }
	}

	ignoreUser(userId: number): void
	{
		// TODO: Send IgnoreUserMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new IgnoreUserMessageComposer(userId));
		// }
	}

	unignoreUser(userId: number): void
	{
		// TODO: Send UnignoreUserMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new UnignoreUserMessageComposer(userId));
		// }
	}

	isIgnored(userId: number): boolean
	{
		return this._ignoredUserIds.has(userId);
	}

	/**
	 * Set the ignored users list (called by message handler)
	 */
	setIgnoredUsers(userIds: number[]): void
	{
		this._ignoredUserIds = new Set(userIds);
	}

	/**
	 * Handle ignore result from server
	 */
	handleIgnoreResult(result: number, userId: number): void
	{
		switch (result)
		{
			case IgnoreResult.FAILED:
				// Do nothing
				break;

			case IgnoreResult.IGNORED:
				this.addUserToIgnoreList(userId);
				break;

			case IgnoreResult.IGNORED_LIST_FULL:
				// Add user but remove oldest
				this.addUserToIgnoreList(userId);
				{
					const oldest = this._ignoredUserIds.values().next().value;
					if(oldest !== undefined) this._ignoredUserIds.delete(oldest);
				}
				break;

			case IgnoreResult.UNIGNORED:
				this.removeUserFromIgnoreList(userId);
				break;
		}
	}

	dispose(): void
	{
		if (this.disposed) return;

		for (const event of this._messageEvents)
		{
			this._communication?.removeMessageEvent(event);
		}

		this._messageEvents = [];
		this._ignoredUserIds.clear();
		this._communication = null;
		this._sendCallback = null;
	}

	private addUserToIgnoreList(userId: number): void
	{
		this._ignoredUserIds.add(userId);
	}

	private removeUserFromIgnoreList(userId: number): void
	{
		this._ignoredUserIds.delete(userId);
	}

	private registerMessageEvents(): void
	{
		// TODO: Register IgnoreResultMessageEvent and IgnoredUsersMessageEvent when implemented
		// if (this._communication)
		// {
		//     const ignoreResultEvent = new IgnoreResultMessageEvent(this.onIgnoreResult.bind(this));
		//     this._communication.addMessageEvent(ignoreResultEvent);
		//     this._messageEvents.push(ignoreResultEvent);
		//
		//     const ignoredUsersEvent = new IgnoredUsersMessageEvent(this.onIgnoredUsers.bind(this));
		//     this._communication.addMessageEvent(ignoredUsersEvent);
		//     this._messageEvents.push(ignoredUsersEvent);
		// }
	}
}
