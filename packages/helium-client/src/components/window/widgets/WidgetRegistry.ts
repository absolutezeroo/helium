import type {Component as SolidComponent} from 'solid-js';
import type {WindowElementProps} from '../WindowComponentRegistry';

type WidgetComponent = SolidComponent<WindowElementProps>;

/**
 * Registry of specialized widget components.
 *
 * Widgets are special element types that require custom rendering
 * beyond what the standard element components provide (e.g. avatar images,
 * badge displays, room previewers).
 *
 * @see sources/flash_version/com/sulake/habbo/window/widgets/class_3474.as
 */
const widgetRegistry = new Map<string, WidgetComponent>();

/**
 * Register a widget component by name.
 *
 * @param name - The widget type name (e.g. 'avatar_image', 'badge_image')
 * @param component - The SolidJS component to render this widget
 */
export function registerWidget(name: string, component: WidgetComponent): void
{
	widgetRegistry.set(name, component);
}

/**
 * Get the component for a widget type.
 *
 * @param name - The widget type name
 * @returns The registered component, or null if none
 */
export function getWidget(name: string): WidgetComponent | null
{
	return widgetRegistry.get(name) ?? null;
}

/**
 * Get all registered widget names.
 */
export function getRegisteredWidgets(): string[]
{
	return Array.from(widgetRegistry.keys());
}
