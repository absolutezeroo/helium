import type {NavigatorSavedSearch, NavigatorTopLevelContext} from '../../communication/messages/incoming/newnavigator';

/**
 * Container for navigator contexts and saved searches
 *
 */
export class ContextContainer {
    private _topLevelContexts: Map<string, NavigatorSavedSearch[]> = new Map();
    private _savedSearches: NavigatorSavedSearch[] = [];

    constructor() {}

    hasContextFor(searchCode: string): boolean {
        return this._topLevelContexts.has(searchCode);
    }

    initialize(topLevelContexts: NavigatorTopLevelContext[]): void {
        this._topLevelContexts.clear();
        for (const context of topLevelContexts) {
            this._topLevelContexts.set(context.searchCode, context.savedSearches);
        }
    }

    getTopLevelSearches(): string[] {
        return Array.from(this._topLevelContexts.keys());
    }

    get savedSearches(): NavigatorSavedSearch[] {
        return this._savedSearches;
    }

    set savedSearches(value: NavigatorSavedSearch[]) {
        this._savedSearches = value;
    }

    isReady(): boolean {
        return this._topLevelContexts.size > 0;
    }
}
