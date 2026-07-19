import { USER_AVATAR_CLASS, USER_AVATAR_ROOT_CLASS } from './UserAvatar.constants.ts'
import type { UserAvatarProps } from './UserAvatar.types.ts'
import './UserAvatar.css'

export function UserAvatar({
  imageUrl,
  label,
  fallback,
  size,
}: UserAvatarProps): React.ReactElement {
  return (
    <span
      className={USER_AVATAR_ROOT_CLASS[size]}
      role={imageUrl ? undefined : 'img'}
      aria-label={imageUrl ? undefined : label}
    >
      {imageUrl ? (
        <img className={USER_AVATAR_CLASS.image} src={imageUrl} alt={label} />
      ) : (
        <span className={USER_AVATAR_CLASS.fallback} aria-hidden="true">
          {fallback}
        </span>
      )}
    </span>
  )
}
