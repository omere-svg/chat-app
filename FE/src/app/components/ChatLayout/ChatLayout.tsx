import { CHAT_LAYOUT_CLASS } from './ChatLayout.constants.ts'
import type { ChatLayoutProps } from './ChatLayout.types.ts'
import './ChatLayout.css'

export function ChatLayout({
  topbar,
  sidebar,
  main,
}: ChatLayoutProps): React.ReactElement {
  return (
    <div className={CHAT_LAYOUT_CLASS.layout}>
      {topbar}
      <div className={CHAT_LAYOUT_CLASS.panels}>
        {sidebar}
        <main className={CHAT_LAYOUT_CLASS.main}>{main}</main>
      </div>
    </div>
  )
}
