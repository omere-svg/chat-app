import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FakePaymentProvider } from './fake-payment-provider.js'
import { PAYMENT_PROVIDER } from './payment-provider.tokens.js'
import { RapydPaymentProvider } from './rapyd-payment-provider.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { PaymentProvider } from './types/payment-provider.js'

@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): PaymentProvider =>
        configService.get('PAYMENT_PROVIDER_KIND', { infer: true }) === 'rapyd'
          ? new RapydPaymentProvider(configService)
          : new FakePaymentProvider(),
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentProviderModule {}
