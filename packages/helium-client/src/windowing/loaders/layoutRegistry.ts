import type { CompiledLayout } from '../types/Layout';

const layoutModules = import.meta.glob('../../assets/window-layouts/*.json', { eager: true, import: 'default' });

const registry: Map<string, CompiledLayout> = new Map();

Object.values(layoutModules).forEach((layout: unknown) =>
{
    const compiled = layout as CompiledLayout;
    registry.set(compiled.name, compiled);
});

export function getCompiledLayout(name: string): CompiledLayout | undefined
{
    return registry.get(name);
}

export function getAllCompiledLayouts(): CompiledLayout[]
{
    return Array.from(registry.values());
}

export function registerAllLayouts(context: { registerLayout: (layout: CompiledLayout) => void }): void
{
    registry.forEach((layout) =>
    {
        context.registerLayout(layout);
    });
}
