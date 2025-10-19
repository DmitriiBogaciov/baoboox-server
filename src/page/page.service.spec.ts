import { Test, TestingModule } from '@nestjs/testing';
import { PageService } from './page.service';

describe('PageService', () => {
  let service: PageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageService,
        {
          provide: 'PageModel',
          useValue: {}, // Provide a mock or stub as needed
        },
        {
          provide: 'DatabaseConnection',
          useValue: {}, // Provide a mock or stub as needed
        },
      ],
    }).compile();

    service = module.get<PageService>(PageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
