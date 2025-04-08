import { Module } from '@nestjs/common';
import { IvrController } from './ivr.controller';
import { IvrService } from './ivr.service';
import { DepartmentModule } from '../department/department.module';
import { SupportAgentModule } from '../support-agent/support-agent.module';
import { WebSocketModule } from 'src/websocket/websocket.module';
import { CallModule } from 'src/call/call.module';

@Module({
  imports: [DepartmentModule, SupportAgentModule, WebSocketModule, CallModule],
  controllers: [IvrController],
  providers: [IvrService]
})
export class IvrModule {}
