import {SearchContext} from './SearchContext';

/**
 * Manages search context history for back/forward navigation
 *
 */
export class SearchContextHistoryManager
{
	private _history: SearchContext[] = [];
	private _browsingOffset: number = -1;

	constructor()
	{
	}

	get hasNext(): boolean
	{
		return this._browsingOffset + 1 < this._history.length;
	}

	get hasPrevious(): boolean
	{
		return this._browsingOffset > 0 && this._history.length > 0;
	}

	public addSearchContextAtCurrentOffset(context: SearchContext): number
	{
		if (this._history.length > this._browsingOffset + 1)
		{
			this._history.splice(this._browsingOffset + 1, this._history.length - this._browsingOffset);
		}
		this._history.push(context);
		return ++this._browsingOffset;
	}

	public getPreviousSearchContextAndGoBack(): SearchContext | null
	{
		if (this.hasPrevious)
		{
			return this._history[--this._browsingOffset];
		}
		return null;
	}

	public getNextSearchContextAndMoveForward(): SearchContext | null
	{
		if (this.hasNext)
		{
			return this._history[++this._browsingOffset];
		}
		return null;
	}

	public toString(): string
	{
		const items = this._history.map(item => item.toString());

		return `history: [${items.join(',')}] browsing offset: ${this._browsingOffset}`;
	}
}
