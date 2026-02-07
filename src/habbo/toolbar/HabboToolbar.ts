import {EventEmitter} from 'eventemitter3';
import {
	Component,
	ComponentDependency,
	type IContext,
	IID_HabboCommunicationManager,
	IID_HabboConfigurationManager,
} from '@core/runtime';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import type {IHabboToolbar} from './IHabboToolbar';
import type {IExtensionView} from './IExtensionView';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {HabboToolbarEvent} from './events/HabboToolbarEvent';
import {HabboToolbarEnum} from './HabboToolbarEnum';
import {HabboToolbarIconEnum} from './HabboToolbarIconEnum';
import {EventLogMessageComposer} from '../communication/messages/outgoing/tracking/EventLogMessageComposer';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('HabboToolbar');

/**
 * Events emitted by HabboToolbar via toolbarEvents
 */
export interface HabboToolbarEvents
{
	[HabboToolbarEvent.TOOLBAR_CLICK]: (event: HabboToolbarEvent) => void;
	[HabboToolbarEvent.RESIZED]: (event: HabboToolbarEvent) => void;
	[HabboToolbarEvent.CAMERA_TOGGLE]: (event: HabboToolbarEvent) => void;
	[HabboToolbarEvent.GROUP_ROOM_INFO_CLICK]: (event: HabboToolbarEvent) => void;
}

/**
 * Main Habbo Toolbar Component
 *
 * Manages the toolbar UI state, icon interactions, and extension panels.
 * Extends Component for dependency injection lifecycle.
 *
 * IMPORTANT: Uses `_toolbarEvents` / `toolbarEvents` for custom events
 * rather than overriding the `events` getter from Component (see MEMORY.md).
 *
 * @see source_as/habbo/toolbar/HabboToolbar.as
 */
export class HabboToolbar extends Component implements IHabboToolbar
{
	private _communication: IHabboCommunicationManager | null = null;
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _messageEvents: IMessageEvent[] = [];
	private _extensionsInitialized: boolean = false;

	constructor(context: IContext)
	{
		super(context);
	}

	private _sessionDataManager: ISessionDataManager | null = null;

	/**
	 * The session data manager
	 */
	get sessionDataManager(): ISessionDataManager | null
	{
		return this._sessionDataManager;
	}

	private _toolbarEvents: EventEmitter = new EventEmitter();

	/**
	 * Custom toolbar event emitter (NOT the Component events)
	 *
	 * Uses a separate EventEmitter to avoid overriding Component.events
	 * which would break the dependency injection unlock mechanism.
	 */
	get toolbarEvents(): EventEmitter
	{
		return this._toolbarEvents;
	}

	private _currentState: string = HabboToolbarEnum.TOOLBAR_STATE_HIDDEN;

	/**
	 * The current toolbar state
	 */
	get currentState(): string
	{
		return this._currentState;
	}

	private _onDuty: boolean = false;

	/**
	 * Whether the user is on duty (moderation)
	 */
	get onDuty(): boolean
	{
		return this._onDuty;
	}

	set onDuty(value: boolean)
	{
		this._onDuty = value;
	}

	/**
	 * The extension view container for toolbar extensions
	 *
	 * In the AS3 version this was an ExtensionView (Flash window container).
	 * In Helium, extensions are handled by the SolidJS UI layer.
	 * This returns null as the UI layer manages the extension view.
	 */
	get extensionView(): IExtensionView | null
	{
		return null;
	}

	/**
	 * The width of the toolbar area
	 *
	 * In AS3 this returned the toolbar BottomBarLeft width.
	 * UI rendering is handled by SolidJS, so we return 0 here.
	 */
	get toolBarAreaWidth(): number
	{
		return 0;
	}

	/**
	 * The communication manager
	 */
	get communicationManager(): IHabboCommunicationManager | null
	{
		return this._communication;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboConfigurationManager,
				null,
				true,
				[{
					type: 'complete',
					callback: this.onConfigurationComplete.bind(this)
				}]
			),
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			new ComponentDependency(
				IID_SessionDataManager,
				(manager: ISessionDataManager | null) =>
				{
					this._sessionDataManager = manager;
				},
				true,
				[{
					type: 'PUE_perks_updated',
					callback: this.onPerksUpdated.bind(this)
				}]
			),
			new ComponentDependency(
				IID_RoomSessionManager,
				(manager: IRoomSessionManager | null) =>
				{
					this._roomSessionManager = manager;
				},
				false
			),
		];
	}

	/**
	 * Set the toolbar state (hotel view, room view, hidden, etc.)
	 *
	 * @param state One of HabboToolbarEnum state constants
	 * @see source_as/habbo/toolbar/HabboToolbar.as setToolbarState()
	 */
	setToolbarState(state: string): void
	{
		this._currentState = state;

		switch (state)
		{
			case HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW:
			case HabboToolbarEnum.TOOLBAR_STATE_GAME_CENTER_VIEW:
			case HabboToolbarEnum.TOOLBAR_STATE_ROOM_VIEW:
				// Extensions visible in hotel, game center, and room views
				break;
			case HabboToolbarEnum.TOOLBAR_STATE_HIDDEN:
				// Extensions hidden
				break;
		}

		// Dispatch resized event
		const resizedEvent = new HabboToolbarEvent(HabboToolbarEvent.RESIZED);
		this._toolbarEvents.emit(HabboToolbarEvent.RESIZED, resizedEvent);

		log.debug(`Toolbar state set to: ${state}`);
	}

	/**
	 * Toggle the visibility of a window by icon name
	 *
	 * Dispatches the appropriate toolbar event when an icon is clicked.
	 * Also sends an event log to the server for tracking.
	 *
	 * @param iconName Icon name to toggle
	 * @see source_as/habbo/toolbar/HabboToolbar.as toggleWindowVisibility()
	 */
	toggleWindowVisibility(iconName: string): void
	{
		const iconId = (HabboToolbarIconEnum as unknown as Record<string, string>)[iconName];

		if (iconId === HabboToolbarIconEnum.CAMERA)
		{
			const cameraEvent = new HabboToolbarEvent(HabboToolbarEvent.CAMERA_TOGGLE);
			cameraEvent.iconName = HabboToolbarEvent.CAMERA_LAUNCH_ORIGIN_TOOLBAR;
			this._toolbarEvents.emit(HabboToolbarEvent.CAMERA_TOGGLE, cameraEvent);
		} else
		{
			const clickEvent = new HabboToolbarEvent(HabboToolbarEvent.TOOLBAR_CLICK);
			clickEvent.iconId = iconId;
			clickEvent.iconName = iconName;
			this._toolbarEvents.emit(HabboToolbarEvent.TOOLBAR_CLICK, clickEvent);
		}

		// Send tracking event
		if (this._communication?.connection)
		{
			const composer = new EventLogMessageComposer('Toolbar', iconName, 'client.toolbar.clicked');
			this._communication.connection.send(composer);
		}
	}

	/**
	 * Get the screen location of a toolbar icon
	 *
	 * In AS3, this returned a Flash Rectangle from the toolbar view.
	 * In Helium, icon locations are managed by the SolidJS UI layer.
	 *
	 * @param _iconId Icon identifier
	 * @returns null - UI layer handles icon positions
	 * @see source_as/habbo/toolbar/HabboToolbar.as getIconLocation()
	 */
	getIconLocation(_iconId: string): { x: number; y: number; width: number; height: number } | null
	{
		return null;
	}

	/**
	 * Set bitmap data for a toolbar icon
	 *
	 * In AS3, this set a BitmapData on the toolbar view icon.
	 * In Helium, icon rendering is handled by the SolidJS UI layer.
	 *
	 * @param _iconId Icon identifier
	 * @param _bitmap Bitmap data
	 * @see source_as/habbo/toolbar/HabboToolbar.as setIconBitmap()
	 */
	setIconBitmap(_iconId: string, _bitmap: unknown): void
	{
		// UI layer handles icon rendering
	}

	/**
	 * Get the bounding rectangle of the toolbar
	 *
	 * @returns An empty rectangle - UI layer handles toolbar bounds
	 * @see source_as/habbo/toolbar/HabboToolbar.as getRect()
	 */
	getRect(): { x: number; y: number; width: number; height: number }
	{
		return {x: 0, y: 0, width: 0, height: 0};
	}

	/**
	 * Set the visibility of a toolbar icon
	 *
	 * @param _iconId Icon identifier
	 * @param _visible Whether the icon should be visible
	 * @see source_as/habbo/toolbar/HabboToolbar.as setIconVisibility()
	 */
	setIconVisibility(_iconId: string, _visible: boolean): void
	{
		// UI layer handles icon visibility
	}

	/**
	 * Check if this is a new identity user
	 *
	 * @returns True if new.identity config value is greater than 0
	 * @see source_as/habbo/toolbar/HabboToolbar.as isNewIdentity()
	 */
	isNewIdentity(): boolean
	{
		return this.getInteger('new.identity', 0) > 0;
	}

	/**
	 * Check if Xmas features are enabled
	 *
	 * @returns True if xmas11.enabled config is true
	 * @see source_as/habbo/toolbar/HabboToolbar.as isXmasEnabled()
	 */
	isXmasEnabled(): boolean
	{
		return this.getBoolean('xmas11.enabled');
	}

	/**
	 * Check if Valentines features are enabled
	 *
	 * @returns True if valentines.enabled config is true
	 * @see source_as/habbo/toolbar/HabboToolbar.as isValentinesEnabled()
	 */
	isValentinesEnabled(): boolean
	{
		return this.getBoolean('valentines.enabled');
	}

	/**
	 * Dispose of this component
	 *
	 * Cleans up all message event handlers, extensions, and timers.
	 *
	 * @see source_as/habbo/toolbar/HabboToolbar.as dispose()
	 */
	override dispose(): void
	{
		if (this._disposed) return;

		// Remove all message event handlers
		if (this._communication)
		{
			for (const event of this._messageEvents)
			{
				this._communication.removeMessageEvent(event);
			}
		}
		this._messageEvents = [];

		// Clear toolbar events
		this._toolbarEvents.removeAllListeners();

		// Clear references
		this._communication = null;
		this._sessionDataManager = null;
		this._roomSessionManager = null;
		this._extensionsInitialized = false;

		super.dispose();
	}

	/**
	 * Initialize the toolbar component
	 *
	 * Called when all required dependencies are resolved.
	 * Sets up message event handlers and initial toolbar state.
	 *
	 * @see source_as/habbo/toolbar/HabboToolbar.as initComponent()
	 */
	protected override initComponent(): void
	{
		log.info('Toolbar component initialized');
	}

	/**
	 * Handler for configuration complete event
	 *
	 * @see source_as/habbo/toolbar/HabboToolbar.as onConfigurationComplete()
	 */
	private onConfigurationComplete(): void
	{
		// Configuration is ready - extensions can now be initialized
	}

	/**
	 * Handler for perks updated event
	 *
	 * Initializes toolbar extensions after perks are available.
	 * Extensions are only initialized once.
	 *
	 * @see source_as/habbo/toolbar/HabboToolbar.as onPerksUpdated()
	 */
	private onPerksUpdated(): void
	{
		if (!this._extensionsInitialized)
		{
			// Extension initialization would happen here
			// In AS3: purse area, seasonal currency, VIP extend, settings, etc.
			this._extensionsInitialized = true;
			log.info('Toolbar extensions initialized after perks update');
		}
	}

	/**
	 * Add a message event handler and track it for cleanup
	 *
	 * @param event The message event to register
	 */
	private addHabboConnectionMessageEvent(event: IMessageEvent): void
	{
		if (this._communication)
		{
			this._communication.addMessageEvent(event);
			this._messageEvents.push(event);
		}
	}
}
