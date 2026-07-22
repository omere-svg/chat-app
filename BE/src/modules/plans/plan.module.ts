import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoPlanRepository } from './plan.mongo.repository.js'
import { PLAN_REPOSITORY } from './plan.repository.js'
import { PlanDocument, PlanSchema } from './plan.schema.js'
import { PlanService } from './plan.service.js'

@Module({
  imports: [MongooseModule.forFeature([{ name: PlanDocument.name, schema: PlanSchema }])],
  providers: [PlanService, { provide: PLAN_REPOSITORY, useClass: MongoPlanRepository }],
  exports: [PlanService],
})
export class PlanModule {}
