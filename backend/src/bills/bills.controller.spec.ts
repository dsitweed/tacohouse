import { Test, TestingModule } from '@nestjs/testing';

import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

describe('BillsController', () => {
  let controller: BillsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillsController],
      providers: [
        {
          provide: BillsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BillsController>(BillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
