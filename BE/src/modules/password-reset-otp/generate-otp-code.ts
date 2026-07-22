import { randomInt } from 'node:crypto'
import { OTP_CODE_LENGTH } from './constants.js'

export function generateOtpCode(): string {
  let code = ''
  for (let position = 0; position < OTP_CODE_LENGTH; position++) {
    code += randomInt(0, 10).toString()
  }
  return code
}
