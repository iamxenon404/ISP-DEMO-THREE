// src/plans/plans.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    })
  }
}