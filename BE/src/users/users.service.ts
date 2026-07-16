import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { PasswordHasher } from './password-hasher.js'
import { USER_REPOSITORY } from './repository/user-repository.port.js'
import { toPublicUser } from './user-public-view.js'
import type { UserRepository } from './repository/user-repository.port.js'
import type { PublicUser } from './user-public-view.js'
import type { UserRecord } from './user.entity.js'

export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface VerifyCredentialsInput {
  email: string
  password: string
}

export interface UpdateNameInput {
  firstName: string
  lastName: string
}

export interface UpdateEmailInput {
  email: string
  currentPassword: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createUser(createUserInput: CreateUserInput): Promise<UserRecord> {
    const normalizedEmail = normalizeEmail(createUserInput.email)

    const existingUser = await this.userRepository.findByEmail(normalizedEmail)
    if (existingUser !== null) {
      throw new ConflictException({
        code: ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        message: 'An account with this email already exists',
      })
    }

    const passwordHash = await this.passwordHasher.hash(createUserInput.password)
    const userRecord: UserRecord = {
      id: `user-${randomUUID()}`,
      email: normalizedEmail,
      passwordHash,
      firstName: createUserInput.firstName,
      lastName: createUserInput.lastName,
    }

    return this.userRepository.insert(userRecord)
  }

  async updateName(userId: string, { firstName, lastName }: UpdateNameInput): Promise<PublicUser> {
    const updatedUser = await this.userRepository.update(userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
    if (updatedUser === null) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found',
      })
    }
    return toPublicUser(updatedUser)
  }

  async updateEmail(userId: string, { email, currentPassword }: UpdateEmailInput): Promise<PublicUser> {
    const existingUser = await this.userRepository.findById(userId)
    if (existingUser === null) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found',
      })
    }

    // Changing the login identifier is sensitive, so re-verify the password first.
    const passwordMatches = await this.passwordHasher.verify(
      currentPassword,
      existingUser.passwordHash,
    )
    if (!passwordMatches) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Current password is incorrect',
      })
    }

    const normalizedEmail = normalizeEmail(email)
    if (normalizedEmail === existingUser.email) {
      return toPublicUser(existingUser)
    }

    const emailOwner = await this.userRepository.findByEmail(normalizedEmail)
    if (emailOwner !== null) {
      throw new ConflictException({
        code: ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        message: 'An account with this email already exists',
      })
    }

    const updatedUser = await this.userRepository.update(userId, { email: normalizedEmail })
    if (updatedUser === null) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found',
      })
    }
    return toPublicUser(updatedUser)
  }

  async verifyCredentials({ email, password }: VerifyCredentialsInput): Promise<UserRecord | null> {
    const userRecord = await this.userRepository.findByEmail(normalizeEmail(email))
    if (userRecord === null) {
      return null
    }

    const passwordMatches = await this.passwordHasher.verify(password, userRecord.passwordHash)
    return passwordMatches ? userRecord : null
  }

  async findPublicUserById(userId: string): Promise<PublicUser | null> {
    const userRecord = await this.userRepository.findById(userId)
    return userRecord === null ? null : toPublicUser(userRecord)
  }

  async findPublicUsersByIds(userIds: readonly string[]): Promise<PublicUser[]> {
    const userRecords = await this.userRepository.findByIds(userIds)
    return userRecords.map(toPublicUser)
  }

  async resolveExistingUsersByEmails(emails: readonly string[]): Promise<PublicUser[]> {
    const normalizedByOriginal = emails.map((email) => ({
      original: email,
      normalized: normalizeEmail(email),
    }))

    const foundUsers = await this.userRepository.findByEmails(
      normalizedByOriginal.map((entry) => entry.normalized),
    )
    const foundEmails = new Set(foundUsers.map((user) => user.email))

    const unknownEmails = normalizedByOriginal
      .filter((entry) => !foundEmails.has(entry.normalized))
      .map((entry) => entry.original)
    if (unknownEmails.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User with this email does not exist',
        details: { unknownEmails },
      })
    }

    return foundUsers.map(toPublicUser)
  }
}
