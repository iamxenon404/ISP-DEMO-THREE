// src/tickets/tickets.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { SendMessageDto } from './dto/send-message.dto'

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  /**
   * POST /api/tickets
   * Create a ticket — AI responds instantly
   */
  @Post()
  create(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(req.user.id, dto)
  }

  /**
   * GET /api/tickets
   * List tickets — customers see own, support/admin see all
   */
  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.ticketsService.getTickets(req.user.id, req.user.role, status)
  }

  /**
   * GET /api/tickets/:id
   * Get single ticket with full message history
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ticketsService.getTicket(id, req.user.id, req.user.role)
  }

  /**
   * POST /api/tickets/:id/messages
   * Send a message — triggers AI if ticket is in ai_handling
   */
  @Post(':id/messages')
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.ticketsService.sendMessage(id, req.user.id, req.user.role, dto)
  }

  /**
   * POST /api/tickets/:id/escalate
   * Customer requests human support
   */
  @Post(':id/escalate')
  escalate(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ticketsService.escalate(id, req.user.id)
  }

  /**
   * PATCH /api/tickets/:id/status
   * Support/admin updates ticket status
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    return this.ticketsService.updateStatus(id, body.status)
  }
}