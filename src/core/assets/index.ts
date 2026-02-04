/**
 * Core Asset System
 *
 * Based on AS3: com.sulake.core.assets
 *
 * This module provides a complete asset management system following the AS3 architecture:
 *
 * - **Interfaces**: IAsset, ILazyAsset, IAssetLoader, IAssetLibrary
 * - **Type Registry**: AssetTypeDeclaration maps MIME types to asset/loader classes
 * - **Asset Types**: UnknownAsset, TextAsset, XmlAsset, BitmapDataAsset, SoundAsset
 * - **Loaders**: BinaryFileLoader, TextFileLoader, BitmapFileLoader, SoundFileLoader, NitroBundleLoader
 * - **Libraries**: AssetLibrary, AssetLibraryCollection
 *
 * Note: GraphicAsset, GraphicAssetPalette, GraphicAssetCollection are in room/object/visualization/utils/
 * per AS3 structure (com.sulake.room.object.visualization.utils)
 *
 * @example
 * ```typescript
 * import {AssetLibrary, BitmapDataAsset} from '@core/assets';
 *
 * // Create a library
 * const library = new AssetLibrary(context, 'myLibrary');
 *
 * // Load an asset
 * const loader = library.loadAssetFromFile('myImage', 'assets/image.png');
 * loader.events.on('AssetLoaderEventComplete', () => {
 *     const asset = library.getAssetByName('myImage') as BitmapDataAsset;
 *     const texture = asset.content; // PixiJS Texture
 * });
 * ```
 *
 * @module core/assets
 */

export type {IAsset} from './IAsset';
export type {ILazyAsset} from './ILazyAsset';
export type {IAssetLoader} from './loaders/IAssetLoader';
export {AssetLoaderErrorCodes} from './loaders/IAssetLoader';
export type {IAssetLibrary} from './IAssetLibrary';

export {AssetTypeDeclaration} from './AssetTypeDeclaration';
export type {AssetClass, AssetLoaderClass} from './AssetTypeDeclaration';

export {AssetLoaderStruct} from './AssetLoaderStruct';

export {UnknownAsset} from './UnknownAsset';
export {TextAsset} from './TextAsset';
export {XmlAsset} from './XmlAsset';
export {BitmapDataAsset} from './BitmapDataAsset';
export type {Point, Rectangle} from './BitmapDataAsset';
export {SoundAsset} from './SoundAsset';
export {NitroAsset} from './NitroAsset';

export {AssetLoaderEvent, AssetLoaderEventType} from './loaders/AssetLoaderEvent';
export {BaseFileLoader} from './loaders/BaseFileLoader';
export {BinaryFileLoader} from './loaders/BinaryFileLoader';
export {TextFileLoader} from './loaders/TextFileLoader';
export {BitmapFileLoader} from './loaders/BitmapFileLoader';
export {SoundFileLoader} from './loaders/SoundFileLoader';
export {NitroBundleLoader} from './loaders/NitroBundleLoader';
export type {IAssetData, ISpritesheetData, IFrameInfo, IAssetInfo, IAssetAlias} from './loaders/NitroBundleLoader';

export {AssetLibrary, AssetLibraryEvents} from './AssetLibrary';
export {AssetLibraryCollection} from './AssetLibraryCollection';
