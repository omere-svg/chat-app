import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { CHAT_TOPBAR_CLASS } from '../../ChatTopbar.constants.ts'
import { useChatTopbar } from '../../context/useChatTopbarContext.tsx'
import { TopbarUserName } from './components/TopbarUserName/TopbarUserName.tsx'

export function TopbarIdentity(): React.ReactElement {
  const { userName, avatarUrl } = useChatTopbar()

  return (
    <div className={CHAT_TOPBAR_CLASS.identity}>
      <UserAvatarContainer name={userName} imageUrl={avatarUrl} size="sm" />
      <TopbarUserName />
    </div>
  )
}
