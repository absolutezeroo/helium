/**
 * HeliumCore configuration options
 */
export interface IHeliumCoreConfig
{
	/** Background color */
	background?: string;
	/** Element to resize to */
	resizeTo?: HTMLElement | Window;
	/** Enable antialiasing */
	antialias?: boolean;
	/** Pixel resolution */
	resolution?: number;
	/** Canvas container element */
	canvas?: HTMLElement;
}

export interface IHeliumCore extends IDisposable
{
	readonly context: ComponentContext;
	readonly application: Application<Renderer>;
	readonly assets: IAssetLibrary;
	readonly communication: ICoreCommunicationManager;
	readonly isReady: boolean;

	/**
	 * Initialize the core layer
	 */
	init(config?: IHeliumCoreConfig): Promise<void>;

	/**
	 * Main update loop - updates context and communication
	 */
	update(ticker: Ticker): void;
}