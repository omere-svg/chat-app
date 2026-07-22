import type { Plan } from './types/plan.js'

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY')

export interface PlanRepository {
  insertIfAbsent(plan: Plan): Promise<void>
  findByCode(code: string): Promise<Plan | null>
  listActive(): Promise<Plan[]>
}
