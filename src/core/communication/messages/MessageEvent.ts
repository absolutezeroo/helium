import type {IConnection} from '../connection/IConnection';
import type {IMessageEvent, MessageEventCallback, ParserClass} from './IMessageEvent';
import type {IMessageParser} from './IMessageParser';

/**
 * Base implementation of message event
 * Extend this class to create handlers for specific message types
 */
export class MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback, parserClass: ParserClass)
	{
		this._callback = callback;
		this._parserClass = parserClass;
	}

	protected _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	protected _callback: MessageEventCallback;

	get callback(): MessageEventCallback
	{
		return this._callback;
	}

	protected _connection: IConnection | null = null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	set connection(value: IConnection | null)
	{
		this._connection = value;
	}

	protected _parserClass: ParserClass;

	get parserClass(): ParserClass
	{
		return this._parserClass;
	}

	protected _parser: IMessageParser | null = null;

	get parser(): IMessageParser | null
	{
		return this._parser;
	}

	set parser(value: IMessageParser | null)
	{
		this._parser = value;
	}

	/**
	 * Get the parser cast to a specific type
	 */
	public getParser<T extends IMessageParser>(): T
	{
		return this._parser as T; // cast: type assertion required
	}

	public dispose(): void
	{
		if (this._disposed) return;
		this._disposed = true;

		// TS-009: Intentional null assignment for disposal - fields are non-nullable by type
		// but must be cleared to release references. The `_disposed` flag guards access.
		this._callback = null as unknown as MessageEventCallback; // cast: disposal null assignment
		this._parserClass = null as unknown as ParserClass; // cast: disposal null assignment
		this._connection = null;
		this._parser = null;
	}
}
