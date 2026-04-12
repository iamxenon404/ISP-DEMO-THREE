// src/tickets/tickets.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { getAIResponse } from './ai.engine'
import { TicketsGateway } from './tickets.gateway'

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private gateway: TicketsGateway,
  ) {}

  // ─── Create ticket + AI first response ───────────────────

  async createTicket(userId: number, dto: CreateTicketDto) {
    // Create ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        subject: dto.subject,
        status:  'ai_handling',
      },
    })

    // Save customer's first message
    await this.prisma.message.create({
      data: {
        ticketId:   ticket.id,
        senderId:   userId,
        senderType: 'customer',
        content:    dto.message,
      },
    })

    // Get AI response
    const ai = getAIResponse(dto.message)

    // Save AI response
    const aiMessage = await this.prisma.message.create({
      data: {
        ticketId:   ticket.id,
        senderId:   null,
        senderType: 'ai',
        content:    ai.message,
      },
    })

    // Notify via WebSocket
    this.gateway.emitToTicket(ticket.id, 'newMessage', this.formatMessage(aiMessage))

    return {
      ticket:   this.formatTicket(ticket),
      messages: [
        { content: dto.message, senderType: 'customer', createdAt: new Date() },
        this.formatMessage(aiMessage),
      ],
    }
  }

  // ─── Get all tickets ──────────────────────────────────────

  async getTickets(userId: number, role: string, status?: string) {
    const where: any = {}

    // Customers only see their own tickets
    if (role === 'customer') where.userId = userId

    // Filter by status if provided
    if (status) where.status = status

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        user:     { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return { tickets: tickets.map(this.formatTicketWithPreview) }
  }

  // ─── Get single ticket with messages ─────────────────────

  async getTicket(ticketId: number, userId: number, role: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where:   { id: ticketId },
      include: {
        user:     { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
      },
    })

    if (!ticket) throw new NotFoundException('Ticket not found.')

    // Customers can only view their own tickets
    if (role === 'customer' && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied.')
    }

    return {
      ticket:   this.formatTicket(ticket),
      messages: ticket.messages.map(this.formatMessage),
    }
  }

  // ─── Send message ─────────────────────────────────────────

  async sendMessage(ticketId: number, userId: number, role: string, dto: SendMessageDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new NotFoundException('Ticket not found.')

    const senderType = role === 'customer' ? 'customer' : 'support'

    // Save the message
    const message = await this.prisma.message.create({
      data: {
        ticketId,
        senderId:   userId,
        senderType: senderType as any,
        content:    dto.content,
      },
    })

    // Update ticket timestamp
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data:  { updatedAt: new Date() },
    })

    const formatted = this.formatMessage(message)

    // Broadcast to WebSocket room
    this.gateway.emitToTicket(ticketId, 'newMessage', formatted)

    // If customer message and ticket is still AI handling → AI responds
    if (role === 'customer' && ticket.status === 'ai_handling') {
      const ai = getAIResponse(dto.content)

      const aiMessage = await this.prisma.message.create({
        data: {
          ticketId,
          senderId:   null,
          senderType: 'ai',
          content:    ai.message,
        },
      })

      const formattedAI = this.formatMessage(aiMessage)
      this.gateway.emitToTicket(ticketId, 'newMessage', formattedAI)

      return { message: formatted, aiMessage: formattedAI }
    }

    // If support agent is replying → move to in_progress
    if (role === 'support' && ticket.status === 'waiting_human') {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data:  { status: 'in_progress' },
      })
      this.gateway.emitToTicket(ticketId, 'ticketUpdated', { status: 'in_progress' })
    }

    return { message: formatted }
  }

  // ─── Escalate to human ────────────────────────────────────

  async escalate(ticketId: number, userId: number) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new NotFoundException('Ticket not found.')
    if (ticket.userId !== userId) throw new ForbiddenException('Access denied.')

    // Simulate wait time based on current open tickets
    const openCount = await this.prisma.ticket.count({
      where: { status: { in: ['waiting_human', 'in_progress'] } },
    })
    const waitTime = Math.max(2, openCount * 3) // min 2 mins, +3 per ticket in queue

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data:  { status: 'waiting_human', waitTime },
    })

    // AI sends handoff message
    const handoffMessage = await this.prisma.message.create({
      data: {
        ticketId,
        senderId:   null,
        senderType: 'ai',
        content:    `Got it! I'm connecting you with a human support agent. Estimated wait time: **${waitTime} minutes**. An agent will join this chat shortly. Thank you for your patience! 🙏`,
      },
    })

    this.gateway.emitToTicket(ticketId, 'ticketUpdated', { status: 'waiting_human', waitTime })
    this.gateway.emitToTicket(ticketId, 'newMessage', this.formatMessage(handoffMessage))

    return {
      message:  'Escalated to human support.',
      waitTime,
      ticket:   this.formatTicket(updated),
    }
  }

  // ─── Update ticket status (support/admin) ─────────────────

  async updateStatus(ticketId: number, status: string) {
    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data:  { status: status as any },
    })

    this.gateway.emitToTicket(ticketId, 'ticketUpdated', { status })

    return { ticket: this.formatTicket(updated) }
  }

  // ─── Formatters ───────────────────────────────────────────

  private formatTicket(ticket: any) {
    return {
      id:        ticket.id,
      subject:   ticket.subject,
      status:    ticket.status,
      waitTime:  ticket.waitTime,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      user:      ticket.user ?? undefined,
    }
  }

  private formatTicketWithPreview = (ticket: any) => ({
    id:          ticket.id,
    subject:     ticket.subject,
    status:      ticket.status,
    waitTime:    ticket.waitTime,
    createdAt:   ticket.createdAt,
    updatedAt:   ticket.updatedAt,
    user:        ticket.user,
    lastMessage: ticket.messages?.[0]?.content ?? null,
  })

  private formatMessage = (msg: any) => ({
    id:         msg.id,
    ticketId:   msg.ticketId,
    senderType: msg.senderType,
    senderId:   msg.senderId,
    senderName: msg.sender?.name ?? (msg.senderType === 'ai' ? 'AI Assistant' : null),
    content:    msg.content,
    createdAt:  msg.createdAt,
  })
}