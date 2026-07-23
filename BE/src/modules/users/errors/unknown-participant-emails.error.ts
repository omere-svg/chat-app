import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class UnknownParticipantEmailsError extends AppException {
  constructor(unknownEmails: string[]) {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.USER_NOT_FOUND,
      'User with this email does not exist',
      { unknownEmails },
    )
  }
}
