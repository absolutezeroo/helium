/**
 * User name update event
 *
 * @see source_as/habbo/session/events/UserNameUpdateEvent.as
 */
export class UserNameUpdateEvent
{
	public static readonly NAME_UPDATE = 'unue_name_updated';

	private _name: string;

	get name(): string
	{
		return this._name;
	}

	constructor(name: string)
	{
		this._name = name;
	}
}
