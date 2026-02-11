import type { IActionDefinition } from './IActionDefinition';
import type { IActiveActionData } from './IActiveActionData';

/**
 * Represents an active action being applied to an avatar.
 * Holds the action type, parameter, and associated definition.
 *
 * @see sources/win63_version/habbo/avatar/actions/ActiveActionData.as
 */
export class ActiveActionData implements IActiveActionData
{
    private _actionType: string;
    private _actionParameter: string;
    private _definition: IActionDefinition | null = null;
    private _startFrame: number;
    private _overridingAction: string = '';

    constructor(actionType: string, actionParameter: string = '', startFrame: number = 0)
    {
        this._actionType = actionType;
        this._actionParameter = actionParameter;
        this._startFrame = startFrame;
    }

    /**
     * A composite identifier combining the definition id and action parameter.
     */
    public get id(): string
    {
        if(!this._definition) return '';

        return this._definition.id + '_' + this._actionParameter;
    }

    /**
     * The action type identifier.
     */
    public get actionType(): string
    {
        return this._actionType;
    }

    /**
     * The action parameter value.
     */
    public get actionParameter(): string
    {
        return this._actionParameter;
    }

    public set actionParameter(value: string)
    {
        this._actionParameter = value;
    }

    /**
     * The action definition associated with this active action.
     */
    public get definition(): IActionDefinition
    {
        return this._definition!;
    }

    public set definition(value: IActionDefinition)
    {
        this._definition = value;
    }

    /**
     * The start frame for animation.
     */
    public get startFrame(): number
    {
        return this._startFrame;
    }

    /**
     * An optional action that overrides this one.
     */
    public get overridingAction(): string
    {
        return this._overridingAction;
    }

    public set overridingAction(value: string)
    {
        this._overridingAction = value;
    }

    public toString(): string
    {
        return 'Action: ' + this._actionType + '  param: ' + this._actionParameter;
    }

    public dispose(): void
    {
        this._definition = null;
    }
}
