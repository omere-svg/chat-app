import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { SIDEBAR_USER_CHIP_CLASS } from './SidebarUserChip.constants.ts'
import type { SidebarUserChipProps } from './SidebarUserChip.types.ts'
import './SidebarUserChip.css'

export function SidebarUserChip({ name, avatarUrl }: SidebarUserChipProps): React.ReactElement {
  return (
    <div className={SIDEBAR_USER_CHIP_CLASS.chip}>
      <UserAvatarContainer name={name} imageUrl={avatarUrl} size="sm" />
      <span className={SIDEBAR_USER_CHIP_CLASS.name}>{name}</span>
    </div>
  )
}
