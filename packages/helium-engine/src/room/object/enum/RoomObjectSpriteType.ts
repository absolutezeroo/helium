/**
 * RoomObjectSpriteType
 *
 * Based on AS3: com.sulake.room.object.enum.RoomObjectSpriteType
 *
 * Sprite type constants for room object sprites.
 */
export const RoomObjectSpriteType = {
	DEFAULT: 1,
	ROOM_PLANE: 2,
	AVATAR: 3,
	FURNITURE: 4,
} as const;

export type RoomObjectSpriteType = typeof RoomObjectSpriteType[keyof typeof RoomObjectSpriteType];
