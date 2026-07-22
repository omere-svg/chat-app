import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { OTP_HASH_SALT_ROUNDS } from './constants.js'

@Injectable()
export class OtpCodeHasher {
  hash(code: string): Promise<string> {
    return bcrypt.hash(code, OTP_HASH_SALT_ROUNDS)
  }

  verify(code: string, codeHash: string): Promise<boolean> {
    return bcrypt.compare(code, codeHash)
  }
}
