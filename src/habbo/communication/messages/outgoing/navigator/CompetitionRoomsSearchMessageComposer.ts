import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search competition rooms
 *
 * Based on AS3 CompetitionRoomsSearchMessageComposer
 */
export class CompetitionRoomsSearchMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(goalId: number, pageIndex: number) {
        this._data = [goalId, pageIndex];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
