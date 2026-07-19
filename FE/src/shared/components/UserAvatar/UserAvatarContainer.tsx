import { UserAvatar } from './UserAvatar.tsx'
import { deriveInitials } from './UserAvatar.utils.ts'
import type { UserAvatarContainerProps } from './UserAvatar.types.ts'

export function UserAvatarContainer({
  name,
  imageUrl = null,
  size = 'md',
}: UserAvatarContainerProps): React.ReactElement {
  return (
    <UserAvatar imageUrl={imageUrl} label={name} fallback={deriveInitials(name)} size={size} />
  )
}
