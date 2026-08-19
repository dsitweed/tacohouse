import { Test, TestingModule } from '@nestjs/testing';

import { R2StorageService } from './r2-storage.service';

describe('StorageService', () => {
  let service: R2StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [R2StorageService],
    }).compile();

    service = module.get<R2StorageService>(R2StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
