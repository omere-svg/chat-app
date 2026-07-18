import { SIDEBAR_USER_CHIP_CLASS } from './SidebarUserChip.constants.ts'
import type { SidebarUserChipProps } from './SidebarUserChip.types.ts'
import './SidebarUserChip.css'

export function SidebarUserChip({ avatar, name }: SidebarUserChipProps): React.ReactElement {
  return (
    <div className={SIDEBAR_USER_CHIP_CLASS.chip}>
      {avatar}
      <span className={SIDEBAR_USER_CHIP_CLASS.name}>{name}</span>
    </div>
  )
}
