import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PasswordHasher } from './password-hasher.js'
import { MongoUserRepository } from './user.mongo.repository.js'
import { USER_REPOSITORY } from './user.repository.js'
import { UserDocument, UserSchema } from './user.schema.js'
import { UsersService } from './users.service.js'

@Module({
  imports: [MongooseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }])],
  providers: [
    UsersService,
    PasswordHasher,
    { provide: USER_REPOSITORY, useClass: MongoUserRepository },
  ],
  exports: [UsersService, PasswordHasher, USER_REPOSITORY],
})
export class UsersModule {}
