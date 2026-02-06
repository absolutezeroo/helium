import type {HabboCommunicationEvent} from '@habbo/communication/enum';

/**
 * Possible states of the connection
 */
export type ConnectionStateType =
	| 'disconnected'
	| 'connecting'
	| 'connected'
	| 'authenticated'
	| 'error';

/**
 * Loading steps during the connection/handshake process
 */
export type LoadingStep =
	| typeof HabboCommunicationEvent.INIT
	| typeof HabboCommunicationEvent.ESTABLISHED
	| typeof HabboCommunicationEvent.HANDSHAKING
	| typeof HabboCommunicationEvent.HANDSHAKED
	| typeof HabboCommunicationEvent.HANDSHAKE_FAIL
	| typeof HabboCommunicationEvent.AUTHENTICATED
	| null;

/**
 * Connection module state
 */
export interface IConnectionState
{
	/** Current connection state */
	state: ConnectionStateType;

	/** Current loading step during handshake */
	loadingStep: LoadingStep;

	/** Error message if state is 'error' */
	error: string | null;
}
