import {IMessageComposer} from "@/core";
import {getConnection} from "@ui/api";

/**
 * Send a message composer to the server
 *
 * @see source_nitro_react/src/api/nitro/SendMessageComposer.ts
 */
export const SendMessageComposer = (composer: IMessageComposer<unknown[]>): void =>
{
	getConnection()?.send(composer);
};
