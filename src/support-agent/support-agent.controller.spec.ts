import { Test, TestingModule } from '@nestjs/testing';
import { SupportAgentController } from './support-agent.controller';

describe('SupportAgentController', () => {
  let controller: SupportAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportAgentController],
    }).compile();

    controller = module.get<SupportAgentController>(SupportAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
