import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidXmark} from 'solid-icons/fa';

export interface HeliumCardHeaderViewProps extends ParentProps
{
	title: string;
	icon?: JSX.Element;
	onClose?: () => void;
	class?: string;
}

/**
 * HeliumCardHeaderView - Standard window header (Nitro-style).
 *
 * Uses `drag-handler` class for HeliumCardView to detect as drag handle.
 *
 * @see source_nitro_react/common/card/NitroCardHeaderView.tsx
 */
export function HeliumCardHeaderView(props: HeliumCardHeaderViewProps): JSX.Element
{
	const onMouseDown = (e: MouseEvent) =>
	{
		e.stopPropagation();
	};

	return (
		<div
			class={clsx(
				'drag-handler container-fluid helium-card-header',
				'd-flex justify-content-center align-items-center position-relative',
				props.class
			)}
		>
			<div class="d-flex w-100 justify-content-center">
				<span class="helium-card-header-text">{props.title}</span>
				{props.children}
				<Show when={props.onClose}>
					<div
						class="d-flex justify-content-center align-items-center position-absolute end-2 helium-card-header-close"
						onMouseDown={onMouseDown}
						onClick={() => props.onClose?.()}
					>
						<FaSolidXmark class="w-12 h-12" />
					</div>
				</Show>
			</div>
		</div>
	);
}
