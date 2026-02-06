import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IIgnoredUsersManager} from './IIgnoredUsersManager';
import {IgnoreResult} from './IIgnoredUsersManager';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';

/**
 * Ignored users manager
 * Based on AS3 com.sulake.habbo.session.IgnoredUsersManager
 */
export class IgnoredUsersManager implements IIgnoredUsersManager
{
	private _communication: IHabboCommunicationManager | null = null;
	private _sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null = null;
	private _ignoredUserIds: number[] = [];
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

	public initIgnoreList(): void
	{
		// TODO: Send GetIgnoredUsersMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new GetIgnoredUsersMessageComposer());
		// }
	}

	public ignoreUser(userId: number): void
	{
		// TODO: Send IgnoreUserMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new IgnoreUserMessageComposer(userId));
		// }
	}

	public unignoreUser(userId: number): void
	{
		// TODO: Send UnignoreUserMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new UnignoreUserMessageComposer(userId));
		// }
	}

	public isIgnored(userId: number): boolean
	{
		return this._ignoredUserIds.includes(userId);
	}

	/**
	 * Set the ignored users list (called by message handler)
	 */
	public setIgnoredUsers(userIds: number[]): void
	{
		this._ignoredUserIds = [...userIds];
	}

	/**
	 * Handle ignore result from server
	 */
	public handleIgnoreResult(result: number, userId: number): void
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
				this._ignoredUserIds.shift();
				break;

			case IgnoreResult.UNIGNORED:
				this.removeUserFromIgnoreList(userId);
				break;
		}
	}

	public dispose(): void
	{
		if (this.disposed) return;

		for (const event of this._messageEvents)
		{
			this._communication?.removeMessageEvent(event);
		}

		this._messageEvents = [];
		this._ignoredUserIds = [];
		this._communication = null;
		this._sendCallback = null;
	}

	private addUserToIgnoreList(userId: number): void
	{
		if (!this._ignoredUserIds.includes(userId))
		{
			this._ignoredUserIds.push(userId);
		}
	}

	private removeUserFromIgnoreList(userId: number): void
	{
		const index = this._ignoredUserIds.indexOf(userId);

		if (index >= 0)
		{
			this._ignoredUserIds.splice(index, 1);
		}
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
