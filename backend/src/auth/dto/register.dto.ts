// src/auth/dto/register.dto.ts

import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'

export enum UserRole {
  customer   = 'customer',
  admin      = 'admin',
  support    = 'support',
  technician = 'technician',
}

export class RegisterDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsEnum(UserRole)
  role: UserRole
}