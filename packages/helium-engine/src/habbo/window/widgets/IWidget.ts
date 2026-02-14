import type { IDisposable } from '@core/runtime/IDisposable';

/**
 * Property definition for a widget.
 */
export interface IWidgetProperty
{
    /** Property key identifier. */
    key: string;
    /** Property value. */
    value: unknown;
    /** Property type name. */
    type: string;
}

/**
 * Base interface for all Habbo window widgets.
 *
 * Corresponds to the AS3 class_3420 (IDisposable + IIterable + properties).
 * All specific widget interfaces extend this base.
 *
 * @see sources/win63_version/core/window/class_3420.as
 */
export interface IWidget extends IDisposable
{
    /**
     * Get all configurable properties of this widget.
     */
    readonly properties: IWidgetProperty[];

    /**
     * Set widget properties from an array of key-value pairs.
     */
    setProperties(values: IWidgetProperty[]): void;
}

