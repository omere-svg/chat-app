import { CHAT_TOPBAR_CLASS, CHAT_TOPBAR_TEXT } from '../../../../ChatTopbar.constants.ts'
import { useChatTopbar } from '../../../../context/useChatTopbarContext.tsx'

export function TopbarUserName(): React.ReactElement {
  const { userName } = useChatTopbar()

  return (
    <span className={CHAT_TOPBAR_CLASS.user}>
      {CHAT_TOPBAR_TEXT.signedInPrefix} {userName}
    </span>
  )
}
