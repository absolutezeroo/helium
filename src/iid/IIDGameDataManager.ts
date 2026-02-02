import {createIID} from "@core/runtime/IID";
import type {IGameDataManager} from '@core/gamedata/IGameDataManager';

/**
 * IID for Game Data Manager
 *
 * Based on AS3: com.sulake.iid.IIDGameDataManager
 */
export const IID_GameDataManager = createIID<IGameDataManager>('IGameDataManager');
