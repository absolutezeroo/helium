import type { AvatarStructure } from '../AvatarStructure';
import type { AssetAliasCollection } from '../alias/AssetAliasCollection';
import type { IAvatarImage } from '../IAvatarImage';
import type { IActiveActionData } from '../actions/IActiveActionData';
import type { AvatarImagePartContainer } from '../AvatarImagePartContainer';
import type { AvatarCanvas } from '../structure/AvatarCanvas';
import { AvatarDirectionAngle } from '../enum/AvatarDirectionAngle';
import { AvatarScaleType } from '../enum/AvatarScaleType';
import { AvatarImageBodyPartCache } from './AvatarImageBodyPartCache';
import { AvatarImageActionCache } from './AvatarImageActionCache';
import { AvatarImageDirectionCache } from './AvatarImageDirectionCache';
import { AvatarImageBodyPartContainer } from '../AvatarImageBodyPartContainer';
import { ImageData } from './ImageData';

/**
 * Main cache manager for avatar image rendering.
 * Manages a hierarchical cache: bodyPart -> action -> direction -> frame.
 *
 * The rendering pipeline composites individual part sprites into body-part
 * containers, using direction-aware flipping and color transforms.
 *
 * @see sources/win63_version/habbo/avatar/cache/AvatarImageCache.as
 */
export class AvatarImageCache
{
    public static readonly DEFAULT_MAX_CACHE_STORAGE_TIME_MS: number = 60000;

    private static readonly UNDERSCORE: string = '_';
    private static readonly DEF_SEPARATOR: string = '.';
    private static readonly BASE_ACTION: string = 'std';
    private static readonly PART_FACE: string = 'fc';
    private static readonly PART_EYES: string = 'ey';
    private static readonly PART_RIGHT_ITEM: string = 'ri';
    private static readonly ACTION_WAVE: string = 'wav';
    private static readonly ACTION_DRINK: string = 'drk';
    private static readonly ACTION_BLOW: string = 'blw';
    private static readonly ACTION_SIGN: string = 'sig';
    private static readonly ACTION_RESPECT: string = 'respect';

    private _structure: AvatarStructure;
    private _avatar: IAvatarImage;
    private _assets: AssetAliasCollection;
    private _scale: string;
    private _cache: Map<string, AvatarImageBodyPartCache>;
    private _canvas: AvatarCanvas | null;
    private _disposed: boolean;
    private _geometryType: string;
    private _unionImages: ImageData[];
    private _serverRenderData: any[];

    constructor(
        structure: AvatarStructure,
        avatar: IAvatarImage,
        assets: AssetAliasCollection,
        scale: string
    )
    {
        this._structure = structure;
        this._avatar = avatar;
        this._assets = assets;
        this._scale = scale;
        this._cache = new Map();
        this._canvas = null;
        this._disposed = false;
        this._geometryType = '';
        this._unionImages = [];
        this._serverRenderData = [];
    }

    /**
     * Sets the direction for all body parts in the given set type.
     *
     * @param setType - The body part set identifier (e.g. 'full', 'head')
     * @param direction - The avatar direction (0-7)
     */
    public setDirection(setType: string, direction: number): void
    {
        const bodyPartIds = this._structure.getBodyPartsUnordered(setType);

        for(const bodyPartId of bodyPartIds)
        {
            const cache = this.getBodyPartCache(bodyPartId);

            if(cache) cache.setDirection(direction);
        }
    }

    /**
     * Sets the action for all active body parts of the given action.
     *
     * @param action - The active action data
     * @param frameCount - The current frame count
     */
    public setAction(action: IActiveActionData, frameCount: number): void
    {
        const bodyPartIds = this._structure.getActiveBodyPartIds(action, this._avatar);

        for(const bodyPartId of bodyPartIds)
        {
            const cache = this.getBodyPartCache(bodyPartId);

            if(cache) cache.setAction(action, frameCount);
        }
    }

    /**
     * Sets the geometry type (vertical, sitting, lay, etc.).
     * Clears caches only when the transition requires it.
     *
     * @param geometryType - The geometry type string
     */
    public setGeometryType(geometryType: string): void
    {
        if(this._geometryType === geometryType) return;

        if((this._geometryType === 'sitting' && geometryType === 'vertical') ||
            (this._geometryType === 'vertical' && geometryType === 'sitting') ||
            (this._geometryType === 'swhorizontal' || geometryType === 'swhorizontal'))
        {
            this._geometryType = geometryType;
            this._canvas = null;

            return;
        }

        this.disposeInactiveActions(0);
        this._geometryType = geometryType;
        this._canvas = null;
    }

    /**
     * Disposes action caches that have been idle longer than the threshold.
     *
     * @param maxIdleTime - Maximum idle time in ms before eviction
     */
    public disposeInactiveActions(maxIdleTime: number = AvatarImageCache.DEFAULT_MAX_CACHE_STORAGE_TIME_MS): void
    {
        const now = Date.now();

        for(const cache of this._cache.values())
        {
            if(cache) cache.disposeActions(maxIdleTime, now);
        }
    }

    /**
     * Resets all body part caches to the given action.
     *
     * @param action - The action to reset to
     */
    public resetBodyPartCache(action: IActiveActionData): void
    {
        for(const cache of this._cache.values())
        {
            if(cache) cache.setAction(action, 0);
        }
    }

    /**
     * Core method: gets or creates a cached body part image container.
     *
     * Handles animation layer data overrides for direction, frame index,
     * and action, then delegates to the hierarchical cache or renders if needed.
     *
     * @param bodyPartId - The body part identifier
     * @param frameIndex - The current animation frame index
     * @param forceUpdate - If true, bypasses cache and forces re-render
     * @returns The body part container, or null if rendering fails
     */
    public getImageContainer(bodyPartId: string, frameIndex: number, forceUpdate: boolean = false): AvatarImageBodyPartContainer | null
    {
        let bodyPartCache = this.getBodyPartCache(bodyPartId);

        if(!bodyPartCache)
        {
            bodyPartCache = new AvatarImageBodyPartCache();
            this._cache.set(bodyPartId, bodyPartCache);
        }

        let direction = bodyPartCache.getDirection();
        let adjustedFrameIndex = frameIndex;

        const action = bodyPartCache.getAction();

        if(!action) return null;

        if(action.definition.startFromFrameZero)
        {
            adjustedFrameIndex -= action.startFrame;
        }

        let cacheAction: IActiveActionData = action;
        let renderAction: IActiveActionData = action;
        const removeData: string[] = [];
        let effectParts: Map<string, string> = new Map();
        let animationOffset = { x: 0, y: 0 };

        if(action && action.definition)
        {
            if(action.definition.isAnimation)
            {
                let animDirection = direction;
                const animation = this._structure.getAnimation(
                    action.definition.state + AvatarImageCache.DEF_SEPARATOR + action.actionParameter
                );
                const animFrameIndex = frameIndex - action.startFrame;

                if(animation)
                {
                    const layerData = animation.getLayerData(animFrameIndex, bodyPartId, action.overridingAction);

                    if(layerData)
                    {
                        animDirection = direction + layerData.dd;

                        if(layerData.dd < 0)
                        {
                            if(animDirection < 0)
                            {
                                animDirection = 8 + animDirection;
                            }
                            else if(animDirection > 7)
                            {
                                animDirection = 8 - animDirection;
                            }
                        }
                        else
                        {
                            if(animDirection < 0)
                            {
                                animDirection += 8;
                            }
                            else if(animDirection > 7)
                            {
                                animDirection -= 8;
                            }
                        }

                        if(this._scale === AvatarScaleType.LARGE)
                        {
                            animationOffset.x = layerData.dx;
                            animationOffset.y = layerData.dy;
                        }
                        else
                        {
                            animationOffset.x = layerData.dx / 2;
                            animationOffset.y = layerData.dy / 2;
                        }

                        adjustedFrameIndex = layerData.animationFrame;

                        if(layerData.action)
                        {
                            renderAction = layerData.action;
                        }

                        if(layerData.type === 'bodypart')
                        {
                            if(layerData.action)
                            {
                                cacheAction = layerData.action;
                            }

                            direction = animDirection;
                        }
                        else if(layerData.type === 'fx')
                        {
                            direction = animDirection;
                        }

                        effectParts = layerData.items;
                    }

                    const animRemoveData = animation.removeData;

                    if(animRemoveData)
                    {
                        for(const item of animRemoveData)
                        {
                            removeData.push(item);
                        }
                    }
                }
            }
        }

        let actionCache = bodyPartCache.getActionCache(cacheAction);

        if(!actionCache || forceUpdate)
        {
            actionCache = new AvatarImageActionCache();
            bodyPartCache.updateActionCache(cacheAction, actionCache);
        }

        let directionCache = actionCache.getDirectionCache(direction);

        if(!directionCache || forceUpdate)
        {
            const partList = this._structure.getParts(
                bodyPartId,
                this._avatar.getFigure(),
                cacheAction,
                this._geometryType,
                direction,
                removeData,
                this._avatar,
                effectParts
            );

            if(!partList) return null;

            directionCache = new AvatarImageDirectionCache(partList);
            actionCache.updateDirectionCache(direction, directionCache);
        }

        let container = directionCache.getImageContainer(adjustedFrameIndex);

        if(!container || forceUpdate)
        {
            const partList = directionCache.getPartList();

            container = this.renderBodyPart(direction, partList, adjustedFrameIndex, renderAction, forceUpdate);

            if(!container || forceUpdate)
            {
                return null;
            }

            if(container.isCacheable)
            {
                directionCache.updateImageContainer(container, adjustedFrameIndex);
            }
        }

        const bodyPartOffset = this._structure.getFrameBodyPartOffset(cacheAction, direction, adjustedFrameIndex, bodyPartId);

        container.offset = {
            x: animationOffset.x + bodyPartOffset.x,
            y: animationOffset.y + bodyPartOffset.y
        };

        return container;
    }

    /**
     * Returns and clears the accumulated server render data.
     */
    public getServerRenderData(): any[]
    {
        const data = this._serverRenderData;

        this._serverRenderData = [];

        return data;
    }

    /**
     * Gets or creates a body part cache for the given ID.
     *
     * @param bodyPartId - The body part identifier
     * @returns The body part cache
     */
    public getBodyPartCache(bodyPartId: string): AvatarImageBodyPartCache
    {
        let cache = this._cache.get(bodyPartId) || null;

        if(!cache)
        {
            cache = new AvatarImageBodyPartCache();
            this._cache.set(bodyPartId, cache);
        }

        return cache;
    }

    /**
     * Renders a body part by compositing all its individual part sprites
     * into a single container, handling direction flipping, color transforms,
     * and animation frames.
     *
     * @param direction - The avatar direction (0-7)
     * @param partList - The list of part containers to render
     * @param frameIndex - The animation frame index
     * @param action - The active action data for asset name resolution
     * @param forceUpdate - Whether this is a forced re-render
     * @returns The composited body part container, or null if no parts render
     */
    private renderBodyPart(
        direction: number,
        partList: AvatarImagePartContainer[],
        frameIndex: number,
        action: IActiveActionData,
        forceUpdate: boolean = false
    ): AvatarImageBodyPartContainer | null
    {
        if(!partList || partList.length === 0) return null;

        if(!this._canvas)
        {
            this._canvas = this._structure.getCanvas(this._scale, this._geometryType);

            if(!this._canvas) return null;
        }

        let assetDirection = direction;
        const isFlippedDirection = AvatarDirectionAngle.DIRECTION_IS_FLIPPED[direction] || false;
        let assetPartDefinition = action.definition.assetPartDefinition;
        let isCacheable = true;
        const partCount = partList.length;

        for(let i = partCount - 1; i >= 0; i--)
        {
            const partContainer = partList[i];

            if(direction === 7 && (partContainer.partType === AvatarImageCache.PART_FACE || partContainer.partType === AvatarImageCache.PART_EYES))
            {
                continue;
            }

            if(partContainer.partType === AvatarImageCache.PART_RIGHT_ITEM && !partContainer.partId)
            {
                continue;
            }

            const partType = partContainer.partType;
            const partId = partContainer.partId;
            let currentPartType = partType;

            const animFrame = partContainer.getFrameDefinition(frameIndex);
            let frameNumber: number;

            if(animFrame)
            {
                frameNumber = animFrame.number;

                if(animFrame.assetPartDefinition && animFrame.assetPartDefinition.length > 0)
                {
                    assetPartDefinition = animFrame.assetPartDefinition;
                }
            }
            else
            {
                frameNumber = partContainer.getFrameIndex(frameIndex);
            }

            assetDirection = direction;
            let isPartFlipped = false;

            if(isFlippedDirection)
            {
                if(assetPartDefinition === AvatarImageCache.ACTION_WAVE &&
                    (currentPartType === 'lh' || currentPartType === 'ls' || currentPartType === 'lc'))
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_DRINK &&
                    (currentPartType === 'rh' || currentPartType === 'rs' || currentPartType === 'rc'))
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_BLOW && currentPartType === 'rh')
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_SIGN && currentPartType === 'lh')
                {
                    isPartFlipped = true;
                }
                else if(assetPartDefinition === AvatarImageCache.ACTION_RESPECT && currentPartType === 'lh')
                {
                    isPartFlipped = true;
                }
                else if(currentPartType === 'ri')
                {
                    isPartFlipped = true;
                }
                else if(currentPartType === 'li')
                {
                    isPartFlipped = true;
                }
                else if(currentPartType === 'cp')
                {
                    isPartFlipped = true;
                }
                else
                {
                    if(direction === 4)
                    {
                        assetDirection = 2;
                    }
                    else if(direction === 5)
                    {
                        assetDirection = 1;
                    }
                    else if(direction === 6)
                    {
                        assetDirection = 0;
                    }

                    if(partContainer.flippedPartType !== currentPartType)
                    {
                        currentPartType = partContainer.flippedPartType;
                    }
                }
            }

            const assetName = this._scale
                + AvatarImageCache.UNDERSCORE + assetPartDefinition
                + AvatarImageCache.UNDERSCORE + currentPartType
                + AvatarImageCache.UNDERSCORE + partId
                + AvatarImageCache.UNDERSCORE + assetDirection
                + AvatarImageCache.UNDERSCORE + frameNumber;

            // Resolve the asset name through the alias collection
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const resolvedName = this._assets.getAssetName(assetName);

            // TODO: When the asset system provides getAssetByName(), resolve the
            // actual texture and offset here. Fallback to std action, frame 0.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const fallbackName = this._scale
                + AvatarImageCache.UNDERSCORE + AvatarImageCache.BASE_ACTION
                + AvatarImageCache.UNDERSCORE + currentPartType
                + AvatarImageCache.UNDERSCORE + partId
                + AvatarImageCache.UNDERSCORE + assetDirection
                + AvatarImageCache.UNDERSCORE + '0';

            // Asset resolution will be connected when AvatarRenderManager integrates
            // the sprite sheet / asset bundle system. The cache structure is ready.
        }

        if(this._unionImages.length === 0) return null;

        const unionImage = this.createUnionImage(this._unionImages, isFlippedDirection);

        const canvasOffset = this._scale === AvatarScaleType.LARGE
            ? this._canvas.height - 16
            : this._canvas.height - 8;

        const regPoint = unionImage.regPoint;

        const containerRegPoint = {
            x: -regPoint.x,
            y: canvasOffset - regPoint.y
        };

        if(isFlippedDirection && assetPartDefinition !== 'lay')
        {
            containerRegPoint.x += this._scale === AvatarScaleType.LARGE ? 67 : 31;
        }

        // Dispose union images
        for(let i = this._unionImages.length - 1; i >= 0; i--)
        {
            const img = this._unionImages.pop();

            if(img) img.dispose();
        }

        return new AvatarImageBodyPartContainer(unionImage.texture, containerRegPoint, isCacheable);
    }

    /**
     * Composites multiple ImageData objects into a single union image
     * by computing the bounding rectangle union and drawing each part.
     *
     * @param imageDataList - The list of image data to composite
     * @param isFlipped - Whether the composite should be flipped
     * @returns The composited image data, or null if empty
     */
    private createUnionImage(imageDataList: ImageData[], isFlipped: boolean): ImageData
    {
        // Compute the union bounding rect from all offset rects
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        for(const imageData of imageDataList)
        {
            const offsetRect = imageData.offsetRect;

            minX = Math.min(minX, offsetRect.x);
            minY = Math.min(minY, offsetRect.y);
            maxX = Math.max(maxX, offsetRect.x + offsetRect.width);
            maxY = Math.max(maxY, offsetRect.y + offsetRect.height);
        }

        const width = maxX - minX;
        const height = maxY - minY;
        const regPoint = { x: -minX, y: -minY };

        // Actual pixel compositing requires PixiJS RenderTexture.
        // When the asset system is connected, this method will create a
        // RenderTexture, draw each part with correct transforms, and return
        // the result. The spatial math (union rect, regPoint) is ready.

        return new ImageData(
            null,
            { x: 0, y: 0, width, height },
            regPoint,
            isFlipped,
            null
        );
    }

    /**
     * Disposes all caches and clears references.
     */
    public dispose(): void
    {
        if(this._disposed) return;

        this._structure = null!;
        this._avatar = null!;
        this._assets = null!;

        if(this._cache)
        {
            for(const cache of this._cache.values())
            {
                if(cache) cache.dispose();
            }

            this._cache.clear();
        }

        this._canvas = null;
        this._unionImages = [];
        this._serverRenderData = [];
        this._disposed = true;
    }
}
