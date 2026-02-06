/**
 * RoomObjectManager
 *
 * Based on AS3: com.sulake.room.RoomObjectManager
 *
 * Manages room objects within a single category.
 * Provides object creation, retrieval, and disposal.
 */
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomObjectController} from './object/IRoomObjectController';
import type {IRoomObjectManager} from './IRoomObjectManager';
import {RoomObject} from './object/RoomObject';

export class RoomObjectManager implements IRoomObjectManager
{
	private _objectsByType: Map<string, Map<string, IRoomObjectController>> = new Map();

	private _objects: Map<string, IRoomObjectController> = new Map();

	get objects(): IRoomObject[]
	{
		return Array.from(this._objects.values());
	}

	get objectCount(): number
	{
		return this._objects.size;
	}

	public dispose(): void
	{
		this.reset();
		this._objects.clear();
		this._objectsByType.clear();
	}

	public createObject(id: number, stateCount: number, type: string): IRoomObjectController | null
	{
		const object = new RoomObject(id, stateCount, type);

		return this.addObject(String(id), type, object);
	}

	public getObject(id: number): IRoomObject | null
	{
		return this._objects.get(String(id)) ?? null;
	}

	public getObjectByIndex(index: number): IRoomObject | null
	{
		const values = Array.from(this._objects.values());

		if (index >= 0 && index < values.length)
		{
			return values[index];
		}

		return null;
	}

	public getObjectCountForType(type: string): number
	{
		const typeMap = this.getObjectsForType(type, false);

		if (typeMap !== null)
		{
			return typeMap.size;
		}

		return 0;
	}

	public getObjectWithIndexAndType(index: number, type: string): IRoomObjectController | null
	{
		const typeMap = this.getObjectsForType(type, false);

		if (typeMap !== null)
		{
			const values = Array.from(typeMap.values());

			if (index >= 0 && index < values.length)
			{
				return values[index];
			}
		}

		return null;
	}

	public disposeObject(id: number): boolean
	{
		const idKey = String(id);
		const object = this._objects.get(idKey) as RoomObject | undefined; // cast: type assertion required

		if (object !== undefined)
		{
			const type = object.getType();
			const typeMap = this.getObjectsForType(type, false);

			if (typeMap !== null)
			{
				typeMap.delete(idKey);
			}

			this._objects.delete(idKey);
			object.dispose();

			return true;
		}

		return false;
	}

	public reset(): void
	{
		for (const object of this._objects.values())
		{
			object.dispose();
		}

		this._objects.clear();

		for (const typeMap of this._objectsByType.values())
		{
			typeMap.clear();
		}

		this._objectsByType.clear();
	}

	private addObject(idKey: string, type: string, object: IRoomObjectController): IRoomObjectController | null
	{
		if (this._objects.has(idKey))
		{
			object.dispose();

			return null;
		}

		this._objects.set(idKey, object);

		const typeMap = this.getObjectsForType(type, true)!;
		typeMap.set(idKey, object);

		return object;
	}

	private getObjectsForType(type: string, createIfMissing: boolean = true): Map<string, IRoomObjectController> | null
	{
		let typeMap = this._objectsByType.get(type);

		if (typeMap === undefined && createIfMissing)
		{
			typeMap = new Map();
			this._objectsByType.set(type, typeMap);
		}

		return typeMap ?? null;
	}
}
