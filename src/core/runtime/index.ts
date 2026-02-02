/**
 * Core Runtime Module
 *
 * Based on AS3: com.sulake.core.runtime
 *
 * Provides the Component system for dependency injection and lifecycle management.
 *
 * @example
 * ```typescript
 * import {
 *     Component,
 *     ComponentContext,
 *     ComponentDependency,
 *     createIID,
 *     type IContext,
 * } from '@core/runtime';
 *
 * // Define interface identifiers
 * const IID_Navigator = createIID<INavigator>('INavigator');
 *
 * // Create a component
 * class NavigatorManager extends Component
 * {
 *     protected get dependencies(): ComponentDependency[]
 *     {
 *         return [
 *             new ComponentDependency(IID_Communication, (m) => this._comm = m),
 *         ];
 *     }
 *
 *     protected initComponent(): void
 *     {
 *         // Dependencies are ready
 *     }
 * }
 *
 * // Create context and attach component
 * const context = new ComponentContext();
 * const navigator = new NavigatorManager(context);
 * context.attachComponent(navigator, [IID_Navigator]);
 * ```
 *
 * @module core/runtime
 */

// IID - Interface Identifiers (from @iid/)
export {createIID, getIIDName, type IID} from './IID';

// Interfaces
export type {IDisposable} from './IDisposable';
export type {ICoreConfiguration} from './ICoreConfiguration';
export type {IContext, IUpdateReceiver, InterfaceCallback} from './IContext';

// Component Dependency
export {ComponentDependency} from './ComponentDependency';
export type {DependencyEventListener} from './ComponentDependency';

// Component
export {Component, ComponentEvents, ComponentFlags} from './Component';

// Component Context
export {ComponentContext} from './ComponentContext';

// Re-export IIDs from @iid/ for convenience
export {
	IID_AssetLibrary,
	IID_CoreCommunicationManager,
	IID_GameDataManager,
	IID_HabboConfigurationManager,
	IID_HabboCommunicationManager,
	IID_HabboLocalizationManager,
	IID_HabboNavigator,
	IID_HabboNewNavigator,
} from '@iid/index';
