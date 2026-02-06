import {Component, ComponentDependency, type IContext, IID_HabboCommunicationManager} from '@core/runtime';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {Logger} from '@core/utils/Logger';
import type {IMessageComposer} from "@/core";
import type {IHabboNavigator} from './IHabboNavigator';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import {NavigatorData} from './domain';
import {IncomingMessages} from './IncomingMessages';
import type {CompetitionRoomsData, EventCategory, GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';

// Composers
import {
	CompetitionRoomsSearchMessageComposer,
	GetGuestRoomMessageComposer,
	MyGuildBasesSearchMessageComposer,
	MyRoomsSearchMessageComposer,
	RemoveOwnRoomRightsRoomMessageComposer,
	RoomTextSearchMessageComposer,
} from '../communication/messages/outgoing/navigator';

const log = Logger.getLogger('Navigator');

/**
 * Habbo Navigator component
 */
export class HabboNavigator extends Component implements IHabboNavigator
{
	private _incomingMessages: IncomingMessages | null = null;
	private _isOpen: boolean = false;
	private _isRoomInfoOpen: boolean = false;
	private _roomSessionManager: IRoomSessionManager | null = null;

	constructor(context: IContext)
	{
		super(context);
		this._data = new NavigatorData();
	}

	private _communication: IHabboCommunicationManager | null = null;

	get communication(): IHabboCommunicationManager
	{
		if (!this._communication)
		{
			throw new Error('[HabboNavigator] Communication not available');
		}
		return this._communication;
	}

	private _data: NavigatorData;

	get data(): NavigatorData
	{
		return this._data;
	}

	get homeRoomId(): number
	{
		return this._data.homeRoomId;
	}

	get enteredGuestRoomData(): GuestRoomData | null
	{
		return this._data.enteredGuestRoom;
	}

	get visibleEventCategories(): EventCategory[]
	{
		return this._data.visibleEventCategories;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			new ComponentDependency(
				IID_RoomSessionManager,
				(manager: IRoomSessionManager | null) =>
				{
					this._roomSessionManager = manager;
				},
				true
			),
		];
	}

	public goToHomeRoom(): boolean
	{
		if (this._data.homeRoomId < 1)
		{
			log.warn('No home room set');

			return false;
		}

		this.goToRoom(this._data.homeRoomId, true);

		return true;
	}

	public goToPrivateRoom(roomId: number): void
	{
		this.send(new GetGuestRoomMessageComposer(roomId, false, true));
	}

	public goToRoomNetwork(roomId: number, useHomeRoom: boolean): void
	{
		this.closeRoomInfo();

		let homeRoomId = 0;

		if (useHomeRoom && this._data.homeRoomId > 0)
		{
			homeRoomId = this._data.homeRoomId;
		}

		// Would call room session manager here
		log.debug(`Go to room network: ${roomId}, homeRoom=${homeRoomId}`);
	}

	public goToRoom(roomId: number, closeNavigator: boolean = true, password: string = ''): void
	{
		log.info(`Going to room: ${roomId}`);

		if (closeNavigator)
		{
			this.closeNavigator();
		}

		if (!this._roomSessionManager)
		{
			log.error('RoomSessionManager not available');
			return;
		}

		// Use RoomSessionManager to enter the room
		// This will send OpenFlatConnectionMessageComposer via RoomSession.start()
		this._roomSessionManager.gotoRoom(roomId, password);
	}

	public performTagSearch(tag: string): void
	{
		let searchTag = tag;

		if (searchTag.indexOf(' ') !== -1)
		{
			searchTag = '"' + searchTag + '"';
		}

		this.send(new RoomTextSearchMessageComposer(searchTag));

		log.debug(`Tag search: ${searchTag}`);
	}

	public performTextSearch(searchText: string): void
	{
		this.send(new RoomTextSearchMessageComposer(searchText));

		log.debug(`Text search: ${searchText}`);
	}

	public performGuildBaseSearch(): void
	{
		this.send(new MyGuildBasesSearchMessageComposer());

		log.debug('Guild base search');
	}

	public performCompetitionRoomsSearch(goalId: number, pageIndex: number): void
	{
		if (this._data.isLoading())
		{
			return;
		}

		// Set competition data for tracking
		this._data.competitionRoomsData = {
			goalId,
			pageIndex,
			pageCount: 0,
		} as CompetitionRoomsData; // cast: type assertion required

		this.send(new CompetitionRoomsSearchMessageComposer(goalId, pageIndex));

		log.debug(`Competition rooms search: goal=${goalId}, page=${pageIndex}`);
	}

	public showOwnRooms(): void
	{
		this.send(new MyRoomsSearchMessageComposer());

		this.openNavigator();

		log.debug('Showing own rooms');
	}

	public hasRoomRightsButIsNotOwner(roomId: number): boolean
	{
		// Would check with room session manager
		log.debug(`Checking room rights for: ${roomId}`);

		return false;
	}

	public removeRoomRights(roomId: number): void
	{
		this.send(new RemoveOwnRoomRightsRoomMessageComposer(roomId));
	}

	public startRoomCreation(): void
	{
		log.debug('Starting room creation');
	}

	public openNavigator(): void
	{
		if (this._isOpen) return;

		this._isOpen = true;

		log.debug('Navigator opened');
	}

	public closeNavigator(): void
	{
		if (!this._isOpen) return;

		this._isOpen = false;

		log.debug('Navigator closed');
	}

	public toggleRoomInfoVisibility(): void
	{
		if (this._isRoomInfoOpen)
		{
			this.closeRoomInfo();
		} else
		{
			this.openRoomInfo();
		}
	}

	public canRateRoom(): boolean
	{
		return this._data.canRate;
	}

	public isRoomFavorite(roomId: number): boolean
	{
		return this._data.isRoomFavourite(roomId);
	}

	public isRoomHome(roomId: number): boolean
	{
		return this._data.isRoomHome(roomId);
	}

	override dispose(): void
	{
		if (this.disposed) return;

		this._incomingMessages?.dispose();
		this._data.dispose();

		log.info('Navigator disposed');
		super.dispose();
	}

	protected override initComponent(): void
	{
		this._incomingMessages = new IncomingMessages(this);

		log.info('Navigator initialized');
	}

	private openRoomInfo(): void
	{
		if (this._isRoomInfoOpen) return;

		this._isRoomInfoOpen = true;

		log.debug('Room info opened');
	}

	private closeRoomInfo(): void
	{
		if (!this._isRoomInfoOpen) return;

		this._isRoomInfoOpen = false;

		log.debug('Room info closed');
	}

	private send(composer: IMessageComposer<unknown[]>): void
	{
		const connection = this._communication?.connection;

		if (connection)
		{
			connection.send(composer);
		}
	}
}
