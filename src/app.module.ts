import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IvrModule } from './ivr/ivr.module';
import { SupportAgentModule } from './support-agent/support-agent.module';
import { DepartmentModule } from './department/department.module';
import { TwilioModule } from './twilio/twilio.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ConfigModule } from '@nestjs/config';
import { CallModule } from './call/call.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IvrModule,
    SupportAgentModule,
    DepartmentModule,
    TwilioModule,
    CallModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
