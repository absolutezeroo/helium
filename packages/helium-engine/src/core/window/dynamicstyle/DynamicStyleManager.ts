import { DynamicStyle } from './DynamicStyle';

/**
 * Static registry of dynamic styles by name.
 *
 * Lazily initializes a table of built-in styles (lifted_hover,
 * brightness_and_shadow_under) and allows lookup by name.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/dynamicstyle/DynamicStyleManager.as
 */
export class DynamicStyleManager
{
    private static _styles: Map<string, DynamicStyle> | null = null;

    /**
     * Returns the dynamic style registered under the given name.
     *
     * @param name - The style name
     * @returns The matching style, or a new empty DynamicStyle if not found
     */
    public static getStyle(name: string): DynamicStyle
    {
        if(!DynamicStyleManager._styles)
        {
            DynamicStyleManager.fillStyleTable();
        }

        const style = DynamicStyleManager._styles!.get(name);

        if(style)
        {
            return style;
        }

        return new DynamicStyle();
    }

    /**
     * Registers a custom dynamic style.
     *
     * @param name - The style name
     * @param style - The dynamic style instance
     */
    public static register(name: string, style: DynamicStyle): void
    {
        if(!DynamicStyleManager._styles)
        {
            DynamicStyleManager.fillStyleTable();
        }

        DynamicStyleManager._styles!.set(name, style);
    }

    /**
     * Checks whether a style with the given name is registered.
     *
     * @param name - The style name to look up
     * @returns True if the style exists
     */
    public static hasStyle(name: string): boolean
    {
        if(!DynamicStyleManager._styles)
        {
            DynamicStyleManager.fillStyleTable();
        }

        return DynamicStyleManager._styles!.has(name);
    }

    private static fillStyleTable(): void
    {
        DynamicStyleManager._styles = new Map();

        // ── lifted_hover ──────────────────────────────────────────────
        const liftedHover = new DynamicStyle('lifted_hover');
        liftedHover.defaultStyles = {};
        liftedHover.pressedStyles = {
            offsetX: 1,
            colorTransform: [1, 0.7, 0.7, 0.7, 0, 0, 0, 0],
        };
        liftedHover.hoverStyles = {
            offsetY: -1,
            offsetX: -1,
        };

        const liftedIcon = new DynamicStyle();
        liftedIcon.defaultStyles = {
            etchingColor: 0x48000000,
            etchingPoint: [1, 1],
        };
        liftedIcon.hoverStyles = {
            etchingColor: 0x80000000,
            etchingPoint: [2, 2],
        };
        liftedIcon.pressedStyles = {
            etchingColor: 0x48000000,
            etchingPoint: [-1, -1],
        };
        liftedHover.setChildStyle('#icon', liftedIcon);

        // ── brightness_and_shadow_under ───────────────────────────────
        const brightnessAndShadow = new DynamicStyle('brightness_and_shadow_under');
        brightnessAndShadow.defaultStyles = {};

        const bsIcon = new DynamicStyle();
        bsIcon.defaultStyles = {
            etchingColor: 0x48000000,
            etchingPoint: [0, 1],
        };
        bsIcon.pressedStyles = {
            etchingColor: 0x80000000,
            etchingPoint: [0, -1],
            offsetY: -1,
            colorTransform: [0.7, 0.7, 0.7, 1, 0, 0, 0, 0],
        };
        bsIcon.hoverStyles = {
            etchingColor: 0x48000000,
            etchingPoint: [0, 1],
            colorTransform: [1, 1, 1, 1, 77, 77, 77, 0],
        };
        brightnessAndShadow.setChildStyle('#icon', bsIcon);

        const bsBg = new DynamicStyle();
        bsBg.defaultStyles = {
            etchingColor: 0x48000000,
            etchingPoint: [0, 1],
        };
        bsBg.pressedStyles = {
            etchingColor: 0x80000000,
            etchingPoint: [0, 0],
            colorTransform: [0.9, 0.9, 0.9, 1, 0, 0, 0, 0],
        };
        bsBg.hoverStyles = {
            etchingColor: 0x48000000,
            etchingPoint: [0, 1],
            colorTransform: [1, 1, 1, 1, 77, 77, 77, 0],
        };
        bsBg.disabledStyles = {
            colorTransform: [0.5, 0.5, 0.5, 0.7, 0, 0, 0, 0],
        };
        brightnessAndShadow.setChildStyle('#bg', bsBg);

        DynamicStyleManager._styles.set('lifted_hover', liftedHover);
        DynamicStyleManager._styles.set('brightness_and_shadow_under', brightnessAndShadow);
    }
}
