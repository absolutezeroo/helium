/**
 * Warning event data class.
 *
 * Used as a payload when emitting warning events through EventEmitter3.
 *
 * @see sources/win63_version/core/runtime/events/WarningEvent.as
 */
export class WarningEvent
{
	constructor(message: string)
	{
		this._message = message ?? 'undefined';
	}

	private _message: string;

	get message(): string
	{
		return this._message;
	}
}
