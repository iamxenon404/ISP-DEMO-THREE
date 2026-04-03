// src/users/users.service.ts
// Stub — will expand when building admin user management

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        status:    true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        status:    true,
        createdAt: true,
      },
    })
  }
}