import { Injectable, Logger } from '@nestjs/common'
import type { OnModuleInit } from '@nestjs/common'
import { PlanService } from '../plans/plan.service.js'
import { PLAN_SEEDS } from '../../shared/seed/plan-seed.js'

@Injectable()
export class PlanSeeder implements OnModuleInit {
  private readonly logger = new Logger(PlanSeeder.name)

  constructor(private readonly planService: PlanService) {}

  async onModuleInit(): Promise<void> {
    for (const plan of PLAN_SEEDS) {
      await this.planService.seedIfAbsent(plan)
    }
    this.logger.log(`Ensured ${PLAN_SEEDS.length.toString()} plans exist`)
  }
}
