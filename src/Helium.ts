import 'reflect-metadata';
import {Application, Ticker} from 'pixi.js';
import {container, setupContainer, TYPES} from './iid';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IConfigurationManager} from '@core/configuration/IConfigurationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import {Logger} from '@core/utils/Logger';
import {mountUI, uiBridge} from '@ui/index';
import '@ui/styles.css';

const log = Logger.getLogger('Helium');

export class Helium {
    private _ready = false;
    // Managers
    private _configurationManager: IConfigurationManager | null = null;
    private _communicationManager: ICoreCommunicationManager | null = null;
    private _habboCommunicationManager: HabboCommunicationManager | null = null;
    // UI
    private _disposeUI: (() => void) | null = null;

    private static _instance: Helium;

    public static get instance(): Helium {
        if (!this._instance) {
            this._instance = new Helium();
        }

        return this._instance;
    }

    private _application: Application | null = null;

    public get application(): Application {
        if (!this._application) {
            throw new Error('[Helium] Not initialized');
        }

        return this._application;
    }

    public get isReady(): boolean {
        return this._ready;
    }

    /**
     * Get the configuration manager
     */
    public get configuration(): IConfigurationManager {
        if (!this._configurationManager) {
            throw new Error('[Helium] Not initialized');
        }

        return this._configurationManager;
    }

    /**
     * Get the core communication manager
     */
    public get communication(): ICoreCommunicationManager {
        if (!this._communicationManager) {
            throw new Error('[Helium] Not initialized');
        }

        return this._communicationManager;
    }

    /**
     * Get the Habbo communication manager
     */
    public get habboCommunication(): HabboCommunicationManager {
        if (!this._habboCommunicationManager) {
            throw new Error('[Helium] Not initialized');
        }

        return this._habboCommunicationManager;
    }

    public static async bootstrap(config?: HeliumConfig): Promise<Helium> {
        const instance = this.instance;

        await instance.init(config);

        return instance;
    }

    /**
     * Connect to the Habbo server
     */
    public connect(): void {
        if (!this._habboCommunicationManager) {
            throw new Error('[Helium] Not initialized');
        }

        log.info('Connecting to server...');

        this._habboCommunicationManager.initConnection('habbo');
    }

    /**
     * Disconnect from the server
     */
    public disconnect(): void {
        this._habboCommunicationManager?.disconnect();
    }

    public dispose(): void {
        // Stop update loop
        this._application?.ticker.remove(this.update, this);

        // Dispose UI
        if (this._disposeUI) {
            this._disposeUI();
            this._disposeUI = null;
        }
        uiBridge.disconnect();

        // Dispose communication
        this._communicationManager?.dispose();

        // Dispose PixiJS
        this._application?.destroy(true);
        this._application = null;

        this._configurationManager = null;
        this._communicationManager = null;
        this._habboCommunicationManager = null;
        this._ready = false;
    }

    private async init(config?: HeliumConfig): Promise<void> {
        log.info('Initializing...');

        // Setup IoC container
        setupContainer();

        // Initialize configuration manager
        this._configurationManager = container.get<IConfigurationManager>(TYPES.ConfigurationManager);

        // Load configuration from URL if provided
        if (config?.configurationUrl) {
            await this._configurationManager.loadFromUrl(config.configurationUrl);
        } else if (config?.configuration) {
            // Load configuration from object
            this._configurationManager.loadFromObject(config.configuration);
        }

        // Initialize PixiJS application
        this._application = new Application();

        await this._application.init({
            background: config?.background ?? '#000000',
            resizeTo: config?.resizeTo ?? window,
            antialias: config?.antialias ?? true,
            resolution: config?.resolution ?? window.devicePixelRatio,
            autoDensity: true,
        });

        const target = config?.canvas ?? document.body;

        target.appendChild(this._application.canvas);

        // Initialize communication managers
        this._communicationManager = container.get<ICoreCommunicationManager>(TYPES.CommunicationManager);
        this._habboCommunicationManager = container.get<HabboCommunicationManager>(TYPES.HabboCommunicationManager);

        // Configure connection if provided
        if (config?.connection) {
            this._habboCommunicationManager.configure(config.connection);
        }

        // Connect UIBridge to managers
        uiBridge.connectConfigurationManager(this._configurationManager);

        const sessionDataManager = this._habboCommunicationManager.sessionDataManager;
        if (sessionDataManager) {
            uiBridge.connectSessionDataManager(sessionDataManager);
        }

        // Mount SolidJS UI
        const uiContainer = document.createElement('div');
        uiContainer.id = 'helium-ui';
        document.body.appendChild(uiContainer);
        this._disposeUI = mountUI(uiContainer);

        // Setup update loop for communication
        this._application.ticker.add(this.update, this);

        this._ready = true;
        log.success('Ready!');

        // Auto-connect if configured
        if (config?.connection?.autoConnect) {
            this.connect();
        }
    }

    /**
     * Main update loop
     */
    private update(ticker: Ticker): void {
        const deltaTime = ticker.deltaMS;

        // Process communication
        this._communicationManager?.update(deltaTime);
    }
}

/**
 * Connection configuration
 */
export interface ConnectionConfig {
    /** Server host (can include ws:// or wss://) */
    host: string;
    /** Server ports to try */
    ports: number[];
    /** SSO ticket for authentication */
    ssoTicket?: string;
    /** Auto-connect on initialization */
    autoConnect?: boolean;
}

/**
 * Helium configuration
 */
export interface HeliumConfig {
    /** Background color */
    background?: string;
    /** Element to resize to */
    resizeTo?: HTMLElement | Window;
    /** Enable antialiasing */
    antialias?: boolean;
    /** Pixel resolution */
    resolution?: number;
    /** Canvas container element */
    canvas?: HTMLElement;
    /** Connection configuration */
    connection?: ConnectionConfig;
    /** URL to load external configuration from (external_variables.txt) */
    configurationUrl?: string;
    /** Configuration object (alternative to URL) */
    configuration?: Record<string, string>;
}

export default Helium;
