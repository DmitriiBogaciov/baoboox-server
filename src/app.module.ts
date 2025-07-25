import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { BookModule } from './book/book.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from './category/category.module';
import { PageModule } from './page/page.module';
import { BlockModule } from './block/block.module';
import { AuthModule } from './auth/auth.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { HttpModule } from '@nestjs/axios';
import { GraphQLJSON } from 'graphql-type-json';
import { pubSub } from './utils/pubsub.provider';
import { parse } from 'url';
import { RedisClientModule } from './utils/redis-client.module';
import { PageController } from './page/page.controller';
import { PUBSUB } from './utils/pubsub.constants';

const redisUrl = process.env.REDIS_URL!;
const parsed = parse(redisUrl);

const host = parsed.hostname!;
const redisPort = Number(parsed.port);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      subscriptions: {
        'graphql-ws': true
      },
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      resolvers: { JSON: GraphQLJSON },
      context: ({ req }) => ({ req }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    UserModule,
    BookModule,
    CategoryModule,
    PageModule,
    BlockModule,
    AuthModule,
    HttpModule,
    RedisClientModule
  ],
  controllers: [AppController, PageController],
  providers: [
    AppService,
    {
      provide: PUBSUB,
      useValue: pubSub,
    },
  ]
})
export class AppModule { }
