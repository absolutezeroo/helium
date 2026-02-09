import type {JSX, Setter} from 'solid-js';
import {onMount, onCleanup} from 'solid-js';

interface ToolbarMeViewProps
{
	setMeExpanded: Setter<boolean>;
}

/**
 * ToolbarMeView - "Me" popup menu above the avatar icon.
 *
 * @see source_nitro_react/components/toolbar/ToolbarMeView.tsx
 */
export function ToolbarMeView(props: ToolbarMeViewProps): JSX.Element
{
	onMount(() =>
	{
		const onClick = () => props.setMeExpanded(false);

		document.addEventListener('click', onClick);

		onCleanup(() => document.removeEventListener('click', onClick));
	});

	return (
		<div class="helium-toolbar-me d-flex align-items-center p-2 gap-2">
			<div class="navigation-item icon icon-me-achievements cursor-pointer" />
			<div class="navigation-item icon icon-me-profile cursor-pointer" />
			<div class="navigation-item icon icon-me-rooms cursor-pointer" />
			<div class="navigation-item icon icon-me-clothing cursor-pointer" />
			<div class="navigation-item icon icon-me-settings cursor-pointer" />
		</div>
	);
}
