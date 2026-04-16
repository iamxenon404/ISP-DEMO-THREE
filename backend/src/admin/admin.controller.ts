// src/admin/admin.controller.ts

import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private adminService: AdminService) {}

  // GET /api/admin/stats
  @Get('stats')
  getStats() {
    return this.adminService.getStats()
  }

  // GET /api/admin/users
  @Get('users')
  getAllUsers(
    @Query('role')   role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllUsers(role, status)
  }

  // PATCH /api/admin/users/:id/status
  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'active' | 'suspended' | 'pending' },
  ) {
    return this.adminService.updateUserStatus(id, body.status)
  }

  // GET /api/admin/technicians
  @Get('technicians')
  getTechnicians() {
    return this.adminService.getTechnicians()
  }

  // GET /api/admin/installations
  @Get('installations')
  getInstallations(@Query('status') status?: string) {
    return this.adminService.getInstallations(status)
  }

  // POST /api/admin/installations/:id/assign
  @Post('installations/:id/assign')
  assignTechnician(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { technicianId: number },
  ) {
    return this.adminService.assignTechnician(id, body.technicianId)
  }

  // PATCH /api/admin/installations/:id/status
  @Patch('installations/:id/status')
  updateInstallationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    return this.adminService.updateInstallationStatus(id, body.status)
  }

  // GET /api/admin/technicians/:id/jobs
  @Get('technicians/:id/jobs')
  getTechnicianJobs(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTechnicianJobs(id)
  }

  // POST /api/admin/installations/assign-direct
  // Creates an installation and assigns technician in one step
  @Post('installations/assign-direct')
  assignDirect(@Body() body: { userId: number; technicianId: number; notes?: string }) {
    return this.adminService.assignDirect(body.userId, body.technicianId, body.notes)
  }
}