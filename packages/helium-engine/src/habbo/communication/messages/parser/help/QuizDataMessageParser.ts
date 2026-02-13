import type { IMessageParser } from '@core/communication/messages/IMessageParser';
import type { IMessageDataWrapper } from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses quiz data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/QuizDataMessageEventParser.as
 */
export class QuizDataMessageParser implements IMessageParser
{
	private _quizCode: string = '';
	private _questionIds: Array<number> = [];

	flush(): boolean
	{
		this._quizCode = '';
		this._questionIds = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._quizCode = wrapper.readString();
		this._questionIds = [];

		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._questionIds.push(wrapper.readInt());
		}

		return true;
	}

	get quizCode(): string
	{
		return this._quizCode;
	}

	get questionIds(): Array<number>
	{
		return this._questionIds;
	}
}
