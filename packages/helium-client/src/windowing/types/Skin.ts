export interface SkinRect
{
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CompiledSkinTemplateEntity
{
    id: number;
    name: string;
    type: string;
    region: SkinRect;
}

export interface CompiledSkinTemplate
{
    name: string;
    asset: string;
    entities: CompiledSkinTemplateEntity[];
}

export interface CompiledSkinLayoutEntity
{
    id: number;
    name: string;
    colorize: boolean;
    color: number;
    blend: number;
    scaleH: number;
    scaleV: number;
    region: SkinRect;
}

export interface CompiledSkinLayout
{
    name: string;
    transparent: boolean;
    blendMode: string;
    entities: CompiledSkinLayoutEntity[];
}

export interface CompiledSkinState
{
    name: string;
    layout: string;
    template: string;
}

export interface CompiledSkin
{
    id: string;
    name: string;
    source: string;
    variables: Record<string, string>;
    templates: CompiledSkinTemplate[];
    layouts: CompiledSkinLayout[];
    states: CompiledSkinState[];
}

export interface CompiledWindowDefaults
{
    threshold: number;
    background: boolean;
    blend: number;
    color: number;
    widthMin: number;
    widthMax: number;
    heightMin: number;
    heightMax: number;
}

export interface CompiledWindowDefinition
{
    type: string;
    intent: string;
    style: string;
    renderer: string;
    asset: string;
    layout: string;
    windowLayout: string;
    defaults: CompiledWindowDefaults;
    states: CompiledSkinState[];
}

export interface CompiledElementDescription
{
    id: string;
    source: string;
    windows: CompiledWindowDefinition[];
}
