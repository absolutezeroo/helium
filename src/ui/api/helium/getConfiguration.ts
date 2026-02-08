import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/GetConfiguration.ts
 */
export const getConfiguration = (): IHabboConfigurationManager => getHelium().configuration;
