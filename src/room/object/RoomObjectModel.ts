/**
 * RoomObjectModel
 *
 * Based on AS3: com.sulake.room.object.RoomObjectModel
 *
 * Stores room object state as key-value pairs.
 * Supports numbers, strings, and arrays with optional immutability.
 */
import type {IRoomObjectModelController} from './IRoomObjectModelController';

export class RoomObjectModel implements IRoomObjectModelController
{
	private static readonly MAP_KEYS_PREFIX = 'ROMC_MAP_KEYS_';
	private static readonly MAP_VALUES_PREFIX = 'ROMC_MAP_VALUES_';

	private _numbers: Map<string, number> = new Map();
	private _strings: Map<string, string> = new Map();
	private _numberArrays: Map<string, number[]> = new Map();
	private _stringArrays: Map<string, string[]> = new Map();
	private _objects: Map<string, unknown> = new Map();

	private _immutableNumbers: string[] = [];
	private _immutableStrings: string[] = [];
	private _immutableNumberArrays: string[] = [];
	private _immutableStringArrays: string[] = [];
	private _immutableObjects: string[] = [];

	private _updateID: number = 0;

	dispose(): void
	{
		this._numbers.clear();
		this._strings.clear();
		this._numberArrays.clear();
		this._stringArrays.clear();
		this._objects.clear();

		this._immutableNumbers = [];
		this._immutableStrings = [];
		this._immutableNumberArrays = [];
		this._immutableStringArrays = [];
		this._immutableObjects = [];
	}

	hasNumber(key: string): boolean
	{
		return this._numbers.has(key);
	}

	hasNumberArray(key: string): boolean
	{
		return this._numberArrays.has(key);
	}

	hasString(key: string): boolean
	{
		return this._strings.has(key);
	}

	hasStringArray(key: string): boolean
	{
		return this._stringArrays.has(key);
	}

	getNumber(key: string): number
	{
		return this._numbers.get(key) ?? NaN;
	}

	getString(key: string): string
	{
		return this._strings.get(key) ?? '';
	}

	getNumberArray(key: string): number[] | null
	{
		const array = this._numberArrays.get(key);

		if (array !== undefined)
		{
			return array.slice();
		}

		return null;
	}

	getStringArray(key: string): string[] | null
	{
		const array = this._stringArrays.get(key);

		if (array !== undefined)
		{
			return array.slice();
		}

		return null;
	}

	getStringToStringMap(key: string): Map<string, string>
	{
		const result = new Map<string, string>();

		const keys = this.getStringArray(RoomObjectModel.MAP_KEYS_PREFIX + key);
		const values = this.getStringArray(RoomObjectModel.MAP_VALUES_PREFIX + key);

		if (keys !== null && values !== null && keys.length === values.length)
		{
			for (let i = 0; i < keys.length; i++)
			{
				result.set(keys[i], values[i]);
			}
		}

		return result;
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
			this._updateID++;
		}
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
			this._updateID++;
		}
	}

	setNumberArray(key: string, value: number[], immutable: boolean = false): void
	{
		if (value === null)
		{
			return;
		}

		if (this._immutableNumberArrays.indexOf(key) >= 0)
		{
			return;
		}

		if (immutable)
		{
			this._immutableNumberArrays.push(key);
		}

		const newArray = value.filter(v => typeof v === 'number');
		const existingArray = this._numberArrays.get(key);
		let isDifferent = true;

		if (existingArray !== undefined && existingArray.length === newArray.length)
		{
			isDifferent = false;

			for (let i = newArray.length - 1; i >= 0; i--)
			{
				if (newArray[i] !== existingArray[i])
				{
					isDifferent = true;

					break;
				}
			}
		}

		if (isDifferent)
		{
			this._numberArrays.set(key, newArray);
			this._updateID++;
		}
	}

	setStringArray(key: string, value: string[], immutable: boolean = false): void
	{
		if (value === null)
		{
			return;
		}

		if (this._immutableStringArrays.indexOf(key) >= 0)
		{
			return;
		}

		if (immutable)
		{
			this._immutableStringArrays.push(key);
		}

		const newArray = value.filter(v => typeof v === 'string');
		const existingArray = this._stringArrays.get(key);
		let isDifferent = true;

		if (existingArray !== undefined && existingArray.length === newArray.length)
		{
			isDifferent = false;

			for (let i = newArray.length - 1; i >= 0; i--)
			{
				if (newArray[i] !== existingArray[i])
				{
					isDifferent = true;

					break;
				}
			}
		}

		if (isDifferent)
		{
			this._stringArrays.set(key, newArray);
			this._updateID++;
		}
	}

	setStringToStringMap(key: string, value: Map<string, string>, immutable: boolean = false): void
	{
		if (value === null)
		{
			return;
		}

		const keys = Array.from(value.keys());
		const values = Array.from(value.values());

		this.setStringArray(RoomObjectModel.MAP_KEYS_PREFIX + key, keys, immutable);
		this.setStringArray(RoomObjectModel.MAP_VALUES_PREFIX + key, values, immutable);
	}

	getObject(key: string): unknown
	{
		return this._objects.get(key) ?? null;
	}

	setObject(key: string, value: unknown, immutable: boolean = false): void
	{
		if (this._immutableObjects.indexOf(key) >= 0)
		{
			return;
		}

		if (immutable)
		{
			this._immutableObjects.push(key);
		}

		this._objects.set(key, value);
		this._updateID++;
	}

	getUpdateID(): number
	{
		return this._updateID;
	}
}
