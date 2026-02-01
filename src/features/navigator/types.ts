import type {IHabboNavigator, IHabboNewNavigator} from '@habbo/navigator';

/**
 * Manager dependencies for the navigator feature
 */
export interface NavigatorManagers
{
	navigator: IHabboNavigator | null;
	newNavigator: IHabboNewNavigator | null;
}
