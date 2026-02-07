/**
 * FreeFlowChat Module - ENGINE files
 *
 * Based on AS3: com.sulake.habbo.freeflowchat
 *
 * Provides the core data models, event handlers, and chat management
 * for the Habbo free-flow chat system.
 *
 * @module habbo/freeflowchat
 */

// Data models and handlers (data/)
export * from './data';

// Viewer constants and utilities (viewer/enum/)
export * from './viewer';

// History buffer (history/)
export * from './history';

// Interface
export * from './IHabboFreeFlowChat';

// Main component
export {HabboFreeFlowChat} from './HabboFreeFlowChat';
export type {HabboFreeFlowChatEvents} from './HabboFreeFlowChat';