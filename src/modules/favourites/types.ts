/**
 * Favourites module state
 */
export interface IFavouritesState
{
	/** Maximum number of favourite rooms allowed */
	limit: number;

	/** Set of favourite room IDs */
	roomIds: number[];
}
