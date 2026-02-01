import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

/**
 * Manager dependencies for the config feature
 */
export interface ConfigManagers
{
	configuration: IHabboConfigurationManager | null;
}
