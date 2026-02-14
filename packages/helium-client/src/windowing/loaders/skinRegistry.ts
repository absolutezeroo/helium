import type { CompiledElementDescription, CompiledSkin } from '../types/Skin';

const skinModules = import.meta.glob('../../assets/window-skins/*.json', { eager: true, import: 'default' });

const skins: Map<string, CompiledSkin> = new Map();
let elementDescription: CompiledElementDescription | null = null;

Object.entries(skinModules).forEach(([modulePath, data]) =>
{
    const fileName = modulePath.split('/').pop() ?? '';
    const baseName = fileName.replace(/\.json$/i, '');

    if (baseName === 'element-description')
    {
        elementDescription = data as CompiledElementDescription;
    }
    else
    {
        skins.set(baseName, data as CompiledSkin);
    }
});

export function getCompiledSkin(id: string): CompiledSkin | undefined
{
    return skins.get(id);
}

export function getCompiledSkins(): CompiledSkin[]
{
    return Array.from(skins.values());
}

export function getElementDescription(): CompiledElementDescription | null
{
    return elementDescription;
}

export function getSkinMap(): Map<string, CompiledSkin>
{
    return skins;
}
