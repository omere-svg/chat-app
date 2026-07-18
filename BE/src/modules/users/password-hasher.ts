import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { BCRYPT_SALT_ROUNDS } from './constants.js'

@Injectable()
export class PasswordHasher {
  hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, BCRYPT_SALT_ROUNDS)
  }

  verify(plainTextPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, passwordHash)
  }
}
