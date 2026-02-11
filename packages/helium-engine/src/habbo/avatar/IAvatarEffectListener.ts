/**
 * Listener interface for avatar effect load completion.
 *
 * @see sources/win63_version/habbo/avatar/class_3375.as (IAvatarEffectListener)
 */
export interface IAvatarEffectListener
{
    avatarEffectReady(effectId: number): void;
    disposed?: boolean;
}
