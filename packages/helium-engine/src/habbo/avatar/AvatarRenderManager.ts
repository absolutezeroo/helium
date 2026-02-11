import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_AssetLibrary} from '@iid/IIDAssetLibrary';
import type {IHabboConfigurationManager} from '../configuration/IHabboConfigurationManager';
import type {IAssetLibrary} from '@core/assets';
import type {IAvatarRenderManager} from './IAvatarRenderManager';
import type {IAvatarImage} from './IAvatarImage';
import type {IAvatarFigureContainer} from './IAvatarFigureContainer';
import type {IAvatarImageListener} from './IAvatarImageListener';
import type {IAvatarEffectListener} from './IAvatarEffectListener';
import type {IFigureData} from './structure/IFigureData';
import {AvatarStructure} from './AvatarStructure';
import {AssetAliasCollection} from './alias/AssetAliasCollection';
import {AvatarFigureContainer} from './AvatarFigureContainer';
import {AvatarImage} from './AvatarImage';
import {PlaceholderAvatarImage} from './PlaceholderAvatarImage';
import {AvatarAssetDownloadManager} from './AvatarAssetDownloadManager';
import {EffectAssetDownloadManager} from './EffectAssetDownloadManager';
import {AvatarRenderEvent} from './enum/AvatarRenderEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AvatarRenderManager');

/**
 * Main avatar render manager component. Initializes and manages the avatar rendering system.
 *
 * @see sources/win63_version/habbo/avatar/class_1808.as
 * @see sources/flash_version/com/sulake/habbo/avatar/AvatarRenderManager.as
 */
export class AvatarRenderManager extends Component implements IAvatarRenderManager
{
    private _structure: AvatarStructure;
    private _aliasCollection: AssetAliasCollection;
    private _avatarAssetDownloadManager: AvatarAssetDownloadManager | null = null;
    private _effectAssetDownloadManager: EffectAssetDownloadManager | null = null;
    private _configuration: IHabboConfigurationManager | null = null;
    private _assetLibrary: IAssetLibrary | null = null;
    private _figureMapReady: boolean = false;
    private _structureReady: boolean = false;
    private _geometryReady: boolean = false;
    private _partSetsReady: boolean = false;
    private _actionsReady: boolean = false;
    private _animationsReady: boolean = false;
    private _effectMapReady: boolean = false;

    constructor(context: IContext)
    {
        super(context);

        this._structure = new AvatarStructure();
        this._aliasCollection = new AssetAliasCollection();
    }

    private _isReady: boolean = false;

    public get isReady(): boolean
    {
        return this._isReady;
    }

    public get effectMap(): Map<string, any>
    {
        if(!this._effectAssetDownloadManager) return new Map();

        return this._effectAssetDownloadManager.effectMap;
    }

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboConfigurationManager,
                (config: IHabboConfigurationManager | null) =>
                {
                    this._configuration = config;

                    if(config)
                    {
                        this.onConfigurationReady();
                    }
                },
                true
            ),
            new ComponentDependency(
                IID_AssetLibrary,
                (assets: IAssetLibrary | null) =>
                {
                    this._assetLibrary = assets;
                },
                true
            ),
        ];
    }

    public createAvatarImage(
        figureString: string,
        scale: string,
        gender: string,
        listener: IAvatarImageListener | null = null,
        effectListener: IAvatarEffectListener | null = null
    ): IAvatarImage | null
    {
        if(!this._isReady) return null;

        const figureContainer = new AvatarFigureContainer(figureString);

        // Fill in mandatory parts
        this.validateAvatarFigure(figureContainer, gender);

        // Check if assets are ready
        if(this._avatarAssetDownloadManager && !this._avatarAssetDownloadManager.isReady(figureContainer))
        {
            // Download needed assets
            this._avatarAssetDownloadManager.loadFigureSetData(figureContainer, listener);

            // Return placeholder
            return new PlaceholderAvatarImage(
                this._structure,
                this._aliasCollection,
                figureContainer,
                scale
            );
        }

        return new AvatarImage(
            this._structure,
            this._aliasCollection,
            figureContainer,
            scale,
            this._effectAssetDownloadManager,
            effectListener
        );
    }

    public getFigureData(): IFigureData
    {
        return this._structure.figureData;
    }

    public getFigureStringWithFigureIds(figureString: string, gender: string, figureIds: number[]): string
    {
        const figure = new AvatarFigureContainer(figureString);

        for(const setId of figureIds)
        {
            const partSet = this._structure.figureData.getFigurePartSet(setId);

            if(partSet)
            {
                figure.updatePart(partSet.type, setId, [0]);
            }
        }

        return figure.getFigureString();
    }

    public isValidFigureSetForGender(setId: number, gender: string): boolean
    {
        const partSet = this._structure.figureData.getFigurePartSet(setId);

        if(!partSet) return false;

        return partSet.gender === gender || partSet.gender === 'U';
    }

    public getMandatoryAvatarPartSetIds(gender: string, clubLevel: number): string[]
    {
        return this._structure.getMandatorySetTypeIds(gender, clubLevel);
    }

    public createFigureContainer(figureString: string): IAvatarFigureContainer
    {
        return new AvatarFigureContainer(figureString);
    }

    public isFigureReady(figure: IAvatarFigureContainer): boolean
    {
        if(!this._avatarAssetDownloadManager) return false;

        return this._avatarAssetDownloadManager.isReady(figure);
    }

    public downloadFigure(figure: IAvatarFigureContainer, listener: IAvatarImageListener | null = null): void
    {
        if(!this._avatarAssetDownloadManager) return;

        this._avatarAssetDownloadManager.loadFigureSetData(figure, listener);
    }

    public injectFigureData(data: any): void
    {
        this._structure.injectFigureData(data);
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._avatarAssetDownloadManager)
        {
            this._avatarAssetDownloadManager.dispose();
            this._avatarAssetDownloadManager = null;
        }

        if(this._effectAssetDownloadManager)
        {
            this._effectAssetDownloadManager.dispose();
            this._effectAssetDownloadManager = null;
        }

        this._structure.dispose();
        this._aliasCollection.dispose();

        super.dispose();
    }

    /**
     * AS3 initComponent(): loads geometry/partsets from asset library (embedded in .nitro bundles),
     * registers a hardcoded Default action, and marks animations ready (per-effect only).
     *
     * @see sources/flash_version/com/sulake/habbo/avatar/AvatarRenderManager.as lines 67-82
     */
    private onConfigurationReady(): void
    {
        if(!this._configuration) return;

        log.info('Configuration ready, loading embedded avatar data...');

        // AS3 line 71: hardcoded Default action as initial fallback
        this._structure.initActions({
            action: [{
                id: 'Default',
                precedence: '1000',
                state: 'std',
                main: '1',
                isdefault: '1',
                geometrytype: 'vertical',
                activepartset: 'figure',
                assetpartdefinition: 'std'
            }]
        });
        this._actionsReady = true;

        // AS3 lines 74-75: load geometry/partsets from asset library (.nitro bundles)
        if(this._assetLibrary)
        {
            if(this._assetLibrary.hasAsset('HabboAvatarGeometry'))
            {
                const asset = this._assetLibrary.getAssetByName('HabboAvatarGeometry');

                if(asset?.content)
                {
                    this._structure.initGeometry(asset.content);
                    log.info('Loaded geometry from asset library');
                }
            }

            if(this._assetLibrary.hasAsset('HabboAvatarPartSets'))
            {
                const asset = this._assetLibrary.getAssetByName('HabboAvatarPartSets');

                if(asset?.content)
                {
                    this._structure.initPartSets(asset.content);
                    log.info('Loaded partsets from asset library');
                }
            }
        }

        this._geometryReady = true;
        this._partSetsReady = true;

        // Animation data comes per-effect from EffectAssetDownloadLibrary, not a global file
        this._animationsReady = true;

        this.checkReady();
    }

    /**
     * Called by HeliumMain when game_data hash URLs become available.
     * Loads all avatar resources whose URLs are derived from game_data hashes
     * (avatar.actions.url, avatar.figuredata.url, avatar.figuremap.url, etc.)
     * and any remaining resources not yet loaded.
     */
    public onGameDataReady(): void
    {
        if(!this._configuration) return;

        log.info('Game data URLs available, loading avatar resources...');

        // Load hash-based resources (URLs set by HeliumMain.onGameDataResourcesReady)
        this.loadActions();
        this.loadFigureData();

        // Initialize download managers (figure map + effect map)
        this.initDownloadManagers();
    }

    /**
     * Load actions from habbo_avatar_actions URL.
     * Uses updateActions() to append to the hardcoded Default action.
     *
     * @see AS3 RoomEngine._Str_1200() loads HabboAvatarActions.xml externally
     */
    private async loadActions(): Promise<void>
    {
        try
        {
            const url = this._configuration?.getProperty('avatar.actions.url');

            if(url)
            {
                const response = await fetch(url);
                const data = await response.json();

                this._structure.updateActions(data);
            }

            this.checkReady();
        }
        catch(error)
        {
            log.error('Failed to load actions data', error);
        }
    }

    private async loadFigureData(): Promise<void>
    {
        try
        {
            const url = this._configuration?.getProperty('avatar.figuredata.url');

            if(url)
            {
                const response = await fetch(url);
                const data = await response.json();

                this._structure.initFigureData(data);
            }

            this._structureReady = true;
            this.checkReady();
        }
        catch(error)
        {
            log.error('Failed to load figure data', error);
            this._structureReady = true;
            this.checkReady();
        }
    }

    private initDownloadManagers(): void
    {
        const avatarDownloadUrl = this._configuration?.getProperty('avatar.asset.url')
            || this._configuration?.getProperty('flash.dynamic.avatar.download.url')
            || '';
        const effectDownloadUrl = this._configuration?.getProperty('avatar.effect.url')
            || this._configuration?.getProperty('flash.dynamic.avatar.download.url')
            || '';

        log.info(`Avatar download URL: ${avatarDownloadUrl}`);
        log.info(`Effect download URL: ${effectDownloadUrl}`);

        if(!this._assetLibrary)
        {
            log.error('AssetLibrary not available for download managers');

            return;
        }

        // Connect alias collection to asset library for sprite resolution
        this._aliasCollection.setAssetLibrary(this._assetLibrary);

        this._avatarAssetDownloadManager = new AvatarAssetDownloadManager(
            avatarDownloadUrl,
            this._structure,
            this._assetLibrary,
            this._aliasCollection
        );

        this._effectAssetDownloadManager = new EffectAssetDownloadManager(
            effectDownloadUrl,
            this._structure,
            this._assetLibrary
        );

        // Load figure map
        this.loadFigureMap();

        // Load effect map
        this.loadEffectMap();
    }

    private async loadFigureMap(): Promise<void>
    {
        try
        {
            const url = this._configuration?.getProperty('avatar.figuremap.url');

            if(url && this._avatarAssetDownloadManager)
            {
                const response = await fetch(url);
                const data = await response.json();

                this._avatarAssetDownloadManager.loadFigureMap(data);
            }

            this._figureMapReady = true;
            this.checkReady();
        }
        catch(error)
        {
            log.error('Failed to load figure map', error);
            this._figureMapReady = true;
            this.checkReady();
        }
    }

    private async loadEffectMap(): Promise<void>
    {
        try
        {
            const url = this._configuration?.getProperty('avatar.effectmap.url');

            if(url && this._effectAssetDownloadManager)
            {
                const response = await fetch(url);
                const data = await response.json();

                this._effectAssetDownloadManager.loadEffectMap(data);
            }

            this._effectMapReady = true;
            this.checkReady();
        }
        catch(error)
        {
            log.error('Failed to load effect map', error);
            this._effectMapReady = true;
            this.checkReady();
        }
    }

    private checkReady(): void
    {
        if(this._isReady) return;

        if(this._geometryReady &&
            this._partSetsReady &&
            this._actionsReady &&
            this._animationsReady &&
            this._structureReady &&
            this._figureMapReady &&
            this._effectMapReady)
        {
            this._isReady = true;

            log.info('Avatar render system ready');
            this.events.emit(AvatarRenderEvent.AVATAR_RENDER_READY);
        }
    }

    private validateAvatarFigure(figure: AvatarFigureContainer, gender: string): void
    {
        const mandatoryTypes = this._structure.getMandatorySetTypeIds(gender, 0);

        for(const partType of mandatoryTypes)
        {
            if(!figure.hasPartType(partType))
            {
                const defaultPartSet = this._structure.getDefaultPartSet(partType, gender);

                if(defaultPartSet)
                {
                    figure.updatePart(partType, defaultPartSet.id, [0]);
                }
            }
        }
    }
}
