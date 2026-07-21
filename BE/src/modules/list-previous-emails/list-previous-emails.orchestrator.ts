import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import type { PreviousEmailsView } from './types/previous-emails.view.js'

@Injectable()
export class ListPreviousEmailsOrchestrator {
  constructor(private readonly usersService: UsersService) {}

  async list(userId: string): Promise<PreviousEmailsView> {
    return { previousEmails: await this.usersService.getPreviousEmails(userId) }
  }
}
