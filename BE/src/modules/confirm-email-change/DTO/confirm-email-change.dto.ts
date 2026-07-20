import { Allow } from 'class-validator'

export class ConfirmEmailChangeDto {
  @Allow()
  token!: unknown
}
