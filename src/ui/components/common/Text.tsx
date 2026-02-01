import {createMemo, type JSX} from 'solid-js';
import {localizationStore} from '../../stores';

export interface TextProps
{
	/** Localization key */
	key: string;
	/** Default value if key not found */
	default?: string;
	/** Parameters to substitute in the text */
	params?: Record<string, string>;
	/** HTML element to render (default: span) */
	as?: keyof JSX.IntrinsicElements;
	/** Additional class names */
	class?: string;
}

/**
 * Component for displaying localized text
 *
 * Usage:
 * ```tsx
 * <Text key="landing.welcome" />
 * <Text key="catalog.item.price" params={{price: "100"}} />
 * <Text key="error.message" default="An error occurred" />
 * ```
 */
export function Text(props: TextProps): JSX.Element
{
	const text = createMemo(() =>
	{
		if (props.params)
		{
			return localizationStore.getWithParams(props.key, props.params, props.default);
		}
		return localizationStore.get(props.key, props.default);
	});

	const Tag = props.as || 'span';

	return <Tag class={props.class}>{text()}</Tag>;
}

/**
 * Hook for getting localized text in components
 *
 * Usage:
 * ```tsx
 * const t = useLocalization();
 * return <div>{t('landing.welcome')}</div>;
 * ```
 */
export function useLocalization()
{
	return (key: string, defaultValue?: string) =>
	{
		return localizationStore.get(key, defaultValue);
	};
}

/**
 * Hook for getting localized text with parameters
 *
 * Usage:
 * ```tsx
 * const tp = useLocalizationWithParams();
 * return <div>{tp('catalog.price', {price: '100'})}</div>;
 * ```
 */
export function useLocalizationWithParams()
{
	return (key: string, params: Record<string, string>, defaultValue?: string) =>
	{
		return localizationStore.getWithParams(key, params, defaultValue);
	};
}
