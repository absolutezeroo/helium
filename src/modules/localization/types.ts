/**
 * Localization module state
 */
export interface LocalizationState
{
	/** Whether localization has been loaded */
	isLoaded: boolean;

	/** Current language code */
	languageCode: string;
}
