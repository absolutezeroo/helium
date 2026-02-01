import {inflate} from 'pako';
import {Texture} from 'pixi.js';
import type {IAssetData} from './IAssetLibrary';

/**
 * Parser for .nitro bundle format
 *
 * Format:
 * - [short] file count
 * - For each file:
 *   - [short] filename length
 *   - [bytes] filename (UTF-8)
 *   - [int] file data length
 *   - [bytes] deflate-compressed file data
 *
 * @see source_nitro_renderer/api/utils/NitroBundle.ts
 */
export class NitroBundle
{
	private static readonly TEXT_DECODER = new TextDecoder('utf-8');

	private _jsonData: IAssetData | null = null;
	private _texture: Texture | null = null;

	constructor(arrayBuffer: ArrayBuffer)
	{
		this.parse(arrayBuffer);
	}

	private parse(arrayBuffer: ArrayBuffer): void
	{
		const view = new DataView(arrayBuffer);
		let offset = 0;

		// Read file count
		let fileCount = view.getInt16(offset, false); // big-endian
		offset += 2;

		while (fileCount > 0)
		{
			// Read filename length
			const filenameLength = view.getInt16(offset, false);
			offset += 2;

			// Read filename
			const filenameBytes = new Uint8Array(arrayBuffer, offset, filenameLength);
			const filename = NitroBundle.TEXT_DECODER.decode(filenameBytes);
			offset += filenameLength;

			// Read file data length
			const dataLength = view.getInt32(offset, false);
			offset += 4;

			// Read file data
			const fileData = new Uint8Array(arrayBuffer, offset, dataLength);
			offset += dataLength;

			// Decompress and process
			const decompressed = inflate(fileData);

			if (filename.endsWith('.json'))
			{
				const jsonString = NitroBundle.TEXT_DECODER.decode(decompressed);
				this._jsonData = JSON.parse(jsonString) as IAssetData;
			}
			else if (filename.endsWith('.png') || filename.endsWith('.jpg'))
			{
				// Convert to base64 data URL
				const base64 = this.arrayBufferToBase64(decompressed);
				const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
				const dataUrl = `data:${mimeType};base64,${base64}`;

				this._texture = Texture.from(dataUrl);
			}

			fileCount--;
		}
	}

	private arrayBufferToBase64(buffer: Uint8Array): string
	{
		let binary = '';
		const len = buffer.byteLength;

		for (let i = 0; i < len; i++)
		{
			binary += String.fromCharCode(buffer[i]);
		}

		return btoa(binary);
	}

	get jsonData(): IAssetData | null
	{
		return this._jsonData;
	}

	get texture(): Texture | null
	{
		return this._texture;
	}
}
