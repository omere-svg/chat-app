import { Injectable } from '@nestjs/common'
import { PlanService } from '../plans/plan.service.js'
import { toPlanView } from './plan-view.mapper.js'
import type { PlansView } from './types/plans.view.js'

@Injectable()
export class ListPlansOrchestrator {
  constructor(private readonly planService: PlanService) {}

  async list(): Promise<PlansView> {
    const plans = await this.planService.listActive()
    return { plans: plans.map(toPlanView) }
  }
}
