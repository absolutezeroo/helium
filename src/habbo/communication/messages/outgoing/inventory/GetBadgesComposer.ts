import type {IMessageComposer} from "@/core";

/**
 * Request badges from server
 */
export class GetBadgesComposer implements IMessageComposer<ConstructorParameters<typeof GetBadgesComposer>>
{
	private _data: ConstructorParameters<typeof GetBadgesComposer>;

	constructor()
	{
		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
