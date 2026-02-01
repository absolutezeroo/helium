/**
 * User profile data from UserObjectMessageEvent
 */
export interface UserData
{
	id: number;
	name: string;
	figure: string;
	gender: string;
	motto: string;
	realName: string;
	respectsReceived: number;
	respectsRemaining: number;
	respectsPetRemaining: number;
	streamPublishingAllowed: boolean;
	lastAccessDate: string;
	canChangeName: boolean;
	safetyLocked: boolean;
}

/**
 * Server availability status
 */
export interface AvailabilityStatus
{
	isOpen: boolean;
	onShutDown: boolean;
	isAuthenticHabbo: boolean;
}
