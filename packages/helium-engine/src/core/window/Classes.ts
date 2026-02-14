import { WindowType } from './enum/WindowType';

/**
 * Registry mapping window type IDs to their controller constructors.
 *
 * In AS3, each type maps to a specific controller class (ButtonController,
 * ContainerController, etc.). The Classes registry is used by WindowContext.create()
 * to instantiate the correct controller for a given type.
 *
 * Controllers are registered lazily on first call to init().
 *
 * @see sources/win63_2021_version/com/sulake/core/window/Classes.as
 */
export class Classes
{
    private static _registry: Map<number, new (...args: unknown[]) => unknown> | null = null;

    /**
     * Initializes the type→constructor registry with all known window types.
     *
     * Must be called before any window creation. Safe to call multiple times.
     */
    public static init(): void
    {
        if(Classes._registry) return;

        Classes._registry = new Map();

        // Registration happens when component controllers are imported.
        // Each controller module calls Classes.register() to register itself.
        // This avoids circular dependency issues with the controllers.
    }

    /**
     * Registers a controller constructor for a window type.
     *
     * @param type - The WindowType value
     * @param ctor - The controller constructor
     */
    public static register(type: number, ctor: new (...args: unknown[]) => unknown): void
    {
        if(!Classes._registry) Classes.init();

        Classes._registry!.set(type, ctor);
    }

    /**
     * Registers a controller constructor for multiple window types.
     *
     * @param types - Array of WindowType values
     * @param ctor - The controller constructor
     */
    public static registerMultiple(types: number[], ctor: new (...args: unknown[]) => unknown): void
    {
        for(const type of types)
        {
            Classes.register(type, ctor);
        }
    }

    /**
     * Returns the controller constructor for a given window type.
     *
     * @param type - The WindowType value
     * @returns The constructor, or null if not registered
     */
    public static getWindowClassByType(type: number): (new (...args: unknown[]) => unknown) | null
    {
        if(!Classes._registry) Classes.init();

        return Classes._registry!.get(type) ?? null;
    }

    /**
     * Returns all registered type IDs.
     */
    public static getRegisteredTypes(): number[]
    {
        if(!Classes._registry) return [];

        return [...Classes._registry.keys()];
    }
}

// Export WindowType values for convenience in registration
export { WindowType };
