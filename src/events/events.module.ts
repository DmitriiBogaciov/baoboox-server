import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PageModule } from '../page/page.module';

@Module({
  imports: [forwardRef(() => PageModule)], 
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}