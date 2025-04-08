import { Test, TestingModule } from '@nestjs/testing';
import { SupportAgentService } from './support-agent.service';

describe('SupportAgentService', () => {
  let service: SupportAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportAgentService],
    }).compile();

    service = module.get<SupportAgentService>(SupportAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
