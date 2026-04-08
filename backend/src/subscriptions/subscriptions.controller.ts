// src/subscriptions/subscriptions.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SubscriptionsService } from './subscriptions.service'
import { RenewDto } from './dto/renew.dto'

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  /**
   * GET /api/subscriptions/my
   * Get the current logged-in customer's subscription
   */
  @Get('my')
  getMySubscription(@Request() req: any) {
    return this.subscriptionsService.getMySubscription(req.user.id)
  }

  /**
   * POST /api/subscriptions/renew
   * Renew current user's subscription (+30 days)
   */
  @Post('renew')
  renew(@Request() req: any, @Body() dto: RenewDto) {
    return this.subscriptionsService.renew(req.user.id, dto)
  }

  /**
   * GET /api/subscriptions/user/:userId
   * Admin: get any user's subscription
   */
  @Get('user/:userId')
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.subscriptionsService.getByUserId(userId)
  }

  /**
   * PATCH /api/subscriptions/:id
   * Admin: update a subscription's status or plan
   */
  @Patch(':id')
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status?: string; planId?: number },
  ) {
    return this.subscriptionsService.adminUpdate(id, data)
  }
}