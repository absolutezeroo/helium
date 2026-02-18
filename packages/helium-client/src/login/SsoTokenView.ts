/**
 * SsoTokenView
 *
 * @see sources/win63_2021_version/login/SsoTokenView.as
 *
 * SSO token input screen (default screen, SCREEN_SSO_TOKEN = 4).
 * User pastes an SSO token in the format "hh<env>.<uuid1>.<uuid2>".
 * Validates on keystroke, extracts environment ID, and triggers login.
 */
import type {ILoginContext} from './ILoginContext';

export class SsoTokenView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;
	private _tokenInput: HTMLInputElement;
	private _saveButton: HTMLButtonElement;
	private _cancelButton: HTMLButtonElement;
	private _initialized: boolean = false;
	private _disposed: boolean = false;

	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		this._root.className = 'login-sso-view';

		// Create elements but don't call init() yet — AS3 calls init() on showScreen
		this._tokenInput = document.createElement('input');
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
	}

	/**
	 * Get the root DOM element.
	 */
	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * Initialize the view — builds the DOM tree.
	 * Guard prevents double initialization (AS3 _SafeStr_527 pattern).
	 */
	public init(): void
	{
		if(this._initialized) return;

		this._initialized = true;

		this.addTitleField();
		this.addInputFields();
		this.addButtons();
	}

	/**
	 * AS3: ready()
	 * Enable the Play button (called when the environment is ready).
	 */
	public ready(): void
	{
		if(this._saveButton)
		{
			this._saveButton.disabled = false;
		}
	}

	/**
	 * Focus the token input when the view is shown.
	 */
	public focus(): void
	{
		setTimeout(() => this._tokenInput.focus(), 50);
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		this._tokenInput.removeEventListener('input', this._onInputChange);
		this._tokenInput.removeEventListener('keydown', this._onInputKeydown);
		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onLogin);
		this._root.remove();
	}

	/**
	 * AS3: addTitleField()
	 * Creates the title text: "${connection.login.title}" → "Habbo Login"
	 */
	private addTitleField(): void
	{
		const title = document.createElement('div');

		title.className = 'login-title';
		title.textContent = 'Habbo Login';
		this._root.appendChild(title);
	}

	/**
	 * AS3: addInputFields()
	 * Creates the token input field with label and placeholder.
	 */
	private addInputFields(): void
	{
		const group = document.createElement('div');

		group.className = 'login-input-group';

		const label = document.createElement('label');

		label.textContent = 'SSO Ticket';
		group.appendChild(label);

		this._tokenInput.type = 'password';
		this._tokenInput.placeholder = 'Enter your SSO ticket...';
		this._tokenInput.autocomplete = 'off';
		this._tokenInput.spellcheck = false;

		this._tokenInput.addEventListener('input', this._onInputChange);
		this._tokenInput.addEventListener('keydown', this._onInputKeydown);

		group.appendChild(this._tokenInput);
		this._root.appendChild(group);
	}

	/**
	 * AS3: addButtons()
	 * Creates Cancel (red) and Play (green) buttons.
	 */
	private addButtons(): void
	{
		const container = document.createElement('div');

		container.className = 'login-buttons';

		// Cancel button (red) — goes to Environment screen
		this._cancelButton.className = 'login-btn login-btn-red';
		this._cancelButton.textContent = 'Cancel';
		this._cancelButton.addEventListener('click', this._onCancel);
		container.appendChild(this._cancelButton);

		// Play button (green) — triggers login with SSO token
		this._saveButton.className = 'login-btn login-btn-green';
		this._saveButton.textContent = 'Play';
		this._saveButton.disabled = true;
		this._saveButton.addEventListener('click', this._onLogin);
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * AS3: onInputKeyboardEvent()
	 * an Enter key triggers login if the button is active.
	 */
	private _onInputKeydown = (e: KeyboardEvent): void =>
	{
		if(e.key === 'Enter' && !this._saveButton.disabled)
		{
			this._onLogin();
		}
	};

	/**
	 * AS3: onInputChange()
	 * Validates token on every keystroke, enables/disables Play button.
	 */
	private _onInputChange = (): void =>
	{
		const result = this.validateToken();

		if(result)
		{
			if(result.envId)
			{
				this._context.updateEnvironment(result.envId, true);
			}

			this._saveButton.disabled = false;
		}
		else
		{
			this._saveButton.disabled = true;
		}
	};

	/**
	 * AS3: onLogin()
	 * Validates token and calls context.initLoginWithSsoToken().
	 */
	private _onLogin = (): void =>
	{
		const result = this.validateToken();

		if(result)
		{
			this._context.initLoginWithSsoToken(result.envId ?? '', result.token);
		}
		else
		{
			this._saveButton.disabled = true;
		}
	};

	/**
	 * AS3: validateToken()
	 *
	 * Validates the SSO token. Supports two formats:
	 *
	 * 1. Habbo format: "hh<env>.<uuid1>.<uuid2>"
	 *    - Extracts environment from prefix (strip "hh", "br"→"pt", "us"→"en")
	 *    - Token sent to server: "<uuid1>.<uuid2>"
	 *
	 * 2. Generic format: any non-empty string
	 *    - No environment detection
	 *    - Token sent to server as-is
	 *
	 * @returns Parsed token data or null if empty
	 */
	private validateToken(): { envId: string | null; token: string } | null
	{
		const text = this._tokenInput.value.trim();

		if(!text || text.length === 0) return null;

		const parts = text.split('.');

		// AS3 format: hh<env>.<uuid1>.<uuid2>
		if(parts.length === 3 && parts[0].startsWith('hh'))
		{
			// AS3: _local_2 = _local_3[0].replace("hh", "")
			let envId = parts[0].replace('hh', '');

			// AS3: _local_2 = _local_2.replace("br", "pt")
			envId = envId.replace('br', 'pt');

			// AS3: _local_2 = _local_2.replace("us", "en")
			envId = envId.replace('us', 'en');

			return { envId, token: parts[1] + '.' + parts[2] };
		}

		// Generic token: accept any non-empty string
		return { envId: null, token: text };
	}

	/**
	 * AS3: onCancel()
	 * Go back to the Environment screen.
	 */
	private _onCancel = (): void =>
	{
		this._context.showScreen(1);
	};
}
