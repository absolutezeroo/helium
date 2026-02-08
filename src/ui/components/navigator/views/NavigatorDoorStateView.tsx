import type {JSX} from 'solid-js';
import {createEffect, createSignal, Show} from 'solid-js';
import {ModuleId, useActions, useModule} from '@ui/bridge';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';
import {DoorStateType} from '@/modules/navigator/types';

const VISIBLE_STATES: number[] = [
	DoorStateType.START_DOORBELL,
	DoorStateType.STATE_WAITING,
	DoorStateType.STATE_NO_ANSWER,
	DoorStateType.START_PASSWORD,
	DoorStateType.STATE_WRONG_PASSWORD,
];

const DOORBELL_STATES: number[] = [
	DoorStateType.START_DOORBELL,
	DoorStateType.STATE_WAITING,
	DoorStateType.STATE_NO_ANSWER,
];

/**
 * NavigatorDoorStateView - Doorbell/password dialog from navigator.
 *
 * @see source_nitro_react/components/navigator/views/NavigatorDoorStateView.tsx
 */
export function NavigatorDoorStateView(): JSX.Element
{
	const t = useLocalization();
	const {state: navigator} = useModule(ModuleId.Navigator);
	const navActions = useActions(ModuleId.Navigator);

	const [password, setPassword] = createSignal('');

	const doorData = () => navigator().doorData;

	const isVisible = () =>
	{
		const data = doorData();

		if (!data || data.state === DoorStateType.NONE) return false;

		return VISIBLE_STATES.includes(data.state);
	};

	const isDoorbell = () =>
	{
		const data = doorData();

		if (!data) return false;

		return DOORBELL_STATES.includes(data.state);
	};

	const onClose = () =>
	{
		const data = doorData();

		if (data && data.state === DoorStateType.STATE_WAITING)
		{
			// Go to desktop when closing while waiting
			// TODO: GoToDesktop action
		}

		navActions.setDoorData(null);
	};

	const ring = () =>
	{
		const data = doorData();

		if (!data || !data.roomInfo) return;

		navActions.goToRoom(data.roomInfo.flatId);
		navActions.updateDoorState(DoorStateType.STATE_PENDING_SERVER);
	};

	const tryEntering = () =>
	{
		const data = doorData();

		if (!data || !data.roomInfo) return;

		navActions.goToRoom(data.roomInfo.flatId);
		navActions.updateDoorState(DoorStateType.STATE_PENDING_SERVER);
	};

	// Auto-close on no answer
	createEffect(() =>
	{
		const data = doorData();

		if (!data || data.state !== DoorStateType.STATE_NO_ANSWER) return;

		// TODO: GoToDesktop action
	});

	return (
		<Show when={isVisible()}>
			<HeliumCardView
				uniqueKey="navigator-doorbell"
				class={isDoorbell() ? 'helium-navigator-doorbell' : 'helium-navigator-password'}
				theme="primary-slim"
			>
				<HeliumCardHeaderView
					title={t(isDoorbell() ? 'navigator.doorbell.title' : 'navigator.password.title', isDoorbell() ? 'Doorbell' : 'Password')}
					onClose={onClose}
				/>
				<HeliumCardContentView>
					<div class="d-flex flex-column gap-1">
						<span class="fw-bold">{doorData()?.roomInfo?.roomName}</span>
						<Show when={doorData()?.state === DoorStateType.START_DOORBELL}>
							<span>{t('navigator.doorbell.info', 'Ring the doorbell to enter this room.')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.STATE_WAITING}>
							<span>{t('navigator.doorbell.waiting', 'Waiting for the room owner to let you in...')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.STATE_NO_ANSWER}>
							<span>{t('navigator.doorbell.no.answer', 'Nobody answered the doorbell.')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.START_PASSWORD}>
							<span>{t('navigator.password.info', 'This room requires a password.')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.STATE_WRONG_PASSWORD}>
							<span>{t('navigator.password.retryinfo', 'Wrong password. Please try again.')}</span>
						</Show>
					</div>

					{/* Doorbell buttons */}
					<Show when={isDoorbell()}>
						<div class="d-flex flex-column gap-1 mt-2">
							<Show when={doorData()?.state === DoorStateType.START_DOORBELL}>
								<button class="btn btn-success btn-sm" onClick={ring}>
									{t('navigator.doorbell.button.ring', 'Ring')}
								</button>
							</Show>
							<button class="btn btn-danger btn-sm" onClick={onClose}>
								{t('generic.cancel', 'Cancel')}
							</button>
						</div>
					</Show>

					{/* Password input and buttons */}
					<Show when={!isDoorbell()}>
						<div class="d-flex flex-column gap-1 mt-2">
							<span>{t('navigator.password.enter', 'Enter password:')}</span>
							<input
								type="password"
								class="form-control form-control-sm"
								onInput={(e) => setPassword(e.currentTarget.value)}
							/>
						</div>
						<div class="d-flex flex-column gap-1 mt-2">
							<button class="btn btn-success btn-sm" onClick={tryEntering}>
								{t('navigator.password.button.try', 'Try')}
							</button>
							<button class="btn btn-danger btn-sm" onClick={onClose}>
								{t('generic.cancel', 'Cancel')}
							</button>
						</div>
					</Show>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
