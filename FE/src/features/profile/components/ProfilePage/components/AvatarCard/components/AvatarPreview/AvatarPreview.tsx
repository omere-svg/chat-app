import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { useProfileAvatarContext } from '../../context/useProfileAvatarContext.tsx'

export function AvatarPreview(): React.ReactElement {
  const { name, avatarUrl } = useProfileAvatarContext()

  return <UserAvatarContainer name={name} imageUrl={avatarUrl} size="lg" />
}
