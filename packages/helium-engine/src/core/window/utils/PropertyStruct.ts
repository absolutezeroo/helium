/**
 * Key-value property struct for custom window properties.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/PropertyStruct.as
 */
export class PropertyStruct
{
    private _key: string;
    private _value: unknown;
    private _type: number;

    constructor(key: string, value: unknown, type: number = 0)
    {
        this._key = key;
        this._value = value;
        this._type = type;
    }

    public get key(): string
    {
        return this._key;
    }

    public get value(): unknown
    {
        return this._value;
    }

    public set value(value: unknown)
    {
        this._value = value;
    }

    public get type(): number
    {
        return this._type;
    }

    public clone(): PropertyStruct
    {
        return new PropertyStruct(this._key, this._value, this._type);
    }

    public toString(): string
    {
        return `[PropertyStruct key=${this._key} value=${this._value} type=${this._type}]`;
    }
}
