import { AnimationActionPart } from './AnimationActionPart';

/**
 * Represents a complete animation action containing parts and body part offsets.
 * Each action has multiple parts (keyed by set-type) and optional per-frame,
 * per-direction body part offsets.
 *
 * @see sources/win63_version/habbo/avatar/structure/animation/AnimationAction.as
 */
export class AnimationAction
{
    public static readonly DEFAULT_OFFSET: { x: number; y: number } = { x: 0, y: 0 };

    private _id: string;
    private _parts: Map<string, AnimationActionPart>;
    private _offsets: Map<number, Map<number, Map<string, { x: number; y: number }>>>;
    private _frameCount: number;
    private _offsetFrames: number[];

    constructor(data: any)
    {
        this._id = String(data.id ?? '');
        this._parts = new Map();
        this._offsets = new Map();
        this._frameCount = 0;
        this._offsetFrames = [];

        if(data.part)
        {
            const parts: any[] = Array.isArray(data.part) ? data.part : [data.part];

            for(const partData of parts)
            {
                const actionPart = new AnimationActionPart(partData);
                this._parts.set(String(partData['set-type']), actionPart);
                this._frameCount = Math.max(this._frameCount, actionPart.frames.length);
            }
        }

        if(data.offsets && data.offsets.frame)
        {
            const frames: any[] = Array.isArray(data.offsets.frame) ? data.offsets.frame : [data.offsets.frame];

            for(const frameData of frames)
            {
                const frameId: number = parseInt(frameData.id) || 0;
                this._frameCount = Math.max(this._frameCount, frameId);

                const directionMap = new Map<number, Map<string, { x: number; y: number }>>();
                this._offsets.set(frameId, directionMap);

                if(frameData.directions && frameData.directions.direction)
                {
                    const directions: any[] = Array.isArray(frameData.directions.direction)
                        ? frameData.directions.direction
                        : [frameData.directions.direction];

                    for(const directionData of directions)
                    {
                        const directionId: number = parseInt(directionData.id) || 0;
                        const bodyPartMap = new Map<string, { x: number; y: number }>();
                        directionMap.set(directionId, bodyPartMap);

                        if(directionData.bodypart)
                        {
                            const bodyParts: any[] = Array.isArray(directionData.bodypart)
                                ? directionData.bodypart
                                : [directionData.bodypart];

                            for(const bodyPartData of bodyParts)
                            {
                                const bodyPartId: string = String(bodyPartData.id);
                                const dx: number = (bodyPartData.dx !== undefined) ? parseInt(bodyPartData.dx) || 0 : 0;
                                const dy: number = (bodyPartData.dy !== undefined) ? parseInt(bodyPartData.dy) || 0 : 0;
                                bodyPartMap.set(bodyPartId, { x: dx, y: dy });
                            }
                        }
                    }
                }

                this._offsetFrames.push(frameId);

                let repeats: number = parseInt(frameData.repeats) || 0;

                if(repeats > 1)
                {
                    while(--repeats > 0)
                    {
                        this._offsetFrames.push(frameId);
                    }
                }
            }
        }
    }

    /**
     * Gets the animation action part for a given set type.
     *
     * @param setType - The set type identifier
     * @returns The matching action part, or null if not found
     */
    public getPart(setType: string): AnimationActionPart | null
    {
        return this._parts.get(setType) ?? null;
    }

    public get id(): string
    {
        return this._id;
    }

    public get parts(): Map<string, AnimationActionPart>
    {
        return this._parts;
    }

    public get frameCount(): number
    {
        return this._frameCount;
    }

    /**
     * Gets the body part offset for a given direction, frame index, and body part.
     *
     * @param direction - The avatar direction
     * @param frameIndex - The animation frame index
     * @param bodyPartId - The body part identifier
     * @returns The offset point, or the default (0, 0) if not found
     */
    public getFrameBodyPartOffset(direction: number, frameIndex: number, bodyPartId: string): { x: number; y: number }
    {
        if(this._offsetFrames.length === 0)
        {
            return AnimationAction.DEFAULT_OFFSET;
        }

        const normalizedIndex: number = frameIndex % this._offsetFrames.length;
        const frameId: number = this._offsetFrames[normalizedIndex];

        const directionMap = this._offsets.get(frameId);

        if(directionMap)
        {
            const bodyPartMap = directionMap.get(direction);

            if(bodyPartMap)
            {
                const offset = bodyPartMap.get(bodyPartId);

                if(offset)
                {
                    return offset;
                }
            }
        }

        return AnimationAction.DEFAULT_OFFSET;
    }
}
