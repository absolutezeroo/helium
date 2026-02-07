/**
 * Local interface for achievement data used in category management.
 * This mirrors the parser data class from the communication layer.
 */
export interface AchievementData
{
	id: number;
	groupId: number;
	badgeId: string;
	category: string;
	state: number;
	currentPoints: number;
	scoreAtStartOfLevel: number;
	scoreLimit: number;
	levelRewardPoints: number;
	levelRewardPointType: number;
	levels: number;
	levelCount: number;
	displayProgress: boolean;
	finalLevel: boolean;
	firstLevelAchieved: boolean;
	achievementId: number;
	level: number;
}

/**
 * Single achievement category containing achievements and progress calculations
 *
 * @see source_as/habbo/quest/AchievementCategory.as
 */
export class AchievementCategory
{
	private _code: string;

	get code(): string
	{
		return this._code;
	}

	private _achievements: AchievementData[] = [];

	get achievements(): AchievementData[]
	{
		return this._achievements;
	}

	constructor(code: string)
	{
		this._code = code;
	}

	/**
	 * Add an achievement to this category
	 *
	 * @param data The achievement data to add
	 */
	add(data: AchievementData): void
	{
		this._achievements.push(data);
	}

	/**
	 * Update an existing achievement in this category
	 *
	 * @param data The updated achievement data
	 */
	update(data: AchievementData): void
	{
		for (let i = 0; i < this._achievements.length; i++)
		{
			if (this._achievements[i].achievementId === data.achievementId)
			{
				this._achievements[i] = data;
				return;
			}
		}
	}

	/**
	 * Calculate the current progress for this category.
	 * For each achievement: if finalLevel, count full level; otherwise count level - 1.
	 *
	 * @returns The total progress across all achievements
	 */
	getProgress(): number
	{
		let progress = 0;

		for (const achievement of this._achievements)
		{
			progress += achievement.finalLevel ? achievement.level : (achievement.level - 1);
		}

		return progress;
	}

	/**
	 * Calculate the maximum possible progress for this category.
	 * Sum of levelCount for each achievement.
	 *
	 * @returns The maximum progress across all achievements
	 */
	getMaxProgress(): number
	{
		let maxProgress = 0;

		for (const achievement of this._achievements)
		{
			maxProgress += achievement.levelCount;
		}

		return maxProgress;
	}
}
