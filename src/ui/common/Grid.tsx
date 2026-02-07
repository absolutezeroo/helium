import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

export interface GridProps extends ParentProps
{
	cols?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
	gap?: 0 | 1 | 2 | 3 | 4;
	class?: string;
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
	style?: JSX.CSSProperties | string;
}

const COLS_MAP: Record<number, string> =
{
	2: 'grid-cols-2',
	3: 'grid-cols-3',
	4: 'grid-cols-4',
	5: 'grid-cols-5',
	6: 'grid-cols-6',
	7: 'grid-cols-7',
	8: 'grid-cols-8',
};

const GAP_MAP: Record<number, string> =
{
	0: 'gap-0',
	1: 'gap-1',
	2: 'gap-2',
	3: 'gap-3',
	4: 'gap-4',
};

export function Grid(props: GridProps): JSX.Element
{
	return (
		<div
			ref={props.ref as HTMLDivElement | undefined}
			class={clsx(
				'grid',
				props.cols && COLS_MAP[props.cols],
				props.gap !== undefined && GAP_MAP[props.gap],
				props.class
			)}
			style={props.style}
		>
			{props.children}
		</div>
	);
}
