import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallService } from '../call/call.service';
import { SupportAgentService } from '../support-agent/support-agent.service';


@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: '*',
    credentials: true,
    httpOnly: false,
    sameOrigin: false,
    allowedHeaders: ['ngrok-skip-browser-warning']

  },
  transports: ['websocket', 'polling'],
})
export class SupportWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; 

  constructor(
    private readonly callService: CallService,
    private readonly supportAgentService: SupportAgentService,
  ) {}


  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }



  // Join room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, agentId: string) {
    client.join(agentId);
    console.log(`Agent ${agentId} joined their room`);
  }

  // Handle agent available
  @SubscribeMessage('agentAvailable')
  async handleAgentAvailable(client: Socket, agentId: string) {
    const agent = await this.supportAgentService.findById(Number(agentId));
    if (agent) {
      await this.supportAgentService.updateAvailability(Number(agentId), true);
      const nextCall = this.callService.getNextCall();
      if (nextCall) {
        this.server.to(agentId).emit('assignedCall', {
          conferenceName: nextCall.conferenceName,
          caller: nextCall.caller,
        });
      }
    }
  }


  @SubscribeMessage('conferenceStatus')
  notifyConferenceStatus(agentId: string, status: {
    status: string;
    conferenceSid: string;
    callSid: string;
  }) {
    this.server.to(agentId).emit('conferenceStatus', status);
  }

  notifyNewCall(call: { conferenceName: string; caller: string }) {
    this.server.emit('newSupportCall', call);
  }

  notifyAssignedCall(agentId: string, call: { conferenceName: string; caller: string }) {
    this.server.to(agentId).emit('assignedCall', call);
  }
} 