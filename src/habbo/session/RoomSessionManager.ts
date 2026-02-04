import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext, IID_HabboCommunicationManager} from '@core/runtime';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IRoomSessionManager} from './IRoomSessionManager';
import type {IRoomHandlerListener} from './IRoomHandlerListener';
import type {IRoomSession} from './IRoomSession';
import {RoomSessionState} from './IRoomSession';
import {RoomSession} from './RoomSession';
import {RoomSessionEvent} from './events/RoomSessionEvent';
import {BaseHandler} from './handler/BaseHandler';
import {RoomSessionHandler, RoomSessionHandlerState} from './handler/RoomSessionHandler';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('RoomSessionManager');

/**
 * Room session manager implementation
 *
 * Based on AS3: com.sulake.habbo.session.RoomSessionManager
 *
 * Implements both IRoomSessionManager and IRoomHandlerListener.
 * Creates handlers that listen to messages and call back via IRoomHandlerListener.
 *
 * Room entry flow:
 * 1. gotoRoom() creates RoomSession
 * 2. createSession() stores session, emits RSE_CREATED
 * 3. startSession() calls session.start() which sends OpenFlatConnectionMessageComposer
 * 4. Server responds with OpenConnectionMessageEvent -> onRoomConnected
 * 5. Server responds with RoomReadyMessageEvent -> onRoomReady -> sessionUpdate(RS_READY)
 */
export class RoomSessionManager extends Component implements IRoomSessionManager, IRoomHandlerListener
{
	private _communication: IHabboCommunicationManager | null = null;
	private _handlers: BaseHandler[] = [];
	private _sessions: Map<string, RoomSession> = new Map();
	private _pendingSession: RoomSession | null = null;

	constructor(context: IContext)
	{
		super(context);
	}

	private _sessionStarting: boolean = false;

	get sessionStarting(): boolean
	{
		return this._sessionStarting;
	}

	private _initialized: boolean = false;
	private _sessionEvents: EventEmitter = new EventEmitter();

	// ========== IRoomSessionManager ==========

	/**
	 * Whether the manager is fully initialized
	 * In AS3 this also checks room engine initialization
	 */
	get initialized(): boolean
	{
		return this._initialized && this.allRequiredDependenciesInjected;
	}

	get events(): EventEmitter
	{
		return this._sessionEvents;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			// TODO: Add IRoomEngine dependency with event listener for REE_ENGINE_INITIALIZED
		];
	}

	/**
	 * Go to a room - creates and starts a new room session
	 */
	gotoRoom(roomId: number, password: string = '', _roomResources: string = ''): boolean
	{
		const session = new RoomSession();
		session.roomId = roomId;
		session.roomPassword = password;
		// session.roomResources = roomResources; // TODO: Add to RoomSession

		return this.createSession(session);
	}

	/**
	 * Go to a room via network (for room forwarding)
	 */
	gotoRoomNetwork(roomId: number, _homeRoomId: number): boolean
	{
		const session = new RoomSession();
		session.roomId = 1;
		session.roomPassword = '';
		// session.openConnectionComposer = new RoomNetworkOpenConnectionMessageComposer(roomId, homeRoomId);

		return this.createSession(session);
	}

	/**
	 * Start an existing session
	 */
	startSession(session: IRoomSession): boolean
	{
		if (session.state === RoomSessionState.STARTED)
		{
			return false;
		}

		if ((session as RoomSession).isGameSession)
		{
			return true;
		}

		if (session.start())
		{
			this._sessionStarting = false;
			this._sessionEvents.emit(RoomSessionEvent.RSE_STARTED, new RoomSessionEvent(RoomSessionEvent.RSE_STARTED, session));
			this.updateHandlers(session);

			log.info(`Room session started: ${session.roomId}`);

			return true;
		}

		this.disposeSession(session.roomId);
		this._sessionStarting = false;

		return false;
	}

	/**
	 * Get an active session by room ID
	 */
	getSession(roomId: number): IRoomSession | null
	{
		const key = this.getRoomIdentifier(roomId);
		return this._sessions.get(key) ?? null;
	}

	/**
	 * Dispose a session
	 */
	disposeSession(roomId: number, disposeEngine: boolean = true): void
	{
		const key = this.getRoomIdentifier(roomId);
		const session = this._sessions.get(key);

		if (session)
		{
			this._sessions.delete(key);
			this._sessionEvents.emit(RoomSessionEvent.RSE_ENDED, new RoomSessionEvent(RoomSessionEvent.RSE_ENDED, session), disposeEngine);

			session.dispose();

			// TODO: roomEngine.purgeRoomContent()

			log.info(`Room session disposed: ${roomId}`);
		}
	}

	/**
	 * Start a game session
	 */
	startGameSession(): void
	{
		const session = new RoomSession();
		session.roomId = 1;
		session.isGameSession = true;

		if (this._communication?.connection)
		{
			session.connection = this._communication.connection;
		}

		const key = this.getRoomIdentifier(session.roomId);
		this._sessions.set(key, session);

		this._sessionEvents.emit(RoomSessionEvent.RSE_CREATED, new RoomSessionEvent(RoomSessionEvent.RSE_CREATED, session));

		log.info('Game session started');
	}

	/**
	 * Dispose the game session
	 */
	disposeGameSession(): void
	{
		const key = this.getRoomIdentifier(1);
		const session = this._sessions.get(key);

		if (session && session.isGameSession)
		{
			this.disposeSession(1, false);
		}
	}

	// ========== IRoomHandlerListener ==========

	/**
	 * Called by handlers when session state changes
	 */
	sessionUpdate(roomId: number, type: string): void
	{
		const session = this.getSession(roomId);

		if (session !== null)
		{
			switch (type)
			{
				case RoomSessionHandlerState.RS_CONNECTED:
				case RoomSessionHandlerState.RS_READY:
					// Session connected/ready - no action needed
					break;
				case RoomSessionHandlerState.RS_DISCONNECTED:
					this.disposeSession(roomId);
					break;
			}
		}

		log.debug(`Session update: room=${roomId}, type=${type}`);
	}

	/**
	 * Called by handlers when session needs reinitialization
	 */
	sessionReinitialize(oldRoomId: number, newRoomId: number): void
	{
		const oldKey = this.getRoomIdentifier(oldRoomId);
		const session = this._sessions.get(oldKey);

		if (session)
		{
			this._sessions.delete(oldKey);
			session.reset(newRoomId);

			const newKey = this.getRoomIdentifier(newRoomId);

			// Remove any existing session at new key
			const existingSession = this._sessions.get(newKey);
			if (existingSession)
			{
				existingSession.dispose();
			}

			this._sessions.set(newKey, session);
			this.updateHandlers(session);
		}

		log.debug(`Session reinitialize: ${oldRoomId} -> ${newRoomId}`);
	}

	// ========== Component Lifecycle ==========

	override dispose(): void
	{
		if (this.disposed) return;

		// Dispose all sessions
		for (const [key, session] of this._sessions)
		{
			session.dispose();
			this._sessions.delete(key);
		}

		// Dispose all handlers
		for (const handler of this._handlers)
		{
			handler.dispose();
		}
		this._handlers = [];

		this._sessionEvents.removeAllListeners();

		super.dispose();

		log.info('RoomSessionManager disposed');
	}

	protected override initComponent(): void
	{
		this.createHandlers();
		this._initialized = true;
		this.executePendingSessionRequest();

		log.info('RoomSessionManager initialized');
	}

	// ========== Private Methods ==========

	private createHandlers(): void
	{
		if (!this._communication)
		{
			return;
		}

		const connection = this._communication.connection;

		// Create handlers - they register message events on construction
		this._handlers.push(new RoomSessionHandler(connection, this));
		// TODO: Add other handlers as they are implemented
		// this._handlers.push(new RoomChatHandler(connection, this));
		// this._handlers.push(new RoomUsersHandler(connection, this));
		// this._handlers.push(new RoomPermissionsHandler(connection, this));
		// this._handlers.push(new RoomDataHandler(connection, this));

		log.debug(`Created ${this._handlers.length} handlers`);
	}

	private createSession(session: RoomSession): boolean
	{
		if (!this.initialized)
		{
			log.debug(`Not initialized, creating pending session for room: ${session.roomId}`);
			this._pendingSession = session;
			return false;
		}

		const key = this.getRoomIdentifier(session.roomId);
		this._sessionStarting = true;

		// Dispose existing session for this room
		if (this._sessions.has(key))
		{
			this.disposeSession(session.roomId, false);
		}

		// Set connection
		if (this._communication?.connection)
		{
			session.connection = this._communication.connection;
		}

		this._sessions.set(key, session);

		this._sessionEvents.emit(RoomSessionEvent.RSE_CREATED, new RoomSessionEvent(RoomSessionEvent.RSE_CREATED, session));

		log.info(`Room session created: ${session.roomId}`);

		// Start the session
		this.startSession(session);

		return true;
	}

	private executePendingSessionRequest(): void
	{
		if (this.initialized && this._pendingSession !== null)
		{
			this.createSession(this._pendingSession);
			this._pendingSession = null;
		}
	}

	private updateHandlers(session: IRoomSession): void
	{
		if (session !== null && this._handlers !== null)
		{
			for (const handler of this._handlers)
			{
				if (handler !== null)
				{
					handler.roomId = session.roomId;
				}
			}
		}
	}

	private getRoomIdentifier(roomId: number): string
	{
		// AS3 uses a hardcoded key, we'll use room ID for flexibility
		return `room_${roomId}`;
	}
}
