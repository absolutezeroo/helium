import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import type {HabboNewNavigator} from './HabboNewNavigator';
import type {NavigatorData} from './domain';

// Message events
import {
	NavigatorCollapsedCategoriesMessageEvent,
	NavigatorLiftedRoomsMessageEvent,
	NavigatorMetaDataMessageEvent,
	NavigatorSavedSearchesMessageEvent,
	NavigatorSearchResultSetMessageEvent,
} from '../communication/messages/incoming/newnavigator';

import {RoomEntryInfoMessageEvent} from '../communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';

// Parsers
import {
	NavigatorCollapsedCategoriesMessageParser,
	NavigatorLiftedRoomsMessageParser,
	NavigatorMetaDataMessageParser,
	NavigatorSavedSearchesMessageParser,
	NavigatorSearchResultSetMessageParser,
} from '../communication/messages/parser/newnavigator';

import {RoomEntryInfoMessageParser} from '../communication/messages/parser/room/engine/RoomEntryInfoMessageParser';

// Composers
import {GetGuestRoomMessageComposer} from '../communication/messages/outgoing/navigator';

const log = Logger.getLogger('NewNavigator');

/**
 * Handles incoming messages for the new navigator
 *
 * Based on AS3 com.sulake.habbo.navigator.NewIncomingMessages
 */
export class NewIncomingMessages
{
	private _navigator: HabboNewNavigator;
	private _messageEvents: IMessageEvent[] = [];

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;

		this.addMessageListeners();
	}

	get data(): NavigatorData
	{
		return this._navigator.data;
	}

	public dispose(): void
	{
		for (const event of this._messageEvents)
		{
			this._navigator.communication.removeMessageEvent(event);
		}

		this._messageEvents = [];
	}

	private addMessageListeners(): void
	{
		// Navigator metadata (top level contexts)
		this.addMessageEvent(new NavigatorMetaDataMessageEvent(this.onNavigatorMetaData.bind(this)));

		// Search results
		this.addMessageEvent(new NavigatorSearchResultSetMessageEvent(this.onNavigatorSearchResultSet.bind(this)));

		// Saved searches
		this.addMessageEvent(new NavigatorSavedSearchesMessageEvent(this.onSavedSearches.bind(this)));

		// Lifted rooms
		this.addMessageEvent(new NavigatorLiftedRoomsMessageEvent(this.onLiftedRooms.bind(this)));

		// Collapsed categories
		this.addMessageEvent(new NavigatorCollapsedCategoriesMessageEvent(this.onCollapsedCategories.bind(this)));

		// Room entry - triggers actual room entry
		this.addMessageEvent(new RoomEntryInfoMessageEvent(this.onRoomEntryInfo.bind(this)));
	}

	private addMessageEvent(event: IMessageEvent): void
	{
		this._navigator.communication.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	private onNavigatorMetaData(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorMetaDataMessageParser; // cast: event type assertion

		if (!parser) return;

		this._navigator.initialize(parser.topLevelContexts);
	}

	private onNavigatorSearchResultSet(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorSearchResultSetMessageParser; // cast: event type assertion

		if (!parser) return;

		if (!parser.searchResult) return;

		this._navigator.onSearchResult(parser.searchResult);
	}

	private onSavedSearches(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorSavedSearchesMessageParser; // cast: event type assertion

		if (!parser) return;

		this._navigator.onSavedSearches(parser.savedSearches);
	}

	private onLiftedRooms(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorLiftedRoomsMessageParser; // cast: event type assertion

		if (!parser) return;

		this._navigator.onLiftedRooms(parser.liftedRooms);
	}

	private onCollapsedCategories(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorCollapsedCategoriesMessageParser; // cast: event type assertion

		if (!parser) return;

		this._navigator.onCollapsedCategories(parser.collapsedCategories);
	}

	/**
	 * Room entry info received - now we can actually enter the room
	 * Send GetGuestRoomMessageComposer with enterRoom=true
	 */
	private onRoomEntryInfo(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as RoomEntryInfoMessageParser; // cast: event type assertion

		if (!parser) return;

		log.debug(`Room entry info: roomId=${parser.guestRoomId}, owner=${parser.owner}`);

		// Send the second GetGuestRoomMessage with enterRoom=true to get full room data
		const connection = this._navigator.communication.connection;

		if (connection)
		{
			connection.send(new GetGuestRoomMessageComposer(parser.guestRoomId, true, false));
		}
	}
}
