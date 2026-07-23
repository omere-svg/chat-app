import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import type { RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { ListPlansOrchestrator } from '../list-plans/list-plans.orchestrator.js'
import { GetSubscriptionOrchestrator } from '../get-subscription/get-subscription.orchestrator.js'
import { CreatePaymentSessionOrchestrator } from '../create-payment-session/create-payment-session.orchestrator.js'
import { ReceivePaymentWebhookOrchestrator } from '../receive-payment-webhook/receive-payment-webhook.orchestrator.js'
import { CreatePaymentSessionDto } from '../create-payment-session/DTO/create-payment-session.dto.js'
import type { User } from '../users/types/user.js'
import type { PlansView } from '../list-plans/types/plans.view.js'
import type { SubscriptionView } from '../get-subscription/types/subscription.view.js'
import type { CreatePaymentSessionResult } from '../create-payment-session/types/create-payment-session-result.js'
import type { ReceivePaymentWebhookResult } from '../receive-payment-webhook/types/receive-payment-webhook-result.js'

@Controller()
export class PlansController {
  constructor(
    private readonly listPlansOrchestrator: ListPlansOrchestrator,
    private readonly getSubscriptionOrchestrator: GetSubscriptionOrchestrator,
    private readonly createPaymentSessionOrchestrator: CreatePaymentSessionOrchestrator,
    private readonly receivePaymentWebhookOrchestrator: ReceivePaymentWebhookOrchestrator,
  ) {}

  @Get('users/plans')
  @UseGuards(JwtAuthGuard)
  listPlans(): Promise<PlansView> {
    return this.listPlansOrchestrator.list()
  }

  @Get('users/subscription')
  @UseGuards(JwtAuthGuard)
  getSubscription(@CurrentUser() currentUser: User): Promise<SubscriptionView> {
    return this.getSubscriptionOrchestrator.get(currentUser.id)
  }

  @Post('users/plans/payment-session')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  createPaymentSession(
    @CurrentUser() currentUser: User,
    @Body() createPaymentSessionDto: CreatePaymentSessionDto,
  ): Promise<CreatePaymentSessionResult> {
    return this.createPaymentSessionOrchestrator.createSession(
      currentUser.id,
      createPaymentSessionDto,
    )
  }

  @Post('users/plans/webhook')
  @HttpCode(HttpStatus.OK)
  handlePaymentWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<ReceivePaymentWebhookResult> {
    return this.receivePaymentWebhookOrchestrator.receive({
      rawBody: request.rawBody?.toString('utf8') ?? '',
      headers: request.headers,
    })
  }
}
