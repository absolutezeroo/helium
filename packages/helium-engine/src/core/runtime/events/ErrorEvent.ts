import {WarningEvent} from './WarningEvent';

/**
 * Error event data class.
 *
 * Extends WarningEvent with error category, criticality, and cause.
 *
 * @see sources/win63_version/core/runtime/events/ErrorEvent.as
 */
export class ErrorEvent extends WarningEvent
{
	private _category: number;
	private _critical: boolean;
	private _error: Error | null;

	constructor(message: string, critical: boolean, category: number, error: Error | null = null)
	{
		super(message);
		this._critical = critical;
		this._category = category;
		this._error = error;
	}

	get category(): number
	{
		return this._category;
	}

	get critical(): boolean
	{
		return this._critical;
	}

	get error(): Error | null
	{
		return this._error;
	}
}
