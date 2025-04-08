import { Injectable } from '@nestjs/common';

export interface SupportAgent {
  id: number;
  name: string;
  departmentId: number;
  isAvailable: boolean;
  priority: number;
}

@Injectable()
export class SupportAgentService {
  private agents: SupportAgent[] = [
    { id: 12, name: 'John Doe', departmentId: 1, isAvailable: true, priority: 1 },
    { id: 13, name: 'Jane Smith', departmentId: 1, isAvailable: true, priority: 2 },
    { id: 14, name: 'Mike Johnson', departmentId: 2, isAvailable: false, priority: 1 },
    { id: 15, name: 'Sarah Williams', departmentId: 2, isAvailable: true, priority: 2 },
  ];

  findAll(): SupportAgent[] {
    return this.agents;
  }

  findById(id: number): SupportAgent | undefined {
    return this.agents.find(a => a.id === id);
  }

  findByDepartment(departmentId: number): SupportAgent[] {
    return this.agents
      .filter(a => a.departmentId === departmentId)
      .sort((a, b) => {
        // First sort by availability, then by priority
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1;
        }
        return a.priority - b.priority;
      });
  }

  findAvailableAgent(departmentId: number): SupportAgent | undefined {
    return this.agents
      .filter(a => a.departmentId === departmentId && a.isAvailable)
      .sort((a, b) => a.priority - b.priority)[0];
  }

  updateAvailability(id: number, isAvailable: boolean): SupportAgent | undefined {
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
      agent.isAvailable = isAvailable;
    }
    return agent;
  }
}
