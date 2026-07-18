import { USER_AVATAR_CLASS, USER_AVATAR_ROOT_CLASS } from './UserAvatar.constants.ts'
import type { UserAvatarProps } from './UserAvatar.types.ts'
import './UserAvatar.css'

export function UserAvatar({
  imageUrl,
  label,
  fallback,
  size,
}: UserAvatarProps): React.ReactElement {
  if (imageUrl) {
    return (
      <span className={USER_AVATAR_ROOT_CLASS[size]}>
        <img className={USER_AVATAR_CLASS.image} src={imageUrl} alt={label} />
      </span>
    )
  }

  return (
    <span className={USER_AVATAR_ROOT_CLASS[size]} role="img" aria-label={label}>
      <span className={USER_AVATAR_CLASS.fallback} aria-hidden="true">
        {fallback}
      </span>
    </span>
  )
}
