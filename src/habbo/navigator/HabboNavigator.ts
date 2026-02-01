import {EventEmitter} from 'eventemitter3';
import {inject, injectable} from 'inversify';
import type {HabboNavigatorEvents, IHabboNavigator} from './IHabboNavigator';
import {NavigatorData} from './domain';
import {IncomingMessages} from './IncomingMessages';
import type {CompetitionRoomsData, EventCategory, GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import {TYPES} from '@iid/types';
import {Logger} from '@core/utils/Logger';

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
 *
 */
@injectable()
export class HabboNavigator extends EventEmitter<HabboNavigatorEvents> implements IHabboNavigator
{
	private _communication: IHabboCommunicationManager;
	private _incomingMessages: IncomingMessages;
	private _isOpen: boolean = false;
	private _isRoomInfoOpen: boolean = false;
	private _disposed: boolean = false;

	constructor(
		@inject(TYPES.HabboCommunicationManager) communication: IHabboCommunicationManager
	)
	{
		super();
		this._communication = communication;
		this._data = new NavigatorData();
		this._incomingMessages = new IncomingMessages(communication, this._data);

		log.info('Navigator initialized');
	}

	private _data: NavigatorData;

	// ========== Properties ==========

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

	// ========== Navigation Methods ==========

	goToHomeRoom(): boolean
	{
		if (this._data.homeRoomId < 1)
		{
			log.warn('No home room set');
			return false;
		}
		this.goToRoom(this._data.homeRoomId, true);
		return true;
	}

	goToPrivateRoom(roomId: number): void
	{
		this.send(new GetGuestRoomMessageComposer(roomId, false, true));
	}

	goToRoomNetwork(roomId: number, useHomeRoom: boolean): void
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

	goToRoom(roomId: number, closeNavigator: boolean = true, password: string = ''): void
	{
		log.info(`Going to room: ${roomId}`);
		if (closeNavigator)
		{
			this.closeNavigator();
		}
		// Would call room session manager here to actually enter the room
		this.send(new GetGuestRoomMessageComposer(roomId, true, true));
	}

	// ========== Search Methods ==========

	performTagSearch(tag: string): void
	{
		let searchTag = tag;

		if (searchTag.indexOf(' ') !== -1)
		{
			searchTag = '"' + searchTag + '"';
		}

		this.send(new RoomTextSearchMessageComposer(searchTag));

		log.debug(`Tag search: ${searchTag}`);
	}

	performTextSearch(searchText: string): void
	{
		this.send(new RoomTextSearchMessageComposer(searchText));

		log.debug(`Text search: ${searchText}`);
	}

	performGuildBaseSearch(): void
	{
		this.send(new MyGuildBasesSearchMessageComposer());

		log.debug('Guild base search');
	}

	performCompetitionRoomsSearch(goalId: number, pageIndex: number): void
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
		} as CompetitionRoomsData;

		this.send(new CompetitionRoomsSearchMessageComposer(goalId, pageIndex));

		log.debug(`Competition rooms search: goal=${goalId}, page=${pageIndex}`);
	}

	showOwnRooms(): void
	{
		this.send(new MyRoomsSearchMessageComposer());

		this.openNavigator();

		log.debug('Showing own rooms');
	}

	// ========== Room Rights ==========

	hasRoomRightsButIsNotOwner(roomId: number): boolean
	{
		// Would check with room session manager
		log.debug(`Checking room rights for: ${roomId}`);

		return false;
	}

	removeRoomRights(roomId: number): void
	{
		this.send(new RemoveOwnRoomRightsRoomMessageComposer(roomId));
	}

	// ========== UI Methods ==========

	startRoomCreation(): void
	{
		log.debug('Starting room creation');
		
		this.emit('navigatorOpened');
		// Would open room creation view
	}

	openNavigator(): void
	{
		if (this._isOpen) return;
		this._isOpen = true;
		this.emit('navigatorOpened');
		log.debug('Navigator opened');
	}

	closeNavigator(): void
	{
		if (!this._isOpen) return;
		this._isOpen = false;
		this.emit('navigatorClosed');
		log.debug('Navigator closed');
	}

	toggleRoomInfoVisibility(): void
	{
		if (this._isRoomInfoOpen)
		{
			this.closeRoomInfo();
		} else
		{
			this.openRoomInfo();
		}
	}

	canRateRoom(): boolean
	{
		return this._data.canRate;
	}

	isRoomFavorite(roomId: number): boolean
	{
		return this._data.isRoomFavourite(roomId);
	}

	// ========== Utility Methods ==========

	isRoomHome(roomId: number): boolean
	{
		return this._data.isRoomHome(roomId);
	}

	dispose(): void
	{
		if (this._disposed) return;
		this._disposed = true;

		this._incomingMessages.dispose();
		this._data.dispose();
		this.removeAllListeners();

		log.info('Navigator disposed');
	}

	private openRoomInfo(): void
	{
		if (this._isRoomInfoOpen) return;
		this._isRoomInfoOpen = true;
		this.emit('roomInfoOpened');
		log.debug('Room info opened');
	}

	private closeRoomInfo(): void
	{
		if (!this._isRoomInfoOpen) return;
		this._isRoomInfoOpen = false;
		this.emit('roomInfoClosed');
		log.debug('Room info closed');
	}

	// ========== Dispose ==========

	private send(composer: { getMessageArray(): unknown[]; dispose(): void }): void
	{
		const connection = this._communication.connection;
		if (connection)
		{
			connection.send(composer);
		}
	}
}
