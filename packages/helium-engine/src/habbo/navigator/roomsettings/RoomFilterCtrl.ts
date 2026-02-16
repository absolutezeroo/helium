import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';

/**
 * Room word filter editor controller.
 *
 * Manages the list of filtered words for a room.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/RoomFilterCtrl.as
 */
export class RoomFilterCtrl implements IDisposable
{
	private _flatId: number = 0;
	private _navigator: IHabboTransitionalNavigator | null;
	private _selectedIndex: number = -1;
	private _window: IWindowContainer | null = null;
	private _badWords: string[] = [];
	private _listWindow: IItemListWindow | null = null;
	private _addWordInput: ITextFieldWindow | null = null;

	constructor(navigator: IHabboTransitionalNavigator)
	{
		this._navigator = navigator;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Opens the room filter editor.
	 *
	 * @param flatId - The room ID
	 */
	startRoomFilterEdit(flatId: number): void
	{
		this._flatId = flatId;

		// Would send GetCustomRoomFilterMessageComposer
	}

	/**
	 * Receives filter settings from server.
	 *
	 * @param badWords - Array of filtered words
	 */
	onRoomFilterSettings(badWords: string[]): void
	{
		this._badWords = badWords;
		this.refreshBadWords();
	}

	close(): void
	{
		if (this._window)
		{
			(this._window as IWindow).visible = false;
		}
	}

	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		if (this._window)
		{
			(this._window as IWindow).dispose();
			this._window = null;
		}

		this._navigator = null;
	}

	private refreshBadWords(): void
	{
		// Rebuild word list UI
	}

	private addBadWord(word: string): void
	{
		if (!word || word.trim().length === 0) return;

		this._badWords.push(word);
		this.refreshBadWords();

		// Would send UpdateRoomFilterMessageComposer(ADD)
	}
}
