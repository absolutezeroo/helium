import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {NavigatorData} from './domain';
import type {HabboNewNavigator} from './HabboNewNavigator';

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
export class NewIncomingMessages {
    private _navigator: HabboNewNavigator;
    private _communication: IHabboCommunicationManager;
    private _data: NavigatorData;
    private _messageEvents: IMessageEvent[] = [];

    constructor(navigator: HabboNewNavigator, communication: IHabboCommunicationManager, data: NavigatorData) {
        this._navigator = navigator;
        this._communication = communication;
        this._data = data;

        this.addMessageListeners();
    }

    private addMessageListeners(): void {
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

    private addMessageEvent(event: IMessageEvent): void {
        this._communication.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    dispose(): void {
        for (const event of this._messageEvents) {
            this._communication.removeMessageEvent(event);
        }
        
        this._messageEvents = [];
    }

    // ========== Message Handlers ==========

    private onNavigatorMetaData(event: IMessageEvent): void {
        if(!event) return;

        const parser = event.parser as NavigatorMetaDataMessageParser;

        if(!parser) return;

        this._navigator.initialize(parser.topLevelContexts);

        log.info(`Navigator metadata received: ${parser.topLevelContexts.length} contexts`);
    }

    private onNavigatorSearchResultSet(event: IMessageEvent): void {
        if(!event) return;

        const parser = event.parser as NavigatorSearchResultSetMessageParser;

        if(!parser) return;

        if(!parser.searchResult) return;

        this._navigator.onSearchResult(parser.searchResult);

        log.debug(`Search results: ${parser.searchResult.blocks.length} blocks`);
    }

    private onSavedSearches(event: IMessageEvent): void {
        if(!event) return;

        const parser = event.parser as NavigatorSavedSearchesMessageParser;

        if(!parser) return;

        this._navigator.onSavedSearches(parser.savedSearches);

        log.debug(`Saved searches: ${parser.savedSearches.length}`);
    }

    private onLiftedRooms(event: IMessageEvent): void {
        if(!event) return;

        const parser = event.parser as NavigatorLiftedRoomsMessageParser;

        if(!parser) return;

        this._navigator.onLiftedRooms(parser.liftedRooms);

        log.debug(`Lifted rooms: ${parser.liftedRooms.length}`);
    }

    private onCollapsedCategories(event: IMessageEvent): void {
        if(!event) return;

        const parser = event.parser as NavigatorCollapsedCategoriesMessageParser;

        if(!parser) return;

        this._navigator.onCollapsedCategories(parser.collapsedCategories);

        log.debug(`Collapsed categories: ${parser.collapsedCategories.length}`);
    }
}
