/**
 * Interface Identifiers (IIDs)
 *
 * Based on AS3: com.sulake.iid.*
 *
 * Each IID uniquely identifies a service interface for dependency injection.
 */

// Base IID type and utilities
export {type IID, createIID, getIIDName} from '@core/runtime/IID';

// Core IIDs
export {IID_AssetLibrary} from './IIDAssetLibrary';
export {IID_CoreCommunicationManager} from './IIDCoreCommunicationManager';
export {IID_GameDataManager} from './IIDGameDataManager';

// Habbo IIDs
export {IID_HabboConfigurationManager} from './IIDHabboConfigurationManager';
export {IID_HabboCommunicationManager} from './IIDHabboCommunicationManager';
export {IID_HabboLocalizationManager} from './IIDHabboLocalizationManager';
export {IID_HabboNavigator} from './IIDHabboNavigator';
export {IID_HabboNewNavigator} from './IIDHabboNewNavigator';
export {IID_HabboInventory} from './IIDHabboInventory';
export {IID_RoomEngine} from './IIDRoomEngine';
