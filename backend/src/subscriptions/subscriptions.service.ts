// src/subscriptions/subscriptions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RenewDto } from './dto/renew.dto'

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  // ─── Get current user's subscription ─────────────────────

  async getMySubscription(userId: number) {
    const sub = await this.prisma.subscription.findUnique({
      where:   { userId },
      include: { plan: true },
    })

    if (!sub) {
      return { subscription: null }
    }

    // Auto-check expiry and suspend if past due
    const now = new Date()
    if (sub.expiryDate < now && sub.status === 'active') {
      const updated = await this.prisma.subscription.update({
        where:   { id: sub.id },
        data:    { status: 'suspended' },
        include: { plan: true },
      })
      return { subscription: this.formatSub(updated) }
    }

    return { subscription: this.formatSub(sub) }
  }

  // ─── Renew subscription ───────────────────────────────────

  async renew(userId: number, dto: RenewDto) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    })

    if (!sub) throw new NotFoundException('No subscription found for this user.')

    // Calculate new expiry — extend from today or from current expiry (whichever is later)
    const now        = new Date()
    const baseDate   = sub.expiryDate > now ? sub.expiryDate : now
    const newExpiry  = new Date(baseDate)
    newExpiry.setDate(newExpiry.getDate() + 30)

    const updated = await this.prisma.subscription.update({
      where:   { id: sub.id },
      data:    {
        status:     'active',
        expiryDate: newExpiry,
        ...(dto.planId ? { planId: dto.planId } : {}),
      },
      include: { plan: true },
    })

    return {
      message:      'Subscription renewed successfully.',
      subscription: this.formatSub(updated),
    }
  }

  // ─── Get subscription by userId (admin use) ───────────────

  async getByUserId(userId: number) {
    const sub = await this.prisma.subscription.findUnique({
      where:   { userId },
      include: { plan: true },
    })
    if (!sub) throw new NotFoundException('Subscription not found.')
    return { subscription: this.formatSub(sub) }
  }

  // ─── Admin: manually update subscription ──────────────────

  async adminUpdate(subId: number, data: { status?: string; planId?: number }) {
    const updated = await this.prisma.subscription.update({
      where:   { id: subId },
      data:    {
        ...(data.status ? { status: data.status as any } : {}),
        ...(data.planId ? { planId: data.planId }        : {}),
      },
      include: { plan: true },
    })
    return { subscription: this.formatSub(updated) }
  }

  // ─── Helper ───────────────────────────────────────────────

  private formatSub(sub: any) {
    return {
      id:         sub.id,
      status:     sub.status,
      expiryDate: sub.expiryDate,
      daysLeft:   Math.max(0, Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000)),
      plan: {
        id:    sub.plan.id,
        name:  sub.plan.name,
        speed: sub.plan.speed,
        price: sub.plan.price,
      },
    }
  }
}