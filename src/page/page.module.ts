import { Module, forwardRef } from '@nestjs/common';
import { PageService } from './page.service';
import { PageResolver } from './page.resolver';
import { Page, PageSchema } from './entities/page.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Page.name, schema: PageSchema}]),
    forwardRef(() => EventsModule),
  ],
  providers: [PageResolver, PageService],
  exports: [PageService]
})
export class PageModule {}
