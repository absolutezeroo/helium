/**
 * UsersMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.UsersMessageEventParser
 *
 * Parser for room users (avatars, pets, bots).
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomUserData} from '../../../incoming/room/engine/RoomUserData';

export class UsersMessageParser implements IMessageParser
{
	private _users: RoomUserData[] = [];

	get userCount(): number
	{
		return this._users.length;
	}

	getUser(index: number): RoomUserData | null
	{
		if (index < 0 || index >= this._users.length)
		{
			return null;
		}

		const data = this._users[index];

		if (data !== null)
		{
			data.setReadOnly();
		}

		return data;
	}

	flush(): boolean
	{
		this._users = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._users = [];

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			const webId = wrapper.readInt();
			const name = wrapper.readString();
			const custom = wrapper.readString();
			const figure = wrapper.readString();
			const roomIndex = wrapper.readInt();
			const x = wrapper.readInt();
			const y = wrapper.readInt();
			const z = wrapper.readString();
			const dir = wrapper.readInt();
			const userType = wrapper.readInt();

			const userData = new RoomUserData(roomIndex);
			userData.dir = dir;
			userData.name = name;
			userData.custom = custom;
			userData.x = x;
			userData.y = y;
			userData.z = parseFloat(z);

			this._users.push(userData);

			// User type 1 = regular user
			if (userType === 1)
			{
				userData.webID = webId;
				userData.userType = RoomUserData.USER_TYPE_USER;
				userData.sex = this.resolveSex(wrapper.readString());
				userData.groupID = '' + wrapper.readInt();
				userData.groupStatus = wrapper.readInt();
				userData.groupName = wrapper.readString();

				const swimFigure = wrapper.readString();
				userData.figure = swimFigure !== '' ? this.convertSwimFigure(swimFigure, figure, userData.sex) : figure;

				userData.achievementScore = wrapper.readInt();
				userData.isModerator = wrapper.readBoolean();
			}
			// User type 2 = pet
			else if (userType === 2)
			{
				userData.userType = RoomUserData.USER_TYPE_PET;
				userData.figure = figure;
				userData.webID = webId;
				userData.subType = wrapper.readInt().toString();
				userData.ownerId = wrapper.readInt();
				userData.ownerName = wrapper.readString();
				userData.rarityLevel = wrapper.readInt();
				userData.hasSaddle = wrapper.readBoolean();
				userData.isRiding = wrapper.readBoolean();
				userData.canBreed = wrapper.readBoolean();
				userData.canHarvest = wrapper.readBoolean();
				userData.canRevive = wrapper.readBoolean();
				userData.hasBreedingPermission = wrapper.readBoolean();
				userData.petLevel = wrapper.readInt();
				userData.petPosture = wrapper.readString();
			}
			// User type 3 = old bot
			else if (userType === 3)
			{
				userData.userType = RoomUserData.USER_TYPE_OLD_BOT;
				userData.webID = roomIndex * -1;

				if (figure.indexOf('/') === -1)
				{
					userData.figure = figure;
				}
				else
				{
					userData.figure = 'hr-100-.hd-180-1.ch-876-66.lg-270-94.sh-300-64';
				}

				userData.sex = 'M';
			}
			// User type 4 = rentable bot
			else if (userType === 4)
			{
				userData.userType = RoomUserData.USER_TYPE_BOT;
				userData.webID = webId;
				userData.sex = this.resolveSex(wrapper.readString());
				userData.figure = figure;
				userData.ownerId = wrapper.readInt();
				userData.ownerName = wrapper.readString();

				const skillCount = wrapper.readInt();

				if (skillCount > 0)
				{
					const skills: number[] = [];

					for (let j = 0; j < skillCount; j++)
					{
						skills.push(wrapper.readShort());
					}

					userData.botSkills = skills;
				}
			}
		}

		return true;
	}

	private resolveSex(value: string): string
	{
		if (value.substring(0, 1).toLowerCase() === 'f')
		{
			return 'F';
		}

		return 'M';
	}

	private convertSwimFigure(swimFigure: string, baseFigure: string, sex: string): string
	{
		// Simplified swim figure conversion
		// The full implementation has complex color mapping
		const parts = baseFigure.split('.');
		let skinColor = 1;

		for (const part of parts)
		{
			const segments = part.split('-');

			if (segments.length > 2 && segments[0] === 'hd')
			{
				skinColor = parseInt(segments[2], 10);
			}
		}

		const swimType = sex === 'F' ? 10010 : 10011;
		const swimSuffix = `.bds-10001-${skinColor}.ss-${swimType}-10001`;

		return baseFigure + swimSuffix;
	}
}
