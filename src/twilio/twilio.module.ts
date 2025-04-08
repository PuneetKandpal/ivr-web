import { Module, forwardRef } from '@nestjs/common';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { SupportAgentModule } from '../support-agent/support-agent.module';

@Module({
  imports: [forwardRef(() => SupportAgentModule)],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {} 