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
	constructor(message: string, critical: boolean, category: number, error: Error | null = null)
	{
		super(message);
		this._critical = critical;
		this._category = category;
		this._error = error;
	}

	private _category: number;

	get category(): number
	{
		return this._category;
	}

	private _critical: boolean;

	get critical(): boolean
	{
		return this._critical;
	}

	private _error: Error | null;

	get error(): Error | null
	{
		return this._error;
	}
}
