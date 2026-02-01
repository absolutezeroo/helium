import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search guild base
 *
 * Based on AS3 GuildBaseSearchMessageComposer
 */
export class GuildBaseSearchMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(guildId: number) {
        this._data = [guildId];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
