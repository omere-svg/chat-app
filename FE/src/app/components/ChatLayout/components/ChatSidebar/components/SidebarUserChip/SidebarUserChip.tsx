import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { SIDEBAR_USER_CHIP_CLASS } from './SidebarUserChip.constants.ts'
import { useSidebarUserChip } from './context/useSidebarUserChipContext.tsx'
import { SidebarUserChipName } from './components/SidebarUserChipName/SidebarUserChipName.tsx'

export function SidebarUserChip(): React.ReactElement {
  const { userName, avatarUrl } = useSidebarUserChip()

  return (
    <div className={SIDEBAR_USER_CHIP_CLASS.chip}>
      <UserAvatarContainer name={userName} imageUrl={avatarUrl} size="sm" />
      <SidebarUserChipName />
    </div>
  )
}
