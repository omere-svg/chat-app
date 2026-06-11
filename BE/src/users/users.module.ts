import { Module } from '@nestjs/common'
import { PasswordHasher } from './password-hasher.js'
import { InMemoryUserRepository } from './repository/in-memory-user.repository.js'
import { USER_REPOSITORY } from './repository/user-repository.port.js'
import { UsersService } from './users.service.js'

@Module({
  providers: [
    UsersService,
    PasswordHasher,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
