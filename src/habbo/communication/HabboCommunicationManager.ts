import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {ArcFour} from '@habbo/communication/encryption/ArcFour';
import {DiffieHellman} from '@habbo/communication/encryption/DiffieHellman';
import {Logger} from '@core/utils/Logger';
import {HabboMessages} from './HabboMessages';
import {SessionDataManager} from '../session/SessionDataManager';
import {HabboCommunicationEvent, HabboCommunicationEventType} from './enum/HabboCommunicationEvent';
import type {IHabboCommunicationManager} from './IHabboCommunicationManager';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IConnectionCallback} from '@core/communication/connection/IConnectionCallback';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageConfiguration} from '@core/communication/messages/IMessageConfiguration';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/handshake/IKeyExchange';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {ConnectionActions} from '@ui/stores/connectionStore';
import {IID_CoreCommunicationManager} from "@iid/IIDCoreCommunicationManager";

const log = Logger.getLogger('Communication');

export interface HabboConnectionConfig
{
	host: string;
	ports: number[];
	ssoTicket?: string;
}

/**
 * Habbo Communication Manager
 *
 * Based on AS3: com.sulake.habbo.communication.HabboCommunicationManager
 *
 * Uses Component.events as the central event dispatcher for communication-related
 * events like AUTHENTICATED, HANDSHAKED, etc.
 */
export class HabboCommunicationManager extends Component implements IHabboCommunicationManager, IConnectionCallback
{
	private messageConfig: IMessageConfiguration;
	private config: HabboConnectionConfig | null = null;
	private portIndex: number = -1;
	private connectionAttempt: number = 1;
	private maxConnectionAttempts: number = 2;
	private pendingMessageEvents: IMessageEvent[] = [];

	constructor(context: IContext)
	{
		super(context);
		this.messageConfig = new HabboMessages();
	}

	private _sessionDataManager: SessionDataManager | null = null;

	get sessionDataManager(): ISessionDataManager | null
	{
		return this._sessionDataManager;
	}

	private _connection: IConnection | null = null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	private _ssoTicket: string | null = null;

	get ssoTicket(): string | null
	{
		return this._ssoTicket;
	}

	set ssoTicket(value: string | null)
	{
		this._ssoTicket = value;
	}

	get isConnected(): boolean
	{
		return this._connection?.connected ?? false;
	}

	get messages(): IMessageConfiguration
	{
		return this.messageConfig;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_CoreCommunicationManager,
				(manager: ICoreCommunicationManager | null) =>
				{
					this._communicationManager = manager;
				},
				true
			),
		];
	}

	private _communicationManager: ICoreCommunicationManager | null = null;

	private get communicationManager(): ICoreCommunicationManager
	{
		if (!this._communicationManager)
		{
			throw new Error('CommunicationManager not available');
		}

		return this._communicationManager;
	}

	private _connectionActions: ConnectionActions | null = null;

	private get connectionActions(): ConnectionActions
	{
		if (!this._connectionActions)
		{
			throw new Error('Connection actions not set. Call setConnectionActions() first.');
		}

		return this._connectionActions;
	}

	/**
	 * Set connection actions for state updates
	 * Called by Helium after module registration
	 */
	setConnectionActions(actions: ConnectionActions): void
	{
		this._connectionActions = actions;
	}

	configure(config: HabboConnectionConfig): void
	{
		this.config = config;
		this._ssoTicket = config.ssoTicket || null;
	}

	initConnection(type: string): void
	{
		if (type !== 'habbo')
		{
			log.warn(`Unknown connection type: ${type}`);

			return;
		}

		if (!this.config)
		{
			throw new Error('Connection not configured. Call configure() first.');
		}

		if (!this._connection)
		{
			this._connection = this.communicationManager.createConnection(this);
			this._connection.registerMessageClasses(this.messageConfig);

			// Flush pending message events
			if (this.pendingMessageEvents.length > 0)
			{
				log.debug(`Flushing ${this.pendingMessageEvents.length} pending message events`);

				for (const event of this.pendingMessageEvents)
				{
					this._connection.addMessageEvent(event);
				}

				this.pendingMessageEvents = [];
			}
		}

		// Dispose previous SessionDataManager
		if (this._sessionDataManager)
		{
			this._sessionDataManager.dispose();
		}

		this._sessionDataManager = new SessionDataManager(this.context);

		this.portIndex = -1;
		this.connectionAttempt = 1;
		this.tryNextPort();
	}

	addMessageEvent(event: IMessageEvent): IMessageEvent
	{
		if (this._connection)
		{
			this._connection.addMessageEvent(event);
		}
		else
		{
			// Buffer events until connection is established
			this.pendingMessageEvents.push(event);
		}
		return event;
	}

	removeMessageEvent(event: IMessageEvent): void
	{
		if (this._connection)
		{
			this._connection.removeMessageEvent(event);
		}
		else
		{
			// Remove from pending events if not yet registered
			const index = this.pendingMessageEvents.indexOf(event);
			if (index !== -1)
			{
				this.pendingMessageEvents.splice(index, 1);
			}
		}
	}

	createEncryption(): IEncryption
	{
		return new ArcFour();
	}

	createKeyExchange(prime: string, generator: string): IKeyExchange
	{
		return new DiffieHellman(prime, generator);
	}

	disconnect(): void
	{
		this._connection?.close();
	}

	onMessage(listener: (event: IMessageEvent) => void): () => void
	{
		if (!this._connection)
		{
			// Buffer listener until connection is ready
			const bufferedListener = listener;
			const checkConnection = () =>
			{
				if (this._connection)
				{
					this._connection.on('messageEvent', bufferedListener);
				}
			};
			// Check on next tick in case connection is created soon
			setTimeout(checkConnection, 0);
			return () =>
			{
				this._connection?.off('messageEvent', bufferedListener);
			};
		}

		this._connection.on('messageEvent', listener);
		return () =>
		{
			this._connection?.off('messageEvent', listener);
		};
	}

	// IConnectionCallback
	connectionInit(host: string, port: number): void
	{
		log.info(`Connecting to ${host}:${port}...`);

		this.connectionActions.setConnecting();
	}

	connectionOpened(): void
	{
		log.success('Connected to server');

		this.connectionActions.setConnected();
	}

	connectionClosed(): void
	{
		log.info('Connection closed');

		this.connectionActions.setDisconnected();
	}

	connectionError(error: Error): void
	{
		log.error(`Connection error: ${error.message}`);
		// Only set error state if we've exhausted all retry attempts
		if (this.connectionAttempt >= this.maxConnectionAttempts &&
			this.portIndex >= (this.config?.ports.length ?? 0) - 1)
		{
			this.connectionActions.setError(error.message);
		}
		this.tryNextPort();
	}

	messageParseError(message: IMessageDataWrapper, error: Error): void
	{
		log.error(`Failed to parse message ${message.getMessageId()}: ${error.message}`);
	}

	protected override initComponent(): void
	{
		log.debug('HabboCommunicationManager initialized');

		// Forward loginStep events
		this.events.on('loginStep', (step: HabboCommunicationEventType) =>
		{
			this._connectionActions?.setLoginStep(step);

			if (step === HabboCommunicationEvent.AUTHENTICATED)
			{
				this._connectionActions?.setAuthenticated();
			}
		});
	}

	private tryNextPort(): void
	{
		if (!this._connection || !this.config) return;

		if (this._connection.connected) return;

		this.portIndex++;

		if (this.portIndex >= this.config.ports.length)
		{
			this.connectionAttempt++;

			if (this.connectionAttempt > this.maxConnectionAttempts)
			{
				log.failure('Failed to connect after all attempts');

				return;
			}

			this.portIndex = 0;
		}

		const port = this.config.ports[this.portIndex];

		this._connection.timeout = this.connectionAttempt * 10000;
		this._connection.init(this.config.host, port);
	}
}
