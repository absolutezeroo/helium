import type {JSX} from 'solid-js';
import {createEffect, createSignal, Show} from 'solid-js';
import {useNavigator, DoorStateType} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

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
 * DoorStateView - Doorbell / password dialog.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/GuestRoomDoorbell.as
 * @see source_as_flash/com/sulake/habbo/navigator/view/GuestRoomPasswordInput.as
 */
export function DoorStateView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [password, setPassword] = createSignal('');

	const doorData = () => nav.doorData;

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
		actions.setDoorData(null);
	};

	const ring = () =>
	{
		const data = doorData();

		if (!data || !data.roomInfo) return;

		actions.goToRoom(data.roomInfo.flatId);
		actions.updateDoorState(DoorStateType.STATE_PENDING_SERVER);
	};

	const tryPassword = () =>
	{
		const data = doorData();

		if (!data || !data.roomInfo) return;

		actions.goToRoom(data.roomInfo.flatId, password());
		actions.updateDoorState(DoorStateType.STATE_PENDING_SERVER);
	};

	// Auto-close on no answer after delay
	createEffect(() =>
	{
		const data = doorData();

		if (!data || data.state !== DoorStateType.STATE_NO_ANSWER) return;

		const timer = setTimeout(() => actions.setDoorData(null), 5000);

		return () => clearTimeout(timer);
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
							<span class="doorbell-info">{t('navigator.doorbell.info', 'Ring the doorbell to enter this room.')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.STATE_WAITING}>
							<span class="doorbell-info">{t('navigator.doorbell.waiting', 'Waiting for the room owner to let you in...')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.STATE_NO_ANSWER}>
							<span class="doorbell-info">{t('navigator.doorbell.no.answer', 'Nobody answered the doorbell.')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.START_PASSWORD}>
							<span class="password-info">{t('navigator.password.info', 'This room requires a password.')}</span>
						</Show>
						<Show when={doorData()?.state === DoorStateType.STATE_WRONG_PASSWORD}>
							<span class="password-info">{t('navigator.password.retryinfo', 'Wrong password. Please try again.')}</span>
						</Show>
					</div>

					{/* Doorbell buttons */}
					<Show when={isDoorbell()}>
						<div class="doorbell-actions">
							<Show when={doorData()?.state === DoorStateType.START_DOORBELL}>
								<button class="doorbell-ring-btn" onClick={ring}>
									{t('navigator.doorbell.button.ring', 'Ring')}
								</button>
							</Show>
							<button class="doorbell-cancel-btn" onClick={onClose}>
								{t('generic.cancel', 'Cancel')}
							</button>
						</div>
					</Show>

					{/* Password input */}
					<Show when={!isDoorbell()}>
						<div class="d-flex flex-column gap-1 mt-2">
							<span class="password-info">{t('navigator.password.enter', 'Enter password:')}</span>
							<input
								type="password"
								class="form-control form-control-sm password-input"
								value={password()}
								onInput={(e) => setPassword(e.currentTarget.value)}
								onKeyDown={(e) => e.key === 'Enter' && tryPassword()}
							/>
						</div>
						<div class="password-actions">
							<button class="password-try-btn" onClick={tryPassword}>
								{t('navigator.password.button.try', 'Try')}
							</button>
							<button class="password-cancel-btn" onClick={onClose}>
								{t('generic.cancel', 'Cancel')}
							</button>
						</div>
					</Show>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
