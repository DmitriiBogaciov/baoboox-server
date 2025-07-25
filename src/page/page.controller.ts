import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { PUBSUB } from '../utils/pubsub.constants';
import { PubSub } from 'graphql-subscriptions';

@Controller('page')
export class PageController {
    constructor(
        @Inject(PUBSUB) private readonly pubSub: PubSub
    ) { }

    private logger = new Logger(PageController.name);

    // @EventPattern('pageUpdated')
    // async handlePageUpdated(data: any) {
    //     this.logger.log(`Received pageUpdated event with data: ${JSON.stringify(data)}`);
    //     await this.pubSub.publish('pageUpdated', { pageUpdated: data });
    // }
}