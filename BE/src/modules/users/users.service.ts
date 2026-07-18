import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PasswordHasher } from './password-hasher.js'
import { USER_REPOSITORY } from './user.repository.js'
import { toPublicUser } from './user.mapper.js'
import { EmailAlreadyRegisteredError } from './errors/email-already-registered.error.js'
import { UserNotFoundError } from './errors/user-not-found.error.js'
import { IncorrectCurrentPasswordError } from './errors/incorrect-current-password.error.js'
import { UnknownParticipantEmailsError } from './errors/unknown-participant-emails.error.js'
import type { UserRepository } from './user.repository.js'
import type { PublicUser } from './types/user-public-view.js'
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

  toPublicView(userRecord: UserRecord): PublicUser {
    return toPublicUser(userRecord)
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

  async updateName(userId: string, { firstName, lastName }: UpdateNameInput): Promise<PublicUser> {
    const updatedUser = await this.userRepository.update(userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toPublicView(updatedUser)
  }

  async getAvatarKey(userId: string): Promise<string | null> {
    const existingUser = await this.userRepository.findById(userId)
    if (existingUser === null) {
      throw new UserNotFoundError()
    }
    return existingUser.avatar?.key ?? null
  }

  async updateAvatar(userId: string, avatar: StoredAvatar): Promise<PublicUser> {
    const updatedUser = await this.userRepository.update(userId, { avatar })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toPublicView(updatedUser)
  }

  async clearAvatar(userId: string): Promise<PublicUser> {
    const updatedUser = await this.userRepository.update(userId, { avatar: null })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toPublicView(updatedUser)
  }

  async updateEmail(userId: string, { email, currentPassword }: UpdateEmailInput): Promise<PublicUser> {
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
      return this.toPublicView(existingUser)
    }

    const emailOwner = await this.userRepository.findByEmail(normalizedEmail)
    if (emailOwner !== null) {
      throw new EmailAlreadyRegisteredError()
    }

    const updatedUser = await this.userRepository.update(userId, { email: normalizedEmail })
    if (updatedUser === null) {
      throw new UserNotFoundError()
    }
    return this.toPublicView(updatedUser)
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
    return userRecord === null ? null : this.toPublicView(userRecord)
  }

  async findPublicUsersByIds(userIds: readonly string[]): Promise<PublicUser[]> {
    const userRecords = await this.userRepository.findByIds(userIds)
    return userRecords.map((userRecord) => this.toPublicView(userRecord))
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
      throw new UnknownParticipantEmailsError(unknownEmails)
    }

    return foundUsers.map((foundUser) => this.toPublicView(foundUser))
  }
}
