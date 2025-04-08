import { Controller, Get, Param, Put, Body, Post, HttpException, HttpStatus } from '@nestjs/common';
import { SupportAgentService, SupportAgent } from './support-agent.service';
import { TwilioService } from '../twilio/twilio.service';

@Controller('support-agents')
export class SupportAgentController {
  constructor(
    private readonly supportAgentService: SupportAgentService,
    private readonly twilioService: TwilioService,
  ) {}

  @Get()
  findAll(): SupportAgent[] {
    return this.supportAgentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): SupportAgent | undefined {
    return this.supportAgentService.findById(Number(id));
  }

  @Get('department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string): SupportAgent[] {
    return this.supportAgentService.findByDepartment(Number(departmentId));
  }

  @Put(':id/availability')
  updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ): SupportAgent | undefined {
    return this.supportAgentService.updateAvailability(Number(id), isAvailable);
  }

  @Post(':id/call')
  async makeOutboundCall(
    @Param('id') id: string,
    @Body('customerPhoneNumber') customerPhoneNumber: string,
  ) {
    if (!customerPhoneNumber) {
      throw new HttpException('Customer phone number is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const call = await this.twilioService.makeOutboundCall(Number(id), customerPhoneNumber);
      return call;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
