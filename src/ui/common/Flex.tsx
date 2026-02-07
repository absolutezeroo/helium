import type {JSX, ParentProps} from 'solid-js';
import {splitProps} from 'solid-js';
import clsx from 'clsx';

export interface FlexProps extends ParentProps
{
	column?: boolean;
	center?: boolean;
	gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
	justify?: 'start' | 'center' | 'end' | 'between' | 'around';
	wrap?: boolean;
	class?: string;
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
	style?: JSX.CSSProperties | string;
	onClick?: (e: MouseEvent) => void;
	onMouseDown?: (e: MouseEvent) => void;
}

const GAP_MAP: Record<number, string> =
{
	0: 'gap-0',
	1: 'gap-1',
	2: 'gap-2',
	3: 'gap-3',
	4: 'gap-4',
	5: 'gap-5',
	6: 'gap-6',
};

const ALIGN_MAP: Record<string, string> =
{
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
};

const JUSTIFY_MAP: Record<string, string> =
{
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
};

export function Flex(props: FlexProps): JSX.Element
{
	const [local, rest] = splitProps(props, [
		'column', 'center', 'gap', 'align', 'justify', 'wrap', 'class', 'children',
		'ref', 'style', 'onClick', 'onMouseDown',
	]);

	return (
		<div
			ref={local.ref as HTMLDivElement | undefined}
			class={clsx(
				'flex',
				local.column && 'flex-col',
				local.center && 'items-center justify-center',
				local.gap !== undefined && GAP_MAP[local.gap],
				local.align && !local.center && ALIGN_MAP[local.align],
				local.justify && !local.center && JUSTIFY_MAP[local.justify],
				local.wrap && 'flex-wrap',
				local.class
			)}
			style={local.style}
			onClick={local.onClick}
			onMouseDown={local.onMouseDown}
		>
			{local.children}
		</div>
	);
}
