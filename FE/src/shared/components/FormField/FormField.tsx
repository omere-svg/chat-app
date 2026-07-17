import { FORM_FIELD_CLASS } from './FormField.constants.ts'
import type { FormFieldProps } from './FormField.types.ts'
import { useFieldChange } from './hooks/useFieldChange.ts'
import './FormField.css'

export function FormField({
  label,
  name,
  type,
  autoComplete,
  value,
  disabled = false,
  autoFocus = false,
  onValueChange,
}: FormFieldProps): React.ReactElement {
  const handleChange = useFieldChange({ onValueChange })

  return (
    <label className={FORM_FIELD_CLASS.field}>
      <span className={FORM_FIELD_CLASS.label}>{label}</span>
      <input
        className={FORM_FIELD_CLASS.input}
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={handleChange}
      />
    </label>
  )
}
