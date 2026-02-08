import type {ILinkEventTracker} from '@core/runtime';
import {Component, ComponentDependency, type IContext,} from '@core/runtime';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboQuestEngine} from './IHabboQuestEngine';
import {QuestController} from './QuestController';
import {AchievementController} from './AchievementController';
import {AchievementsResolutionController} from './AchievementsResolutionController';
import {RoomCompetitionController} from './RoomCompetitionController';
import {QuestMessageHandler} from './QuestMessageHandler';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('HabboQuestEngine');

/**
 * Main Quest Engine component
 *
 * Coordinates all quest subsystems: quests, achievements, resolutions,
 * and room competitions. Implements ILinkEventTracker for deep linking.
 *
 * @see source_as/habbo/quest/HabboQuestEngine.as
 */
export class HabboQuestEngine extends Component implements IHabboQuestEngine, ILinkEventTracker
{
	private _resolutionController: AchievementsResolutionController | null = null;
	private _competitionController: RoomCompetitionController | null = null;
	private _messageHandler: QuestMessageHandler | null = null;

	constructor(context: IContext)
	{
		super(context);
	}

	private _communicationManager: IHabboCommunicationManager | null = null;

	/**
	 * Get the communication manager
	 */
	get communicationManager(): IHabboCommunicationManager | null
	{
		return this._communicationManager;
	}

	private _questController: QuestController | null = null;

	/**
	 * Get the quest controller
	 */
	get questController(): QuestController | null
	{
		return this._questController;
	}

	private _achievementController: AchievementController | null = null;

	/**
	 * Get the achievement controller
	 */
	get achievementController(): AchievementController | null
	{
		return this._achievementController;
	}

	private _currentlyInRoom: boolean = false;

	/**
	 * Whether the user is currently in a room
	 */
	get currentlyInRoom(): boolean
	{
		return this._currentlyInRoom;
	}

	set currentlyInRoom(value: boolean)
	{
		this._currentlyInRoom = value;
	}

	private _isFirstLoginOfDay: boolean = false;

	/**
	 * Whether this is the first login of the day
	 */
	get isFirstLoginOfDay(): boolean
	{
		return this._isFirstLoginOfDay;
	}

	/**
	 * Get the achievements resolution controller
	 */
	get achievementsResolutionController(): AchievementsResolutionController | null
	{
		return this._resolutionController;
	}

	/**
	 * Get the room competition controller
	 */
	get roomCompetitionController(): RoomCompetitionController | null
	{
		return this._competitionController;
	}

	/**
	 * The link pattern for the ILinkEventTracker interface
	 */
	get linkPattern(): string
	{
		return 'questengine/';
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communicationManager = manager;
				},
				true
			),
		];
	}

	/**
	 * Set the first login of day flag
	 */
	setIsFirstLoginOfDay(value: boolean): void
	{
		this._isFirstLoginOfDay = value;
	}

	/**
	 * Handle a link event matching the "questengine/" pattern
	 *
	 * @param link The full link string
	 */
	linkReceived(link: string): void
	{
		const parts = link.split('/');

		if (parts.length < 2)
		{
			return;
		}

		switch (parts[1])
		{
			case 'gotorooms':
				this.goToQuestRooms();
				break;

			case 'achievements':
				if (parts.length === 3)
				{
					// Deep link to specific category: questengine/achievements/{category}
					this.showAchievements();
				}
				else
				{
					this.showAchievements();
				}
				break;

			case 'quests':
				this.showQuests();
				break;

			default:
				log.warn(`QuestEngine unknown link-type received: ${parts[1]}`);
		}
	}

	/**
	 * Send a message through the communication manager
	 *
	 * @param composer The message composer to send
	 */
	send(composer: IMessageComposer<unknown[]>): void
	{
		const connection = this._communicationManager?.connection;

		if (connection)
		{
			connection.send(composer);
		}
	}

	/**
	 * Request all quests from the server
	 */
	requestQuests(): void
	{
		// send(new GetQuestsMessageComposer());
		// Composer will be imported once available
		log.debug('Requesting quests');
	}

	/**
	 * Request seasonal quests from the server
	 */
	requestSeasonalQuests(): void
	{
		// send(new GetSeasonalQuestsOnlyMessageComposer());
		// Composer will be imported once available
		log.debug('Requesting seasonal quests');
	}

	/**
	 * Activate a quest by its ID
	 *
	 * @param questId The quest ID to activate
	 */
	activateQuest(questId: number): void
	{
		// send(new ActivateQuestMessageComposer(questId));
		// Composer will be imported once available
		log.debug(`Activating quest: ${questId}`);
	}

	/**
	 * Show the quests panel
	 */
	showQuests(): void
	{
		// Emit event for UI to handle
		this.events.emit('showQuests');
		log.debug('Show quests requested');
	}

	/**
	 * Show the achievements panel
	 */
	showAchievements(): void
	{
		// Emit event for UI to handle
		this.events.emit('showAchievements');
		log.debug('Show achievements requested');
	}

	/**
	 * Ensure achievements data has been requested from the server
	 */
	ensureAchievementsInitialized(): void
	{
		if (this._achievementController)
		{
			this._achievementController.ensureAchievementsInitialized();
		}
	}

	/**
	 * Get the user's achievement level for a given category and badge
	 *
	 * @param category The achievement category code
	 * @param badge The badge identifier
	 * @returns The user's level for the achievement, or 0 if not found
	 */
	getAchievementLevel(category: string, badge: string): number
	{
		if (this._achievementController)
		{
			return this._achievementController.getAchievementLevel(category, badge);
		}

		return 0;
	}

	/**
	 * Navigate to a random quest room via link event
	 */
	goToQuestRooms(): void
	{
		this.context.createLinkEvent('navigator/goto/quest_rooms');
		log.debug('Going to quest rooms');
	}

	/**
	 * Dispose of this engine and all controllers
	 */
	override dispose(): void
	{
		if (this.disposed) return;

		// Remove link event tracker
		this.context.removeLinkEventTracker(this);

		// Dispose message handler
		if (this._messageHandler)
		{
			this._messageHandler.dispose();
			this._messageHandler = null;
		}

		// Dispose controllers
		if (this._questController)
		{
			this._questController.dispose();
			this._questController = null;
		}

		if (this._achievementController)
		{
			this._achievementController.dispose();
			this._achievementController = null;
		}

		if (this._resolutionController)
		{
			this._resolutionController.dispose();
			this._resolutionController = null;
		}

		if (this._competitionController)
		{
			this._competitionController.dispose();
			this._competitionController = null;
		}

		log.info('HabboQuestEngine disposed');

		super.dispose();
	}

	/**
	 * Called when all required dependencies are available.
	 * Creates all controllers and the message handler, registers link event tracker.
	 */
	protected override initComponent(): void
	{
		// Create controllers
		this._questController = new QuestController(this);
		this._achievementController = new AchievementController(this);
		this._resolutionController = new AchievementsResolutionController(this);
		this._competitionController = new RoomCompetitionController(this);

		// Create message handler (registers all message events)
		this._messageHandler = new QuestMessageHandler(this);

		// Register link event tracker
		this.context.addLinkEventTracker(this);

		log.info('HabboQuestEngine initialized');
	}
}
