import type {RoomEngine} from '@habbo/room';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/room/GetRoomEngine.ts
 */
export const getRoomEngine = (): RoomEngine => getHelium().roomEngine;
