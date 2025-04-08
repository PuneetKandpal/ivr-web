import { Controller, Post, Body, Param, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { IvrService } from './ivr.service';
import { CallService } from '../call/call.service';
import { SupportWebSocketGateway } from '../websocket/websocket.gateway';
import * as twilio from 'twilio';
const VoiceResponse = twilio.twiml.VoiceResponse;



@Controller('ivr')
export class IvrController {
  constructor(
    private readonly ivrService: IvrService,
    private readonly callService: CallService,
    private readonly webSocketGateway: SupportWebSocketGateway,
  ) {}

  @Get('welcome')
  handleIncomingCall(@Res() res: Response) {
    console.log('✅Incoming call');
    const twiml = this.ivrService.generateWelcomeMessage();
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('gather')
  async handleGather(@Body('Digits') digits: string, @Res() res: Response) {
    const twiml = await this.ivrService.handleDigitInput(digits);
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('direct-agent')
  async handleDirectAgentConnect(@Body('Digits') agentId: string, @Res() res: Response) {
    const twiml = await this.ivrService.connectToSpecificAgent(agentId);
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('wait')
  handleWait(@Res() res: Response) {
    const twiml = this.ivrService.generateWaitMusic();
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('agent/answer/:agentId')
  handleAgentAnswer(
    @Param('agentId') agentId: string,
    @Body('conferenceName') conferenceName: string,
    @Res() res: Response,
  ) {
    const twiml = this.ivrService.generateAgentAnswerResponse(Number(agentId));
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('agent/connect/:agentId')
  handleAgentConnect(
    @Param('agentId') agentId: string,
    @Body('conferenceName') conferenceName: string,
    @Res() res: Response,
  ) {
    const twiml = this.ivrService.generateConnectToAgentResponse(Number(agentId));
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('queue')
  async handleQueue(
    @Body('conferenceName') conferenceName: string,
    @Body('caller') caller: string,
    @Res() res: Response,
  ) {
    const queueItem = this.callService.addToQueue(conferenceName, caller);
    this.webSocketGateway.notifyNewCall(queueItem);
    const twiml = this.ivrService.generateQueueResponse('Support');
    res.type('text/xml');
    res.send(twiml);
  }

  @Get('queue/status')
  getQueueStatus() {
    return this.callService.getQueue();
  }

  @Post('conference-status')
  handleConferenceStatus(@Body() body: any) {
    console.log('Conference status received:', body);
    return ""
  }
}
