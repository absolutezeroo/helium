/**
 * EnvironmentView
 *
 * @see sources/win63_2021_version/login/EnvironmentView.as
 *
 * Server/environment selection screen (SCREEN_ENVIRONMENT = 1).
 * Displays flag icons for each available hotel environment.
 * User selects a hotel, then proceeds to Login or SSO Token screen.
 */
import type {ILoginContext} from './ILoginContext';

// Import flag icons
import flagEnUrl from '../assets/images/flag_icon_en.png';
import flagPtUrl from '../assets/images/flag_icon_pt.png';
import flagDeUrl from '../assets/images/flag_icon_de.png';
import flagEsUrl from '../assets/images/flag_icon_es.png';
import flagFiUrl from '../assets/images/flag_icon_fi.png';
import flagFrUrl from '../assets/images/flag_icon_fr.png';
import flagItUrl from '../assets/images/flag_icon_it.png';
import flagNlUrl from '../assets/images/flag_icon_nl.png';
import flagTrUrl from '../assets/images/flag_icon_tr.png';
import flagDevUrl from '../assets/images/flag_icon_dev.png';

/**
 * AS3: ITEMS_PER_ROW = 9, THUMB_SCALE = 0.5
 */
const ITEMS_PER_ROW = 9;

/**
 * Map of environment ID → flag image URL.
 * Order matches AS3: en, pt, de, es, fi, fr, it, nl, tr, dev
 */
const FLAG_IMAGES: Record<string, string> = {
	'en': flagEnUrl,
	'pt': flagPtUrl,
	'de': flagDeUrl,
	'es': flagEsUrl,
	'fi': flagFiUrl,
	'fr': flagFrUrl,
	'it': flagItUrl,
	'nl': flagNlUrl,
	'tr': flagTrUrl,
	'dev': flagDevUrl,
};

/**
 * Environment display names.
 * AS3 uses localization keys: "connection.info.name.{envId}"
 */
const ENV_NAMES: Record<string, string> = {
	'en': 'Habbo.com',
	'pt': 'Habbo Brasil',
	'de': 'Habbo Deutschland',
	'es': 'Habbo España',
	'fi': 'Habbo Suomi',
	'fr': 'Habbo France',
	'it': 'Habbo Italia',
	'nl': 'Habbo Nederland',
	'tr': 'Habbo Türkiye',
	'dev': 'Development',
};

export class EnvironmentView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;
	private _environmentList: string[] = [];
	private _selectedIndex: number = 0;
	private _envItems: HTMLDivElement[] = [];
	private _envNameLabel: HTMLDivElement | null = null;
	private _loginButton: HTMLButtonElement;
	private _ticketButton: HTMLButtonElement;
	private _initialized: boolean = false;
	private _disposed: boolean = false;

	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		this._root.className = 'login-env-view';
		this._loginButton = document.createElement('button');
		this._ticketButton = document.createElement('button');
	}

	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * AS3: init()
	 * Initialize the environment view — builds DOM, reads environment list from config.
	 */
	public init(): void
	{
		if(this._initialized) return;

		this._initialized = true;

		this.initEnvironmentImages();
		this.updateEnvironment();
		this.initView();
	}

	/**
	 * AS3: initEnvironmentImages()
	 * Reads the environment list from config property "live.environment.list".
	 */
	private initEnvironmentImages(): void
	{
		const envListStr = this._context.getProperty('live.environment.list');

		if(envListStr)
		{
			this._environmentList = envListStr.split('/');
		}
		else
		{
			// Default environment list matching AS3 order
			this._environmentList = ['en', 'pt', 'de', 'es', 'fi', 'fr', 'it', 'nl', 'tr', 'dev'];
		}
	}

	/**
	 * AS3: updateEnvironment()
	 * Reads current environment.id from config and selects it.
	 */
	public updateEnvironment(): void
	{
		const currentEnvId = this._context.getProperty('environment.id');

		if(currentEnvId)
		{
			const index = this._environmentList.indexOf(currentEnvId);

			this._selectedIndex = index >= 0 ? index : 0;
		}
		else
		{
			this._selectedIndex = 0;
		}
	}

	/**
	 * AS3: initView()
	 * Builds the full DOM tree: title, flag grid, name label, buttons.
	 */
	private initView(): void
	{
		// Title
		const title = document.createElement('div');

		title.className = 'login-title';
		title.textContent = 'Choose your hotel';
		this._root.appendChild(title);

		// Flag grid
		const grid = document.createElement('div');

		grid.className = 'login-env-grid';

		for(let i = 0; i < this._environmentList.length; i++)
		{
			const envId = this._environmentList[i];
			const item = document.createElement('div');

			item.className = 'login-env-item';
			item.dataset.index = String(i);

			const img = document.createElement('img');

			img.src = FLAG_IMAGES[envId] ?? '';
			img.alt = envId;
			img.draggable = false;
			item.appendChild(img);

			item.addEventListener('click', this._onEnvironmentClick);
			grid.appendChild(item);
			this._envItems.push(item);
		}

		this._root.appendChild(grid);

		// Environment name label
		this._envNameLabel = document.createElement('div');
		this._envNameLabel.className = 'login-env-name';
		this._root.appendChild(this._envNameLabel);

		// Buttons
		const buttons = document.createElement('div');

		buttons.className = 'login-buttons';

		// Login button (green) → go to Login screen
		this._loginButton.className = 'login-btn login-btn-green';
		this._loginButton.textContent = 'Login';
		this._loginButton.addEventListener('click', this._onLoginClick);
		buttons.appendChild(this._loginButton);

		// Use Ticket button (green) → go to SSO Token screen
		this._ticketButton.className = 'login-btn login-btn-green';
		this._ticketButton.textContent = 'Use Ticket';
		this._ticketButton.addEventListener('click', this._onTicketClick);
		buttons.appendChild(this._ticketButton);

		this._root.appendChild(buttons);

		// Select current environment
		this.chooseEnvironment();
	}

	/**
	 * AS3: onEnvironmentClick()
	 */
	private _onEnvironmentClick = (e: Event): void =>
	{
		const target = (e.currentTarget as HTMLDivElement);
		const index = parseInt(target.dataset.index ?? '0', 10);

		this._selectedIndex = index;
		this.chooseEnvironment();
		this._context.updateEnvironment(this._environmentList[this._selectedIndex], true);
	};

	/**
	 * AS3: chooseEnvironment()
	 * Highlights the selected environment and updates the name label.
	 */
	private chooseEnvironment(): void
	{
		// Update selection highlight
		for(let i = 0; i < this._envItems.length; i++)
		{
			this._envItems[i].classList.toggle('selected', i === this._selectedIndex);
		}

		this._loginButton.disabled = false;
		this.updateDescription();
	}

	/**
	 * AS3: updateDescription()
	 * Updates the environment name label.
	 */
	private updateDescription(): void
	{
		const envId = this._environmentList[this._selectedIndex];
		const name = this._context.getProperty('connection.info.name.' + envId) ?? ENV_NAMES[envId] ?? envId;

		if(this._envNameLabel)
		{
			this._envNameLabel.textContent = name;
		}
	}

	/**
	 * AS3: onButtonSelect()
	 * Commits environment selection and goes to Login screen.
	 */
	private _onLoginClick = (): void =>
	{
		this._context.updateEnvironment(this._environmentList[this._selectedIndex], false);
		this._context.showScreen(2);
	};

	/**
	 * AS3: onButtonSelectToken()
	 * Commits environment selection and goes to SSO Token screen.
	 */
	private _onTicketClick = (): void =>
	{
		this._context.updateEnvironment(this._environmentList[this._selectedIndex], false);
		this._context.showScreen(4);
	};

	get environmentId(): string
	{
		return this._environmentList[this._selectedIndex] ?? 'en';
	}

	get environmentAvailable(): boolean
	{
		const currentEnvId = this._context.getProperty('environment.id');

		return currentEnvId ? this._environmentList.indexOf(currentEnvId) > -1 : false;
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		for(const item of this._envItems)
		{
			item.removeEventListener('click', this._onEnvironmentClick);
		}

		this._loginButton.removeEventListener('click', this._onLoginClick);
		this._ticketButton.removeEventListener('click', this._onTicketClick);
		this._envItems.length = 0;
		this._root.remove();
	}
}
