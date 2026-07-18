import { Link } from 'react-router-dom'
import {
  CHAT_TOPBAR_CLASS,
  CHAT_TOPBAR_ROUTE,
  CHAT_TOPBAR_TEXT,
} from './ChatTopbar.constants.ts'
import type { ChatTopbarProps } from './ChatTopbar.types.ts'
import './ChatTopbar.css'

export function ChatTopbar({
  userName,
  avatar,
  onLogout,
}: ChatTopbarProps): React.ReactElement {
  return (
    <header className={CHAT_TOPBAR_CLASS.topbar}>
      <div className={CHAT_TOPBAR_CLASS.identity}>
        {avatar}
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
          onClick={onLogout}
        >
          {CHAT_TOPBAR_TEXT.logout}
        </button>
      </div>
    </header>
  )
}
