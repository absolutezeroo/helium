/**
 * SelectedRoomObjectData
 *
 * @see source_as_flash/com/sulake/habbo/room/utils/SelectedRoomObjectData.as
 *
 * Read-only data container for the currently selected room object state.
 * Used when moving/placing furniture to track the object being manipulated.
 */
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';

export class SelectedRoomObjectData
{
	private _id: number;
	private _category: number;
	private _operation: string;
	private _loc: Vector3d | null;
	private _dir: Vector3d | null;
	private _typeId: number;
	private _instanceData: string | null;
	private _stuffData: IStuffData | null;
	private _state: number;
	private _animFrame: number;
	private _posture: string | null;

	constructor(
		id: number,
		category: number,
		operation: string,
		loc: IVector3d,
		dir: IVector3d,
		typeId: number = 0,
		instanceData: string | null = null,
		stuffData: IStuffData | null = null,
		state: number = -1,
		animFrame: number = -1,
		posture: string | null = null
	)
	{
		this._id = id;
		this._category = category;
		this._operation = operation;
		this._loc = new Vector3d();
		this._loc.assign(loc);
		this._dir = new Vector3d();
		this._dir.assign(dir);
		this._typeId = typeId;
		this._instanceData = instanceData;
		this._stuffData = stuffData;
		this._state = state;
		this._animFrame = animFrame;
		this._posture = posture;
	}

	get id(): number
	{
		return this._id;
	}

	get category(): number
	{
		return this._category;
	}

	get operation(): string
	{
		return this._operation;
	}

	get loc(): Vector3d | null
	{
		return this._loc;
	}

	get dir(): Vector3d | null
	{
		return this._dir;
	}

	get typeId(): number
	{
		return this._typeId;
	}

	get instanceData(): string | null
	{
		return this._instanceData;
	}

	get stuffData(): IStuffData | null
	{
		return this._stuffData;
	}

	get state(): number
	{
		return this._state;
	}

	get animFrame(): number
	{
		return this._animFrame;
	}

	get posture(): string | null
	{
		return this._posture;
	}

	dispose(): void
	{
		this._loc = null;
		this._dir = null;
	}
}
