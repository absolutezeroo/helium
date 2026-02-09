import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for account preferences message
 *
 * @see source_as_win63/habbo/communication/messages/parser/preferences/AccountPreferencesEventParser.as
 */
export class AccountPreferencesParser implements IMessageParser
{
	private _uiVolume: number = 0;
	private _furniVolume: number = 0;
	private _traxVolume: number = 0;
	private _freeFlowChatDisabled: boolean = false;
	private _roomInvitesIgnored: boolean = false;
	private _roomCameraFollowDisabled: boolean = false;
	private _uiFlags: number = 0;
	private _preferredChatStyle: number = 0;

	flush(): boolean
	{
		this._uiVolume = 0;
		this._furniVolume = 0;
		this._traxVolume = 0;
		this._freeFlowChatDisabled = false;
		this._roomInvitesIgnored = false;
		this._roomCameraFollowDisabled = false;
		this._uiFlags = 0;
		this._preferredChatStyle = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._uiVolume = wrapper.readInt();
		this._furniVolume = wrapper.readInt();
		this._traxVolume = wrapper.readInt();
		this._freeFlowChatDisabled = wrapper.readBoolean();
		this._roomInvitesIgnored = wrapper.readBoolean();
		this._roomCameraFollowDisabled = wrapper.readBoolean();
		this._uiFlags = wrapper.readInt();
		this._preferredChatStyle = wrapper.readInt();

		return true;
	}

	get uiVolume(): number
	{
		return this._uiVolume;
	}

	get furniVolume(): number
	{
		return this._furniVolume;
	}

	get traxVolume(): number
	{
		return this._traxVolume;
	}

	get freeFlowChatDisabled(): boolean
	{
		return this._freeFlowChatDisabled;
	}

	get roomInvitesIgnored(): boolean
	{
		return this._roomInvitesIgnored;
	}

	get roomCameraFollowDisabled(): boolean
	{
		return this._roomCameraFollowDisabled;
	}

	get uiFlags(): number
	{
		return this._uiFlags;
	}

	get preferredChatStyle(): number
	{
		return this._preferredChatStyle;
	}
}
