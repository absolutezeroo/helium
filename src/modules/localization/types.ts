/**
 * Localization module state
 */
export interface ILocalizationState
{
	/** Whether localization has been loaded */
	isLoaded: boolean;

	/** Current language code */
	languageCode: string;
}
