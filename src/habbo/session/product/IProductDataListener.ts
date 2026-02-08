/**
 * Listener interface for product data ready events
 * @see source_as_win63/habbo/session/product/class_1812.as
 * @see source_as_flash/com/sulake/habbo/session/product/IProductDataListener.as
 */
export interface IProductDataListener
{
	productDataReady(): void;
	dispose(): void;
}
