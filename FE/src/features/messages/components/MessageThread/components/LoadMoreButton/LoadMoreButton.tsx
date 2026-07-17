import {
  LOAD_MORE_BUTTON_CLASS,
  LOAD_MORE_BUTTON_TEXT,
} from './LoadMoreButton.constants.ts'
import type { LoadMoreButtonProps } from './LoadMoreButton.types.ts'
import './LoadMoreButton.css'

export function LoadMoreButton({
  loading,
  onClick,
}: LoadMoreButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className={LOAD_MORE_BUTTON_CLASS.button}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? LOAD_MORE_BUTTON_TEXT.loading : LOAD_MORE_BUTTON_TEXT.idle}
    </button>
  )
}
