// src/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────

  private getDashboard(role: string): string {
    const map: Record<string, string> = {
      admin:      '/dashboard/admin',
      support:    '/dashboard/support',
      technician: '/dashboard/technician',
      customer:   '/dashboard/customer',
    }
    return map[role] ?? '/dashboard/customer'
  }

  private buildUserPayload(user: {
    id: number
    name: string
    email: string
    role: string
    status: string
  }) {
    return {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      status:    user.status,
      dashboard: this.getDashboard(user.role),
    }
  }

  private signToken(userId: number, email: string, role: string): string {
    return this.jwt.sign({ sub: userId, email, role })
  }

  // ─── Register ───────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (existing) {
      throw new ConflictException('An account with this email already exists.')
    }

    const hashed = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        name:     dto.name,
        email:    dto.email,
        password: hashed,
        role:     dto.role,
        status:   'active', // auto-activate for demo
      },
    })

    const token = this.signToken(user.id, user.email, user.role)

    return {
      message:    'Account created successfully.',
      token,
      token_type: 'Bearer',
      user:       this.buildUserPayload(user),
    }
  }

  // ─── Login ──────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.')
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password.')
    }

    const token = this.signToken(user.id, user.email, user.role)

    return {
      message:    'Login successful.',
      token,
      token_type: 'Bearer',
      user:       this.buildUserPayload(user),
    }
  }

  // ─── Me ─────────────────────────────────────────────────

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) throw new UnauthorizedException('User not found.')

    return { user: this.buildUserPayload(user) }
  }
}