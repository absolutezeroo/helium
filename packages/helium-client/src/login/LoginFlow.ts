/**
 * LoginFlow
 *
 * @see sources/win63_2021_version/login/LoginFlow.as
 *
 * Main orchestrator for the login flow.
 * Implements ILoginContext (views call into) and ILoginViewer (provider calls back).
 * Creates all 4 screens: SSO Token (default), Environment, Login, Avatar.
 * When complete, dispatches LOGIN_FLOW_FINISHED_EVENT with the SSO token.
 *
 * Like AS3's LoginFlow (a standalone Sprite not part of the window hierarchy),
 * this is a DOM-based overlay that runs independently of the main canvas.
 *
 * AS3 pattern: constructor calls createFakeContext() which creates:
 * - createConfiguration() → HabboConfigurationManager
 * - createLocalization() → HabboLocalizationManager
 * - createCommunication() → HabboCommunicationManager
 * - WebApiLoginProvider(this)
 */
import {EventEmitter} from 'eventemitter3';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ILoginViewer} from '@habbo/communication/login/ILoginViewer';
import type {ILoginProvider} from '@habbo/communication/login/ILoginProvider';
import {WebApiLoginProvider} from '@habbo/communication/login/WebApiLoginProvider';
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import type {ILoginContext} from './ILoginContext';
import {LoginBackground} from './LoginBackground';
import {SsoTokenView} from './SsoTokenView';
import {EnvironmentView} from './EnvironmentView';
import {LoginView} from './LoginView';
import {AvatarView} from './AvatarView';
import './login.scss';

// Import logo
import habboLogoUrl from '../assets/images/habbo_logo.png';

/**
 * AS3 constants.
 *
 * @see sources/win63_2021_version/login/LoginFlow.as lines 41-48
 */
const LOGO_AREA_HEIGHT = 50;
const MAIN_AREA_MARGIN = 5;

export class LoginFlow implements ILoginContext, ILoginViewer
{
	static readonly LOGIN_FLOW_FINISHED_EVENT = 'LOGIN_FLOW_FINISHED_EVENT';
	static readonly SCREEN_ENVIRONMENT = 1;
	static readonly SCREEN_LOGIN = 2;
	static readonly SCREEN_AVATARS = 3;
	static readonly SCREEN_SSO_TOKEN = 4;

	private _events: EventEmitter = new EventEmitter();

	/**
	 * AS3: _configuration — HabboConfigurationManager created by createConfiguration()
	 */
	private _configuration: IHabboConfigurationManager;

	/**
	 * AS3: _localization — HabboLocalizationManager created by createLocalization()
	 */
	private _localization: IHabboLocalizationManager | null = null;

	/**
	 * AS3: _communication — HabboCommunicationManager created by createCommunication()
	 */
	private _communication: IHabboCommunicationManager | null = null;

	/**
	 * AS3: _SafeStr_597 — WebApiLoginProvider (ILoginProvider)
	 */
	private _provider: ILoginProvider;

	private _background: LoginBackground | null = null;
	private _environmentView: EnvironmentView | null = null;
	private _loginView: LoginView | null = null;
	private _ssoTokenView: SsoTokenView | null = null;
	private _avatarView: AvatarView | null = null;
	private _root: HTMLDivElement | null = null;
	private _mainContainer: HTMLDivElement | null = null;
	private _viewContainer: HTMLDivElement | null = null;
	private _errorBalloon: HTMLDivElement | null = null;
	private _errorTimer: number = 0;

	/**
	 * AS3: LoginFlow(dict: Dictionary)
	 * Constructor calls createFakeContext() which sets up all managers and the provider.
	 *
	 * @param configurationManager - The engine's configuration manager (already loaded).
	 *     In AS3, the config is created from embedded resources; in our port we reuse
	 *     the engine's already-loaded configuration manager.
	 */
	constructor(configurationManager: IHabboConfigurationManager)
	{
		this._configuration = configurationManager;

		// AS3: createFakeContext(_arg_1)
		this.createFakeContext();
	}

	private _ssoToken: string | null = null;

	/**
	 * The SSO token obtained from the login flow.
	 */
	get ssoToken(): string | null
	{
		return this._ssoToken;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * EventEmitter for login flow events.
	 * Listen for LOGIN_FLOW_FINISHED_EVENT.
	 */
	get loginEvents(): EventEmitter
	{
		return this._events;
	}

	/**
	 * AS3: initLogin(email, password)
	 * Delegates to WebApiLoginProvider.
	 */
	public initLogin(email: string, password: string): void
	{
		this._provider.loginWithCredentials(email, password);
	}

	/**
	 * AS3: initLoginWithSsoToken(envId, token)
	 * Direct SSO token login — skips Web API entirely.
	 */
	public initLoginWithSsoToken(envId: string, token: string): void
	{
		this.updateEnvironment(envId, false);
		this._ssoToken = token;
		this._events.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
	}

	/**
	 * AS3: loginWithAvatar(avatar)
	 * Delegates avatar selection to WebApiLoginProvider.
	 */
	public loginWithAvatar(avatar: AvatarData): void
	{
		this._provider.loginWithCredentialsWeb(avatar.uniqueId);
	}

	/**
	 * AS3: showScreen(screen)
	 * Switches between login screens.
	 */
	public showScreen(screen: number): void
	{
		this.hideViews();

		switch(screen)
		{
			case LoginFlow.SCREEN_ENVIRONMENT:
				if(this._environmentView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._environmentView.element);
					this._environmentView.init();
				}
				break;

			case LoginFlow.SCREEN_LOGIN:
				if(this._loginView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._loginView.element);
					this._loginView.init();

					// AS3: _SafeStr_597.init(_communication)
					this._provider.init(this._communication);
					this._loginView.focus();
				}
				break;

			case LoginFlow.SCREEN_SSO_TOKEN:
				if(this._ssoTokenView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._ssoTokenView.element);
					this._ssoTokenView.init();
					this._ssoTokenView.focus();
				}
				break;

			case LoginFlow.SCREEN_AVATARS:
				if(this._avatarView && this._viewContainer)
				{
					this._viewContainer.appendChild(this._avatarView.element);
					this._avatarView.init();
					this._avatarView.baseUrl = this.getProperty('web.api') ?? '';
				}
				break;
		}

		this.layoutMainElements();
	}

	/**
	 * AS3: updateEnvironment(envId, previewOnly)
	 */
	public updateEnvironment(envId: string, _previewOnly: boolean): void
	{
		// In full AS3, previewOnly=true only reloads localization.
		// previewOnly=false also writes to SOL and updates host params.
		// Since we don't have localization or SOL, we just update the view.
		if(this._environmentView)
		{
			this._environmentView.updateEnvironment();
		}
	}

	/**
	 * AS3: getProperty(key)
	 * Delegates to the configuration manager.
	 */
	public getProperty(key: string): string | null
	{
		try
		{
			const value = this._configuration.getProperty(key);

			return value && value.length > 0 ? value : null;
		}
		catch
		{
			return null;
		}
	}

	/**
	 * AS3: environmentReady()
	 * Called when /api/public/info/hello succeeds — enables login button.
	 */
	public environmentReady(): void
	{
		if(this._loginView)
		{
			this._loginView.ready();
		}
	}

	/**
	 * AS3: populateCharacterList(avatars)
	 * Called when multiple avatars need selection.
	 */
	public populateCharacterList(avatars: AvatarData[]): void
	{
		this.showScreen(LoginFlow.SCREEN_AVATARS);

		if(this._avatarView)
		{
			this._avatarView.populateAvatars(avatars);
		}
	}

	/**
	 * AS3: showErrorMessage(msg)
	 * Displays a temporary error balloon.
	 */
	public showErrorMessage(message: string): void
	{
		if(!this._mainContainer) return;

		// Clear previous timer
		if(this._errorTimer)
		{
			clearTimeout(this._errorTimer);
			this._errorTimer = 0;
		}

		// Create or reuse error balloon
		if(!this._errorBalloon)
		{
			this._errorBalloon = document.createElement('div');
			this._errorBalloon.className = 'login-error';
			this._mainContainer.appendChild(this._errorBalloon);
		}

		this._errorBalloon.textContent = message;
		this._errorBalloon.style.display = '';

		// AS3: Timer(3000, 1) → hide after 3 seconds
		this._errorTimer = window.setTimeout(() =>
		{
			if(this._errorBalloon)
			{
				this._errorBalloon.style.display = 'none';
			}
		}, 3000);
	}

	/**
	 * AS3: init()
	 * Initializes the login flow DOM — background, logo, views.
	 */
	public init(): void
	{
		// Root overlay
		this._root = document.createElement('div');
		this._root.className = 'login-root';

		const container = document.getElementById('helium-ui');

		if(container)
		{
			container.appendChild(this._root);
		}

		// AS3: _background = new Background(); addChild(_background)
		this._background = new LoginBackground();
		this._root.appendChild(this._background.element);

		// AS3: Logo area — habbo_logo_png at (40, 40)
		const logo = document.createElement('div');

		logo.className = 'login-logo';

		const logoImg = document.createElement('img');

		logoImg.src = habboLogoUrl;
		logoImg.alt = 'Habbo';
		logoImg.draggable = false;
		logo.appendChild(logoImg);
		this._root.appendChild(logo);

		// AS3: Main container (_SafeStr_4564) at y=50, x=5
		this._mainContainer = document.createElement('div');
		this._mainContainer.className = 'login-main';
		this._root.appendChild(this._mainContainer);

		// AS3: View container (_SafeStr_4559) at y=50 inside main
		this._viewContainer = document.createElement('div');
		this._viewContainer.className = 'login-view-container';
		this._mainContainer.appendChild(this._viewContainer);

		// AS3: Create all 4 views
		this._environmentView = new EnvironmentView(this);
		this._loginView = new LoginView(this);
		this._avatarView = new AvatarView(this);
		this._ssoTokenView = new SsoTokenView(this);

		// AS3: showScreen(4) — SSO Token is the default screen
		this.showScreen(LoginFlow.SCREEN_SSO_TOKEN);

		// Layout
		this.layoutMainElements();

		// Listen for resize
		window.addEventListener('resize', this._onResize);
	}

	/**
	 * AS3: dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		window.removeEventListener('resize', this._onResize);

		if(this._errorTimer)
		{
			clearTimeout(this._errorTimer);
			this._errorTimer = 0;
		}

		this._provider.off(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, this._onSsoTokenAvailable);
		this._provider.dispose();

		this.hideViews();

		if(this._environmentView)
		{
			this._environmentView.dispose();
			this._environmentView = null;
		}

		if(this._loginView)
		{
			this._loginView.dispose();
			this._loginView = null;
		}

		if(this._avatarView)
		{
			this._avatarView.dispose();
			this._avatarView = null;
		}

		if(this._ssoTokenView)
		{
			this._ssoTokenView.dispose();
			this._ssoTokenView = null;
		}

		if(this._background)
		{
			this._background.dispose();
			this._background = null;
		}

		if(this._root)
		{
			this._root.remove();
			this._root = null;
		}

		this._mainContainer = null;
		this._viewContainer = null;
		this._errorBalloon = null;
		this._communication = null;
		this._localization = null;
	}

	/**
	 * AS3: createFakeContext(dict: Dictionary)
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 160-174
	 *
	 * In AS3, this creates:
	 * 1. FakeContext (stub IContext)
	 * 2. createConfiguration(context) → HabboConfigurationManager
	 * 3. createLocalization(context) → HabboLocalizationManager
	 * 4. createCommunication(context) → HabboCommunicationManager
	 * 5. WebApiLoginProvider(this)
	 *
	 * In our port, the config manager is passed in from the engine (already loaded),
	 * localization and communication are null since we use DOM text and fetch() directly.
	 */
	private createFakeContext(): void
	{
		this._configuration = this.createConfiguration();
		this._localization = this.createLocalization();
		this._communication = this.createCommunication();

		// AS3: _SafeStr_597 = new WebApiLoginProvider(this)
		this._provider = new WebApiLoginProvider(this);

		// AS3: _SafeStr_597.addEventListener("SSO_TOKEN_AVAILABLE", onSsoTokenAvailable)
		this._provider.on(WebApiLoginProvider.SSO_TOKEN_AVAILABLE, this._onSsoTokenAvailable);
	}

	/**
	 * AS3: createConfiguration(context: IContext): HabboConfigurationManager
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 127-136
	 *
	 * In AS3, creates a standalone HabboConfigurationManager from the embedded
	 * HabboConfigurationCom manifest resource. In our port, we reuse the engine's
	 * already-loaded configuration manager which has the same properties.
	 *
	 * @returns The configuration manager instance
	 */
	private createConfiguration(): IHabboConfigurationManager
	{
		return this._configuration;
	}

	/**
	 * AS3: createLocalization(context: IContext): HabboLocalizationManager
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 138-147
	 *
	 * In AS3, creates a standalone HabboLocalizationManager from the embedded
	 * HabboLocalizationCom manifest resource. Sets LocalizedSprite.localizationManager
	 * and LocalizedTextField.localizationManager. Then calls
	 * _localization.loadDefaultEmbedLocalizations(environment.id).
	 *
	 * In our port, localized strings for the DOM-based login views are hardcoded
	 * in English. When a full localization system is added, this method will create
	 * and return a localization manager instance.
	 *
	 * @returns The localization manager instance, or null
	 */
	private createLocalization(): IHabboLocalizationManager | null
	{
		// TODO: Create standalone localization manager when localization system is implemented
		return null;
	}

	/**
	 * AS3: createCommunication(context: IContext): HabboCommunicationManager
	 *
	 * @see sources/win63_2021_version/login/LoginFlow.as lines 149-158
	 *
	 * In AS3, creates a standalone HabboCommunicationManager from the embedded
	 * HabboCommunicationCom manifest resource. The communication manager provides
	 * IHabboWebApiSession which WebApiLoginProvider.init() uses for HTTP requests.
	 *
	 * In our port, WebApiLoginProvider uses the Fetch API directly instead of
	 * going through HabboWebApiSession, so a full communication manager is not needed.
	 *
	 * @returns The communication manager instance, or null
	 */
	private createCommunication(): IHabboCommunicationManager | null
	{
		// WebApiLoginProvider uses fetch() directly — no need for HabboWebApiSession
		return null;
	}

	/**
	 * AS3: hideViews()
	 * Removes all children from the view container.
	 */
	private hideViews(): void
	{
		if(this._viewContainer)
		{
			this._viewContainer.innerHTML = '';
		}
	}

	/**
	 * AS3: layoutMainElements()
	 * Centers the main container on screen.
	 */
	private layoutMainElements(): void
	{
		if(this._disposed || !this._mainContainer) return;

		if(this._background)
		{
			this._background.resize();
		}

		// Center the main content area
		const stageW = window.innerWidth;
		const contentWidth = this._mainContainer.offsetWidth + 20;

		let xPos: number;

		if(stageW > contentWidth)
		{
			xPos = Math.floor((stageW - contentWidth) / 2);

			if(xPos < MAIN_AREA_MARGIN)
			{
				xPos = MAIN_AREA_MARGIN;
			}
		}
		else
		{
			xPos = MAIN_AREA_MARGIN;
		}

		this._mainContainer.style.left = xPos + 'px';
		this._mainContainer.style.top = (LOGO_AREA_HEIGHT + 50) + 'px';
	}

	/**
	 * AS3: onSsoTokenAvailable()
	 * Called when the Web API returns an SSO token.
	 */
	private _onSsoTokenAvailable = (token: string): void =>
	{
		this._ssoToken = token;
		this._events.emit(LoginFlow.LOGIN_FLOW_FINISHED_EVENT);
	};

	/** Bound resize handler. */
	private _onResize = (): void =>
	{
		if(!this._disposed)
		{
			this.layoutMainElements();
		}
	};
}
