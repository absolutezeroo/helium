/**
 * UserUpdateMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.UserUpdateMessageEventParser
 *
 * Parser for updating room user positions and actions.
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export interface IUserUpdate
{
	roomIndex: number;
	x: number;
	y: number;
	z: number;
	headDir: number;
	bodyDir: number;
	actions: string;
}

export class UserUpdateMessageParser implements IMessageParser
{
	private _users: IUserUpdate[] = [];

	get userCount(): number
	{
		return this._users.length;
	}

	getUser(index: number): IUserUpdate | null
	{
		if (index < 0 || index >= this._users.length)
		{
			return null;
		}

		return this._users[index];
	}

	flush(): boolean
	{
		this._users = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._users = [];

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			const roomIndex = wrapper.readInt();
			const x = wrapper.readInt();
			const y = wrapper.readInt();
			const z = wrapper.readString();
			const headDir = wrapper.readInt();
			const bodyDir = wrapper.readInt();
			const actions = wrapper.readString();

			this._users.push({
				roomIndex,
				x,
				y,
				z: parseFloat(z),
				headDir,
				bodyDir,
				actions
			});
		}

		return true;
	}
}
