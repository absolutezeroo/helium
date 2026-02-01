import {HabboCommunicationEvent} from '@habbo/communication/enum';

/**
 * Possible states of the connection
 */
export type ConnectionState =
	| 'disconnected'
	| 'connecting'
	| 'connected'
	| 'authenticated'
	| 'error';

/**
 * Loading steps during the connection/handshake process
 * Maps to AS3 HabboCommunicationEvent constants
 */
export type LoadingStep =
	| typeof HabboCommunicationEvent.INIT
	| typeof HabboCommunicationEvent.ESTABLISHED
	| typeof HabboCommunicationEvent.HANDSHAKING
	| typeof HabboCommunicationEvent.HANDSHAKED
	| typeof HabboCommunicationEvent.HANDSHAKE_FAIL
	| typeof HabboCommunicationEvent.AUTHENTICATED
	| null;
