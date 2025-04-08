import { Injectable } from '@nestjs/common';
import { SupportAgentService } from '../support-agent/support-agent.service';

export interface CallQueueItem {
  conferenceName: string;
  caller: string;
  timestamp: number;
}

@Injectable()
export class CallService {
  private callQueue: CallQueueItem[] = [];

  constructor(private readonly supportAgentService: SupportAgentService) {}

  addToQueue(conferenceName: string, caller: string): CallQueueItem {
    console.log(`📥 Adding call to queue - Conference: ${conferenceName}, Caller: ${caller}`);
    const queueItem: CallQueueItem = {
      conferenceName,
      caller,
      timestamp: Date.now(),
    };
    this.callQueue.push(queueItem);
    console.log(`📊 Current queue size: ${this.callQueue.length}`);
    return queueItem;
  }

  removeFromQueue(conferenceName: string): void {
    console.log(`📤 Removing call from queue - Conference: ${conferenceName}`);
    this.callQueue = this.callQueue.filter(
      (call) => call.conferenceName !== conferenceName,
    );
    console.log(`📊 Updated queue size: ${this.callQueue.length}`);
  }

  getQueue(): CallQueueItem[] {
    return this.callQueue;
  }

  getNextCall(): CallQueueItem | undefined {
    const nextCall = this.callQueue[0];
    if (nextCall) {
      console.log(`📞 Next call in queue - Conference: ${nextCall.conferenceName}, Caller: ${nextCall.caller}`);
    } else {
      console.log('📭 Queue is empty');
    }
    return nextCall;
  }

  async assignCallToAgent(conferenceName: string): Promise<boolean> {
    console.log(`👤 Attempting to assign call to agent - Conference: ${conferenceName}`);
    const availableAgent = await this.supportAgentService.findAvailableAgent(1); // Using department 1 for now
    if (availableAgent) {
      console.log(`✅ Successfully assigned call to agent ${availableAgent.id}`);
      this.removeFromQueue(conferenceName);
      return true;
    }
    console.log('❌ No available agents found');
    return false;
  }
} 