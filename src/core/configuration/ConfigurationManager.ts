import {injectable} from 'inversify';
import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {ConfigurationManagerEvents, IConfigurationManager} from './IConfigurationManager';

const log = Logger.getLogger('Configuration');

/**
 * Configuration manager
 * Manages application configuration with support for:
 * - Key-value storage
 * - Interpolation (${variable} syntax)
 * - Environment-specific overrides
 * - Loading from external files
 *
 * Based on AS3 com.sulake.habbo.configuration.HabboConfigurationManager
 */
@injectable()
export class ConfigurationManager extends EventEmitter<ConfigurationManagerEvents> implements IConfigurationManager {
    private static readonly INTERPOLATION_DEPTH_LIMIT = 3;
    private static readonly REPLACE_CHAR = '%';

    private _data: Map<string, string> = new Map();
    private _persistentKeys: Set<string> = new Set();
    private _initialized: boolean = false;

    constructor() {
        super();
        this.setDefaults();
    }

    private _environmentId: string = '';

    /**
     * Get the current environment ID
     */
    get environmentId(): string {
        return this._environmentId;
    }

    private _useHttps: boolean = true;

    get useHttps(): boolean {
        return this._useHttps;
    }

    /**
     * Set whether to use HTTPS
     */
    set useHttps(value: boolean) {
        this._useHttps = value;
    }

    /**
     * Check if a property exists
     */
    propertyExists(key: string): boolean {
        return this._data.has(key);
    }

    /**
     * Get a string property value
     */
    getProperty(key: string, params?: Record<string, string>): string {
        let value = this._data.get(key);

        if (value === undefined) {
            return '';
        }

        // Interpolate ${variable} references
        value = this.interpolate(value);

        // Handle protocol-relative URLs
        if (value.startsWith('//')) {
            value = (this._useHttps ? 'https:' : 'http:') + value;
        }

        // Update URL protocol if needed
        value = this.updateUrlProtocol(value);

        // Fill in parameters
        if (params) {
            value = this.fillParams(value, params);
        }

        return value;
    }

    /**
     * Set a property value
     */
    setProperty(key: string, value: string, persistent: boolean = false): void {
        // Don't overwrite persistent keys unless this is also persistent
        if (this._persistentKeys.has(key) && !persistent) {
            return;
        }

        this._data.set(key, value);

        if (persistent) {
            this._persistentKeys.add(key);
        }
    }

    /**
     * Get a boolean property value
     */
    getBoolean(key: string): boolean {
        const value = this._data.get(key);
        if (value === undefined) {
            return false;
        }
        return value === '1' || value.toLowerCase() === 'true';
    }

    /**
     * Get an integer property value
     */
    getInteger(key: string, defaultValue: number = 0): number {
        const value = this._data.get(key);
        if (value === undefined) {
            return defaultValue;
        }
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Interpolate a string, replacing ${key} with property values
     */
    interpolate(value: string): string {
        if (!value) {
            return value;
        }

        const regex = /\$\{([^}]*)\}/g;
        let interpolated = value;
        let limit = ConfigurationManager.INTERPOLATION_DEPTH_LIMIT;

        while (limit-- > 0) {
            let hasMatch = false;
            interpolated = interpolated.replace(regex, (match, key) => {
                if (!this.propertyExists(key)) {
                    return match; // Keep original if key doesn't exist
                }
                hasMatch = true;
                return this._data.get(key) || '';
            });

            if (!hasMatch) {
                break;
            }
        }

        return interpolated;
    }

    /**
     * Check if configuration is loaded
     */
    isInitialized(): boolean {
        return this._initialized;
    }

    /**
     * Load configuration from URL
     */
    async loadFromUrl(url: string): Promise<void> {
        try {
            log.info(`Loading configuration from ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            this.parseConfiguration(text);

            this._initialized = true;
            log.success('Configuration loaded');
            this.emit('loaded');
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            log.error(`Failed to load configuration: ${err.message}`);
            this.emit('error', err);
            throw err;
        }
    }

    /**
     * Load configuration from object
     */
    loadFromObject(config: Record<string, string>): void {
        for (const [key, value] of Object.entries(config)) {
            this.setProperty(key, value);
        }
        this._initialized = true;
        log.success('Configuration loaded from object');
        this.emit('loaded');
    }

    /**
     * Reset all configuration
     */
    resetAll(): void {
        this._data.clear();
        this._persistentKeys.clear();
        this._initialized = false;
        this.setDefaults();
        log.info('Configuration reset');
    }

    /**
     * Set the environment ID and update environment-specific properties
     */
    setEnvironmentId(envId: string): void {
        if (this._environmentId === envId) {
            return;
        }

        this._environmentId = envId;
        this.setProperty('environment.id', envId);
        this.updateEnvironmentVariables();
        log.info(`Environment set to: ${envId}`);
    }

    /**
     * Get all configuration as an object
     */
    toObject(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, value] of this._data) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Set default configuration values
     */
    private setDefaults(): void {
        // Default values that can be overridden
        this.setProperty('client.version', '1.0.0');
        this.setProperty('client.name', 'Helium');
    }

    /**
     * Update URL protocol (HTTP to HTTPS)
     */
    private updateUrlProtocol(url: string): string {
        if (this._useHttps) {
            return url.replace('http://', 'https://');
        }
        return url;
    }

    /**
     * Fill in %param% placeholders
     */
    private fillParams(template: string, params: Record<string, string>): string {
        let result = template;
        const char = ConfigurationManager.REPLACE_CHAR;

        for (const [key, value] of Object.entries(params)) {
            result = result.replace(new RegExp(`${char}${key}${char}`, 'g'), value);
        }

        return result;
    }

    /**
     * Parse configuration from text (key=value format)
     */
    private parseConfiguration(text: string): void {
        const lines = text.split(/\r?\n/);

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip comments and empty lines
            if (trimmed.startsWith('#') || trimmed === '') {
                continue;
            }

            // Find first = sign
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) {
                continue;
            }

            const key = trimmed.substring(0, eqIndex).trim();
            const value = trimmed.substring(eqIndex + 1).trim();

            if (key && value) {
                this.setProperty(key, value);
            }
        }
    }

    /**
     * Update environment-specific properties
     * Properties like "connection.host.production" will override "connection.host"
     */
    private updateEnvironmentVariables(): void {
        if (!this._environmentId) {
            return;
        }

        const keysToUpdate = [
            'connection.info.host',
            'connection.info.port',
            'url.prefix',
            'site.url',
            'api.url',
        ];

        for (const key of keysToUpdate) {
            const envKey = `${key}.${this._environmentId}`;
            if (this.propertyExists(envKey)) {
                const envValue = this._data.get(envKey)!;
                this.setProperty(key, envValue);
            }
        }
    }
}
