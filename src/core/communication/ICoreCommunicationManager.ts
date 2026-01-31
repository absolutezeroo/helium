import type {IConnection} from './connection/IConnection';
import type {IConnectionCallback} from './connection/IConnectionCallback';

/**
 * Interface for the core communication manager
 */
export interface ICoreCommunicationManager {
    /**
     * Get all active connections
     */
    readonly connections: IConnection[];

    /**
     * Create a new connection
     * @param callback Optional callback for connection events
     * @returns The created connection
     */
    createConnection(callback?: IConnectionCallback): IConnection;

    /**
     * Update all connections (process received data)
     * Call this from the main update loop
     */
    update(deltaTime: number): void;

    /**
     * Clean up resources
     */
    dispose(): void;
}
