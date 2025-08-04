import { Module, forwardRef } from '@nestjs/common';
import { PageService } from './page.service';
import { PageResolver } from './page.resolver';
import { Page, PageSchema } from './entities/page.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { pubSub } from 'src/utils/pubsub.provider';
import { RedisClientModule } from 'src/utils/redis-client.module';
import { PUBSUB } from 'src/utils/pubsub.constants';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Page.name, schema: PageSchema}]),
    RedisClientModule
  ],
  providers: [
    PageResolver,
    PageService,
    {
      provide: PUBSUB,
      useValue: pubSub,
    },
  ],
  exports: [PageService]
})
export class PageModule {}
