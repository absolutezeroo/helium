import type {Component as SolidComponent} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import type {IWindowLayoutNode} from '@habbo/window/IWindowLayout';

/**
 * Props passed to every window element component.
 */
export interface WindowElementProps
{
	node: IWindowLayoutNode;
	windowId: number;
}

type WindowComponent = SolidComponent<WindowElementProps>;

/**
 * Registry mapping element type IDs to SolidJS components.
 *
 * Replaces AS3 Classes.as which maps type IDs to Flash component classes.
 *
 * @see sources/flash_version/com/sulake/core/window/Classes.as
 */
const registry = new Map<number, WindowComponent>();

/**
 * Register a SolidJS component for a window element type.
 *
 * @param typeId - The element type ID
 * @param component - The SolidJS component to render this type
 */
export function registerWindowComponent(typeId: number, component: WindowComponent): void
{
	registry.set(typeId, component);
}

/**
 * Register a SolidJS component for multiple type IDs.
 *
 * @param typeIds - Array of element type IDs
 * @param component - The SolidJS component to render these types
 */
export function registerWindowComponents(typeIds: number[], component: WindowComponent): void
{
	for(const typeId of typeIds)
	{
		registry.set(typeId, component);
	}
}

/**
 * Get the SolidJS component for a given type ID.
 *
 * @param typeId - The element type ID
 * @returns The registered component, or null if none
 */
export function getWindowComponent(typeId: number): WindowComponent | null
{
	return registry.get(typeId) ?? null;
}

/**
 * Initialize the registry with default component mappings.
 * Called once during app startup after all element components are imported.
 */
export function initWindowComponentRegistry(): void
{
	// Lazy imports to avoid circular dependencies.
	// Each element component registers itself via registerWindowComponent(s).
	// This function is the central entry point that triggers all registrations.

	// Components are registered in their own modules via side-effect imports.
	// See each element component file for its registration call.
}

export type {WindowComponent};
