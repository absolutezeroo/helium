import { ActiveActionData } from '../actions/ActiveActionData';
import type { IActionDefinition } from '../actions/IActionDefinition';
import type { IActiveActionData } from '../actions/IActiveActionData';
import type { IAnimationLayerData } from './IAnimationLayerData';

/**
 * Layer data for a single frame of an animation, containing offsets and action info.
 *
 * @see sources/win63_version/habbo/avatar/animation/AnimationLayerData.as
 */
export class AnimationLayerData implements IAnimationLayerData
{
    public static readonly BODYPART: string = 'bodypart';
    public static readonly FX: string = 'fx';

    private _id: string;
    private _action: IActiveActionData | null;
    private _animationFrame: number;
    private _dx: number;
    private _dy: number;
    private _dz: number;
    private _dd: number;
    private _type: string;
    private _base: string;
    private _items: Map<string, string>;

    constructor(data: any, type: string, actionDefinition: IActionDefinition | null)
    {
        this._items = new Map();
        this._id = String(data.id || '');
        this._animationFrame = parseInt(data.frame) || 0;
        this._dx = parseInt(data.dx) || 0;
        this._dy = parseInt(data.dy) || 0;
        this._dz = parseInt(data.dz) || 0;
        this._dd = parseInt(data.dd) || 0;
        this._type = type;
        this._base = String(data.base || '');

        if(data.items)
        {
            for(const item of data.items)
            {
                this._items.set(String(item.id), String(item.base));
            }
        }

        if(actionDefinition)
        {
            this._action = new ActiveActionData(actionDefinition.state, this._base);
            this._action.definition = actionDefinition;
        }
        else
        {
            this._action = null;
        }
    }

    public get items(): Map<string, string> { return this._items; }
    public get id(): string { return this._id; }
    public get animationFrame(): number { return this._animationFrame; }
    public get dx(): number { return this._dx; }
    public get dy(): number { return this._dy; }
    public get dz(): number { return this._dz; }
    public get dd(): number { return this._dd; }
    public get type(): string { return this._type; }
    public get base(): string { return this._base; }
    public get action(): IActiveActionData { return this._action!; }
}
