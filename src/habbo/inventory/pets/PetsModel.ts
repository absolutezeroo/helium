import type {IPetsModel} from './IPetsModel';
import {Pet} from './Pet';

/**
 * Manages pet inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.pets.PetsModel (ENGINE only)
 */
export class PetsModel implements IPetsModel
{
	private _disposed: boolean = false;
	private _isListInitialized: boolean = false;
	private _pets: Map<number, Pet> = new Map();

	constructor()
	{
	}

	// ========== Properties ==========

	get disposed(): boolean
	{
		return this._disposed;
	}

	get isListInitialized(): boolean
	{
		return this._isListInitialized;
	}

	get pets(): Map<number, Pet>
	{
		return this._pets;
	}

	// ========== Lifecycle ==========

	dispose(): void
	{
		if (this._disposed) return;

		for (const pet of this._pets.values())
		{
			pet.dispose();
		}

		this._pets.clear();
		this._disposed = true;
	}

	// ========== Add/Update/Remove ==========

	addPet(pet: Pet): boolean
	{
		if (this._pets.has(pet.id))
		{
			return false;
		}

		this._pets.set(pet.id, pet);

		return true;
	}

	updatePets(pets: Map<number, Pet>): {
		added: number[];
		removed: number[];
	}
	{
		const existingIds = new Set(this._pets.keys());
		const newIds = new Set(pets.keys());

		const added: number[] = [];
		const removed: number[] = [];

		// Find pets to remove
		for (const id of existingIds)
		{
			if (!newIds.has(id))
			{
				const pet = this._pets.get(id);

				if (pet)
				{
					pet.dispose();
				}

				this._pets.delete(id);
				removed.push(id);
			}
		}

		// Find pets to add
		for (const [id, pet] of pets)
		{
			if (!existingIds.has(id))
			{
				this._pets.set(id, pet);
				added.push(id);
			}
		}

		this._isListInitialized = true;

		return {added, removed};
	}

	removePet(id: number): Pet | null
	{
		const pet = this._pets.get(id);

		if (pet)
		{
			this._pets.delete(id);
			pet.dispose();

			return pet;
		}

		return null;
	}

	// ========== Getters ==========

	getPetById(id: number): Pet | null
	{
		return this._pets.get(id) ?? null;
	}

	getPetsArray(): Pet[]
	{
		return Array.from(this._pets.values());
	}

	// ========== Selection ==========

	getSelectedPet(): Pet | null
	{
		for (const pet of this._pets.values())
		{
			if (pet.isSelected)
			{
				return pet;
			}
		}

		return null;
	}

	selectPet(id: number): void
	{
		this.removeSelections();

		const pet = this._pets.get(id);

		if (pet)
		{
			pet.isSelected = true;
		}
	}

	removeSelections(): void
	{
		for (const pet of this._pets.values())
		{
			pet.isSelected = false;
		}
	}

	// ========== Unseen ==========

	resetUnseenItems(): number[]
	{
		const resetIds: number[] = [];

		for (const pet of this._pets.values())
		{
			if (pet.isUnseen)
			{
				pet.isUnseen = false;
				resetIds.push(pet.id);
			}
		}

		return resetIds;
	}

	updateUnseenItems(unseenIds: number[]): void
	{
		const unseenSet = new Set(unseenIds);

		for (const pet of this._pets.values())
		{
			pet.isUnseen = unseenSet.has(pet.id);
		}
	}

	isUnseen(id: number): boolean
	{
		return this._pets.get(id)?.isUnseen ?? false;
	}
}
