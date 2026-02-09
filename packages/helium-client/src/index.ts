// Main application
export {Helium, type IHeliumConfig, type IConnectionConfig} from './Helium';

// Component Runtime (replaces Inversify IoC)
export * from '@core/runtime';

// IIDs for dependency injection
export * from '@iid/index';

// Core Communication
export * from '@core/communication';

// Utilities
export {Logger, LogLevel, log} from '@core/utils/Logger';
export type {LoggerConfig} from '@core/utils/Logger';
