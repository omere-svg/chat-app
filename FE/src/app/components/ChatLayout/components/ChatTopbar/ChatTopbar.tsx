import { Link } from 'react-router-dom'
import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import {
  CHAT_TOPBAR_CLASS,
  CHAT_TOPBAR_ROUTE,
  CHAT_TOPBAR_TEXT,
} from './ChatTopbar.constants.ts'
import { useChatTopbar } from './context/useChatTopbarContext.tsx'
import './ChatTopbar.css'

export function ChatTopbar(): React.ReactElement {
  const { userName, avatarUrl, logout } = useChatTopbar()

  return (
    <header className={CHAT_TOPBAR_CLASS.topbar}>
      <div className={CHAT_TOPBAR_CLASS.identity}>
        <UserAvatarContainer name={userName} imageUrl={avatarUrl} size="sm" />
        <span className={CHAT_TOPBAR_CLASS.user}>
          {CHAT_TOPBAR_TEXT.signedInPrefix} {userName}
        </span>
      </div>
      <div className={CHAT_TOPBAR_CLASS.actions}>
        <Link to={CHAT_TOPBAR_ROUTE.profile} className={CHAT_TOPBAR_CLASS.action}>
          {CHAT_TOPBAR_TEXT.profile}
        </Link>
        <button
          type="button"
          className={CHAT_TOPBAR_CLASS.action}
          onClick={logout}
        >
          {CHAT_TOPBAR_TEXT.logout}
        </button>
      </div>
    </header>
  )
}
