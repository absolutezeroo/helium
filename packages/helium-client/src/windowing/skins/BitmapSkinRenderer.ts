import type { IWindow } from '../interfaces/IWindow';
import type { CompiledSkin, CompiledSkinState } from '../types/Skin';
import { getSkinImage } from './SkinAssets';
import { SkinLayout, SkinTemplate } from './SkinModels';
import { SkinRenderer } from './SkinRenderer';

const STATE_NAME_TO_VALUE: Record<string, number> =
{
    active: 1,
    default: 0,
    focused: 2,
    disabled: 32,
    hovering: 4,
    pressed: 16,
    selected: 8,
    locked: 64
};

export class BitmapSkinRenderer extends SkinRenderer
{
    private readonly _tintCanvas: HTMLCanvasElement | null;
    private readonly _tintContext: CanvasRenderingContext2D | null;

    public constructor(name: string)
    {
        super(name);
        this._tintCanvas = typeof document === 'undefined' ? null : document.createElement('canvas');
        this._tintContext = this._tintCanvas ? this._tintCanvas.getContext('2d') : null;
    }

    public loadSkinDefinition(skin: CompiledSkin, statesOverride: CompiledSkinState[] | null, layoutFilter?: string): void
    {
        const layouts = layoutFilter
            ? skin.layouts.filter((layout) => layout.name === layoutFilter)
            : skin.layouts;

        layouts.forEach((layout) =>
        {
            this.addLayout(new SkinLayout(layout));
        });

        skin.templates.forEach((template) =>
        {
            this.addTemplate(new SkinTemplate(template));
        });

        const states = statesOverride && statesOverride.length > 0 ? statesOverride : skin.states;
        states.forEach((state) =>
        {
            if (layoutFilter && state.layout !== layoutFilter)
            {
                return;
            }

            const stateValue = STATE_NAME_TO_VALUE[state.name] ?? 0;
            this.registerLayoutForRenderState(stateValue, state.layout);
            this.registerTemplateForRenderState(stateValue, state.template);
        });
    }

    public draw(window: IWindow, canvas: HTMLCanvasElement, state: number, requestRedraw?: () => void): void
    {
        const layout = this.getLayoutByState(state) ?? this.getLayoutByState(0);
        const template = this.getTemplateByState(state) ?? this.getTemplateByState(0);

        if (!layout || !template)
        {
            return;
        }

        const image = getSkinImage(template.asset, requestRedraw);
        if (!image || !image.complete || image.naturalWidth === 0)
        {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx)
        {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = window.blend ?? 1;

        const diffX = window.width - layout.width;
        const diffY = window.height - layout.height;
        const tintColor = !window.background && (window.color & 0xffffff) < 0xffffff
            ? window.color & 0xffffff
            : null;

        layout.entities.forEach((entity) =>
        {
            const templateEntity = template.getEntity(entity.name);
            if (!templateEntity)
            {
                return;
            }

            let destX = entity.region.x;
            let destY = entity.region.y;
            let destW = entity.region.width;
            let destH = entity.region.height;
            const src = templateEntity.region;

            let tileX = false;
            let tileY = false;

            switch (entity.scaleH)
            {
                case 1:
                    destX += diffX;
                    break;
                case 2:
                    destW += diffX;
                    break;
                case 4:
                    destW += diffX;
                    tileX = true;
                    break;
                case 8:
                    destX = window.width / 2 - destW / 2;
                    break;
            }

            switch (entity.scaleV)
            {
                case 1:
                    destY += diffY;
                    break;
                case 2:
                    destH += diffY;
                    break;
                case 4:
                    destH += diffY;
                    tileY = true;
                    break;
                case 8:
                    destY = window.height / 2 - destH / 2;
                    break;
            }

            if (destW <= 0 || destH <= 0)
            {
                return;
            }

            if (templateEntity.type === 'fill')
            {
                ctx.fillStyle = `#${entity.color.toString(16).padStart(6, '0')}`;
                ctx.fillRect(destX, destY, destW, destH);
                return;
            }

            if (templateEntity.type !== 'bitmap')
            {
                return;
            }

            if (!tileX && !tileY)
            {
                this.drawImage(ctx, image, src.x, src.y, src.width, src.height, destX, destY, destW, destH, tintColor, entity.colorize);
                return;
            }

            const stepX = tileX ? src.width : destW;
            const stepY = tileY ? src.height : destH;

            for (let x = 0; x < destW; x += stepX)
            {
                const drawW = tileX ? Math.min(stepX, destW - x) : destW;
                const srcW = tileX ? drawW : src.width;

                for (let y = 0; y < destH; y += stepY)
                {
                    const drawH = tileY ? Math.min(stepY, destH - y) : destH;
                    const srcH = tileY ? drawH : src.height;

                    this.drawImage(
                        ctx,
                        image,
                        src.x,
                        src.y,
                        srcW,
                        srcH,
                        destX + x,
                        destY + y,
                        drawW,
                        drawH,
                        tintColor,
                        entity.colorize
                    );
                }
            }
        });

        ctx.globalAlpha = 1;
    }

    private drawImage(
        ctx: CanvasRenderingContext2D,
        image: HTMLImageElement,
        srcX: number,
        srcY: number,
        srcW: number,
        srcH: number,
        destX: number,
        destY: number,
        destW: number,
        destH: number,
        tintColor: number | null,
        colorize: boolean
    ): void
    {
        if (!tintColor || !colorize || !this._tintCanvas || !this._tintContext)
        {
            ctx.drawImage(image, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
            return;
        }

        this._tintCanvas.width = srcW;
        this._tintCanvas.height = srcH;
        this._tintContext.clearRect(0, 0, srcW, srcH);
        this._tintContext.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
        this._tintContext.globalCompositeOperation = 'multiply';
        this._tintContext.fillStyle = `#${tintColor.toString(16).padStart(6, '0')}`;
        this._tintContext.fillRect(0, 0, srcW, srcH);
        this._tintContext.globalCompositeOperation = 'destination-in';
        this._tintContext.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
        this._tintContext.globalCompositeOperation = 'source-over';
        ctx.drawImage(this._tintCanvas, 0, 0, srcW, srcH, destX, destY, destW, destH);
    }
}
