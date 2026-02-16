import type {IWindow} from '../IWindow';

/**
 * Interface for parsing window layout definitions and constructing window trees.
 *
 * In AS3 this parsed XML; in TypeScript we parse JSON layout definitions.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/IWindowParser.as
 */
export interface IWindowParser
{
	readonly disposed: boolean;

	parseAndConstruct(layout: Record<string, unknown>, parent: IWindow, namedWindows: Map<string, IWindow> | null): IWindow | null;

	windowToLayoutString(window: IWindow): string;

	dispose(): void;
}
