/**
 * Helium IoC Symbols
 * Dependency injection identifiers for Inversify
 */
export const TYPES = {
    // Core
    Helium: Symbol.for('Helium'),
    AssetLibrary: Symbol.for('AssetLibrary'),
    CommunicationManager: Symbol.for('CommunicationManager'),
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
    ConfigurationManager: Symbol.for('ConfigurationManager'),
    HabboCommunicationManager: Symbol.for('HabboCommunicationManager'),
    InventoryManager: Symbol.for('InventoryManager'),
    NavigatorManager: Symbol.for('NavigatorManager'),
    NewNavigatorManager: Symbol.for('NewNavigatorManager'),
    SessionManager: Symbol.for('SessionManager'),
    SoundManager: Symbol.for('SoundManager'),
    UIManager: Symbol.for('UIManager'),
} as const;
