import type {IConnection} from '@core/communication/connection/IConnection';
import {getCommunication} from './getCommunication';

/**
 * @see source_nitro_react/src/api/nitro/GetConnection.ts
 */
export const getConnection = (): IConnection | null => getCommunication().connection;
