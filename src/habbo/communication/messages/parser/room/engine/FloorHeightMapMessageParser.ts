/**
 * FloorHeightMapMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.FloorHeightMapMessageEventParser
 *
 * Parser for room floor height map (tile layout).
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AreaHideMessageData} from './AreaHideMessageData';

export class FloorHeightMapMessageParser implements IMessageParser
{
	private static readonly TILE_BLOCKED = -110;

	private _tiles: number[][] = [];
	private _width: number = 0;
	private _height: number = 0;
	private _scale: number = 0;
	private _text: string = '';
	private _fixedWallsHeight: number = -1;
	private _areaHideData: AreaHideMessageData[] = [];

	get text(): string
	{
		return this._text;
	}

	get width(): number
	{
		return this._width;
	}

	get height(): number
	{
		return this._height;
	}

	get scale(): number
	{
		return this._scale;
	}

	get fixedWallsHeight(): number
	{
		return this._fixedWallsHeight;
	}

	get areaHideData(): AreaHideMessageData[]
	{
		return this._areaHideData;
	}

	getTileHeight(x: number, y: number): number
	{
		if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		{
			return FloorHeightMapMessageParser.TILE_BLOCKED;
		}

		const row = this._tiles[y];
		return row[x];
	}

	flush(): boolean
	{
		this._tiles = [];
		this._width = 0;
		this._height = 0;
		this._text = '';
		this._fixedWallsHeight = -1;
		this._areaHideData = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		const isSmallScale = wrapper.readBoolean();
		this._fixedWallsHeight = wrapper.readInt();
		this._text = wrapper.readString();

		const rows = this._text.split('\r');
		let rowCount = rows.length;

		// Remove trailing empty row
		if (rowCount > 0 && rows[rowCount - 1] === '')
		{
			rowCount--;
		}

		// Find max width
		let maxWidth = 0;

		for (let i = 0; i < rowCount; i++)
		{
			const row = rows[i];

			if (row.length > maxWidth)
			{
				maxWidth = row.length;
			}
		}

		// Initialize tile array
		this._tiles = [];

		for (let y = 0; y < rowCount; y++)
		{
			const row: number[] = [];

			for (let x = 0; x < maxWidth; x++)
			{
				row.push(FloorHeightMapMessageParser.TILE_BLOCKED);
			}

			this._tiles.push(row);
		}

		this._width = maxWidth;
		this._height = rowCount;

		// Parse tile heights
		for (let y = 0; y < rowCount; y++)
		{
			const row = this._tiles[y];
			const rowStr = rows[y];

			if (rowStr.length > 0)
			{
				for (let x = 0; x < rowStr.length; x++)
				{
					const char = rowStr.charAt(x);

					if (char !== 'x' && char !== 'X')
					{
						row[x] = parseInt(char, 36);
					}
					else
					{
						row[x] = FloorHeightMapMessageParser.TILE_BLOCKED;
					}
				}
			}
		}

		this._scale = isSmallScale ? 32 : 64;

		// Parse area hide data
		this._areaHideData = [];
		const areaHideCount = wrapper.readInt();

		for (let i = 0; i < areaHideCount; i++)
		{
			this._areaHideData.push(new AreaHideMessageData(wrapper));
		}

		return true;
	}
}
