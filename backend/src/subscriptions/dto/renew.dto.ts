// src/subscriptions/dto/renew.dto.ts

import { IsInt, IsOptional } from 'class-validator'

export class RenewDto {
  @IsInt()
  @IsOptional()
  planId?: number // optional — if provided, changes plan on renewal
}