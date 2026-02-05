/**
 * RoomInstance
 *
 * Based on AS3: com.sulake.room.RoomInstance
 *
 * Manages a single room with its objects organized by category.
 */
import type {IRoomInstance} from './IRoomInstance';
import type {IRoomInstanceContainer} from './IRoomInstanceContainer';
import type {IRoomObject} from './object/IRoomObject';
import type {IRoomObjectController} from './object/IRoomObjectController';
import type {IRoomObjectEventHandler} from './object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from './IRoomObjectManager';

export class RoomInstance implements IRoomInstance
{
	private _container: IRoomInstanceContainer | null;
	private _managers: Map<string, IRoomObjectManager> = new Map();
	private _updateCategories: number[] = [];
	private _numbers: Map<string, number> = new Map();
	private _strings: Map<string, string> = new Map();
	private _immutableNumbers: string[] = [];
	private _immutableStrings: string[] = [];

	constructor(id: string, container: IRoomInstanceContainer)
	{
		this._id = id;
		this._container = container;
	}

	private _id: string;

	get id(): string
	{
		return this._id;
	}

	dispose(): void
	{
		for (const manager of this._managers.values())
		{
			manager.dispose();
		}

		this._managers.clear();
		this._container = null;
		this._updateCategories = [];
		this._numbers.clear();
		this._strings.clear();
		this._immutableNumbers = [];
		this._immutableStrings = [];
	}

	getNumber(key: string): number
	{
		return this._numbers.get(key) ?? NaN;
	}

	setNumber(key: string, value: number, immutable: boolean = false): void
	{
		if (this._immutableNumbers.indexOf(key) >= 0)
		{
			return;
		}

		if (immutable)
		{
			this._immutableNumbers.push(key);
		}

		if (this._numbers.get(key) !== value)
		{
			this._numbers.set(key, value);
		}
	}

	getString(key: string): string
	{
		return this._strings.get(key) ?? '';
	}

	setString(key: string, value: string, immutable: boolean = false): void
	{
		if (this._immutableStrings.indexOf(key) >= 0)
		{
			return;
		}

		if (immutable)
		{
			this._immutableStrings.push(key);
		}

		if (this._strings.get(key) !== value)
		{
			this._strings.set(key, value);
		}
	}

	addObjectUpdateCategory(category: number): void
	{
		const index = this._updateCategories.indexOf(category);

		if (index >= 0)
		{
			return;
		}

		this._updateCategories.push(category);
	}

	removeObjectUpdateCategory(category: number): void
	{
		const index = this._updateCategories.indexOf(category);

		if (index >= 0)
		{
			this._updateCategories.splice(index, 1);
		}
	}

	update(): void
	{
		const time = performance.now();

		for (let i = this._updateCategories.length - 1; i >= 0; i--)
		{
			const category = this._updateCategories[i];
			const manager = this.getObjectManager(category);

			if (manager !== null)
			{
				for (let j = manager.objectCount - 1; j >= 0; j--)
				{
					const object = manager.getObjectByIndex(j) as IRoomObjectController | null;

					if (object !== null)
					{
						const handler: IRoomObjectEventHandler | null = object.getEventHandler();

						if (handler !== null)
						{
							handler.update(time);
						}
					}
				}
			}
		}
	}

	createRoomObject(id: number, type: string, category: number): IRoomObject | null
	{
		if (this._container !== null)
		{
			return this._container.createRoomObject(this._id, id, type, category);
		}

		return null;
	}

	createObjectInternal(id: number, stateCount: number, type: string, category: number): IRoomObject | null
	{
		const manager = this.createObjectManager(category);

		if (manager !== null)
		{
			return manager.createObject(id, stateCount, type);
		}

		return null;
	}

	getObject(id: number, category: number): IRoomObject | null
	{
		const manager = this.getObjectManager(category);

		if (manager !== null)
		{
			return manager.getObject(id);
		}

		return null;
	}

	getObjects(category: number): IRoomObject[]
	{
		const manager = this.getObjectManager(category);

		return manager ? manager.objects : [];
	}

	getObjectWithIndex(index: number, category: number): IRoomObject | null
	{
		const manager = this.getObjectManager(category);

		if (manager !== null)
		{
			return manager.getObjectByIndex(index);
		}

		return null;
	}

	getObjectCount(category: number): number
	{
		const manager = this.getObjectManager(category);

		if (manager !== null)
		{
			return manager.objectCount;
		}

		return 0;
	}

	getObjectWithIndexAndType(index: number, type: string, category: number): IRoomObject | null
	{
		const manager = this.getObjectManager(category);

		if (manager !== null)
		{
			return manager.getObjectWithIndexAndType(index, type);
		}

		return null;
	}

	getObjectCountForType(type: string, category: number): number
	{
		const manager = this.getObjectManager(category);

		if (manager !== null)
		{
			return manager.getObjectCountForType(type);
		}

		return 0;
	}

	disposeObject(id: number, category: number): boolean
	{
		const manager = this.getObjectManager(category);

		if (manager !== null)
		{
			const object = manager.getObject(id);

			if (object !== null)
			{
				object.tearDown();

				return manager.disposeObject(id);
			}
		}

		return false;
	}

	disposeObjects(category: number): number
	{
		const manager = this.getObjectManager(category);
		let count = 0;

		if (manager !== null)
		{
			count = manager.objectCount;

			for (let i = 0; i < count; i++)
			{
				const object = manager.getObjectByIndex(i) as IRoomObjectController | null;

				if (object !== null)
				{
					object.dispose();
				}
			}

			manager.reset();
		}

		return count;
	}

	getObjectManagerIds(): number[]
	{
		return Array.from(this._managers.keys()).map(k => parseInt(k, 10));
	}

	hasUninitializedObjects(): boolean
	{
		for (const manager of this._managers.values())
		{
			const count = manager.objectCount;

			for (let i = 0; i < count; i++)
			{
				const object = manager.getObjectByIndex(i);

				if (object && !object.isInitialized())
				{
					return true;
				}
			}
		}

		return false;
	}

	protected createObjectManager(category: number): IRoomObjectManager | null
	{
		const key = String(category);

		if (this._managers.has(key))
		{
			return this._managers.get(key)!;
		}

		if (this._container === null)
		{
			return null;
		}

		const manager = this._container.createRoomObjectManager();

		if (manager !== null)
		{
			this._managers.set(key, manager);
		}

		return manager;
	}

	protected getObjectManager(category: number): IRoomObjectManager | null
	{
		return this._managers.get(String(category)) ?? null;
	}

	protected disposeObjectManager(category: number): boolean
	{
		const key = String(category);

		this.disposeObjects(category);

		if (this._managers.has(key))
		{
			const manager = this._managers.get(key)!;
			this._managers.delete(key);
			manager.dispose();

			return true;
		}

		return false;
	}
}
