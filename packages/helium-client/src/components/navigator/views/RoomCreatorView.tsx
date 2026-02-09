import type {JSX} from 'solid-js';
import {createSignal, For, onMount} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';

/**
 * Standard Habbo room models
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/RoomCreateViewCtrl.as
 */
const ROOM_MODELS = [
	{name: 'a', tileSize: 104, clubLevel: 0},
	{name: 'b', tileSize: 94, clubLevel: 0},
	{name: 'c', tileSize: 36, clubLevel: 0},
	{name: 'd', tileSize: 84, clubLevel: 0},
	{name: 'e', tileSize: 80, clubLevel: 0},
	{name: 'f', tileSize: 80, clubLevel: 0},
	{name: 'g', tileSize: 304, clubLevel: 0},
	{name: 'h', tileSize: 304, clubLevel: 0},
	{name: 'i', tileSize: 204, clubLevel: 0},
	{name: 'j', tileSize: 250, clubLevel: 0},
	{name: 'k', tileSize: 210, clubLevel: 0},
	{name: 'l', tileSize: 240, clubLevel: 0},
	{name: 'm', tileSize: 84, clubLevel: 0},
	{name: 'n', tileSize: 100, clubLevel: 0},
	{name: 'o', tileSize: 416, clubLevel: 1},
	{name: 'p', tileSize: 352, clubLevel: 1},
	{name: 'q', tileSize: 304, clubLevel: 1},
	{name: 'r', tileSize: 304, clubLevel: 1},
] as const;

/**
 * RoomCreatorView - Room creation form.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/RoomCreateViewCtrl.as
 */
export function RoomCreatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [name, setName] = createSignal('');
	const [description, setDescription] = createSignal('');
	const [category, setCategory] = createSignal<number>(0);
	const [visitorsCount, setVisitorsCount] = createSignal(10);
	const [tradesSetting, setTradesSetting] = createSignal(0);
	const [selectedModelName, setSelectedModelName] = createSignal('a');

	const maxVisitorsList = () =>
	{
		const list: number[] = [];

		for (let i = 10; i <= 100; i += 10) list.push(i);

		return list;
	};

	const flatCategories = () => nav.flatCategories;

	// Auto-select first category when available
	onMount(() =>
	{
		const cats = flatCategories();

		if (cats.length > 0)
		{
			setCategory(cats[0].nodeId);
		}
	});

	const createRoom = () =>
	{
		const roomName = name();

		if (!roomName || roomName.length < 3) return;

		actions.createRoom(
			roomName,
			description(),
			'model_' + selectedModelName(),
			category(),
			visitorsCount(),
			tradesSetting()
		);
	};

	return (
		<div class="d-flex flex-column overflow-hidden h-100">
			<div class="row g-2 overflow-hidden flex-grow-1">
				{/* Left column: form fields */}
				<div class="col-6 d-flex flex-column gap-1 overflow-auto">
					<div class="d-flex flex-column gap-1">
						<span>{t('navigator.createroom.roomnameinfo', 'Room Name')}</span>
						<input
							type="text"
							class="form-control form-control-sm"
							maxLength={60}
							value={name()}
							onInput={(e) => setName(e.currentTarget.value)}
							placeholder={t('navigator.createroom.roomnameinfo', 'Room Name')}
						/>
					</div>
					<div class="d-flex flex-column gap-1 flex-grow-1">
						<span>{t('navigator.createroom.roomdescinfo', 'Room Description')}</span>
						<textarea
							class="flex-grow-1 form-control form-control-sm w-100"
							maxLength={255}
							onInput={(e) => setDescription(e.currentTarget.value)}
							placeholder={t('navigator.createroom.roomdescinfo', 'Room Description')}
						/>
					</div>
					<div class="d-flex flex-column gap-1">
						<span>{t('navigator.category', 'Category')}</span>
						<select
							class="form-select form-select-sm"
							onChange={(e) => setCategory(Number(e.currentTarget.value))}
						>
							<For each={flatCategories()}>
								{(cat) => (
									<option value={cat.nodeId}>{t(cat.nodeName, cat.nodeName)}</option>
								)}
							</For>
						</select>
					</div>
					<div class="d-flex flex-column gap-1">
						<span>{t('navigator.maxvisitors', 'Max Visitors')}</span>
						<select
							class="form-select form-select-sm"
							onChange={(e) => setVisitorsCount(Number(e.currentTarget.value))}
						>
							<For each={maxVisitorsList()}>
								{(val) => (
									<option value={val}>{val}</option>
								)}
							</For>
						</select>
					</div>
					<div class="d-flex flex-column gap-1">
						<span>{t('navigator.tradesettings', 'Trade Settings')}</span>
						<select
							class="form-select form-select-sm"
							onChange={(e) => setTradesSetting(Number(e.currentTarget.value))}
						>
							<option value="0">{t('navigator.roomsettings.trade_not_allowed', 'Not allowed')}</option>
							<option value="1">{t('navigator.roomsettings.trade_not_with_Controller', 'Not with controller')}</option>
							<option value="2">{t('navigator.roomsettings.trade_allowed', 'Allowed')}</option>
						</select>
					</div>
				</div>

				{/* Right column: room model selection */}
				<div class="col-6 d-flex flex-column gap-1 overflow-auto">
					<For each={ROOM_MODELS}>
						{(model) => (
							<div
								class={`d-flex flex-column align-items-center p-1 rounded cursor-pointer border ${selectedModelName() === model.name ? 'border-primary bg-white' : 'border-muted'}`}
								onClick={() => setSelectedModelName(model.name)}
							>
								<span class="fw-bold">{model.tileSize} {t('navigator.createroom.tilesize', 'tiles')}</span>
								<span class="small text-muted">Model {model.name.toUpperCase()}</span>
							</div>
						)}
					</For>
				</div>
			</div>

			{/* Create button */}
			<button
				class={`btn btn-sm w-100 mt-2 ${(!name() || name().length < 3) ? 'btn-danger' : 'btn-success'}`}
				disabled={!name() || name().length < 3}
				onClick={createRoom}
			>
				{t('navigator.createroom.create', 'Create')}
			</button>
		</div>
	);
}
