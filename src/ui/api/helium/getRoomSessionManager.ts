import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/session/GetRoomSessionManager.ts
 */
export const getRoomSessionManager = (): IRoomSessionManager => getHelium().roomSessionManager;
