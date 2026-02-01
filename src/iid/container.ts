import 'reflect-metadata';
import {Container} from 'inversify';
import {TYPES} from './types';

// Core Configuration
import {ConfigurationManager} from '@core/configuration/ConfigurationManager';
import type {IConfigurationManager} from '@core/configuration/IConfigurationManager';

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

const container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: true,
});

export {container};

export function setupContainer(): Container {
    // Bind Core Services
    container.bind<IConfigurationManager>(TYPES.ConfigurationManager)
        .to(ConfigurationManager)
        .inSingletonScope();

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

export function resetContainer(): void {
    container.unbindAll();
}
