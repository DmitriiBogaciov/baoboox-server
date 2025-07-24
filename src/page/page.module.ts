import { Module, forwardRef } from '@nestjs/common';
import { PageService } from './page.service';
import { PageResolver } from './page.resolver';
import { Page, PageSchema } from './entities/page.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PageGateway } from './page.gateway';
import { PubSubProvider } from 'src/utils/pubsub.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Page.name, schema: PageSchema}]),
  ],
  providers: [
    PageResolver,
    PageService,
    PageGateway,
    PubSubProvider
  ],
  exports: [PageService]
})
export class PageModule {}
