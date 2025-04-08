import { Module } from '@nestjs/common';
import { SupportAgentModule } from '../support-agent/support-agent.module';
import { CallModule } from 'src/call/call.module';
import { SupportWebSocketGateway } from './websocket.gateway';


@Module({
  imports: [CallModule, SupportAgentModule],
  providers: [SupportWebSocketGateway],
  exports: [SupportWebSocketGateway],
})
export class WebSocketModule {} 