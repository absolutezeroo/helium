import {EventEmitter} from 'eventemitter3';

/**
 * Configuration manager events
 */
export interface ConfigurationManagerEvents {
    'loaded': () => void;
    'error': (error: Error) => void;
}

/**
 * Interface for configuration manager
 */
export interface IConfigurationManager extends EventEmitter<ConfigurationManagerEvents> {
    /**
     * Get the current environment ID
     */
    readonly environmentId: string;

    /**
     * Check if a property exists
     */
    propertyExists(key: string): boolean;

    /**
     * Get a string property value
     * @param key Property key
     * @param params Optional parameters for interpolation
     */
    getProperty(key: string, params?: Record<string, string>): string;

    /**
     * Set a property value
     * @param key Property key
     * @param value Property value
     * @param persistent If true, cannot be overwritten
     */
    setProperty(key: string, value: string, persistent?: boolean): void;

    /**
     * Get a boolean property value
     */
    getBoolean(key: string): boolean;

    /**
     * Get an integer property value
     * @param key Property key
     * @param defaultValue Default value if key doesn't exist
     */
    getInteger(key: string, defaultValue?: number): number;

    /**
     * Interpolate a string, replacing ${key} with property values
     */
    interpolate(value: string): string;

    /**
     * Check if configuration is loaded
     */
    isInitialized(): boolean;

    /**
     * Load configuration from URL
     */
    loadFromUrl(url: string): Promise<void>;

    /**
     * Load configuration from object
     */
    loadFromObject(config: Record<string, string>): void;

    /**
     * Reset all configuration
     */
    resetAll(): void;

    /**
     * Set the environment ID
     */
    setEnvironmentId(envId: string): void;
}
