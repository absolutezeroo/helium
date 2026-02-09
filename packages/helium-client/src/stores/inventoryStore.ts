import {createStore} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {SendMessageComposer} from "@ui/api/helium/SendMessageComposer";
import {FurniListMessageEvent} from '@habbo/communication/messages/incoming/inventory/furni/FurniListMessageEvent';
import {BadgesMessageEvent} from '@habbo/communication/messages/incoming/inventory/badges/BadgesMessageEvent';
import {PetInventoryMessageEvent} from '@habbo/communication/messages/incoming/inventory/pets/PetInventoryMessageEvent';
import {BotInventoryMessageEvent} from '@habbo/communication/messages/incoming/inventory/bots/BotInventoryMessageEvent';
import {
	RequestFurniInventoryComposer
} from '@habbo/communication/messages/outgoing/inventory/RequestFurniInventoryComposer';
import {SetActivatedBadgesComposer} from '@habbo/communication/messages/outgoing/inventory/SetActivatedBadgesComposer';
import type {FurniListMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';
import type {BadgesMessageParser} from '@habbo/communication/messages/parser/inventory/badges/BadgesMessageParser';
import type {
	PetInventoryMessageParser
} from '@habbo/communication/messages/parser/inventory/pets/PetInventoryMessageParser';
import type {
	BotInventoryMessageParser
} from '@habbo/communication/messages/parser/inventory/bots/BotInventoryMessageParser';

/**
 * Inventory Store
 *
 * Tracks the user's inventory state including furniture, badges, pets, bots,
 * and effects. Handles category switching, item selection, and unseen counts.
 *
 * State is updated by incoming server messages registered in init().
 */

interface InventoryStoreState
{
	isOpen: boolean;
	currentCategory: string;
	isLoading: boolean;
	furniGroups: any[];
	selectedFurniGroup: any | null;
	furniUnseenCount: number;
	badges: any[];
	activeBadges: any[];
	selectedBadge: any | null;
	badgesUnseenCount: number;
	effects: any[];
	selectedEffect: any | null;
	pets: any[];
	selectedPet: any | null;
	petsUnseenCount: number;
	bots: any[];
	selectedBot: any | null;
	botsUnseenCount: number;
}

const [state, setState] = createStore<InventoryStoreState>({
	isOpen: false,
	currentCategory: 'furni',
	isLoading: false,
	furniGroups: [],
	selectedFurniGroup: null,
	furniUnseenCount: 0,
	badges: [],
	activeBadges: [],
	selectedBadge: null,
	badgesUnseenCount: 0,
	effects: [],
	selectedEffect: null,
	pets: [],
	selectedPet: null,
	petsUnseenCount: 0,
	bots: [],
	selectedBot: null,
	botsUnseenCount: 0,
});

const actions = {
	open()
	{
		setState('isOpen', true);

		SendMessageComposer(new RequestFurniInventoryComposer());
	},

	close()
	{
		setState('isOpen', false);
	},

	toggle()
	{
		setState('isOpen', (v) => !v);

		if (state.isOpen)
		{
			SendMessageComposer(new RequestFurniInventoryComposer());
		}
	},

	switchCategory(category: string)
	{
		setState('currentCategory', category);
	},

	selectFurniGroup(group: any)
	{
		setState('selectedFurniGroup', group);
	},

	selectBadge(badge: any)
	{
		setState('selectedBadge', badge);
	},

	toggleBadgeWearing(badgeId: string)
	{
		const currentActive = [...state.activeBadges];
		const index = currentActive.findIndex((b: any) => b === badgeId);

		if (index >= 0)
		{
			currentActive.splice(index, 1);
		}
		else
		{
			if (currentActive.length < 5)
			{
				currentActive.push(badgeId);
			}
		}

		setState('activeBadges', currentActive);

		SendMessageComposer(new SetActivatedBadgesComposer(...currentActive));
	},

	selectEffect(effect: any)
	{
		setState('selectedEffect', effect);
	},

	selectPet(pet: any)
	{
		setState('selectedPet', pet);
	},

	selectBot(bot: any)
	{
		setState('selectedBot', bot);
	},
};

function init(): void
{
	registerMessageEvent(FurniListMessageEvent, (event) =>
	{
		const parser = event.getParser<FurniListMessageParser>();

		const items = Array.from(parser.items.values());

		setState('furniGroups', items);
		setState('isLoading', false);
	});

	registerMessageEvent(BadgesMessageEvent, (event) =>
	{
		const parser = event.getParser<BadgesMessageParser>();

		setState('badges', parser.badges);
		setState('activeBadges', parser.activeBadgeIds);
	});

	registerMessageEvent(PetInventoryMessageEvent, (event) =>
	{
		const parser = event.getParser<PetInventoryMessageParser>();

		setState('pets', parser.pets);
	});

	registerMessageEvent(BotInventoryMessageEvent, (event) =>
	{
		const parser = event.getParser<BotInventoryMessageParser>();

		setState('bots', parser.bots);
	});
}

export const inventoryStore = {state, actions, init};
