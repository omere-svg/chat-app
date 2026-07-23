import { SIDEBAR_USER_CHIP_CLASS } from '../../SidebarUserChip.constants.ts'
import { useSidebarUserChip } from '../../context/useSidebarUserChipContext.tsx'

export function SidebarUserChipName(): React.ReactElement {
  const { userName } = useSidebarUserChip()

  return <span className={SIDEBAR_USER_CHIP_CLASS.name}>{userName}</span>
}
