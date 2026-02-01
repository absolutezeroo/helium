/**
 * Helium IoC Symbols
 * Dependency injection identifiers for Inversify
 */
export const TYPES = {
	// Core
	Helium: Symbol.for('Helium'),
	AssetLibrary: Symbol.for('AssetLibrary'),
	CommunicationManager: Symbol.for('CommunicationManager'),
	GameDataManager: Symbol.for('GameDataManager'),
	LocalizationManager: Symbol.for('LocalizationManager'),
	RuntimeManager: Symbol.for('RuntimeManager'),
	WindowManager: Symbol.for('WindowManager'),

	// Room
	RoomEngine: Symbol.for('RoomEngine'),
	RoomManager: Symbol.for('RoomManager'),
	RoomRenderer: Symbol.for('RoomRenderer'),

	// Habbo
	AvatarRenderManager: Symbol.for('AvatarRenderManager'),
	CatalogManager: Symbol.for('CatalogManager'),
	HabboConfigurationManager: Symbol.for('HabboConfigurationManager'),
	HabboCommunicationManager: Symbol.for('HabboCommunicationManager'),
	InventoryManager: Symbol.for('InventoryManager'),
	NavigatorManager: Symbol.for('NavigatorManager'),
	NewNavigatorManager: Symbol.for('NewNavigatorManager'),
	SessionManager: Symbol.for('SessionManager'),
	SoundManager: Symbol.for('SoundManager'),
	UIManager: Symbol.for('UIManager'),
} as const;
