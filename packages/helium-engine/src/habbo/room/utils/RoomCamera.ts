/**
 * RoomCamera
 *
 * @see source_as_flash/com/sulake/habbo/room/utils/RoomCamera.as
 *
 * Camera position management with smooth following.
 * Uses sinusoidal easing for natural camera movement.
 */
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomCamera
{
	private static readonly MOVE_SPEED_DENOMINATOR: number = 12;

	private _targetId: number = -1;
	private _targetCategory: number = -2;
	private _targetLoc: Vector3d | null = null;
	private _moveDistance: number = 0;
	private _previousMoveSpeed: number = 0;
	private _maintainPreviousMoveSpeed: boolean = false;
	private _currentLoc: Vector3d | null = null;
	private _targetObjectLoc: Vector3d;
	private _limitedLocX: boolean = false;
	private _limitedLocY: boolean = false;
	private _centeredLocX: boolean = false;
	private _centeredLocY: boolean = false;
	private _screenWd: number = 0;
	private _screenHt: number = 0;
	private _scale: number = 0;
	private _roomWd: number = 0;
	private _roomHt: number = 0;
	private _geometryUpdateId: number = -1;
	private _scaleChanged: boolean = false;
	private _followDuration: number = 0;

	constructor()
	{
		this._targetObjectLoc = new Vector3d();
	}

	get location(): IVector3d | null
	{
		return this._currentLoc;
	}

	get targetId(): number
	{
		return this._targetId;
	}

	set targetId(value: number)
	{
		this._targetId = value;
	}

	get targetCategory(): number
	{
		return this._targetCategory;
	}

	set targetCategory(value: number)
	{
		this._targetCategory = value;
	}

	get targetObjectLoc(): IVector3d
	{
		return this._targetObjectLoc;
	}

	set targetObjectLoc(value: IVector3d)
	{
		this._targetObjectLoc.assign(value);
	}

	get limitedLocX(): boolean
	{
		return this._limitedLocX;
	}

	set limitedLocX(value: boolean)
	{
		this._limitedLocX = value;
	}

	get limitedLocY(): boolean
	{
		return this._limitedLocY;
	}

	set limitedLocY(value: boolean)
	{
		this._limitedLocY = value;
	}

	get centeredLocX(): boolean
	{
		return this._centeredLocX;
	}

	set centeredLocX(value: boolean)
	{
		this._centeredLocX = value;
	}

	get centeredLocY(): boolean
	{
		return this._centeredLocY;
	}

	set centeredLocY(value: boolean)
	{
		this._centeredLocY = value;
	}

	get screenWidth(): number
	{
		return this._screenWd;
	}

	set screenWidth(value: number)
	{
		this._screenWd = value;
	}

	get screenHeight(): number
	{
		return this._screenHt;
	}

	set screenHeight(value: number)
	{
		this._screenHt = value;
	}

	get scale(): number
	{
		return this._scale;
	}

	set scale(value: number)
	{
		if (this._scale !== value)
		{
			this._scale = value;
			this._scaleChanged = true;
		}
	}

	get roomWidth(): number
	{
		return this._roomWd;
	}

	set roomWidth(value: number)
	{
		this._roomWd = value;
	}

	get roomHeight(): number
	{
		return this._roomHt;
	}

	set roomHeight(value: number)
	{
		this._roomHt = value;
	}

	get geometryUpdateId(): number
	{
		return this._geometryUpdateId;
	}

	set geometryUpdateId(value: number)
	{
		this._geometryUpdateId = value;
	}

	get isMoving(): boolean
	{
		return this._targetLoc !== null && this._currentLoc !== null;
	}

	/**
	 * Set camera target position. Computes move distance for easing.
	 * Based on AS3 RoomCamera.set target()
	 */
	set target(value: IVector3d)
	{
		if (this._targetLoc === null)
		{
			this._targetLoc = new Vector3d();
		}

		if (this._targetLoc.x !== value.x || this._targetLoc.y !== value.y || this._targetLoc.z !== value.z)
		{
			this._targetLoc.assign(value);

			const diff = Vector3d.dif(this._targetLoc, this._currentLoc);

			if (diff !== null)
			{
				this._moveDistance = diff.length;
			}

			this._maintainPreviousMoveSpeed = true;
		}
	}

	/**
	 * Initialize camera at a location. Only sets if not already initialized.
	 * Based on AS3 RoomCamera.initializeLocation()
	 */
	initializeLocation(loc: IVector3d): void
	{
		if (this._currentLoc !== null)
		{
			return;
		}

		this._currentLoc = new Vector3d();
		this._currentLoc.assign(loc);
	}

	/**
	 * Force-set camera location regardless of current state.
	 * Based on AS3 RoomCamera.resetLocation()
	 */
	resetLocation(loc: IVector3d): void
	{
		if (this._currentLoc === null)
		{
			this._currentLoc = new Vector3d();
		}

		this._currentLoc.assign(loc);
	}

	/**
	 * Update camera position with sinusoidal easing toward target.
	 * Based on AS3 RoomCamera.update()
	 *
	 * @param time - Current timestamp (unused, kept for interface compat)
	 * @param moveSpeed - Base move speed for this frame
	 */
	update(time: number, moveSpeed: number): void
	{
		if (this._followDuration <= 0 || this._targetLoc === null || this._currentLoc === null)
		{
			return;
		}

		// If scale changed, snap immediately to target
		if (this._scaleChanged)
		{
			this._scaleChanged = false;
			this._currentLoc.assign(this._targetLoc);
			this._targetLoc = null;
			return;
		}

		const diff = Vector3d.dif(this._targetLoc, this._currentLoc);

		if (diff === null)
		{
			return;
		}

		if (diff.length > this._moveDistance)
		{
			this._moveDistance = diff.length;
		}

		// Close enough: snap to target
		if (diff.length <= moveSpeed)
		{
			this._currentLoc.assign(this._targetLoc);
			this._targetLoc = null;
			this._previousMoveSpeed = 0;
		}
		else
		{
			// Sinusoidal easing: sin(PI * remaining / total)
			const sinFactor = Math.sin((Math.PI * diff.length) / this._moveDistance);
			const halfSpeed = moveSpeed * 0.5;
			const maxSpeed = this._moveDistance / RoomCamera.MOVE_SPEED_DENOMINATOR;
			let speed = halfSpeed + (maxSpeed - halfSpeed) * sinFactor;

			// Maintain previous speed to prevent jarring deceleration
			if (this._maintainPreviousMoveSpeed)
			{
				if (speed < this._previousMoveSpeed)
				{
					speed = this._previousMoveSpeed;

					if (speed > diff.length)
					{
						speed = diff.length;
					}
				}
				else
				{
					this._maintainPreviousMoveSpeed = false;
				}
			}

			this._previousMoveSpeed = speed;

			// Normalize direction, multiply by speed, add to current
			diff.div(diff.length);
			diff.mul(speed);

			const newLoc = Vector3d.sum(this._currentLoc, diff);

			if (newLoc !== null)
			{
				this._currentLoc.assign(newLoc);
			}
		}
	}

	/**
	 * Reset geometry update tracking.
	 */
	reset(): void
	{
		this._geometryUpdateId = -1;
	}

	/**
	 * Activate camera following for a given duration.
	 * Based on AS3 RoomCamera.activateFollowing()
	 */
	activateFollowing(duration: number): void
	{
		this._followDuration = duration;
	}

	dispose(): void
	{
		this._targetLoc = null;
		this._currentLoc = null;
	}
}
