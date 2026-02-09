import type {JSX} from 'solid-js';
import {Match, Switch} from 'solid-js';

export type InventoryIconName =
	| 'furni' | 'badges' | 'effects' | 'pets' | 'bots'
	| 'trading' | 'search' | 'close' | 'grid' | 'list'
	| 'place' | 'recycle' | 'sell' | 'use' | 'unseen';

export interface InventoryIconProps
{
	name: InventoryIconName;
	size?: 'xs' | 'sm' | 'md' | 'lg';
	class?: string;
}

const sizeClasses = {
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
};

export function InventoryIcon(props: InventoryIconProps): JSX.Element
{
	const sizeClass = () => sizeClasses[props.size ?? 'md'];

	return (
		<Switch>
			<Match when={props.name === 'furni'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
				</svg>
			</Match>
			<Match when={props.name === 'badges'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
				</svg>
			</Match>
			<Match when={props.name === 'effects'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
				</svg>
			</Match>
			<Match when={props.name === 'pets'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
			</Match>
			<Match when={props.name === 'bots'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
				</svg>
			</Match>
			<Match when={props.name === 'trading'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
				</svg>
			</Match>
			<Match when={props.name === 'search'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
				</svg>
			</Match>
			<Match when={props.name === 'close'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</Match>
			<Match when={props.name === 'grid'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
				</svg>
			</Match>
			<Match when={props.name === 'list'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
				</svg>
			</Match>
			<Match when={props.name === 'place'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
				</svg>
			</Match>
			<Match when={props.name === 'use'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="none" viewBox="0 0 24 24"
					 stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
			</Match>
			<Match when={props.name === 'unseen'}>
				<svg class={`${sizeClass()} ${props.class ?? ''}`} fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="4"/>
				</svg>
			</Match>
		</Switch>
	);
}
