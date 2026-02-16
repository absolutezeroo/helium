import type {HeliumCore, IDisposable, IGameDataResources} from "@core";
import {IHabboCommunicationDemo, IHabboCommunicationManager} from "@habbo/communication";
import {IHabboLocalizationManager} from "@habbo/localization";
import {IHabboNavigator, IHabboNewNavigator} from "@habbo/navigator";
import {IHabboInventory} from "@habbo/inventory";
import {IHabboConfigurationManager} from "@habbo/configuration";
import {IRoomManager} from "@room";
import {IRoomSessionManager, ISessionDataManager} from "@habbo/session";
import {IRoomEngine} from "@habbo/room";
import {IHeliumConfig} from "./Helium";
import {IRoomMessageHandler} from "@habbo/room/IRoomMessageHandler";
import type {IHabboWindowManager} from "@habbo/window/IHabboWindowManager";
import type {IHabboToolbar} from "@habbo/toolbar/IHabboToolbar";

export interface IHeliumMain extends IDisposable
{
	readonly navigator: IHabboNavigator;
	readonly newNavigator: IHabboNewNavigator;
	readonly inventory: IHabboInventory;
	readonly configurationManager: IHabboConfigurationManager;
	readonly communicationDemo: IHabboCommunicationDemo;
	readonly roomManager: IRoomManager;
	readonly roomMessageHandler: IRoomMessageHandler;
	readonly roomSessionManager: IRoomSessionManager;
	readonly localization: IHabboLocalizationManager;
	readonly roomEngine: IRoomEngine;
	readonly sessionDataManager: ISessionDataManager;
	readonly habboCommunication: IHabboCommunicationManager;
	readonly windowManager: IHabboWindowManager;
	readonly toolbar: IHabboToolbar;

	/**
	 * Initialize the engine orchestrator
	 *
	 * @param core - The HeliumCore instance (created by Helium shell)
	 * @param config - Optional Helium configuration
	 */
	init(core: HeliumCore, config?: IHeliumConfig): Promise<void>;

	/**
	 * Create Core and prepare all components.
	 *
	 * Order follows AS3 HabboAirMain.as prepareCore() sequence:
	 * Config → Communication → Demo → Localization → RoomManager → RoomSessionManager
	 * → SessionDataManager → Navigator → Inventory → RoomEngine → RoomMessageHandler
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as prepareCore()
	 */
	prepareCore(config?: IHeliumConfig): Promise<void>;

	/**
	 * Called when game data resources (hashes) are available.
	 * Sets config properties from hashes for game data loading.
	 */
	onGameDataResourcesReady(resources: IGameDataResources): Promise<void>;

	/**
	 * Load external UI variables and merge into configuration
	 */
	loadExternalUIVariables(url: string): Promise<void>;

	/**
	 * Initialize localization
	 */
	initLocalization(): void;

	/**
	 * Initialize the Friend Bar (landing view, etc.)
	 * Must be called AFTER window layouts are registered.
	 */
	initFriendBar(): void;
}
