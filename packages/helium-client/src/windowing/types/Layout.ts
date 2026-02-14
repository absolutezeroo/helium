export interface LayoutNode
{
    tag: string;
    attributes: Record<string, string>;
    children: LayoutNode[];
}

export interface LayoutFilter
{
    type: string;
    attributes: Record<string, string>;
}

export interface CompiledLayout
{
    name: string;
    source: string;
    vars: Record<string, unknown>;
    filters: LayoutFilter[];
    window: LayoutNode;
}
