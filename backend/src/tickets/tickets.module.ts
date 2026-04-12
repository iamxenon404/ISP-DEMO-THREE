// src/tickets/tickets.module.ts

import { Module } from '@nestjs/common'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { TicketsGateway } from './tickets.gateway'

@Module({
  controllers: [TicketsController],
  providers:   [TicketsService, TicketsGateway],
  exports:     [TicketsService],
})
export class TicketsModule {}