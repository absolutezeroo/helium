import {Component, type IContext} from '@core/runtime';
import {SocketConnection} from './connection/SocketConnection';
import type {ICoreCommunicationManager} from './ICoreCommunicationManager';
import type {IConnection} from './connection/IConnection';
import type {IConnectionCallback} from './connection/IConnectionCallback';

/**
 * Core communication manager
 * Manages all network connections and their lifecycle
 */
export class CoreCommunicationManager extends Component implements ICoreCommunicationManager
{
	constructor(context: IContext)
	{
		super(context);
	}

	private _connections: IConnection[] = [];

	/**
	 * Get all active connections
	 */
	get connections(): IConnection[]
	{
		return [...this._connections];
	}

	/**
	 * Create a new connection
	 */
	createConnection(callback?: IConnectionCallback): IConnection
	{
		if (this.disposed)
		{
			throw new Error('CommunicationManager has been disposed');
		}

		const connection = new SocketConnection(callback);
		this._connections.push(connection);

		return connection;
	}

	/**
	 * Update all connections (call from main update loop)
	 */
	update(_deltaTime: number): void
	{
		if (this.disposed) return;

		// Process each connection and remove disposed ones
		for (let i = this._connections.length - 1; i >= 0; i--)
		{
			const connection = this._connections[i];

			if (connection.disposed)
			{
				this._connections.splice(i, 1);
				continue;
			}

			// Process received data
			connection.processReceivedData();
		}
	}

	/**
	 * Remove a connection
	 */
	removeConnection(connection: IConnection): void
	{
		const index = this._connections.indexOf(connection);
		if (index !== -1)
		{
			this._connections.splice(index, 1);
		}
	}

	/**
	 * Clean up all connections
	 */
	override dispose(): void
	{
		if (this.disposed) return;

		for (const connection of this._connections)
		{
			connection.dispose();
		}

		this._connections = [];
		super.dispose();
	}

	protected override initComponent(): void
	{
		// No initialization needed
	}
}
