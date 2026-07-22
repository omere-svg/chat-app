import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { PlanDocument } from './plan.schema.js'
import { toPlan } from './plan.mapper.js'
import type { PlanRepository } from './plan.repository.js'
import type { Plan } from './types/plan.js'

@Injectable()
export class MongoPlanRepository implements PlanRepository {
  constructor(
    @InjectModel(PlanDocument.name)
    private readonly planModel: Model<PlanDocument>,
  ) {}

  async insertIfAbsent(plan: Plan): Promise<void> {
    await this.planModel.updateOne(
      { _id: plan.code },
      {
        $setOnInsert: {
          name: plan.name,
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
          active: plan.active,
        },
      },
      { upsert: true },
    )
  }

  async findByCode(code: string): Promise<Plan | null> {
    const document = await this.planModel.findById(code).lean<PlanDocument | null>()
    return document === null ? null : toPlan(document)
  }

  async listActive(): Promise<Plan[]> {
    const documents = await this.planModel.find({ active: true }).lean<PlanDocument[]>()
    return documents.map(toPlan)
  }
}
