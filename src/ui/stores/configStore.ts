import {createRoot, createSignal} from 'solid-js';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

function createConfigStore() {
    const [isLoaded, setIsLoaded] = createSignal(false);
    let _manager: IHabboConfigurationManager | null = null;

    return {
        // State
        isLoaded,

        // Connect to configuration manager
        connect: (manager: IHabboConfigurationManager) => {
            _manager = manager;
            setIsLoaded(manager.isInitialized());

            manager.on('complete', () => {
                setIsLoaded(true);
            });
        },

        // Get a string property
        get: (key: string, defaultValue: string = ''): string => {
            if (!_manager) return defaultValue;
            const value = _manager.getProperty(key);
            return value || defaultValue;
        },

        // Get a boolean property
        getBoolean: (key: string): boolean => {
            if (!_manager) return false;
            return _manager.getBoolean(key);
        },

        // Get an integer property
        getInteger: (key: string, defaultValue: number = 0): number => {
            if (!_manager) return defaultValue;
            return _manager.getInteger(key, defaultValue);
        },

        // Check if property exists
        exists: (key: string): boolean => {
            if (!_manager) return false;
            return _manager.propertyExists(key);
        },
    };
}

// Create singleton store
export const configStore = createRoot(createConfigStore);
