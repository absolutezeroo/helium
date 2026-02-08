/**
 * Listener interface for furniture data ready events
 * @see source_as_win63/habbo/session/furniture/class_1813.as
 * @see source_as_flash/com/sulake/habbo/session/furniture/IFurniDataListener.as
 */
export interface IFurniDataListener
{
	furniDataReady(): void;
	dispose(): void;
}
