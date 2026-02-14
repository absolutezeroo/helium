type ImageModule = Record<string, string>;

const imageModules = import.meta.glob('../../assets/images/*.png', { eager: true, import: 'default' }) as ImageModule;

const imageUrlByName: Map<string, string> = new Map();
const imageCache: Map<string, HTMLImageElement> = new Map();
const pendingCallbacks: Map<string, Set<() => void>> = new Map();

Object.entries(imageModules).forEach(([filePath, url]) =>
{
    const fileName = filePath.split('/').pop() ?? '';
    const baseName = fileName.replace(/\.png$/i, '').toLowerCase();

    if (baseName.length > 0)
    {
        imageUrlByName.set(baseName, url);
    }
});

function resolveAssetKey(assetName: string): string | null
{
    if (!assetName)
    {
        return null;
    }

    const name = assetName.toLowerCase();
    const candidates = [
        name,
        name.replace(/^habbo_/, ''),
        name.endsWith('_png') ? name.slice(0, -4) : name,
        name.replace(/^habbo_/, '').replace(/_png$/, '')
    ];

    for (const candidate of candidates)
    {
        if (imageUrlByName.has(candidate))
        {
            return candidate;
        }
    }

    return null;
}

function notifyReady(key: string): void
{
    const callbacks = pendingCallbacks.get(key);
    if (!callbacks || callbacks.size === 0)
    {
        return;
    }

    callbacks.forEach((callback) => callback());
    callbacks.clear();
}

export function getSkinImage(assetName: string, onReady?: () => void): HTMLImageElement | null
{
    const key = resolveAssetKey(assetName);
    if (!key)
    {
        return null;
    }

    let image = imageCache.get(key);
    if (!image)
    {
        const url = imageUrlByName.get(key);
        if (!url)
        {
            return null;
        }

        image = new Image();
        image.onload = () => notifyReady(key);
        image.src = url;
        imageCache.set(key, image);
    }

    if (onReady)
    {
        if (image.complete && image.naturalWidth > 0)
        {
            onReady();
        }
        else
        {
            let callbacks = pendingCallbacks.get(key);
            if (!callbacks)
            {
                callbacks = new Set();
                pendingCallbacks.set(key, callbacks);
            }
            callbacks.add(onReady);
        }
    }

    return image;
}
