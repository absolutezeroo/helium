import {ComponentContext, HeliumCore, type ICoreCommunicationManager, IDisposable} from "@/core";
import {Application, Renderer} from "pixi.js";
import type {IHabboConfigurationManager} from "@habbo/configuration";
import type {HabboCommunicationManager} from "@habbo/communication";
import type {RoomEngine} from "@habbo/room";
import type {IRoomSessionManager, ISessionDataManager} from "@habbo/session";
import type {IHabboNavigator, IHabboNewNavigator} from "@habbo/navigator";
import type {IHabboInventory} from "@habbo/inventory";
import type {IHabboLocalizationManager} from "@habbo/localization";
import {IHeliumConfig} from "@/Helium";

export interface IHelium extends IDisposable
{
	readonly core: HeliumCore;
	readonly context: ComponentContext;
	readonly application: Application<Renderer>;
	readonly communication: ICoreCommunicationManager;
	readonly isReady: boolean;
	readonly configuration: IHabboConfigurationManager;
	readonly habboCommunication: HabboCommunicationManager;
	readonly roomEngine: RoomEngine;
	readonly sessionDataManager: ISessionDataManager;
	readonly roomSessionManager: IRoomSessionManager;
	readonly navigator: IHabboNavigator;
	readonly newNavigator: IHabboNewNavigator;
	readonly inventory: IHabboInventory;
	readonly localization: IHabboLocalizationManager;

	/**
	 * Connect to the Habbo server
	 *
	 * Uses HabboCommunicationDemo (AS3 pattern) to manage the login flow:
	 * setSSOTicket → initGameSocket → initConnection → IncomingMessages → handshake
	 */
	connect(): void;

	/**
	 * Disconnect from the server
	 */
	disconnect(): void;

	/**
	 * Initialize the application
	 */
	init(config?: IHeliumConfig): Promise<void>;

	/**
	 * Mount the SolidJS UI
	 */
	mountUI(): void;
}