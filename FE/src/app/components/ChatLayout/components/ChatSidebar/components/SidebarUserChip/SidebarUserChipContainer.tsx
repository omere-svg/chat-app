import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { fullName } from '@/types/domain.ts'
import { SidebarUserChip } from './SidebarUserChip.tsx'

export function SidebarUserChipContainer(): React.ReactElement | null {
  const { currentUser } = useAuth()
  if (!currentUser) {
    return null
  }

  return (
    <SidebarUserChip name={fullName(currentUser)} avatarUrl={currentUser.avatarUrl ?? null} />
  )
}
