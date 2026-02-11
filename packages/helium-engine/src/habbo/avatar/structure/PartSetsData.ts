import type { IActionDefinition } from '../actions/IActionDefinition';
import type { ActionDefinition } from '../actions/ActionDefinition';
import type { IStructureData } from './IStructureData';
import { ActivePartSet } from './parts/ActivePartSet';
import { PartDefinition } from './parts/PartDefinition';

/**
 * Manages part set definitions and active part sets for avatar rendering.
 *
 * @see sources/win63_version/habbo/avatar/structure/PartSetsData.as
 */
export class PartSetsData implements IStructureData
{
    private _parts: Map<string, PartDefinition>;
    private _activePartSets: Map<string, ActivePartSet>;

    constructor()
    {
        this._parts = new Map();
        this._activePartSets = new Map();
    }

    public parse(data: any): boolean
    {
        if(!data) return false;

        if(data.partSet && data.partSet.parts)
        {
            for(const partData of data.partSet.parts)
            {
                this._parts.set(String(partData.setType || partData['set-type']), new PartDefinition(partData));
            }
        }

        if(data.activePartSets)
        {
            for(const apsData of data.activePartSets)
            {
                this._activePartSets.set(String(apsData.id), new ActivePartSet(apsData));
            }
        }

        return true;
    }

    public appendJSON(data: any): boolean
    {
        if(!data) return false;

        if(data.partSet && data.partSet.parts)
        {
            for(const partData of data.partSet.parts)
            {
                this._parts.set(String(partData.setType || partData['set-type']), new PartDefinition(partData));
            }
        }

        if(data.activePartSets)
        {
            for(const apsData of data.activePartSets)
            {
                this._activePartSets.set(String(apsData.id), new ActivePartSet(apsData));
            }
        }

        return true;
    }

    public getActiveParts(action: IActionDefinition): string[]
    {
        const activePartSet = this._activePartSets.get(action.activePartSet);

        if(activePartSet) return activePartSet.parts;

        return [];
    }

    public getPartDefinition(setType: string): PartDefinition | null
    {
        return this._parts.get(setType) || null;
    }

    public addPartDefinition(data: any): PartDefinition
    {
        const setType = String(data.setType || data['set-type']);

        if(!this._parts.has(setType))
        {
            this._parts.set(setType, new PartDefinition(data));
        }

        return this._parts.get(setType)!;
    }

    public get parts(): Map<string, PartDefinition>
    {
        return this._parts;
    }

    public get activePartSets(): Map<string, ActivePartSet>
    {
        return this._activePartSets;
    }

    public getActivePartSet(action: ActionDefinition): ActivePartSet | null
    {
        return this._activePartSets.get(action.activePartSet) || null;
    }
}
