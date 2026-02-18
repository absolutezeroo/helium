/**
 * AvatarView
 *
 * @see sources/win63_2021_version/login/AvatarView.as
 *
 * Avatar selection screen (SCREEN_AVATARS = 3).
 * Displays up to 7 avatar thumbnails loaded from habbo-imaging API.
 * User selects an avatar and confirms to proceed with login.
 */
import type {ILoginContext} from './ILoginContext';
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import placeholderUrl from '../assets/images/placeholder_avatar.png';

export class AvatarView
{
	private _context: ILoginContext;
	private _root: HTMLDivElement;
	private _avatars: AvatarData[] = [];
	private _selectedIndex: number = 0;
	private _avatarItems: HTMLDivElement[] = [];
	private _nameLabel: HTMLDivElement | null = null;
	private _mottoLabel: HTMLDivElement | null = null;
	private _saveButton: HTMLButtonElement;
	private _cancelButton: HTMLButtonElement;
	private _baseUrl: string = '';
	private _initialized: boolean = false;
	private _disposed: boolean = false;

	constructor(context: ILoginContext)
	{
		this._context = context;
		this._root = document.createElement('div');
		this._root.className = 'login-avatar-view';
		this._saveButton = document.createElement('button');
		this._cancelButton = document.createElement('button');
	}

	get element(): HTMLDivElement
	{
		return this._root;
	}

	/**
	 * AS3: set baseUrl()
	 * Sets the base URL for habbo-imaging API.
	 */
	set baseUrl(value: string)
	{
		this._baseUrl = value;
	}

	/**
	 * AS3: init()
	 */
	public init(): void
	{
		this._selectedIndex = 0;

		if(this._initialized) return;

		this._initialized = true;

		this.addTitleField();
		this.addInfoPanel();
		this.addButtons();
	}

	/**
	 * AS3: addTitleField()
	 */
	private addTitleField(): void
	{
		const title = document.createElement('div');

		title.className = 'login-title';
		title.textContent = 'Choose your character';
		this._root.appendChild(title);
	}

	/**
	 * Creates the info panel showing selected avatar's name and motto.
	 */
	private addInfoPanel(): void
	{
		const info = document.createElement('div');

		info.className = 'login-avatar-info';
		info.style.display = 'none';

		this._nameLabel = document.createElement('div');
		this._nameLabel.className = 'avatar-name';
		info.appendChild(this._nameLabel);

		this._mottoLabel = document.createElement('div');
		this._mottoLabel.className = 'avatar-motto';
		info.appendChild(this._mottoLabel);

		this._root.appendChild(info);
	}

	/**
	 * AS3: addButtons()
	 */
	private addButtons(): void
	{
		const container = document.createElement('div');

		container.className = 'login-buttons';

		// Cancel button (red) — goes back to Login screen
		this._cancelButton.className = 'login-btn login-btn-red';
		this._cancelButton.textContent = 'Cancel';
		this._cancelButton.addEventListener('click', this._onCancel);
		container.appendChild(this._cancelButton);

		// Play button (green) — confirms avatar selection
		this._saveButton.className = 'login-btn login-btn-green';
		this._saveButton.textContent = 'Play';
		this._saveButton.disabled = true;
		this._saveButton.addEventListener('click', this._onChooseAvatar);
		container.appendChild(this._saveButton);

		this._root.appendChild(container);
	}

	/**
	 * AS3: populateAvatars()
	 * Populates the avatar grid with up to 7 avatars.
	 *
	 * @param avatars - Array of avatar data from the Web API
	 */
	public populateAvatars(avatars: AvatarData[]): void
	{
		// Clear existing avatar items
		for(const item of this._avatarItems)
		{
			item.removeEventListener('click', this._onAvatarClick);
			item.remove();
		}

		this._avatarItems.length = 0;
		this._avatars = avatars;

		// Find or create grid container
		let grid = this._root.querySelector('.login-avatar-grid') as HTMLDivElement | null;

		if(!grid)
		{
			grid = document.createElement('div');
			grid.className = 'login-avatar-grid';

			// Insert before info panel
			const info = this._root.querySelector('.login-avatar-info');

			if(info)
			{
				this._root.insertBefore(grid, info);
			}
			else
			{
				this._root.appendChild(grid);
			}
		}
		else
		{
			grid.innerHTML = '';
		}

		// AS3: max 7 avatars (index 0-6, break at > 6)
		const maxAvatars = Math.min(avatars.length, 7);

		for(let i = 0; i < maxAvatars; i++)
		{
			const avatar = avatars[i];
			const item = document.createElement('div');

			item.className = 'login-avatar-item';
			item.dataset.index = String(i);

			// Placeholder image
			const placeholder = document.createElement('img');

			placeholder.src = placeholderUrl;
			placeholder.alt = avatar.name;
			placeholder.draggable = false;
			item.appendChild(placeholder);

			// Load avatar image from habbo-imaging
			const avatarImg = document.createElement('img');

			avatarImg.style.position = 'absolute';
			avatarImg.style.top = '0';
			avatarImg.style.left = '0';
			avatarImg.style.width = '100%';
			avatarImg.style.height = '100%';
			avatarImg.style.objectFit = 'contain';
			avatarImg.draggable = false;

			const url = this.getAvatarUrl(avatar);

			avatarImg.src = url;

			avatarImg.onload = (): void =>
			{
				// Remove placeholder on successful load
				if(placeholder.parentNode)
				{
					placeholder.remove();
				}
			};

			avatarImg.onerror = (): void =>
			{
				// Keep placeholder on error
				avatarImg.remove();
			};

			item.appendChild(avatarImg);
			item.addEventListener('click', this._onAvatarClick);
			grid.appendChild(item);
			this._avatarItems.push(item);
		}

		if(avatars.length > 0)
		{
			this._selectedIndex = 0;
			this._saveButton.disabled = false;
			this.updateDescription();
			this.highlightAvatar();

			// Show info panel
			const info = this._root.querySelector('.login-avatar-info') as HTMLDivElement | null;

			if(info) info.style.display = '';
		}
		else
		{
			this._saveButton.disabled = true;
		}
	}

	/**
	 * AS3: getAvatarUrl()
	 * Builds the habbo-imaging URL for an avatar.
	 * Falls back to habbo.com for local development.
	 */
	private getAvatarUrl(avatar: AvatarData): string
	{
		if(this._baseUrl.indexOf('local') > -1 || this._baseUrl.indexOf('127.0.0.1') > -1)
		{
			return 'https://www.habbo.com/habbo-imaging/avatarimage?size=m&figure=' + avatar.figure + '&direction=2';
		}

		return this._baseUrl + '/habbo-imaging/avatarimage?user=' + avatar.name;
	}

	/**
	 * AS3: onAvatarClick()
	 */
	private _onAvatarClick = (e: Event): void =>
	{
		const target = (e.currentTarget as HTMLDivElement);
		const index = parseInt(target.dataset.index ?? '0', 10);

		this._selectedIndex = index;
		this.updateDescription();
		this.highlightAvatar();
		this._saveButton.disabled = false;
	};

	/**
	 * AS3: updateDescription()
	 * Updates the name and motto labels for the selected avatar.
	 */
	private updateDescription(): void
	{
		if(!this._avatars || this._avatars.length === 0) return;

		const avatar = this._avatars[this._selectedIndex];

		if(this._nameLabel) this._nameLabel.textContent = avatar.name;
		if(this._mottoLabel) this._mottoLabel.textContent = avatar.motto;
	}

	/**
	 * Highlights the selected avatar in the grid.
	 * AS3 uses glow + halo bitmaps; we use CSS class.
	 */
	private highlightAvatar(): void
	{
		for(let i = 0; i < this._avatarItems.length; i++)
		{
			this._avatarItems[i].classList.toggle('selected', i === this._selectedIndex);
		}
	}

	/**
	 * AS3: onCancel() → showScreen(2) (Login)
	 */
	private _onCancel = (): void =>
	{
		this._context.showScreen(2);
	};

	/**
	 * AS3: onChooseAvatar() → context.loginWithAvatar()
	 */
	private _onChooseAvatar = (): void =>
	{
		if(this._avatars.length > 0)
		{
			this._context.loginWithAvatar(this._avatars[this._selectedIndex]);
		}
	};

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		for(const item of this._avatarItems)
		{
			item.removeEventListener('click', this._onAvatarClick);
		}

		this._cancelButton.removeEventListener('click', this._onCancel);
		this._saveButton.removeEventListener('click', this._onChooseAvatar);
		this._avatarItems.length = 0;
		this._avatars.length = 0;
		this._root.remove();
	}
}
