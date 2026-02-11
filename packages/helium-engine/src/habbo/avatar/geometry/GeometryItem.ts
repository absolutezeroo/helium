import { Node3D } from './Node3D';
import { Vector3D } from './Vector3D';

/**
 * A geometry item representing a single body part piece in 3D space.
 *
 * @see sources/win63_version/habbo/avatar/geometry/GeometryItem.as
 */
export class GeometryItem extends Node3D
{
    private _id: string;
    private _radius: number;
    private _normal: Vector3D;
    private _isDoubleSided: boolean = false;
    private _isDynamic: boolean = false;

    constructor(data: any, isDynamic: boolean = false)
    {
        super(
            parseFloat(data.x) || 0,
            parseFloat(data.y) || 0,
            parseFloat(data.z) || 0
        );

        this._id = String(data.id);
        this._radius = parseFloat(data.radius) || 0;
        this._normal = new Vector3D(
            parseFloat(data.nx) || 0,
            parseFloat(data.ny) || 0,
            parseFloat(data.nz) || 0
        );
        this._isDoubleSided = Boolean(parseInt(data.double));
        this._isDynamic = isDynamic;
    }

    public getDistance(camera: Vector3D): number
    {
        const near = Math.abs(camera.z - this.transformedLocation.z - this._radius);
        const far = Math.abs(camera.z - this.transformedLocation.z + this._radius);

        return Math.min(near, far);
    }

    public get id(): string
    {
        return this._id;
    }

    public get normal(): Vector3D
    {
        return this._normal;
    }

    public get isDoubleSided(): boolean
    {
        return this._isDoubleSided;
    }

    public get isDynamic(): boolean
    {
        return this._isDynamic;
    }

    public toString(): string
    {
        return this._id + ': ' + this.location + ' - ' + this.transformedLocation;
    }
}
