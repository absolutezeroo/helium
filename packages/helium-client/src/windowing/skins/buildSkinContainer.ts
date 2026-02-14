import { getWindowTypeId } from '../enum/WindowType';
import type { CompiledElementDescription, CompiledSkin, CompiledSkinState } from '../types/Skin';
import { BitmapSkinRenderer } from './BitmapSkinRenderer';
import { DefaultAttStruct } from './DefaultAttStruct';
import { SkinContainer } from './SkinContainer';
import { SkinRenderer } from './SkinRenderer';

function resolveTypeId(type: string): number | null
{
    if (!type)
    {
        return null;
    }

    const numeric = Number(type);
    if (!Number.isNaN(numeric))
    {
        return numeric;
    }

    return getWindowTypeId(type) ?? null;
}

function resolveStates(states: CompiledSkinState[] | undefined): CompiledSkinState[]
{
    return states && states.length > 0 ? states : [];
}

export function buildSkinContainer(
    elementDescription: CompiledElementDescription,
    skins: Map<string, CompiledSkin>
): SkinContainer
{
    const container = new SkinContainer();

    elementDescription.windows.forEach((windowDef) =>
    {
        const typeId = resolveTypeId(windowDef.type);
        if (typeId === null)
        {
            return;
        }

        const styleId = Number.parseInt(windowDef.style, 10);
        const style = Number.isNaN(styleId) ? 0 : styleId;

        let renderer: SkinRenderer | null = null;
        if (windowDef.renderer === 'skin' || windowDef.renderer === 'bitmap')
        {
            const skinDef = skins.get(windowDef.asset);
            if (!skinDef)
            {
                return;
            }

            const layoutName = windowDef.layout || skinDef.name;
            const skinRenderer = new BitmapSkinRenderer(layoutName);
            skinRenderer.loadSkinDefinition(skinDef, resolveStates(windowDef.states), windowDef.layout);
            renderer = skinRenderer;
        }
        else
        {
            renderer = new SkinRenderer(windowDef.layout || windowDef.renderer || 'unknown');
        }

        const defaults = new DefaultAttStruct(windowDef.defaults);
        container.addSkinRenderer(
            typeId,
            style,
            windowDef.intent ?? '',
            renderer,
            windowDef.windowLayout ?? null,
            defaults
        );
    });

    return container;
}
