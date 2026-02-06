import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '../IStuffData';
import {StuffDataFlags} from './StuffDataType';

/**
 * Base class for stuff data implementations
 *
 * Based on AS3 com.sulake.habbo.room.object.data.StuffDataBase
 */
export abstract class StuffDataBase implements IStuffData
{
	private _flags: number = 0;

	get flags(): number
	{
		return this._flags;
	}

	set flags(value: number)
	{
		this._flags = value;
	}

	private _uniqueSerialNumber: number = 0;

	get uniqueSerialNumber(): number
	{
		return this._uniqueSerialNumber;
	}

	set uniqueSerialNumber(value: number)
	{
		this._uniqueSerialNumber = value;
	}

	private _uniqueSeriesSize: number = 0;

	get uniqueSeriesSize(): number
	{
		return this._uniqueSeriesSize;
	}

	set uniqueSeriesSize(value: number)
	{
		this._uniqueSeriesSize = value;
	}

	get rarityLevel(): number
	{
		return -1;
	}

	/**
	 * Initialize from incoming server message
	 */
	public initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
	{
		// Check if unique data is present
		if ((this._flags & StuffDataFlags.UNIQUE_SET) > 0)
		{
			this._uniqueSerialNumber = wrapper.readInt();
			this._uniqueSeriesSize = wrapper.readInt();
		}
	}

	/**
	 * Get the legacy string representation
	 */
	abstract getLegacyString(): string;

	/**
	 * Get a JSON value by key
	 */
	public getJSONValue(key: string): string | null
	{
		try
		{
			let data: Record<string, unknown>;
			try {
  				data = JSON.parse(this.getLegacyString());
			} catch (_parseError: unknown) {
			  // SC-005: JSON.parse validation
			  throw new Error(`Invalid JSON: ${(_parseError as Error).message}`); // cast: type assertion required
			}

			return String(data[key] ?? '');
		} catch
		{
			return null;
		}
	}

	/**
	 * Compare with another stuff data
	 */
	public compare(other: IStuffData): boolean
	{
		return this.getLegacyString() === other.getLegacyString();
	}
}
