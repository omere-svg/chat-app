import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { SIDEBAR_USER_CHIP_CLASS } from './SidebarUserChip.constants.ts'
import { useSidebarUserChip } from './context/useSidebarUserChipContext.tsx'
import './SidebarUserChip.css'

export function SidebarUserChip(): React.ReactElement {
  const { name, avatarUrl } = useSidebarUserChip()

  return (
    <div className={SIDEBAR_USER_CHIP_CLASS.chip}>
      <UserAvatarContainer name={name} imageUrl={avatarUrl} size="sm" />
      <span className={SIDEBAR_USER_CHIP_CLASS.name}>{name}</span>
    </div>
  )
}
