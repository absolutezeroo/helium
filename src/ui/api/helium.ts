import Helium from '@/Helium';
import type {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {RoomEngine} from '@habbo/room';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Engine accessor functions
 *
 * Like Nitro's GetNitroInstance, GetCommunication, etc.
 * Provide convenient access to engine subsystems without importing Helium directly.
 *
 * @see source_nitro_react/src/api/nitro/
 */

export const getHelium = (): Helium => Helium.instance;

export const getCommunication = (): HabboCommunicationManager => getHelium().habboCommunication;

export const getConnection = (): IConnection | null => getCommunication().connection;

export const getConfiguration = (): IHabboConfigurationManager => getHelium().configuration;

export const getRoomEngine = (): RoomEngine => getHelium().roomEngine;

export const getSessionDataManager = (): ISessionDataManager => getHelium().sessionDataManager;

export const getRoomSessionManager = (): IRoomSessionManager => getHelium().roomSessionManager;

export const getNavigator = (): IHabboNavigator => getHelium().navigator;

export const getNewNavigator = (): IHabboNewNavigator => getHelium().newNavigator;

export const getInventory = (): IHabboInventory => getHelium().inventory;

export const getLocalization = (): IHabboLocalizationManager => getHelium().localization;

/**
 * Send a message composer to the server
 *
 * @see source_nitro_react/src/api/nitro/SendMessageComposer.ts
 */
export const SendMessageComposer = (composer: IMessageComposer<unknown[]>): void =>
{
	getConnection()?.send(composer);
};
