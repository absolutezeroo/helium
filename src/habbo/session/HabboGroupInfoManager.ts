import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboGroupInfoManager} from './IHabboGroupInfoManager';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';

/**
 * Habbo group info manager
 * Based on AS3 com.sulake.habbo.session.HabboGroupInfoManager
 */
export class HabboGroupInfoManager implements IHabboGroupInfoManager
{
	private _communication: IHabboCommunicationManager | null = null;
	private _sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null = null;
	private _groupBadges: Map<number, string> = new Map();
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

	public getBadgeId(groupId: number): string | null
	{
		return this._groupBadges.get(groupId) ?? null;
	}

	/**
	 * Set group badge (called by message handler)
	 */
	public setGroupBadge(groupId: number, badgeId: string): void
	{
		this._groupBadges.set(groupId, badgeId);
	}

	/**
	 * Set multiple group badges (called by message handler)
	 */
	public setGroupBadges(badges: Map<number, string>): void
	{
		for (const [groupId, badgeId] of badges)
		{
			this._groupBadges.set(groupId, badgeId);
		}
	}

	/**
	 * Request group badges for current room (called on room ready)
	 */
	public requestGroupBadges(): void
	{
		// TODO: Send GetHabboGroupBadgesMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new GetHabboGroupBadgesMessageComposer());
		// }
	}

	public dispose(): void
	{
		if (this.disposed) return;

		for (const event of this._messageEvents)
		{
			this._communication?.removeMessageEvent(event);
		}

		this._messageEvents = [];
		this._groupBadges.clear();
		this._communication = null;
		this._sendCallback = null;
	}

	private registerMessageEvents(): void
	{
		// TODO: Register RoomReadyMessageEvent and HabboGroupBadgesMessageEvent when implemented
		// if (this._communication)
		// {
		//     const roomReadyEvent = new RoomReadyMessageEvent(this.onRoomReady.bind(this));
		//     this._communication.addMessageEvent(roomReadyEvent);
		//     this._messageEvents.push(roomReadyEvent);
		//
		//     const groupBadgesEvent = new HabboGroupBadgesMessageEvent(this.onGroupBadges.bind(this));
		//     this._communication.addMessageEvent(groupBadgesEvent);
		//     this._messageEvents.push(groupBadgesEvent);
		// }
	}

	// private onRoomReady(event: IMessageEvent): void
	// {
	//     this.requestGroupBadges();
	// }
	//
	// private onGroupBadges(event: IMessageEvent): void
	// {
	//     const parser = event.parser as HabboGroupBadgesMessageParser;
	//     if (!parser) return;
	//     this.setGroupBadges(parser.badges);
	// }
}
