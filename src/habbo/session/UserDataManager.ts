import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IUserDataManager} from './IUserDataManager';
import type {IUserData} from './IUserData';
import {UserDataType} from './UserData';

/**
 * Room user data manager
 * Based on AS3 com.sulake.habbo.session.UserDataManager
 */
export class UserDataManager implements IUserDataManager
{
	private _usersByTypeAndWebId: Map<number, Map<number, IUserData>> = new Map();
	private _usersByRoomIndex: Map<number, IUserData> = new Map();
	private _userBadges: Map<number, string[]> = new Map();
	private _sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null = null;

	constructor(sendCallback?: (composer: IMessageComposer<unknown[]>) => void)
	{
		this._sendCallback = sendCallback ?? null;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._usersByTypeAndWebId.clear();
		this._usersByRoomIndex.clear();
		this._userBadges.clear();
		this._sendCallback = null;
		this._disposed = true;
	}

	public getUserData(webId: number): IUserData | null
	{
		return this.getUserDataByType(webId, UserDataType.USER);
	}

	public getUserDataByType(webId: number, type: number): IUserData | null
	{
		const typeMap = this._usersByTypeAndWebId.get(type);

		if (typeMap)
		{
			return typeMap.get(webId) ?? null;
		}

		return null;
	}

	public getUserDataByIndex(roomIndex: number): IUserData | null
	{
		return this._usersByRoomIndex.get(roomIndex) ?? null;
	}

	public getUserDataByName(name: string): IUserData | null
	{
		for (const userData of this._usersByRoomIndex.values())
		{
			if (userData.name === name)
			{
				return userData;
			}
		}

		return null;
	}

	public getPetUserData(webId: number): IUserData | null
	{
		return this.getUserDataByType(webId, UserDataType.PET);
	}

	public getRentableBotUserData(webId: number): IUserData | null
	{
		return this.getUserDataByType(webId, UserDataType.RENTABLE_BOT);
	}

	public getUserBadges(userId: number): string[]
	{
		// TODO: Send GetSelectedBadgesMessageComposer when implemented
		// if (this._sendCallback)
		// {
		//     this._sendCallback(new GetSelectedBadgesMessageComposer(userId));
		// }

		const badges = this._userBadges.get(userId);

		return badges ?? [];
	}

	public setUserData(userData: IUserData): void
	{
		if (!userData) return;

		// Remove any existing data for this room index
		this.removeUserDataByRoomIndex(userData.roomObjectId);

		// Get or create the type map
		let typeMap = this._usersByTypeAndWebId.get(userData.type);

		if (!typeMap)
		{
			typeMap = new Map();
			this._usersByTypeAndWebId.set(userData.type, typeMap);
		}

		// Add by webID
		typeMap.set(userData.webID, userData);

		// Add by room index
		this._usersByRoomIndex.set(userData.roomObjectId, userData);
	}

	public setUserBadges(userId: number, badges: string[]): void
	{
		this._userBadges.delete(userId);
		this._userBadges.set(userId, badges);
	}

	public removeUserDataByRoomIndex(roomIndex: number): void
	{
		const userData = this._usersByRoomIndex.get(roomIndex);

		if (userData)
		{
			this._usersByRoomIndex.delete(roomIndex);

			const typeMap = this._usersByTypeAndWebId.get(userData.type);

			if (typeMap)
			{
				typeMap.delete(userData.webID);
			}
		}
	}

	public updateFigure(roomIndex: number, figure: string, sex: string, hasSaddle: boolean, isRiding: boolean): void
	{
		const userData = this.getUserDataByIndex(roomIndex);

		if (userData)
		{
			userData.figure = figure;
			userData.sex = sex;
			userData.hasSaddle = hasSaddle;
			userData.isRiding = isRiding;
		}
	}

	public updatePetLevel(roomIndex: number, level: number): void
	{
		const userData = this.getUserDataByIndex(roomIndex);

		if (userData)
		{
			userData.petLevel = level;
		}
	}

	public updatePetBreedingStatus(roomIndex: number, canBreed: boolean, canHarvest: boolean, canRevive: boolean, hasBreedingPermission: boolean): void
	{
		const userData = this.getUserDataByIndex(roomIndex);

		if (userData)
		{
			userData.canBreed = canBreed;
			userData.canHarvest = canHarvest;
			userData.canRevive = canRevive;
			userData.hasBreedingPermission = hasBreedingPermission;
		}
	}

	public updateCustom(roomIndex: number, custom: string): void
	{
		const userData = this.getUserDataByIndex(roomIndex);

		if (userData)
		{
			userData.custom = custom;
		}
	}

	public updateAchievementScore(roomIndex: number, score: number): void
	{
		const userData = this.getUserDataByIndex(roomIndex);

		if (userData)
		{
			userData.achievementScore = score;
		}
	}

	public updateNameByIndex(roomIndex: number, name: string): void
	{
		const userData = this.getUserDataByIndex(roomIndex);

		if (userData)
		{
			userData.name = name;
		}
	}

	public requestPetInfo(webId: number): void
	{
		const petData = this.getPetUserData(webId);

		if (petData && this._sendCallback)
		{
			// TODO: Send GetPetInfoMessageComposer when implemented
			// this._sendCallback(new GetPetInfoMessageComposer(petData.webID));
		}
	}

	public getAllUserIds(): number[]
	{
		const userIds: number[] = [];

		for (const userData of this._usersByRoomIndex.values())
		{
			userIds.push(userData.webID);
		}

		return userIds;
	}
}
