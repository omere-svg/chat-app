import { BUTTON_CLASS } from './Button.constants.ts'
import type { ButtonProps } from './Button.types.ts'
import './Button.css'

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
}: ButtonProps): React.ReactElement {
  return (
    <button
      type={type}
      className={BUTTON_CLASS[variant]}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
