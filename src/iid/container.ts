import 'reflect-metadata';
import {Container} from 'inversify';
import {TYPES} from './types';

// Core Asset
import {AssetLibrary} from '@core/asset/AssetLibrary';
import type {IAssetLibrary} from '@core/asset/IAssetLibrary';

// Core GameData
import {GameDataManager} from '@core/gamedata/GameDataManager';
import type {IGameDataManager} from '@core/gamedata/IGameDataManager';

// Habbo Configuration
import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

// Core Communication
import {CoreCommunicationManager} from '@core/communication/CoreCommunicationManager';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';

// Habbo Communication
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';

// Habbo Localization
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

// Habbo Navigator
import {HabboNavigator} from '@habbo/navigator/HabboNavigator';
import {HabboNewNavigator} from '@habbo/navigator/HabboNewNavigator';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';

// Habbo Inventory
import {HabboInventory} from '@habbo/inventory/HabboInventory';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';

const container = new Container({
	defaultScope: 'Singleton',
	autoBindInjectable: true,
});

export {container};

export function setupContainer(): Container
{
	// Bind Core Asset Library
	container.bind<IAssetLibrary>(TYPES.AssetLibrary)
		.to(AssetLibrary)
		.inSingletonScope();

	// Bind Core GameData Manager
	container.bind<IGameDataManager>(TYPES.GameDataManager)
		.to(GameDataManager)
		.inSingletonScope();

	// Bind Habbo Configuration
	container.bind<IHabboConfigurationManager>(TYPES.HabboConfigurationManager)
		.to(HabboConfigurationManager)
		.inSingletonScope();

	// Bind Core Services
	container.bind<ICoreCommunicationManager>(TYPES.CommunicationManager)
		.to(CoreCommunicationManager)
		.inSingletonScope();

	// Bind Habbo Services
	container.bind<IHabboCommunicationManager>(TYPES.HabboCommunicationManager)
		.to(HabboCommunicationManager)
		.inSingletonScope();

	container.bind<IHabboLocalizationManager>(TYPES.LocalizationManager)
		.to(HabboLocalizationManager)
		.inSingletonScope();

	container.bind<IHabboNavigator>(TYPES.NavigatorManager)
		.to(HabboNavigator)
		.inSingletonScope();

	container.bind<IHabboNewNavigator>(TYPES.NewNavigatorManager)
		.to(HabboNewNavigator)
		.inSingletonScope();

	return container;
}

export function resetContainer(): void
{
	container.unbindAll();
}
