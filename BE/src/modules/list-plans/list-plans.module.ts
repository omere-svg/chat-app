import { Module } from '@nestjs/common'
import { PlanModule } from '../plans/plan.module.js'
import { ListPlansOrchestrator } from './list-plans.orchestrator.js'

@Module({
  imports: [PlanModule],
  providers: [ListPlansOrchestrator],
  exports: [ListPlansOrchestrator],
})
export class ListPlansModule {}
