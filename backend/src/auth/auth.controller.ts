// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/register
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  /**
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  /**
   * POST /api/auth/logout
   * JWT is stateless — client just drops the token.
   * This endpoint exists for a clean API contract.
   */
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logged out successfully.' }
  }

  /**
   * GET /api/auth/me
   * Returns the current authenticated user's profile.
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Request() req: any) {
    return this.authService.getMe(req.user.id)
  }
}