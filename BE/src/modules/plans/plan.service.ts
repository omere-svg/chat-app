import { Inject, Injectable } from '@nestjs/common'
import { PLAN_REPOSITORY } from './plan.repository.js'
import type { PlanRepository } from './plan.repository.js'
import type { Plan } from './types/plan.js'

@Injectable()
export class PlanService {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async seedIfAbsent(plan: Plan): Promise<void> {
    await this.planRepository.insertIfAbsent(plan)
  }

  async findByCode(code: string): Promise<Plan | null> {
    return this.planRepository.findByCode(code)
  }

  async listActive(): Promise<Plan[]> {
    return this.planRepository.listActive()
  }
}
