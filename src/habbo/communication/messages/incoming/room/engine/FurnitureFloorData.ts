/**
 * FurnitureFloorData
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.class_1765
 *
 * Data structure for floor furniture objects.
 */
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {LegacyStuffData} from '@habbo/room/object/data/LegacyStuffData';

export class FurnitureFloorData
{
	private _id: number;
	private _x: number = 0;
	private _y: number = 0;
	private _z: number = 0;
	private _dir: number = 0;
	private _sizeX: number = 0;
	private _sizeY: number = 0;
	private _sizeZ: number = 0;
	private _type: number = 0;
	private _state: number = 0;
	private _data: IStuffData;
	private _extra: number = -1;
	private _usagePolicy: number = 0;
	private _ownerId: number = 0;
	private _ownerName: string = '';
	private _expiryTime: number = 0;
	private _staticClass: string | null = null;
	private _trustedSender: boolean = false;
	private _readOnly: boolean = false;

	constructor(id: number)
	{
		this._id = id;
		this._data = new LegacyStuffData();
	}

	get id(): number
	{
		return this._id;
	}

	get x(): number
	{
		return this._x;
	}

	set x(value: number)
	{
		if (!this._readOnly) this._x = value;
	}

	get y(): number
	{
		return this._y;
	}

	set y(value: number)
	{
		if (!this._readOnly) this._y = value;
	}

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		if (!this._readOnly) this._z = value;
	}

	get dir(): number
	{
		return this._dir;
	}

	set dir(value: number)
	{
		if (!this._readOnly) this._dir = value;
	}

	get sizeX(): number
	{
		return this._sizeX;
	}

	set sizeX(value: number)
	{
		if (!this._readOnly) this._sizeX = value;
	}

	get sizeY(): number
	{
		return this._sizeY;
	}

	set sizeY(value: number)
	{
		if (!this._readOnly) this._sizeY = value;
	}

	get sizeZ(): number
	{
		return this._sizeZ;
	}

	set sizeZ(value: number)
	{
		if (!this._readOnly) this._sizeZ = value;
	}

	get type(): number
	{
		return this._type;
	}

	set type(value: number)
	{
		if (!this._readOnly) this._type = value;
	}

	get state(): number
	{
		return this._state;
	}

	set state(value: number)
	{
		if (!this._readOnly) this._state = value;
	}

	get data(): IStuffData
	{
		return this._data;
	}

	set data(value: IStuffData)
	{
		if (!this._readOnly) this._data = value;
	}

	get extra(): number
	{
		return this._extra;
	}

	set extra(value: number)
	{
		if (!this._readOnly) this._extra = value;
	}

	get usagePolicy(): number
	{
		return this._usagePolicy;
	}

	set usagePolicy(value: number)
	{
		this._usagePolicy = value;
	}

	get ownerId(): number
	{
		return this._ownerId;
	}

	set ownerId(value: number)
	{
		this._ownerId = value;
	}

	get ownerName(): string
	{
		return this._ownerName;
	}

	set ownerName(value: string)
	{
		this._ownerName = value;
	}

	get expiryTime(): number
	{
		return this._expiryTime;
	}

	set expiryTime(value: number)
	{
		if (!this._readOnly) this._expiryTime = value;
	}

	get staticClass(): string | null
	{
		return this._staticClass;
	}

	set staticClass(value: string | null)
	{
		if (!this._readOnly) this._staticClass = value;
	}

	get trustedSender(): boolean
	{
		return this._trustedSender;
	}

	set trustedSender(value: boolean)
	{
		this._trustedSender = value;
	}

	setReadOnly(): void
	{
		this._readOnly = true;
	}
}
