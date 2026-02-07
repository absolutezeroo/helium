import type {JSX} from 'solid-js';
import clsx from 'clsx';

export type CurrencyType = 'credits' | 'diamonds' | 'duckets';

export interface LayoutCurrencyIconProps
{
	type: CurrencyType;
	class?: string;
}

const CURRENCY_COLORS: Record<CurrencyType, string> =
{
	credits: 'text-credits',
	diamonds: 'text-diamonds',
	duckets: 'text-duckets',
};

const CURRENCY_LABELS: Record<CurrencyType, string> =
{
	credits: 'C',
	diamonds: 'D',
	duckets: 'K',
};

/**
 * LayoutCurrencyIcon - Icon for credits/diamonds/duckets.
 */
export function LayoutCurrencyIcon(props: LayoutCurrencyIconProps): JSX.Element
{
	return (
		<span
			class={clsx(
				'inline-flex items-center justify-center w-5 h-5',
				'rounded-full text-xs font-bold',
				CURRENCY_COLORS[props.type],
				props.class
			)}
		>
			{CURRENCY_LABELS[props.type]}
		</span>
	);
}
