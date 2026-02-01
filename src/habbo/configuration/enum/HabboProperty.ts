/**
 * Configuration property key constants
 *
 * Based on AS3: com.sulake.habbo.configuration.enum.HabboProperty
 *
 * Provides type-safe access to configuration values,
 * preventing typos when accessing getProperty/setProperty.
 *
 * Usage:
 * ```typescript
 * const host = config.getProperty(HabboProperty.CONNECTION_HOST);
 * ```
 */
export const HabboProperty = {
	// Environment
	ENVIRONMENT_ID: 'environment.id',
	LIVE_ENVIRONMENTS: 'live.environment.list',

	// Authentication
	SSO_TOKEN: 'sso.token',
	USE_SSO: 'use.sso',

	// Connection
	CONNECTION_HOST: 'connection.info.host',
	CONNECTION_PORT: 'connection.info.port',
	DISABLE_CRYPTO: 'disable.crypto',

	// URLs
	URL_PREFIX: 'url.prefix',
	SITE_URL: 'site.url',
	CLIENT_URL: 'flash.client.url',
	CLIENT_ORIGIN: 'flash.client.origin',
	LOGOUT_URL: 'logout.url',
	LOGOUT_DISCONNECT_URL: 'logout.disconnect.url',

	// External files
	EXTERNAL_VARIABLES: 'external.variables.txt',
	GAMEDATA_HASHES_URL: 'gamedata.hashes.url',

	// Dynamic downloads
	DYNAMIC_DOWNLOAD_URL: 'flash.dynamic.download.url',
	DYNAMIC_DOWNLOAD_NAME_TEMPLATE: 'flash.dynamic.download.name.template',
	AVATAR_DOWNLOAD_CONFIGURATION: 'flash.dynamic.avatar.download.configuration',
	AVATAR_DOWNLOAD_URL: 'flash.dynamic.avatar.download.url',

	// Client state
	CLIENT_STARTING: 'client.starting',
	CLIENT_STARTING_LOADING: 'client.starting.revolving',

	// Logging
	PROCESSLOG_ENABLED: 'processlog.enabled',

	// New user flow
	NEW_USER_FLOW_ENABLED: 'new.user.flow.enabled',
	NEW_USER_FLOW_PAGE: 'new.user.flow.page',
	NEW_USER_ONBOARDING_HC_FLOW_ENABLED: 'new.user.onboarding.hc.flow.enabled',
	NEW_USER_ONBOARDING_SHOW_HC_ITEMS: 'new.user.onboarding.show.hc.items',

	// APIs
	POCKET_API: 'pocket.api',
	WEB_API: 'web.api',

	// Third-party
	FACEBOOK_APPLICATION_ID: 'facebook.application.id',

	// Legal
	TERMS_OF_SERVICE_URL: 'web.terms_of_service.link',
} as const;

export type HabboPropertyType = typeof HabboProperty;
export type HabboPropertyKey = (typeof HabboProperty)[keyof typeof HabboProperty];
