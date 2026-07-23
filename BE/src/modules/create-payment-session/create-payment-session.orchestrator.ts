import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PlanService } from '../plans/plan.service.js'
import { SubscriptionService } from '../subscriptions/subscription.service.js'
import { PaymentSessionService } from '../payment-sessions/payment-session.service.js'
import { PAYMENT_PROVIDER } from '../payment-provider/payment-provider.tokens.js'
import { AlreadySubscribedError } from './errors/already-subscribed.error.js'
import { PaymentProviderError } from './errors/payment-provider.error.js'
import { PlanNotFoundError } from './errors/plan-not-found.error.js'
import {
  PAYMENT_CALLBACK_CANCELLED_STATUS,
  PAYMENT_CALLBACK_STATUS_PARAM,
  PAYMENT_CALLBACK_SUCCESS_STATUS,
  SUBSCRIPTION_CALLBACK_PATH,
} from './constants.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { PaymentProvider } from '../payment-provider/types/payment-provider.js'
import type { CreatePaymentSessionDto } from './DTO/create-payment-session.dto.js'
import type { CreatePaymentSessionResult } from './types/create-payment-session-result.js'

@Injectable()
export class CreatePaymentSessionOrchestrator {
  private readonly logger = new Logger(CreatePaymentSessionOrchestrator.name)

  constructor(
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentSessionService: PaymentSessionService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async createSession(
    userId: string,
    { planCode }: CreatePaymentSessionDto,
  ): Promise<CreatePaymentSessionResult> {
    const plan = await this.planService.findByCode(planCode)
    if (plan === null || !plan.active) {
      throw new PlanNotFoundError()
    }

    if (await this.subscriptionService.isActive(userId)) {
      throw new AlreadySubscribedError()
    }

    const frontendOrigin = this.configService.get('FRONTEND_ORIGIN', { infer: true })
    const successUrl = `${frontendOrigin}${SUBSCRIPTION_CALLBACK_PATH}?${PAYMENT_CALLBACK_STATUS_PARAM}=${PAYMENT_CALLBACK_SUCCESS_STATUS}`
    const cancelUrl = `${frontendOrigin}${SUBSCRIPTION_CALLBACK_PATH}?${PAYMENT_CALLBACK_STATUS_PARAM}=${PAYMENT_CALLBACK_CANCELLED_STATUS}`

    const checkout = await this.startCheckout({
      amount: plan.amount,
      currency: plan.currency,
      planCode: plan.code,
      successUrl,
      cancelUrl,
    })

    await this.paymentSessionService.create({
      userId,
      planCode: plan.code,
      providerSessionId: checkout.providerSessionId,
    })

    return { checkoutUrl: checkout.checkoutUrl }
  }

  private async startCheckout(
    input: Parameters<PaymentProvider['createCheckoutSession']>[0],
  ): ReturnType<PaymentProvider['createCheckoutSession']> {
    try {
      return await this.paymentProvider.createCheckoutSession(input)
    } catch (error) {
      this.logger.error(
        'Failed to create a checkout session with the payment provider',
        error instanceof Error ? error.stack : String(error),
      )
      throw new PaymentProviderError()
    }
  }
}
