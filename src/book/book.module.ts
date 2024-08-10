import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookResolver } from './book.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './entities/book.entity'
import { CategoryModule } from '../category/category.module'
import { AuthModule } from '../auth/auth.module'


@Module({
  imports: [
    MongooseModule.forFeature([{name: Book.name, schema: BookSchema}]),
    CategoryModule,
    AuthModule
  ],
  providers: [BookResolver, BookService],
  exports: [BookService]
})
export class BookModule {}
