import type {JSX} from 'solid-js';
import {NavigatorIcon, type IconName} from './NavigatorIcon';

export interface NavigatorButtonProps {
    children?: JSX.Element;
    type?: 'button' | 'submit' | 'reset';
    icon?: IconName;
    iconPosition?: 'left' | 'right';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
    class?: string;
    title?: string;
}

const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-700',
    secondary: 'bg-slate-600 hover:bg-slate-500 text-white border-slate-700',
    ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 border-transparent',
    danger: 'bg-red-600 hover:bg-red-500 text-white border-red-700',
    success: 'bg-green-600 hover:bg-green-500 text-white border-green-700',
};

const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
};

const iconSizes: Record<string, 'sm' | 'md' | 'lg'> = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
};

/**
 * Navigator button component
 */
export function NavigatorButton(props: NavigatorButtonProps): JSX.Element {
    const variant = () => variantClasses[props.variant ?? 'secondary'];
    const size = () => sizeClasses[props.size ?? 'md'];
    const iconSize = () => iconSizes[props.size ?? 'md'];

    const baseClasses = `
        inline-flex items-center justify-center
        rounded border font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        <button
            type={props.type ?? 'button'}
            class={`
                ${baseClasses}
                ${variant()}
                ${size()}
                ${props.fullWidth ? 'w-full' : ''}
                ${props.class ?? ''}
            `}
            disabled={props.disabled || props.loading}
            onClick={props.onClick}
            title={props.title}
        >
            {props.loading && (
                <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                    />
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {props.icon && props.iconPosition !== 'right' && !props.loading && (
                <NavigatorIcon name={props.icon} size={iconSize()} />
            )}
            {props.children}
            {props.icon && props.iconPosition === 'right' && !props.loading && (
                <NavigatorIcon name={props.icon} size={iconSize()} />
            )}
        </button>
    );
}

/**
 * Icon-only button variant
 */
export interface IconButtonProps {
    icon: IconName;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    onClick?: () => void;
    class?: string;
    title?: string;
}

const iconButtonSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
};

export function IconButton(props: IconButtonProps): JSX.Element {
    const variant = () => variantClasses[props.variant ?? 'ghost'];
    const size = () => iconButtonSizes[props.size ?? 'md'];
    const iconSize = () => iconSizes[props.size ?? 'md'];

    return (
        <button
            type="button"
            class={`
                inline-flex items-center justify-center
                rounded border
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variant()}
                ${size()}
                ${props.class ?? ''}
            `}
            disabled={props.disabled}
            onClick={props.onClick}
            title={props.title}
        >
            <NavigatorIcon name={props.icon} size={iconSize()} />
        </button>
    );
}
