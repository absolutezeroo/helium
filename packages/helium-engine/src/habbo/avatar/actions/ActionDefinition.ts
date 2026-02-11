import type { IActionDefinition } from './IActionDefinition';
import { ActionType } from './ActionType';

/**
 * Defines an avatar action with its configuration, parameters, types, and offsets.
 * Parsed from JSON action data.
 *
 * @see sources/win63_version/habbo/avatar/actions/ActionDefinition.as
 */
export class ActionDefinition implements IActionDefinition
{
    private _id: string;
    private _state: string;
    private _precedence: number;
    private _activePartSet: string;
    private _assetPartDefinition: string;
    private _lay: string;
    private _geometryType: string;
    private _isMain: boolean = false;
    private _isDefault: boolean = false;
    private _isAnimation: boolean = false;
    private _startFromFrameZero: boolean = false;
    private _prevents: string[];
    private _preventHeadTurn: boolean;
    private _offsets: Map<string, Map<number, number[]>> | null = null;
    private _types: Map<string, ActionType>;
    private _params: Map<string, string>;
    private _defaultParam: string = '';

    constructor(data: any)
    {
        this._prevents = [];
        this._types = new Map();
        this._params = new Map();

        this._id = String(data.id ?? '');
        this._state = String(data.state ?? '');
        this._precedence = parseInt(data.precedence) || 0;
        this._activePartSet = String(data.activepartset ?? '');
        this._assetPartDefinition = String(data.assetpartdefinition ?? '');
        this._lay = String(data.lay ?? '');
        this._geometryType = String(data.geometrytype ?? '');
        this._isMain = Boolean(parseInt(data.main));
        this._isDefault = Boolean(parseInt(data.isdefault));
        this._isAnimation = Boolean(parseInt(data.animation));
        this._startFromFrameZero = (String(data.startfromframezero) === 'true');
        this._preventHeadTurn = (String(data.preventheadturn) === 'true');

        const prevents: string = String(data.prevents ?? '');

        if(prevents !== '')
        {
            this._prevents = prevents.split(',');
        }

        if(data.params)
        {
            const params: any[] = Array.isArray(data.params) ? data.params : [data.params];

            for(const param of params)
            {
                const paramId = String(param.id ?? '');
                const paramValue = String(param.value ?? '');

                if(paramId === 'default')
                {
                    this._defaultParam = paramValue;
                }
                else
                {
                    this._params.set(paramId, paramValue);
                }
            }
        }

        if(data.types)
        {
            const types: any[] = Array.isArray(data.types) ? data.types : [data.types];

            for(const typeData of types)
            {
                const typeId = String(typeData.id ?? '');
                this._types.set(typeId, new ActionType(typeData));
            }
        }
    }

    /**
     * Sets canvas offsets for a specific set type and direction.
     *
     * @param setType - The set type identifier
     * @param direction - The direction index
     * @param offsets - The offset values
     */
    public setOffsets(setType: string, direction: number, offsets: number[]): void
    {
        if(!this._offsets)
        {
            this._offsets = new Map();
        }

        if(!this._offsets.has(setType))
        {
            this._offsets.set(setType, new Map());
        }

        const directionMap = this._offsets.get(setType)!;
        directionMap.set(direction, offsets);
    }

    /**
     * Gets canvas offsets for a specific set type and direction.
     *
     * @param setType - The set type identifier
     * @param direction - The direction index
     * @returns The offset values, or null if not found
     */
    public getOffsets(setType: string, direction: number): number[] | null
    {
        if(!this._offsets) return null;

        const directionMap = this._offsets.get(setType);

        if(!directionMap) return null;

        return directionMap.get(direction) ?? null;
    }

    /**
     * Gets the parameter value for the given key, falling back to the default parameter.
     *
     * @param key - The parameter key
     * @returns The parameter value, or the default value if key not found
     */
    public getParameterValue(key: string): string
    {
        if(key === '') return '';

        const value = this._params.get(key);

        if(value === undefined)
        {
            return this._defaultParam;
        }

        return value;
    }

    /**
     * Gets the list of actions prevented by this definition and its type-specific prevents.
     *
     * @param id - Optional type identifier for type-specific prevents
     * @returns Combined array of prevented action identifiers
     */
    public getPrevents(id: string = ''): string[]
    {
        return this._prevents.concat(this._getTypePrevents(id));
    }

    /**
     * Checks if head turning is prevented for this action or a specific type.
     *
     * @param id - Optional type identifier
     * @returns True if head turning is prevented
     */
    public getPreventHeadTurn(id: string = ''): boolean
    {
        if(id === '')
        {
            return this._preventHeadTurn;
        }

        const actionType = this._types.get(id);

        if(actionType)
        {
            return actionType.preventHeadTurn;
        }

        return this._preventHeadTurn;
    }

    /**
     * Checks if the action is animated for a specific type.
     *
     * @param part - The type identifier
     * @returns True if the action is animated
     */
    public isAnimated(part: string): boolean
    {
        if(part === '') return true;

        const actionType = this._types.get(part);

        if(actionType)
        {
            return actionType.isAnimated;
        }

        return true;
    }

    /**
     * Gets prevents from a specific action type.
     *
     * @param id - The type identifier
     * @returns Array of prevented actions for this type
     */
    private _getTypePrevents(id: string): string[]
    {
        if(id === '') return [];

        const actionType = this._types.get(id);

        if(actionType)
        {
            return actionType.prevents;
        }

        return [];
    }

    public get id(): string
    {
        return this._id;
    }

    public get state(): string
    {
        return this._state;
    }

    public get precedence(): number
    {
        return this._precedence;
    }

    public get activePartSet(): string
    {
        return this._activePartSet;
    }

    public get isMain(): boolean
    {
        return this._isMain;
    }

    public get isDefault(): boolean
    {
        return this._isDefault;
    }

    public get assetPartDefinition(): string
    {
        return this._assetPartDefinition;
    }

    public get lay(): string
    {
        return this._lay;
    }

    public get geometryType(): string
    {
        return this._geometryType;
    }

    public get isAnimation(): boolean
    {
        return this._isAnimation;
    }

    public get startFromFrameZero(): boolean
    {
        return this._startFromFrameZero;
    }

    public get params(): Map<string, string>
    {
        return this._params;
    }

    public toString(): string
    {
        return '[ActionDefinition]\n'
            + 'id:           ' + this._id + '\n'
            + 'state:        ' + this._state + '\n'
            + 'main:         ' + this._isMain + '\n'
            + 'default:      ' + this._isDefault + '\n'
            + 'geometry:     ' + this._state + '\n'
            + 'precedence:   ' + this._precedence + '\n'
            + 'activepartset:' + this._activePartSet + '\n'
            + 'activepartdef:' + this._assetPartDefinition;
    }
}
