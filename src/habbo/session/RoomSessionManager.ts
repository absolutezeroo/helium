import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext, IID_HabboCommunicationManager} from '@core/runtime';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IRoomSessionManager} from './IRoomSessionManager';
import type {IRoomSession} from './IRoomSession';
import {RoomSessionState} from './IRoomSession';
import {RoomSession} from './RoomSession';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('RoomSessionManager');

/**
 * Room session event types
 */
export const RoomSessionEvent = {
	CREATED: 'RSE_CREATED',
	STARTED: 'RSE_STARTED',
	ENDED: 'RSE_ENDED',
} as const;

/**
 * Room session manager implementation
 *
 * Based on AS3: com.sulake.habbo.session.RoomSessionManager
 *
 * Manages room sessions lifecycle. When gotoRoom() is called:
 * 1. Creates a new RoomSession
 * 2. Emits RSE_CREATED event
 * 3. Calls startSession() which calls session.start()
 * 4. session.start() sends OpenFlatConnectionMessageComposer
 * 5. Emits RSE_STARTED event
 */
export class RoomSessionManager extends Component implements IRoomSessionManager
{
	private _communication: IHabboCommunicationManager | null = null;
	private _sessions: Map<string, RoomSession> = new Map();
	private _pendingSession: RoomSession | null = null;

	constructor(context: IContext)
	{
		super(context);
	}

	private _events: EventEmitter = new EventEmitter();

	get events(): EventEmitter
	{
		return this._events;
	}

	private _sessionStarting: boolean = false;

	get sessionStarting(): boolean
	{
		return this._sessionStarting;
	}

	protected override get dependencies(): ComponentDependency<unknown>[]
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
		];
	}

	/**
	 * Go to a room - creates and starts a new room session
	 */
	gotoRoom(roomId: number, password: string = ''): boolean
	{
		const session = new RoomSession();
		session.roomId = roomId;
		session.roomPassword = password;

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
			this._events.emit(RoomSessionEvent.STARTED, session);

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
			this._events.emit(RoomSessionEvent.ENDED, session, disposeEngine);

			session.dispose();

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

		this._events.emit(RoomSessionEvent.CREATED, session);

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

	override dispose(): void
	{
		if (this.disposed) return;

		// Dispose all sessions
		for (const [key, session] of this._sessions)
		{
			session.dispose();
			this._sessions.delete(key);
		}

		this._events.removeAllListeners();

		super.dispose();

		log.info('RoomSessionManager disposed');
	}

	protected override initComponent(): void
	{
		log.info('RoomSessionManager initialized');
	}

	private createSession(session: RoomSession): boolean
	{
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

		this._events.emit(RoomSessionEvent.CREATED, session);

		log.info(`Room session created: ${session.roomId}`);

		// Start the session immediately
		this.startSession(session);

		return true;
	}

	private getRoomIdentifier(roomId: number): string
	{
		// AS3 uses a hardcoded key, we'll use room ID for flexibility
		return `room_${roomId}`;
	}
}
