// src/admin/admin.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Overview stats ───────────────────────────────────────

  async getStats() {
    const [
      totalCustomers,
      totalStaff,
      activeSubs,
      suspendedSubs,
      payments,
      plans,
      subsWithPlans,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.user.count({ where: { role: { in: ['admin', 'support', 'technician'] } } }),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.prisma.subscription.count({ where: { status: { in: ['suspended', 'expired'] } } }),
      this.prisma.payment.findMany({ where: { status: 'completed' } }),
      this.prisma.plan.findMany(),
      this.prisma.subscription.findMany({
        where:   { status: 'active' },
        include: { plan: true },
      }),
    ])

    // Actual revenue — sum of confirmed payments
    const actualRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    // Estimated revenue — active subs × their plan price
    const estimatedRevenue = subsWithPlans.reduce((sum, s) => sum + (s.plan?.price ?? 0), 0)

    return {
      totalCustomers,
      totalStaff,
      totalUsers: totalCustomers + totalStaff,
      activeSubs,
      suspendedSubs,
      actualRevenue,
      estimatedRevenue,
    }
  }

  // ─── Get all users ────────────────────────────────────────

  async getAllUsers(role?: string, status?: string) {
    const where: any = {}
    if (role)   where.role   = role
    if (status) where.status = status

    const users = await this.prisma.user.findMany({
      where,
      include: {
        subscription: { include: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      users: users.map((u) => ({
        id:        u.id,
        name:      u.name,
        email:     u.email,
        role:      u.role,
        status:    u.status,
        createdAt: u.createdAt,
        subscription: u.subscription ? {
          status:    u.subscription.status,
          expiryDate: u.subscription.expiryDate,
          plan: {
            name:  u.subscription.plan.name,
            speed: u.subscription.plan.speed,
            price: u.subscription.plan.price,
          },
        } : null,
      })),
    }
  }

  // ─── Update user status ───────────────────────────────────

  async updateUserStatus(userId: number, status: 'active' | 'suspended' | 'pending') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found.')

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data:  { status },
    })

    // If suspending a customer — also suspend their subscription
    if (status === 'suspended' && user.role === 'customer') {
      await this.prisma.subscription.updateMany({
        where: { userId },
        data:  { status: 'suspended' },
      })
    }

    // If reactivating — also reactivate subscription
    if (status === 'active' && user.role === 'customer') {
      await this.prisma.subscription.updateMany({
        where: { userId },
        data:  { status: 'active' },
      })
    }

    return { message: `User ${status} successfully.`, user: updated }
  }

  // ─── Get technicians list ─────────────────────────────────

  async getTechnicians() {
    const techs = await this.prisma.user.findMany({
      where:   { role: 'technician', status: 'active' },
      select:  { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })
    return { technicians: techs }
  }

  // ─── Assign technician to installation ────────────────────

  async assignTechnician(installationId: number, technicianId: number) {
    const installation = await this.prisma.installation.findUnique({
      where: { id: installationId },
    })
    if (!installation) throw new NotFoundException('Installation not found.')

    const updated = await this.prisma.installation.update({
      where: { id: installationId },
      data:  { technicianId, status: 'assigned' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return { message: 'Technician assigned.', installation: updated }
  }

  // ─── Get all installations ────────────────────────────────

  async getInstallations(status?: string) {
    const where: any = {}
    if (status) where.status = status

    const installations = await this.prisma.installation.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return { installations }
  }

  // ─── Get technician's assigned jobs ───────────────────────

  async getTechnicianJobs(technicianId: number) {
    const jobs = await this.prisma.installation.findMany({
      where:   { technicianId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return { jobs }
  }

  // ─── Update installation status ───────────────────────────

  async updateInstallationStatus(installationId: number, status: string) {
    const updated = await this.prisma.installation.update({
      where: { id: installationId },
      data:  { status: status as any },
    })
    return { installation: updated }
  }

  // ─── Create installation + assign technician directly ─────

  async assignDirect(userId: number, technicianId: number, notes?: string) {
    const installation = await this.prisma.installation.create({
      data: {
        userId,
        technicianId,
        status: 'assigned',
        notes:  notes ?? null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return { message: 'Technician assigned successfully.', installation }
  }
}