import {EventEmitter} from 'eventemitter3';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IPerkManager, IPerkAllowance} from './IPerkManager';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';

/**
 * Common perk codes used in the client
 */
export const PerkCodes = {
	TRADE: 'USE_GUIDE_TOOL',
	GUIDE_TOOL: 'GUIDE_TOOL',
	CAMERA: 'CAMERA',
	CALL_ON_HELPERS: 'CALL_ON_HELPERS',
	CITIZEN: 'CITIZEN',
	SAFE_CHAT: 'SAFE_CHAT',
	FULL_CHAT: 'FULL_CHAT',
	BUILDERS_AT_WORK: 'BUILDERS_AT_WORK',
	NAVIGATOR_PHASE_ONE_BETA: 'NAVIGATOR_PHASE_ONE_BETA',
	NAVIGATOR_PHASE_TWO_BETA: 'NAVIGATOR_PHASE_TWO_BETA',
	NAVIGATOR_ROOM_THUMBNAIL_CAMERA: 'NAVIGATOR_ROOM_THUMBNAIL_CAMERA'
} as const;

/**
 * Perk manager
 * Based on AS3 com.sulake.habbo.session.PerkManager
 */
export class PerkManager extends EventEmitter implements IPerkManager
{
	private _communication: IHabboCommunicationManager | null = null;
	private _perks: Map<string, IPerkAllowance> = new Map();
	private _messageEvents: IMessageEvent[] = [];

	constructor(communication: IHabboCommunicationManager | null)
	{
		super();
		this._communication = communication;
		this.registerMessageEvents();
	}

	private _isReady: boolean = false;

	get isReady(): boolean
	{
		return this._isReady;
	}

	get disposed(): boolean
	{
		return this._communication === null;
	}

	public isPerkAllowed(perkCode: string): boolean
	{
		const perk = this._perks.get(perkCode);

		return perk ? perk.isAllowed : false;
	}

	public getPerkErrorMessage(perkCode: string): string
	{
		const perk = this._perks.get(perkCode);

		return perk ? perk.errorMessage : '';
	}

	/**
	 * Set perk allowances (called by message handler)
	 */
	public setPerks(perks: IPerkAllowance[]): void
	{
		for (const perk of perks)
		{
			this._perks.set(perk.code, perk);
		}

		this._isReady = true;
		this.emit('perksUpdated');
	}

	public dispose(): void
	{
		if (this.disposed) return;

		for (const event of this._messageEvents)
		{
			this._communication?.removeMessageEvent(event);
		}

		this._messageEvents = [];
		this._perks.clear();
		this._communication = null;
	}

	private registerMessageEvents(): void
	{
		// TODO: Register PerkAllowancesMessageEvent when implemented
		// if (this._communication)
		// {
		//     const event = new PerkAllowancesMessageEvent(this.onPerkAllowances.bind(this));
		//     this._communication.addMessageEvent(event);
		//     this._messageEvents.push(event);
		// }
	}

	// private onPerkAllowances(event: IMessageEvent): void
	// {
	//     const parser = event.parser as PerkAllowancesMessageParser;
	//     if (!parser) return;
	//     this.setPerks(parser.perks);
	// }
}
