export type FormFieldProps = {
  label: string
  name: string
  type: string
  autoComplete: string
  value: string
  disabled?: boolean
  autoFocus?: boolean
  onValueChange: (value: string) => void
}

export type UseFieldChangeParams = {
  onValueChange: (value: string) => void
}
