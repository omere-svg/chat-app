import { Link } from 'react-router-dom'
import {
  CHAT_TOPBAR_CLASS,
  CHAT_TOPBAR_ROUTE,
  CHAT_TOPBAR_TEXT,
} from '../../ChatTopbar.constants.ts'
import { useChatTopbar } from '../../context/useChatTopbarContext.tsx'

export function TopbarActions(): React.ReactElement {
  const { logout } = useChatTopbar()

  return (
    <div className={CHAT_TOPBAR_CLASS.actions}>
      <Link to={CHAT_TOPBAR_ROUTE.profile} className={CHAT_TOPBAR_CLASS.action}>
        {CHAT_TOPBAR_TEXT.profile}
      </Link>
      <button type="button" className={CHAT_TOPBAR_CLASS.action} onClick={logout}>
        {CHAT_TOPBAR_TEXT.logout}
      </button>
    </div>
  )
}
