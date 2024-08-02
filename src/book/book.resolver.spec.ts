import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';
import { CategoryService } from 'src/category/category.service';

describe('BookResolver', () => {
  let resolver: BookResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookResolver,
        BookService,
        CategoryService, // Provide the CategoryService
        {
          provide: getModelToken(Book.name),
          useValue: {} 
        },
        {
          provide: getConnectionToken(),
          useValue: {} // Используем заглушку соединения
        },
      ],
    }).compile();

    resolver = module.get<BookResolver>(BookResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
