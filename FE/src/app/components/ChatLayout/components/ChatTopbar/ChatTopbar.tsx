import { CHAT_TOPBAR_CLASS } from './ChatTopbar.constants.ts'
import { TopbarIdentity } from './components/TopbarIdentity/TopbarIdentity.tsx'
import { TopbarActions } from './components/TopbarActions/TopbarActions.tsx'
import './ChatTopbar.css'

export function ChatTopbar(): React.ReactElement {
  return (
    <header className={CHAT_TOPBAR_CLASS.topbar}>
      <TopbarIdentity />
      <TopbarActions />
    </header>
  )
}
