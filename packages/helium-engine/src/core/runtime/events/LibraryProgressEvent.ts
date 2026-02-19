/**
 * Library loading progress event data class.
 *
 * Carries progress information for library/asset loading.
 *
 * @see sources/win63_version/core/runtime/events/LibraryProgressEvent.as
 */
export class LibraryProgressEvent
{
	private _fileName: string;
	private _bytesLoaded: number;
	private _bytesTotal: number;
	private _elapsedTime: number;

	constructor(fileName: string, bytesLoaded: number = 0, bytesTotal: number = 0, elapsedTime: number = 0)
	{
		this._fileName = fileName;
		this._bytesLoaded = bytesLoaded;
		this._bytesTotal = bytesTotal;
		this._elapsedTime = elapsedTime;
	}

	get fileName(): string
	{
		return this._fileName;
	}

	get bytesLoaded(): number
	{
		return this._bytesLoaded;
	}

	get bytesTotal(): number
	{
		return this._bytesTotal;
	}

	get elapsedTime(): number
	{
		return this._elapsedTime;
	}

	/**
	 * Loading progress as a value between 0 and 1
	 */
	get progress(): number
	{
		return this._bytesTotal > 0 ? this._bytesLoaded / this._bytesTotal : 0;
	}
}
