import type { IAvatarDataContainer } from './animation/IAvatarDataContainer';
import type { IAnimationLayerData } from './animation/IAnimationLayerData';
import type { ISpriteDataContainer } from './animation/ISpriteDataContainer';
import type { IAvatarFigureContainer } from './IAvatarFigureContainer';
import type { IPartColor } from './structure/figure/IPartColor';

/**
 * Interface for avatar images that can be rendered.
 *
 * @see sources/win63_version/habbo/avatar/class_3374.as (IAvatarImage)
 */
export interface IAvatarImage
{
    getCroppedImage(setType: string, scale?: number): any;
    getImage(setType: string, hightlight: boolean, scale?: number): any;
    getServerRenderData(): any[];
    setDirection(setType: string, direction: number): void;
    setDirectionAngle(setType: string, angle: number): void;
    updateAnimationByFrames(frames?: number): void;
    getScale(): string;
    getSprites(): ISpriteDataContainer[];
    getLayerData(sprite: ISpriteDataContainer): IAnimationLayerData | null;
    getAsset(name: string): any;
    getDirection(): number;
    getFigure(): IAvatarFigureContainer;
    getPartColor(partType: string): IPartColor | null;
    isAnimating(): boolean;
    getCanvasOffsets(): number[];
    initActionAppends(): void;
    endActionAppends(): void;
    appendAction(actionType: string, ...args: any[]): boolean;
    readonly avatarSpriteData: IAvatarDataContainer | null;
    isPlaceholder(): boolean;
    forceActionUpdate(): void;
    readonly animationHasResetOnToggle: boolean;
    resetAnimationFrameCounter(): void;
    readonly mainAction: string;
    disposeInactiveActionCache(): void;
    disposed?: boolean;
    dispose(): void;
}
