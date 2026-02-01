import type {JSX} from 'solid-js';
import {For} from 'solid-js';
import {NavigatorTab} from './NavigatorTab';
import type {IconName} from '../common';

export interface TabDefinition {
    id: string;
    label: string;
    icon?: IconName;
    badge?: number | string;
    disabled?: boolean;
}

export interface NavigatorTabsProps {
    tabs: TabDefinition[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    class?: string;
}

/**
 * Navigator tabs container - manages multiple tabs
 */
export function NavigatorTabs(props: NavigatorTabsProps): JSX.Element {
    return (
        <div
            class={`
                flex items-center
                border-b border-slate-700
                bg-slate-800/30
                overflow-x-auto
                ${props.class ?? ''}
            `}
        >
            <For each={props.tabs}>
                {(tab) => (
                    <NavigatorTab
                        id={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        badge={tab.badge}
                        disabled={tab.disabled}
                        isActive={props.activeTab === tab.id}
                        onClick={props.onTabChange}
                    />
                )}
            </For>
        </div>
    );
}
