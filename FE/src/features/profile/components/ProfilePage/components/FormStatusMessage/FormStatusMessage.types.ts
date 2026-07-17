export type FormStatusRole = 'status' | 'alert'

export type FormStatusMessageProps = {
  className: string
  role: FormStatusRole
  message: string
}
