import { Injectable } from '@nestjs/common';
import { DepartmentService } from '../department/department.service';
import { SupportAgentService } from '../support-agent/support-agent.service';
import { SupportWebSocketGateway } from 'src/websocket/websocket.gateway';
import * as twilio from 'twilio';
const VoiceResponse = twilio.twiml.VoiceResponse;

@Injectable()
export class IvrService {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly supportAgentService: SupportAgentService,
    private readonly webSocketGateway: SupportWebSocketGateway,
  ) {}

  generateWelcomeMessage(): string {
    const response = new VoiceResponse();
    const gather = response.gather({
      numDigits: 1,
      action: '/ivr/gather',
      method: 'POST',
    });

    gather.say('Welcome to our support line. Please press:');
    gather.say('1 for Sales');
    gather.say('2 for Support');
    gather.say('3 for Billing');
    gather.say('4 to connect to a specific agent');

    return response.toString();
  }

  async handleDigitInput(digit: string): Promise<string> {
    console.log(`📞 Handling digit input: ${digit}`);
    
    if (digit === '4') {
      console.log('🔢 User wants to connect to a specific agent');
      return this.promptForAgentId();
    }
    
    const department = this.departmentService.findByExtension(digit);
    if (!department) {
      console.log(`❌ Invalid department extension: ${digit}`);
      return this.generateInvalidOptionResponse();
    }

    console.log(`✅ Found department: ${department.name}`);
    const availableAgent = this.supportAgentService.findAvailableAgent(department.id);
    if (!availableAgent) {
      console.log(`⏳ No available agents in ${department.name}, adding to queue`);
      return this.generateQueueResponse(department.name);
    }

    console.log(`👤 Connecting to available agent: ${availableAgent.id}`);
    return await  this.generateConnectToAgentResponse(availableAgent.id);
  }

  private generateInvalidOptionResponse(): string {
    const response = new VoiceResponse();
    response.say('Invalid option selected. Please try again.');
    response.redirect('/ivr/welcome');
    return response.toString();
  }
  
  private promptForAgentId(): string {
    const response = new VoiceResponse();
    response.say('Please enter the ID of the agent you would like to connect to, followed by the hash key.');
    const gather = response.gather({
      action: '/ivr/direct-agent',
      method: 'POST',
      finishOnKey: '#',
      timeout: 10,
    });
    return response.toString();
  }
  
  async connectToSpecificAgent(agentId: string): Promise<string> {
    console.log(`🔍 Attempting to connect to specific agent with ID: ${agentId}`);
    
    // Strip any '#' character if present
    const cleanAgentId = agentId.replace(/#/g, '');
    const agentIdNumber = Number(cleanAgentId);
    
    // Check if agent exists and is available
    const agent = this.supportAgentService.findById(agentIdNumber);
    
    if (!agent) {
      console.log(`❌ Agent with ID ${agentIdNumber} not found`);
      const response = new VoiceResponse();
      response.say(`The agent with ID ${agentIdNumber} was not found. Please try again.`);
      response.redirect('/ivr/welcome');
      return response.toString();
    }
    
    if (!agent.isAvailable) {
      console.log(`⏳ Agent with ID ${agentIdNumber} is not available`);
      const response = new VoiceResponse();
      response.say(`The agent with ID ${agentIdNumber} is currently not available. You will be added to the queue.`);
      return this.generateQueueResponse(`Agent ${agent.name}`);
    }
    
    console.log(`👤 Connecting to requested agent: ${agent.id}`);
    return await this.generateAssignCallToAgentResponse(agent.id);
  }

  generateQueueResponse(departmentName: string): string {
    console.log(`🔄 Generating queue response for ${departmentName}`);
    const response = new VoiceResponse();
    response.say(`All ${departmentName} agents are currently busy. Please wait in the queue.`);
    response.enqueue({
      waitUrl: '/ivr/wait',
      action: '/ivr/queue-status',
    });
    return response.toString();
  }

  async generateAssignCallToAgentResponse(agentId: number): Promise<string> {
    console.log(`🔗 Generating connect response for agent ${agentId}`);
    const response = new VoiceResponse();
    response.say('Connecting you to an available agent.');
    
    const agentTwilioIdentity = `agent-${agentId}`;

    // Instead of creating a conference, we'll use the Twilio Device API
    // This will trigger the "incoming" event on the agent's device
    response.dial().client(agentTwilioIdentity);
    
    return response.toString();
  }

  async generateConnectToAgentResponse(agentId: number): Promise<string> {
    console.log(`🔗 Generating connect response for agent ${agentId}`);
    const response = new VoiceResponse();
    response.say('Connecting you to an available agent.');
    
    const conferenceName = `conference-${agentId}-${Date.now()}`;

    const dial = response.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
    });
    
    dial.conference(conferenceName);
      
    this.webSocketGateway.notifyNewCall({
      conferenceName,
      caller: process.env.TWILIO_PHONE_NUMBER,
    });
    
    return response.toString();
  }

  generateWaitMusic(): string {
    const response = new VoiceResponse();
    response.play({ loop: 0 }, 'https://demo.twilio.com/docs/classic.mp3');
    return response.toString();
  }

  generateAgentAnswerResponse(agentId: number): string {
    const response = new VoiceResponse();
    response.say('You have a new call. Please press any key to accept.');
    response.gather({
      numDigits: 1,
      action: `/ivr/agent/connect/${agentId}`,
      method: 'POST',
    });
    return response.toString();
  }

}
