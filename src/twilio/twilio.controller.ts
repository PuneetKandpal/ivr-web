import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TwilioService } from './twilio.service';


@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Get('token/:agentId')
  async getAgentToken(@Param('agentId') agentId: string): Promise<{ token: string }> {
    const token = await this.twilioService.generateAgentToken(Number(agentId));
    return { token };
  }
} 