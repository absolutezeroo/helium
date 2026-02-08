import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {getConnection} from './getConnection';

/**
 * Send a message composer to the server
 *
 * @see source_nitro_react/src/api/nitro/SendMessageComposer.ts
 */
export const SendMessageComposer = (composer: IMessageComposer<unknown[]>): void =>
{
	getConnection()?.send(composer);
};
