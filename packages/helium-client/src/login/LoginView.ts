/**
 * LoginView
 *
 * @see sources/win63_2021_version/login/LoginView.as
 *
 * Email/password login screen (SCREEN_LOGIN = 2).
 * User enters credentials and submits to initiate Web API login.
 */
import type {ILoginContext} from './ILoginContext';

export class LoginView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;
	private _emailInput: HTMLInputElement;
	private _passwordInput: HTMLInputElement;
	private _saveButton: HTMLButtonElement;
	private _cancelButton: HTMLButtonElement;
	private _initialized: boolean = false;
	private _disposed: boolean = false;

	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		this._root.className = 'login-credentials-view';
		this._emailInput = document.createElement('input');
		this._passwordInput = document.createElement('input');
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
	}

	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * AS3: init()
	 * Initialize the view — builds the DOM tree.
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
	 * AS3: addTitleField()
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
	 * Creates email and password input fields.
	 */
	private addInputFields(): void
	{
		// Email field
		const emailGroup = document.createElement('div');

		emailGroup.className = 'login-input-group';

		const emailLabel = document.createElement('label');

		emailLabel.textContent = 'Email';
		emailGroup.appendChild(emailLabel);

		this._emailInput.type = 'email';
		this._emailInput.placeholder = 'Enter your email...';
		this._emailInput.autocomplete = 'email';
		emailGroup.appendChild(this._emailInput);
		this._root.appendChild(emailGroup);

		// Password field
		const pwdGroup = document.createElement('div');

		pwdGroup.className = 'login-input-group';

		const pwdLabel = document.createElement('label');

		pwdLabel.textContent = 'Password';
		pwdGroup.appendChild(pwdLabel);

		this._passwordInput.type = 'password';
		this._passwordInput.placeholder = 'Enter your password...';
		this._passwordInput.autocomplete = 'current-password';
		this._passwordInput.addEventListener('keydown', this._onKeydown);
		pwdGroup.appendChild(this._passwordInput);
		this._root.appendChild(pwdGroup);
	}

	/**
	 * AS3: addButtons()
	 */
	private addButtons(): void
	{
		const container = document.createElement('div');

		container.className = 'login-buttons';

		// Cancel button (red) — goes back to Environment screen
		this._cancelButton.className = 'login-btn login-btn-red';
		this._cancelButton.textContent = 'Cancel';
		this._cancelButton.addEventListener('click', this._onCancel);
		container.appendChild(this._cancelButton);

		// Play button (green) — triggers login
		this._saveButton.className = 'login-btn login-btn-green';
		this._saveButton.textContent = 'Play';
		this._saveButton.disabled = true;
		this._saveButton.addEventListener('click', this._onLogin);
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * Enter key in password field triggers login.
	 */
	private _onKeydown = (e: KeyboardEvent): void =>
	{
		if(e.key === 'Enter' && !this._saveButton.disabled)
		{
			this._onLogin();
		}
	};

	/**
	 * AS3: saveOutfit() → context.initLogin(email, password)
	 */
	private _onLogin = (): void =>
	{
		const email = this._emailInput.value.trim();
		const password = this._passwordInput.value;

		if(email && password)
		{
			this._context.initLogin(email, password);
		}
	};

	/**
	 * AS3: onCancel()
	 */
	private _onCancel = (): void =>
	{
		this._context.showScreen(1);
	};

	/**
	 * AS3: ready()
	 * Called when the environment is ready — enables the Play button.
	 */
	public ready(): void
	{
		if(this._saveButton)
		{
			this._saveButton.disabled = false;
		}
	}

	/**
	 * Focus the email input when the view is shown.
	 */
	public focus(): void
	{
		setTimeout(() => this._emailInput.focus(), 50);
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		this._passwordInput.removeEventListener('keydown', this._onKeydown);
		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onLogin);
		this._root.remove();
	}
}
