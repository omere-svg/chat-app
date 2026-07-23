import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'
import {
  LOAD_MORE_BUTTON_CLASS,
  LOAD_MORE_BUTTON_TEXT,
} from './LoadMoreButton.constants.ts'
import './LoadMoreButton.css'

export function LoadMoreButton(): React.ReactElement {
  const { isLoadingOlderMessages, loadOlderMessages } = useMessageThreadContext()

  return (
    <button
      type="button"
      className={LOAD_MORE_BUTTON_CLASS.button}
      onClick={loadOlderMessages}
      disabled={isLoadingOlderMessages}
    >
      {isLoadingOlderMessages
        ? LOAD_MORE_BUTTON_TEXT.loading
        : LOAD_MORE_BUTTON_TEXT.idle}
    </button>
  )
}
