import type {HeliumCore, IDisposable, IGameDataResources} from "@/core";
import {IHabboCommunicationDemo, IHabboCommunicationManager} from "@habbo/communication";
import {IHabboLocalizationManager} from "@habbo/localization";
import {IHabboNavigator, IHabboNewNavigator} from "@habbo/navigator";
import {IHabboInventory} from "@habbo/inventory";
import {IHabboConfigurationManager} from "@habbo/configuration";
import {IRoomManager} from "@/room";
import {IRoomSessionManager, ISessionDataManager} from "@habbo/session";
import {IRoomEngine} from "@habbo/room";
import {IHeliumConfig} from "@/Helium";
import {IRoomMessageHandler} from "@habbo/room/IRoomMessageHandler";

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

	/**
	 * Initialize the engine orchestrator
	 *
	 * @param core - The HeliumCore instance (created by Helium shell)
	 * @param config - Optional Helium configuration
	 */
	init(core: HeliumCore, config?: IHeliumConfig): Promise<void>;

	/**
	 * Initialize Habbo-specific managers
	 *
	 * Order follows AS3 HabboMain.as initialization sequence:
	 * Config → Communication → Demo → Localization → RoomManager → RoomSessionManager
	 * → SessionDataManager → Navigator → Inventory → RoomEngine → RoomMessageHandler
	 */
	initHabboManagers(config?: IHeliumConfig): Promise<void>;

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
	 * Initialize all SolidJS stores
	 */
	initStores(): void;

	/**
	 * Initialize localization
	 */
	initLocalization(): void;
}
