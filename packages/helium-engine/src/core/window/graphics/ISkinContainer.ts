import type { DefaultAttStruct } from '../utils/DefaultAttStruct';

/**
 * Interface for a container of skin renderers indexed by window type and style.
 *
 * Provides lookup methods for skin renderers, default attributes, and
 * state resolution for the window rendering pipeline.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/ISkinContainer.as
 */
export interface ISkinContainer
{
    readonly disposed: boolean;

    /**
     * Returns the skin renderer for the given window type and style.
     *
     * @param type - The window type
     * @param style - The window style
     * @returns The skin renderer, or null
     */
    getSkinRendererByTypeAndStyle(type: number, style: number): unknown | null;

    /**
     * Returns the default attributes for the given window type and style.
     *
     * @param type - The window type
     * @param style - The window style
     * @returns The default attribute struct, or null
     */
    getDefaultAttributesByTypeAndStyle(type: number, style: number): DefaultAttStruct | null;

    /**
     * Resolves the actual drawable state for a window type, style, and state combination.
     *
     * @param type - The window type
     * @param style - The window style
     * @param state - The combined window state flags
     * @returns The resolved drawable state
     */
    getTheActualState(type: number, style: number, state: number): number;

    dispose(): void;
}
