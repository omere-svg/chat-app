import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PasswordHasher } from './password-hasher.js'
import { USER_REPOSITORY } from './user.repository.js'
import { toUser } from './user.mapper.js'
import { EmailAlreadyRegisteredError } from './errors/email-already-registered.error.js'
import { UserNotFoundError } from './errors/user-not-found.error.js'
import { IncorrectCurrentPasswordError } from './errors/incorrect-current-password.error.js'
import { UnknownParticipantEmailsError } from './errors/unknown-participant-emails.error.js'
import type { UserRepository } from './user.repository.js'
import type { User } from './types/user.js'
import type { StoredAvatar } from './types/stored-avatar.js'
import type { UserRecord } from './types/user.entity.js'
import type {
  CreateUserInput,
  UpdateEmailInput,
  UpdateNameInput,
  VerifyCredentialsInput,
} from './types/user-service.types.js'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  toUser(userRecord: UserRecord): User {
    return toUser(userRecord)
  }

  async createUser(createUserInput: CreateUserInput): Promise<UserRecord> {
    const normalizedEmail = normalizeEmail(createUserInput.email)

    const existingUser = await this.userRepository.findByEmail(normalizedEmail)
    if (existingUser !== null) {
      throw new EmailAlreadyRegisteredError()
    }

    const passwordHash = await this.passwordHasher.hash(createUserInput.password)
    const userRecord: UserRecord = {
      id: `user-${randomUUID()}`,
      email: normalizedEmail,
      passwordHash,
      firstName: createUserInput.firstName,
      lastName: createUserInput.lastName,
      avatar: null,
    }

    return this.userRepository.insert(userRecord)
  }

  async updateName(userId: string, { firstName, lastName }: UpdateNameInput): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async getUserRecord(userId: string): Promise<UserRecord> {
    const existingUser = await this.userRepository.findById(userId)
    if (existingUser === null) {
      throw new UserNotFoundError()
    }
    return existingUser
  }

  async updateAvatar(userId: string, avatar: StoredAvatar): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, { avatar })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async clearAvatar(userId: string): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, { avatar: null })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async updateEmail(userId: string, { email, currentPassword }: UpdateEmailInput): Promise<User> {
    const existingUser = await this.userRepository.findById(userId)
    if (existingUser === null) {
      throw new UserNotFoundError()
    }

    const passwordMatches = await this.passwordHasher.verify(
      currentPassword,
      existingUser.passwordHash,
    )
    if (!passwordMatches) {
      throw new IncorrectCurrentPasswordError()
    }

    const normalizedEmail = normalizeEmail(email)
    if (normalizedEmail === existingUser.email) {
      return this.toUser(existingUser)
    }

    const emailOwner = await this.userRepository.findByEmail(normalizedEmail)
    if (emailOwner !== null) {
      throw new EmailAlreadyRegisteredError()
    }

    const updatedUser = await this.userRepository.update(userId, { email: normalizedEmail })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toUser(updatedUser)
  }

  async verifyCredentials({ email, password }: VerifyCredentialsInput): Promise<UserRecord | null> {
    const userRecord = await this.userRepository.findByEmail(normalizeEmail(email))
    if (userRecord === null) {
      return null
    }

    const passwordMatches = await this.passwordHasher.verify(password, userRecord.passwordHash)
    return passwordMatches ? userRecord : null
  }

  async findUserById(userId: string): Promise<User | null> {
    const userRecord = await this.userRepository.findById(userId)
    return userRecord === null ? null : this.toUser(userRecord)
  }

  async findUsersByIds(userIds: readonly string[]): Promise<User[]> {
    const userRecords = await this.userRepository.findByIds(userIds)
    return userRecords.map((userRecord) => this.toUser(userRecord))
  }

  async resolveExistingUsersByEmails(emails: readonly string[]): Promise<User[]> {
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
      throw new UnknownParticipantEmailsError(unknownEmails)
    }

    return foundUsers.map((foundUser) => this.toUser(foundUser))
  }
}
