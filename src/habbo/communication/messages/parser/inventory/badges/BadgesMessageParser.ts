import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export interface IBadgeData
{
	badgeId: string;
	slotId: number;
}

/**
 * Parser for badges list message
 *
 * @see source_as/habbo/communication/messages/parser/inventory/badges/BadgesEventParser.as
 */
export class BadgesMessageParser implements IMessageParser
{
	private _totalFragments: number = 1;

	get totalFragments(): number
	{
		return this._totalFragments;
	}

	private _fragmentNo: number = 0;

	get fragmentNo(): number
	{
		return this._fragmentNo;
	}

	private _badges: IBadgeData[] = [];

	get badges(): IBadgeData[]
	{
		return this._badges;
	}

	private _activeBadgeIds: string[] = [];

	get activeBadgeIds(): string[]
	{
		return this._activeBadgeIds;
	}

	public flush(): boolean
	{
		this._badges = [];
		this._activeBadgeIds = [];
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		// Total badges count
		const totalCount = wrapper.readInt();

		for (let i = 0; i < totalCount; i++)
		{
			const badgeId = wrapper.readString();
			this._badges.push({badgeId, slotId: 0});
		}

		// Active badges count
		const activeCount = wrapper.readInt();

		for (let i = 0; i < activeCount; i++)
		{
			const slotId = wrapper.readInt();
			const badgeId = wrapper.readString();

			this._activeBadgeIds.push(badgeId);

			// Update slot info in badges array
			const badge = this._badges.find(b => b.badgeId === badgeId);
			if (badge)
			{
				badge.slotId = slotId;
			}
		}

		return true;
	}
}
