import { Module, forwardRef } from '@nestjs/common';
import { SupportAgentController } from './support-agent.controller';
import { SupportAgentService } from './support-agent.service';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [forwardRef(() => TwilioModule)],
  controllers: [SupportAgentController],
  providers: [SupportAgentService],
  exports: [SupportAgentService],
})
export class SupportAgentModule {}
