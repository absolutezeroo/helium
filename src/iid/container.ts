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

    return container;
}

export function resetContainer(): void {
    container.unbindAll();
}
