import type { WindowEvent } from './events/WindowEvent';

interface Listener
{
    callback: (event: WindowEvent) => void;
    priority: number;
}

export class WindowEventDispatcher
{
    private _listeners: Map<string, Listener[]>;

    public constructor()
    {
        this._listeners = new Map();
    }

    public addEventListener(type: string, callback: (event: WindowEvent) => void, priority = 0): void
    {
        const existing = this._listeners.get(type) ?? [];

        if (existing.find((item) => item.callback === callback))
        {
            return;
        }

        existing.push({ callback, priority });
        existing.sort((a, b) => b.priority - a.priority);
        this._listeners.set(type, existing);
    }

    public removeEventListener(type: string, callback: (event: WindowEvent) => void): void
    {
        const existing = this._listeners.get(type);

        if (!existing)
        {
            return;
        }

        this._listeners.set(
            type,
            existing.filter((item) => item.callback !== callback)
        );
    }

    public hasEventListener(type: string): boolean
    {
        const existing = this._listeners.get(type);
        return !!existing && existing.length > 0;
    }

    public dispatchEvent(event: WindowEvent): void
    {
        const existing = this._listeners.get(event.type);

        if (!existing || existing.length === 0)
        {
            return;
        }

        const callbacks = existing.map((listener) => listener.callback);

        for (const callback of callbacks)
        {
            callback(event);
        }
    }
}
