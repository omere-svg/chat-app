import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { SidebarUserChip } from './SidebarUserChip.tsx'
import { SidebarUserChipProvider } from './context/useSidebarUserChipContext.tsx'

export function SidebarUserChipContainer(): React.ReactElement | null {
  const { currentUser } = useAuth()
  if (!currentUser) {
    return null
  }

  return (
    <SidebarUserChipProvider>
      <SidebarUserChip />
    </SidebarUserChipProvider>
  )
}
