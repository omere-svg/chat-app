import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { fullName } from '@/types/domain.ts'
import { SidebarUserChip } from './SidebarUserChip.tsx'

export function SidebarUserChipContainer(): React.ReactElement | null {
  const { currentUser } = useAuth()
  if (!currentUser) {
    return null
  }

  const name = fullName(currentUser)
  return (
    <SidebarUserChip
      avatar={<UserAvatarContainer name={name} imageUrl={currentUser.avatarUrl} size="sm" />}
      name={name}
    />
  )
}
