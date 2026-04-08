// src/plans/plans.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PlansService } from './plans.service'

@Controller('plans')
@UseGuards(AuthGuard('jwt'))
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll()
  }
}