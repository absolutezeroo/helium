/**
 * Skin JSON loader.
 *
 * Loads window skin definitions from JSON files via Vite glob import.
 * Each skin describes templates (source regions in the spritesheet),
 * layouts (destination placement rules), and states (which template+layout to use).
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/BitmapSkinRenderer.as
 */

// ── Interfaces ───────────────────────────────────────────────────────

/**
 * A rectangular region (source or destination).
 */
export interface ISkinRegion
{
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * A single bitmap piece in a template (source region in the spritesheet).
 */
export interface ISkinTemplateEntity
{
	id: number;
	name: string;
	type: string;
	region: ISkinRegion;
}

/**
 * A template: a named collection of bitmap pieces in the spritesheet.
 */
export interface ISkinTemplate
{
	name: string;
	asset: string;
	entities: ISkinTemplateEntity[];
}

/**
 * A single piece in a layout (destination placement rules).
 */
export interface ISkinLayoutEntity
{
	id: number;
	name: string;
	colorize: boolean;
	color: number;
	blend: number;
	scaleH: number;
	scaleV: number;
	region: ISkinRegion;
}

/**
 * A layout: defines how pieces are placed and scaled in the target area.
 */
export interface ISkinLayout
{
	name: string;
	transparent: boolean;
	blendMode: string;
	entities: ISkinLayoutEntity[];
}

/**
 * A state: links a state name to a template and layout.
 */
export interface ISkinState
{
	name: string;
	layout: string;
	template: string;
}

/**
 * Full skin data structure as produced by the build tool.
 */
export interface ISkinData
{
	id: string;
	name: string;
	source: string;
	variables: Record<string, string>;
	templates: ISkinTemplate[];
	layouts: ISkinLayout[];
	states: ISkinState[];
}

// ── Loader ───────────────────────────────────────────────────────────

/**
 * All available skin JSON modules, loaded via Vite glob import.
 */
const skinModules = import.meta.glob<ISkinData>(
	'../assets/window-skins/habbo_skin_*.json',
	{ eager: false }
);

/**
 * In-memory cache of loaded skins.
 */
const skinCache: Map<string, ISkinData> = new Map();

/**
 * Map skin ID -> module path for fast lookup.
 */
const idToPath = new Map<string, string>();

for(const modulePath of Object.keys(skinModules))
{
	const basename = modulePath.split('/').pop() ?? '';
	const id = basename.replace(/\.json$/, '');

	idToPath.set(id, modulePath);
}

/**
 * Load a skin by its asset ID.
 *
 * @param assetName - The skin asset ID (e.g. 'habbo_skin_frame_xml')
 * @returns The skin data, or null if not found
 */
export async function loadSkin(assetName: string): Promise<ISkinData | null>
{
	const cached = skinCache.get(assetName);

	if(cached) return cached;

	const modulePath = idToPath.get(assetName);

	if(!modulePath)
	{
		console.warn(`[skinLoader] Skin not found: ${assetName}`);
		return null;
	}

	const loader = skinModules[modulePath];

	if(!loader)
	{
		console.warn(`[skinLoader] No loader for skin: ${assetName}`);
		return null;
	}

	const module = await loader() as unknown as { default: ISkinData } | ISkinData;
	const data = 'default' in module ? module.default : module;

	skinCache.set(assetName, data);

	return data;
}

/**
 * Get a previously loaded skin synchronously.
 *
 * @param assetName - The skin asset ID
 * @returns The skin data, or null if not yet loaded
 */
export function getSkinSync(assetName: string): ISkinData | null
{
	return skinCache.get(assetName) ?? null;
}

/**
 * Clear the skin cache.
 */
export function clearSkinCache(): void
{
	skinCache.clear();
}
