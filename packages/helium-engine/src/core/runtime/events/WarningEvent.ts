/**
 * Warning event data class.
 *
 * Used as a payload when emitting warning events through EventEmitter3.
 *
 * @see sources/win63_version/core/runtime/events/WarningEvent.as
 */
export class WarningEvent
{
	private _message: string;

	constructor(message: string)
	{
		this._message = message ?? 'undefined';
	}

	get message(): string
	{
		return this._message;
	}
}
