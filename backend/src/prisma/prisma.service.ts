// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prismaClient = new PrismaClient({ adapter })

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {

  get user() {
    return prismaClient.user
  }

  async onModuleInit() {
    await prismaClient.$connect()
  }

  async onModuleDestroy() {
    await prismaClient.$disconnect()
  }
}