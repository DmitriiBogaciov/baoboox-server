import { Test, TestingModule } from '@nestjs/testing';
import { PageResolver } from './page.resolver';
import { PageService } from './page.service';

describe('PageResolver', () => {
  let resolver: PageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageResolver,
        PageService,
        {
          provide: 'PUBSUB',
          useValue: {}, // You can provide a mock implementation if needed
        },
        {
          provide: 'BOOK_SERVICE',
          useValue: {}, // You can provide a mock implementation if needed
        },
      ],
    }).compile();

    resolver = module.get<PageResolver>(PageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
