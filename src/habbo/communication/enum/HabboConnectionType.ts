/**
 * Habbo Connection Type Constants
 *
 * @see source_as/habbo/communication/enum/HabboConnectionType.as
 */
export const HabboConnectionType = {
	HABBO_MAIN: 'habbo',
	NORMAL_MODE: 0,
	DEVELOPMENT_MODE: 1,
	NO_CRYPTO_MODE: 2,
} as const;

export type HabboConnectionModeType = typeof HabboConnectionType[keyof typeof HabboConnectionType];
