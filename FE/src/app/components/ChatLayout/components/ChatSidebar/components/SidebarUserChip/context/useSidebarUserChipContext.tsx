import { createContext, useContext } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { getFullName } from '@/types/domain.utils.ts'
import type {
  SidebarUserChipContextValue,
  SidebarUserChipProviderProps,
} from './useSidebarUserChipContext.types.ts'

const SidebarUserChipContext = createContext<SidebarUserChipContextValue | null>(null)

export function SidebarUserChipProvider({
  children,
}: SidebarUserChipProviderProps): React.ReactElement {
  const { currentUser } = useAuth()

  const value: SidebarUserChipContextValue = {
    userName: currentUser ? getFullName(currentUser) : '',
    avatarUrl: currentUser?.avatarUrl ?? null,
  }

  return (
    <SidebarUserChipContext.Provider value={value}>
      {children}
    </SidebarUserChipContext.Provider>
  )
}

export function useSidebarUserChip(): SidebarUserChipContextValue {
  const context = useContext(SidebarUserChipContext)
  if (context === null) {
    throw new Error('useSidebarUserChip must be used within a SidebarUserChipProvider')
  }
  return context
}
