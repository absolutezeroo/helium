import {createEffect, createSignal, onCleanup, type JSX} from 'solid-js';
import clsx from 'clsx';
import {Helium} from 'helium-engine';
import {AvatarScaleType} from '@habbo/avatar/enum/AvatarScaleType';
import {AvatarRenderEvent} from '@habbo/avatar/enum/AvatarRenderEvent';
import type {IAvatarImage} from '@habbo/avatar/IAvatarImage';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';

export interface LayoutAvatarImageViewProps
{
	figure?: string;
	gender?: string;
	direction?: number;
	headDirection?: number;
	scale?: number;
	class?: string;
	onClick?: (e: MouseEvent) => void;
}

/**
 * LayoutAvatarImageView - Displays an avatar by figure string.
 * Uses the AvatarRenderManager to create and render avatar images.
 *
 * @see sources/win63_version/habbo/avatar/AvatarImage.as
 */
export function LayoutAvatarImageView(props: LayoutAvatarImageViewProps): JSX.Element
{
	const [imageUrl, setImageUrl] = createSignal<string | null>(null);

	const renderAvatar = (avatarImage: IAvatarImage | null): void =>
	{
		if(!avatarImage) return;

		const direction = props.direction ?? 2;
		const headDirection = props.headDirection ?? direction;

		avatarImage.setDirection('full', direction);
		avatarImage.setDirection('head', headDirection);

		avatarImage.initActionAppends();
		avatarImage.appendAction('posture', 'std');
		avatarImage.endActionAppends();

		const texture = avatarImage.getImage('full', false, 1);

		if(!texture) return;

		const source = texture.source?.resource;
		const frame = texture.frame;

		if(!source || !frame) return;

		// Draw texture to canvas and extract as data URL
		const w = Math.round(frame.width);
		const h = Math.round(frame.height);

		if(w <= 0 || h <= 0) return;

		const offscreen = new OffscreenCanvas(w, h);
		const ctx = offscreen.getContext('2d');

		if(!ctx) return;

		ctx.drawImage(
			source as CanvasImageSource,
			frame.x, frame.y, frame.width, frame.height,
			0, 0, w, h
		);

		// Convert to blob URL for display in an <img> tag
		offscreen.convertToBlob({ type: 'image/png' }).then(blob =>
		{
			const url = imageUrl();

			if(url) URL.revokeObjectURL(url);

			setImageUrl(URL.createObjectURL(blob));
		});
	};

	createEffect(() =>
	{
		const figure = props.figure;

		if(!figure || figure.length === 0) return;

		const helium = Helium.instance;
		const avatarManager = helium.avatarRenderManager;

		if(!avatarManager.isReady)
		{
			// Wait for avatar system to be ready
			const onReady = (): void =>
			{
				avatarManager.events.off(AvatarRenderEvent.AVATAR_RENDER_READY, onReady);
				createAvatar(figure, avatarManager);
			};

			avatarManager.events.on(AvatarRenderEvent.AVATAR_RENDER_READY, onReady);

			return;
		}

		createAvatar(figure, avatarManager);
	});

	const createAvatar = (figure: string, avatarManager: { createAvatarImage: Function; isReady: boolean }): void =>
	{
		const gender = props.gender ?? 'M';
		const scale = AvatarScaleType.LARGE;

		// Create listener for when assets finish downloading
		const listener: IAvatarImageListener = {
			disposed: false,
			avatarImageReady(figureString: string): void
			{
				if(listener.disposed) return;

				// Assets are loaded, re-create and render the avatar
				const avatarImage = avatarManager.createAvatarImage(
					figureString,
					scale,
					gender,
					null,
					null
				) as IAvatarImage | null;

				renderAvatar(avatarImage);

				if(avatarImage)
				{
					avatarImage.dispose();
				}
			}
		};

		const avatarImage = avatarManager.createAvatarImage(
			figure,
			scale,
			gender,
			listener,
			null
		) as IAvatarImage | null;

		if(avatarImage)
		{
			if(!avatarImage.isPlaceholder())
			{
				// Assets are already loaded
				renderAvatar(avatarImage);
				listener.disposed = true;
			}

			avatarImage.dispose();
		}
	};

	onCleanup(() =>
	{
		const url = imageUrl();

		if(url) URL.revokeObjectURL(url);
	});

	return (
		<div
			class={clsx('layout-avatar-image', props.class)}
			onClick={props.onClick}
			style={{
				'min-width': '64px',
				'min-height': '110px',
				'position': 'relative',
				'image-rendering': 'pixelated'
			}}
		>
			{imageUrl() ? (
				<img
					src={imageUrl()!}
					alt=""
					style={{
						'image-rendering': 'pixelated',
						'position': 'absolute',
						'bottom': '0',
						'left': '50%',
						'transform': 'translateX(-50%)'
					}}
					draggable={false}
				/>
			) : (
				<svg class="w-5 h-5" style={{'margin': 'auto', 'opacity': '0.3'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
				</svg>
			)}
		</div>
	);
}
