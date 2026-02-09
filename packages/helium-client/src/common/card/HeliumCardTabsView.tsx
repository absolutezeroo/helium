import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

export interface TabItem
{
	id: string;
	label: string;
	count?: number;
	icon?: JSX.Element;
}

export interface HeliumCardTabsViewProps extends ParentProps
{
	class?: string;
}

/**
 * HeliumCardTabsView - Tabs container for card windows (Nitro-style).
 *
 * @see source_nitro_react/common/card/tabs/NitroCardTabsView.tsx
 */
export function HeliumCardTabsView(props: HeliumCardTabsViewProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'container-fluid helium-card-tabs d-flex justify-content-center align-items-center gap-1 pt-1',
				props.class
			)}
		>
			{props.children}
		</div>
	);
}
