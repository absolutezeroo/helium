import {EventEmitter} from 'eventemitter3';
import {ByteArray} from '../util/ByteArray';
import {WireFormatter} from '../wireformat/WireFormatter';
import {MessageRegistry} from '../messages/MessageRegistry';
import {Logger} from '../../utils/Logger';
import type {IConnection} from './IConnection';
import type {IConnectionCallback} from './IConnectionCallback';
import type {IEncryption} from '../encryption/IEncryption';
import type {IMessageComposer} from '../messages/IMessageComposer';
import type {IMessageEvent} from '../messages/IMessageEvent';
import type {IMessageConfiguration} from '../messages/IMessageConfiguration';
import type {IWireFormatter} from '../wireformat/IWireFormatter';

const log = Logger.getLogger('Socket');

export interface IConnectionEvents
{
	connected: () => void;
	disconnected: () => void;
	error: (error: Error) => void;
	message: (messageId: number) => void;
	/**
	 * Emitted after a message is successfully parsed and before handlers are called
	 */
	messageEvent: (event: IMessageEvent) => void;
}

export class SocketConnection extends EventEmitter<IConnectionEvents> implements IConnection
{
	private socket: WebSocket | null = null;
	private receivedBuffer: ByteArray = new ByteArray();
	private pendingMessages: ByteArray[] = [];

	private clientToServerEncryption: IEncryption | null = null;
	private serverToClientEncryption: IEncryption | null = null;

	private messageRegistry: MessageRegistry = new MessageRegistry();
	private wireFormatter: IWireFormatter = new WireFormatter();
	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	private callback: IConnectionCallback | null;
	private host: string = '';
	private port: number = 0;

	constructor(callback?: IConnectionCallback)
	{
		super();
		this.callback = callback ?? null;
	}

	private _connected: boolean = false;

	get connected(): boolean
	{
		return this._connected;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _timeout: number = 10000;

	get timeout(): number
	{
		return this._timeout;
	}

	set timeout(value: number)
	{
		this._timeout = value;
	}

	public init(host: string, port: number = 0): boolean
	{
		if (this._disposed) return false;

		this.host = host;
		this.port = port;
		this.callback?.connectionInit?.(host, port);

		let url: string;
		if (host.startsWith('wss://') || host.startsWith('wss://'))
		{
			url = host;
		} else
		{
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			url = port > 0 ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
		}

		try
		{
			this.socket = new WebSocket(url);
			this.socket.binaryType = 'arraybuffer';
			this.setupEventListeners();
			this.startTimeout();
			return true;
		} catch (error)
		{
			log.error(`WebSocket error: ${(error as Error).message}`); // cast: type assertion required
			this.callback?.connectionError?.(error as Error);
			return false;
		}
	}

	public send(composer: IMessageComposer<unknown[]>): boolean
	{
		const messageId = this.messageRegistry.getMessageIdForComposer(composer);
		if (messageId < 0)
		{
			log.warn(`Unknown composer: ${composer.constructor.name}`);
			return false;
		}

		const encoded = this.wireFormatter.encode(messageId, composer.getMessageArray());

		if (this.clientToServerEncryption)
		{
			this.clientToServerEncryption.encipher(encoded);
		}

		return this.sendRaw(encoded, messageId);
	}

	public sendUnencrypted(composer: IMessageComposer<unknown[]>): boolean
	{
		const messageId = this.messageRegistry.getMessageIdForComposer(composer);
		if (messageId < 0)
		{
			log.warn(`Unknown composer: ${composer.constructor.name}`);
			return false;
		}

		const encoded = this.wireFormatter.encode(messageId, composer.getMessageArray());
		return this.sendRaw(encoded, messageId);
	}

	public setEncryption(clientToServer: IEncryption, serverToClient: IEncryption): void
	{
		this.clientToServerEncryption = clientToServer;
		this.serverToClientEncryption = serverToClient;
	}

	public getServerToClientEncryption(): IEncryption | null
	{
		return this.serverToClientEncryption;
	}

	public getClientToServerEncryption(): IEncryption | null
	{
		return this.clientToServerEncryption;
	}

	public registerMessageClasses(config: IMessageConfiguration): void
	{
		this.messageRegistry.registerMessages(config);
	}

	public addMessageEvent(event: IMessageEvent): void
	{
		this.messageRegistry.registerMessageEvent(event);
	}

	public removeMessageEvent(event: IMessageEvent): void
	{
		this.messageRegistry.unregisterMessageEvent(event);
	}

	public processReceivedData(): void
	{
		if (this.receivedBuffer.length === 0) return;

		this.receivedBuffer.position = 0;

		try
		{
			const messages = this.wireFormatter.splitMessages(this.receivedBuffer, this);

			for (const wrapper of messages)
			{
				const messageId = wrapper.getMessageId();
				const messageName = this.messageRegistry.getIncomingMessageName(messageId);

				this.callback?.messageReceived?.(messageId, messageName);

				this.emit('message', messageId);

				const events = this.messageRegistry.getMessageEventsForId(messageId);

				if (events && events.length > 0)
				{
					const parser = events[0].parser;

					if (parser)
					{
						try
						{
							parser.flush();

							if (parser.parse(wrapper))
							{
								for (const event of events)
								{
									event.connection = this;

									// Emit global event for MessageBus integration
									this.emit('messageEvent', event);

									try
									{
										event.callback(event);
									} catch (error)
									{
										log.error(`Handler error for ${messageId}: ${(error as Error).message}`); // cast: type assertion required
									}
								}
							}
						} catch (error)
						{
							log.error(`Parse error for ${messageId}: ${(error as Error).message}`); // cast: type assertion required
							this.callback?.messageParseError?.(wrapper, error as Error);
						}
					}
				}
			}
		} catch (error)
		{
			log.error(`Process error: ${(error as Error).message}`); // cast: type assertion required
		}
	}

	public close(): void
	{
		this.clearTimeout();

		if (this.socket)
		{
			if (this.socket.readyState === WebSocket.OPEN)
			{
				this.socket.close();
			}
			this.socket = null;
		}

		this._connected = false;
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this.close();
		this.receivedBuffer.clear();
		this.pendingMessages = [];
		this.messageRegistry.clear();
		this.wireFormatter.dispose();
		this.clientToServerEncryption = null;
		this.serverToClientEncryption = null;
		this.callback = null;
		this.removeAllListeners();

		this._disposed = true;
	}

	private setupEventListeners(): void
	{
		if (!this.socket) return;

		this.socket.onopen = () =>
		{
			this.clearTimeout();
			this._connected = true;
			this.callback?.connectionOpened?.();
			this.emit('connected');
			this.flushPendingMessages();
		};

		this.socket.onclose = () =>
		{
			this.clearTimeout();
			this._connected = false;
			this.callback?.connectionClosed?.();
			this.emit('disconnected');
		};

		this.socket.onerror = () =>
		{
			const error = new Error('WebSocket error');
			this.callback?.connectionError?.(error);
			this.emit('error', error);
		};

		this.socket.onmessage = (event) =>
		{
			if (!event.data) return;

			if (event.data instanceof Blob)
			{
				const reader = new FileReader();
				reader.readAsArrayBuffer(event.data);
				reader.onloadend = () =>
				{
					this.onDataReceived(reader.result as ArrayBuffer); // cast: type assertion required
				};
			} else if (event.data instanceof ArrayBuffer)
			{
				this.onDataReceived(event.data);
			}
		};
	}

	private onDataReceived(data: ArrayBuffer): void
	{
		const bytes = ByteArray.fromArrayBuffer(data);
		const oldPosition = this.receivedBuffer.position;
		this.receivedBuffer.position = this.receivedBuffer.length;
		this.receivedBuffer.writeBytes(bytes);
		this.receivedBuffer.position = oldPosition;
	}

	private startTimeout(): void
	{
		this.clearTimeout();
		this.timeoutId = setTimeout(() =>
		{
			if (!this._connected && this.socket)
			{
				this.socket.close();
				const error = new Error('Connection timeout');
				this.callback?.connectionError?.(error);
				this.emit('error', error);
			}
		}, this._timeout);
	}

	private clearTimeout(): void
	{
		if (this.timeoutId)
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	private sendRaw(data: ByteArray, messageId?: number): boolean
	{
		if (!this.socket) return false;

		if (!this._connected)
		{
			this.pendingMessages.push(data.clone());
			return true;
		}

		if (this.socket.readyState !== WebSocket.OPEN)
		{
			return false;
		}

		try
		{
			this.socket.send(data.toArrayBuffer());
			if (messageId !== undefined)
			{
				const messageName = this.messageRegistry.getOutgoingMessageName(messageId);
				this.callback?.messageSent?.(messageId, messageName);
			}
			return true;
		} catch (error)
		{
			log.error(`Send error: ${(error as Error).message}`); // cast: type assertion required
			return false;
		}
	}

	private flushPendingMessages(): void
	{
		while (this.pendingMessages.length > 0)
		{
			const message = this.pendingMessages.shift()!;
			this.sendRaw(message);
		}
	}
}
