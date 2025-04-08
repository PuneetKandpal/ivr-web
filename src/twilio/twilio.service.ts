import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { SupportAgentService } from '../support-agent/support-agent.service';
import * as twilio from 'twilio';
const AccessToken = twilio.jwt.AccessToken
const VoiceGrant = AccessToken.VoiceGrant;

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;

  constructor(
    @Inject(forwardRef(() => SupportAgentService))
    private readonly supportAgentService: SupportAgentService
  ) {
    this.twilioClient = new twilio.Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async generateAgentToken(agentId: number): Promise<string> {
    console.log(`🔑 Generating Twilio token for agent ${agentId}`);
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    const client = new twilio.Twilio(accountSid, authToken);

    const agent = this.supportAgentService.findById(agentId);
    if (!agent) {
      //console.log(`❌ Agent ${agentId} not found`);
      throw new Error('Agent not found');
    }

    //console.log(`✅ Found agent ${agentId}, generating access token`);
    // Create an access token
    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: `agent-${agentId}` }
    );

    // Create a Voice grant for this token
    const voiceGrant = new VoiceGrant({
      incomingAllow: true,
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      //pushCredentialSid: process.env.TWILIO_PUSH_CREDENTIAL_SID,
      endpointId: `${process.env.TWILIO_TWIML_APP_SID}:agent-${agentId}`
    });

    // Add the grant to the token
    accessToken.addGrant(voiceGrant);

    // Generate the token
    const token = accessToken.toJwt();
    console.log(`✅ Successfully generated token for agent ${agentId}`);
    return token;
  }

  async makeOutboundCall(agentId: number, customerPhoneNumber: string): Promise<any> {
    console.log(`📞 Initiating outbound call from agent ${agentId} to ${customerPhoneNumber}`);
    
    const agent = await this.supportAgentService.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.isAvailable) {
      throw new Error('Agent is not available');
    }

    try {
      const call = await this.twilioClient.calls.create({
        twiml: `<Response><Say>Connecting you to ${agent.name}</Say><Dial>${customerPhoneNumber}</Dial></Response>`,
        to: customerPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        statusCallback: `${process.env.BASE_URL}/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });

      console.log(`✅ Successfully initiated call: ${call.sid}`);
      return {
        callSid: call.sid,
        status: call.status,
        direction: call.direction,
        from: call.from,
        to: call.to
      };
    } catch (error) {
      console.error('❌ Error making outbound call:', error);
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }
} 