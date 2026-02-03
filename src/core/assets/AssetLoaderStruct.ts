import {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime';
import type {IAssetLoader} from './loaders/IAssetLoader';

/**
 * AssetLoaderStruct
 *
 * Based on AS3: com.sulake.core.assets.AssetLoaderStruct
 *
 * Wrapper structure that associates an asset name with its loader.
 * Used to track pending asset loads and dispatch events when complete.
 */
export class AssetLoaderStruct implements IDisposable
{
	private readonly _events: EventEmitter = new EventEmitter();
	private _assetLoader: IAssetLoader | null;
	private readonly _assetName: string;
	private _disposed: boolean = false;

	constructor(assetName: string, assetLoader: IAssetLoader)
	{
		this._assetName = assetName;
		this._assetLoader = assetLoader;
	}

	/**
	 * The name of the asset being loaded
	 */
	get assetName(): string
	{
		return this._assetName;
	}

	/**
	 * The loader for this asset
	 */
	get assetLoader(): IAssetLoader | null
	{
		return this._assetLoader;
	}

	/**
	 * Event emitter for this struct
	 */
	get events(): EventEmitter
	{
		return this._events;
	}

	/**
	 * Whether this struct has been disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Dispose of this struct and its loader
	 */
	dispose(): void
	{
		if (!this._disposed)
		{
			if (this._assetLoader && !this._assetLoader.disposed)
			{
				this._assetLoader.dispose();
				this._assetLoader = null;
			}

			this._events.removeAllListeners();
			this._disposed = true;
		}
	}

	/**
	 * Dispatch an event
	 */
	dispatchEvent(event: unknown): void
	{
		if (!this._disposed)
		{
			this._events.emit('event', event);
		}
	}

	/**
	 * Add an event listener
	 */
	addEventListener(type: string, callback: (...args: unknown[]) => void): void
	{
		this._events.on(type, callback);
	}

	/**
	 * Remove an event listener
	 */
	removeEventListener(type: string, callback: (...args: unknown[]) => void): void
	{
		this._events.off(type, callback);
	}
}
