import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
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

// Parsers
import {
	NavigatorCollapsedCategoriesMessageParser,
	NavigatorLiftedRoomsMessageParser,
	NavigatorMetaDataMessageParser,
	NavigatorSavedSearchesMessageParser,
	NavigatorSearchResultSetMessageParser,
} from '../communication/messages/parser/newnavigator';

import {Logger} from '@core/utils/Logger';

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

	dispose(): void
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
	}

	private addMessageEvent(event: IMessageEvent): void
	{
		this._navigator.communication.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	// ========== Message Handlers ==========

	private onNavigatorMetaData(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorMetaDataMessageParser;

		if (!parser) return;

		this._navigator.initialize(parser.topLevelContexts);
	}

	private onNavigatorSearchResultSet(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorSearchResultSetMessageParser;

		if (!parser) return;

		if (!parser.searchResult) return;

		this._navigator.onSearchResult(parser.searchResult);
	}

	private onSavedSearches(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorSavedSearchesMessageParser;

		if (!parser) return;

		this._navigator.onSavedSearches(parser.savedSearches);
	}

	private onLiftedRooms(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorLiftedRoomsMessageParser;

		if (!parser) return;

		this._navigator.onLiftedRooms(parser.liftedRooms);
	}

	private onCollapsedCategories(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorCollapsedCategoriesMessageParser;

		if (!parser) return;

		this._navigator.onCollapsedCategories(parser.collapsedCategories);
	}
}
