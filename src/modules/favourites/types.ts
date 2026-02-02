/**
 * Favourites module state
 */
export interface FavouritesState
{
	/** Maximum number of favourite rooms allowed */
	limit: number;

	/** Set of favourite room IDs */
	roomIds: number[];
}
