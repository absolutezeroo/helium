/**
 * Listener interface for avatar image load completion.
 *
 * @see sources/win63_version/habbo/avatar/IAvatarImageListener.as
 */
export interface IAvatarImageListener
{
    avatarImageReady(figureString: string): void;
    disposed?: boolean;
}
