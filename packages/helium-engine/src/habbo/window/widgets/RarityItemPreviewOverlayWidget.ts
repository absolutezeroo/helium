import type {IRarityItemPreviewOverlayWidget} from './IRarityItemPreviewOverlayWidget';
import type {IWidgetProperty} from './IWidget';

/**
 * Rarity item preview overlay widget.
 *
 * Displays the rarity level as text in preview/catalog views.
 *
 * @see sources/win63_version/habbo/window/widgets/RarityItemPreviewOverlayWidget.as
 */
export class RarityItemPreviewOverlayWidget implements IRarityItemPreviewOverlayWidget
{
	public static readonly TYPE: string = 'rarity_item_overlay_preview';

	private static readonly RARITY_LEVEL_KEY: string = 'rarity_item_overlay_preview:level';

	constructor()
	{
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _rarityLevel: number = 0;

	public get rarityLevel(): number
	{
		return this._rarityLevel;
	}

	public set rarityLevel(value: number)
	{
		this._rarityLevel = value;
	}

	public get properties(): IWidgetProperty[]
	{
		if (this._disposed) return [];

		return [
			{key: RarityItemPreviewOverlayWidget.RARITY_LEVEL_KEY, value: this._rarityLevel, type: 'int'},
		];
	}

	public setProperties(values: IWidgetProperty[]): void
	{
		for (const prop of values)
		{
			if (prop.key === RarityItemPreviewOverlayWidget.RARITY_LEVEL_KEY)
			{
				this.rarityLevel = Number(prop.value);
			}
		}
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}

