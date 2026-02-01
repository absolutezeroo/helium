/**
 * Interface for game data resources (hashes for external files)
 *
 * Based on AS3 com.sulake.core.localization.class_40
 */
export interface IGameDataResources
{
	/**
	 * Check if all required resources are present
	 */
	isValid(): boolean;

	/**
	 * Get external texts URL
	 */
	getExternalTextsUrl(): string;

	/**
	 * Get external texts hash
	 */
	getExternalTextsHash(): string;

	/**
	 * Get external variables URL
	 */
	getExternalVariablesUrl(): string;

	/**
	 * Get external variables hash
	 */
	getExternalVariablesHash(): string;

	/**
	 * Get furni data URL
	 */
	getFurniDataUrl(): string;

	/**
	 * Get furni data hash
	 */
	getFurniDataHash(): string;

	/**
	 * Get product data URL
	 */
	getProductDataUrl(): string;

	/**
	 * Get product data hash
	 */
	getProductDataHash(): string;
}
