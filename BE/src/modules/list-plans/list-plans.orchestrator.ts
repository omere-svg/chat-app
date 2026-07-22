import { Injectable } from '@nestjs/common'
import { PlanService } from '../plans/plan.service.js'
import type { Plan } from '../plans/types/plan.js'
import type { PlansView, PlanView } from './types/plans.view.js'

function toPlanView(plan: Plan): PlanView {
  return {
    code: plan.code,
    name: plan.name,
    amount: plan.amount,
    currency: plan.currency,
    interval: plan.interval,
  }
}

@Injectable()
export class ListPlansOrchestrator {
  constructor(private readonly planService: PlanService) {}

  async list(): Promise<PlansView> {
    const plans = await this.planService.listActive()
    return { plans: plans.map(toPlanView) }
  }
}
