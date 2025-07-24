import { Provider } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUBSUB } from './pubsub.constants';

export const PubSubProvider: Provider = {
  provide: PUBSUB,
  useValue: new PubSub(),
};