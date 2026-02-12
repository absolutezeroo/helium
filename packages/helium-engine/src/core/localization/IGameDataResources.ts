/**
 * Interface for game data resources (hashes for external files)
 *
 * Based on AS3 com.sulake.core.localization.class_40
 */
export interface IGameDataResources
{
	readonly effectMapUrl: string;
	readonly effectMapHash: string;
	readonly externalRendererVariablesUrl: string;
	readonly externalRendererVariablesHash: string;
	readonly externalTextsUrl: string;
	readonly externalTextsHash: string;
	readonly externalUIVariablesUrl: string;
	readonly externalUIVariablesHash: string;
	readonly figureDataUrl: string;
	readonly figureDataHash: string;
	readonly figureMapUrl: string;
	readonly figureMapHash: string;
	readonly furnitureDataUrl: string;
	readonly furnitureDataHash: string;
	readonly habboAvatarActionsUrl: string;
	readonly habboAvatarActionsHash: string;
	readonly habboAvatarAnimationsUrl: string;
	readonly habboAvatarAnimationsHash: string;
	readonly habboAvatarGeometryUrl: string;
	readonly habboAvatarGeometryHash: string;
	readonly habboAvatarPartSetsUrl: string;
	readonly habboAvatarPartSetsHash: string;
	readonly productDataUrl: string;
	readonly productDataHash: string;

	/**
	 * Check if all required resources are present
	 */
	isValid(): boolean;
}
