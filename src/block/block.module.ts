import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockResolver } from './block.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './entities/block.entity'
import { PageModule } from '../page/page.module'
import { BlockGateway } from './block.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BlockController } from './block.controller';
import { parse } from 'url';

const createRedisOptions = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    const parsed = parse(redisUrl);
    const isTls = parsed.protocol === 'rediss:';
    
    return {
      host: parsed.hostname!,
      port: Number(parsed.port),
      password: parsed.auth ? parsed.auth.split(':')[1] : undefined,
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      wildcards: true
    };
  } else {
    return {
      host: 'localhost',
      port: 6379,
      wildcards: true
    };
  }
};

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
    PageModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.REDIS,
        options: createRedisOptions()
      }
    ]),
  ],
  providers: [BlockResolver, BlockService, BlockGateway],
  controllers: [BlockController],
})
export class BlockModule { }
