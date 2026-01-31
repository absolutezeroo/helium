import {createRoot, createSignal} from 'solid-js';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

function createConnectionStore() {
    const [state, setState] = createSignal<ConnectionState>('disconnected');
    const [error, setError] = createSignal<string | null>(null);

    return {
        // Getters
        state,
        error,

        // Actions
        setConnecting: () => {
            setState('connecting');
            setError(null);
        },
        setConnected: () => {
            setState('connected');
            setError(null);
        },
        setAuthenticated: () => {
            setState('authenticated');
            setError(null);
        },
        setDisconnected: () => {
            setState('disconnected');
        },
        setError: (message: string) => {
            setState('error');
            setError(message);
        },

        // Computed
        isConnected: () => state() === 'connected' || state() === 'authenticated',
        isAuthenticated: () => state() === 'authenticated',
    };
}

// Create singleton store
export const connectionStore = createRoot(createConnectionStore);
