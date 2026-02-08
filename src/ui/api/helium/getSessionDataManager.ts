import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/session/GetSessionDataManager.ts
 */
export const getSessionDataManager = (): ISessionDataManager => getHelium().sessionDataManager;
