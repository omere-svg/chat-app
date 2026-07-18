import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { fullName } from '@/types/domain.ts'
import { ChatTopbar } from './ChatTopbar.tsx'

export function ChatTopbarContainer(): React.ReactElement {
  const { currentUser, logout } = useAuth()

  return (
    <ChatTopbar
      userName={currentUser ? fullName(currentUser) : ''}
      avatarUrl={currentUser?.avatarUrl ?? null}
      onLogout={logout}
    />
  )
}
