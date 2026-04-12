// src/tickets/tickets.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/tickets',
})
export class TicketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`WS client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`WS client disconnected: ${client.id}`)
  }

  // Client joins a ticket room to receive messages
  @SubscribeMessage('joinTicket')
  handleJoinTicket(
    @MessageBody() data: { ticketId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `ticket_${data.ticketId}`
    client.join(room)
    client.emit('joinedTicket', { ticketId: data.ticketId, room })
  }

  // Client leaves a ticket room
  @SubscribeMessage('leaveTicket')
  handleLeaveTicket(
    @MessageBody() data: { ticketId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`ticket_${data.ticketId}`)
  }

  // Emit event to all clients in a ticket room
  emitToTicket(ticketId: number, event: string, data: any) {
    this.server.to(`ticket_${ticketId}`).emit(event, data)
  }
}