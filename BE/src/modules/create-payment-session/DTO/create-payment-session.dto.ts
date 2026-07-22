import { IsString, MaxLength, MinLength } from 'class-validator'
import { MAX_PLAN_CODE_LENGTH } from '../constants.js'

export class CreatePaymentSessionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_PLAN_CODE_LENGTH)
  planCode!: string
}
