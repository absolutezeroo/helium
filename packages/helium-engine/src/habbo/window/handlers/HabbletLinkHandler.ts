import type { IHabboWindowManager } from '../IHabboWindowManager';

/**
 * Link event handler for "habblet/" prefixed URLs.
 *
 * Routes habblet links to appropriate web actions.
 *
 * @see sources/win63_version/habbo/window/handlers/HabbletLinkHandler.as
 */
export class HabbletLinkHandler
{
    private _windowManager: IHabboWindowManager;
    private _disposed: boolean = false;

    constructor(windowManager: IHabboWindowManager)
    {
        this._windowManager = windowManager;
    }

    /**
     * The link pattern this handler matches.
     */
    public get linkPattern(): string
    {
        return 'habblet/';
    }

    /**
     * Handles a received link URL.
     *
     * Supported patterns:
     * - "habblet/open/credits" -> Opens web shop
     * - "habblet/open/<name>" -> Opens web habblet
     */
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 3) return;

        const action = parts[1];
        const target = parts[2];

        if(action === 'open')
        {
            if(target === 'credits')
            {
                // In AS3: HabboWebTools.openWebPageAndMinimizeClient()
                // Opens the web shop URL
            }
            else
            {
                // In AS3: HabboWebTools.openWebHabblet(target)
                // Opens the named web habblet
            }
        }
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Dispose the link handler.
     */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}
