import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageResolver } from './page.resolver';
import { Page, PageSchema } from './entities/page.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { BookModule } from '../book/book.module'

@Module({
  imports: [
    MongooseModule.forFeature([{name: Page.name, schema: PageSchema}]),
    BookModule
  ],
  providers: [PageResolver, PageService],
  exports: [PageService]
})
export class PageModule {}
