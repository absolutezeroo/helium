import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {NavigatorIcon, type IconName} from '../common';

export interface NavigatorTabProps {
    id: string;
    label: string;
    icon?: IconName;
    badge?: number | string;
    disabled?: boolean;
    isActive: boolean;
    onClick: (tabId: string) => void;
}

/**
 * Individual navigator tab button
 */
export function NavigatorTab(props: NavigatorTabProps): JSX.Element {
    const handleClick = () => {
        if (!props.disabled) {
            props.onClick(props.id);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={props.disabled}
            class={`
                relative flex items-center gap-1.5
                px-3 py-2
                text-sm font-medium
                transition-all duration-150
                border-b-2 -mb-px
                ${props.isActive
                    ? 'text-amber-400 border-amber-400 bg-slate-800/50'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/30'
                }
                ${props.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
            `}
        >
            <Show when={props.icon}>
                <NavigatorIcon
                    name={props.icon!}
                    size="sm"
                    class={props.isActive ? 'text-amber-400' : 'text-slate-400'}
                />
            </Show>

            <span>{props.label}</span>

            <Show when={props.badge !== undefined}>
                <span
                    class={`
                        ml-1 px-1.5 py-0.5
                        text-xs font-bold rounded-full
                        ${props.isActive
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-slate-600 text-slate-300'
                        }
                    `}
                >
                    {props.badge}
                </span>
            </Show>
        </button>
    );
}
