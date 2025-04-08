import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { SupportAgentModule } from '../support-agent/support-agent.module';

@Module({
  imports: [SupportAgentModule],
  providers: [CallService],
  exports: [CallService]
})
export class CallModule {}
