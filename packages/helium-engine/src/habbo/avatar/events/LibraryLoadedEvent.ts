/**
 * Event dispatched when an avatar asset library has finished loading.
 *
 * @see sources/win63_version/habbo/avatar/events/LibraryLoadedEvent.as
 */
export class LibraryLoadedEvent
{
    private _type: string;
    private _library: string;

    constructor(type: string, library: string)
    {
        this._type = type;
        this._library = library;
    }

    public get type(): string
    {
        return this._type;
    }

    public get library(): string
    {
        return this._library;
    }
}
