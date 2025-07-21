import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockResolver } from './block.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './entities/block.entity'
import { PageModule } from '../page/page.module'
import { BlockGateway } from './block.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BlockController } from './block.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
    PageModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
          wildcards: true
        }
      }
    ]),
  ],
  providers: [BlockResolver, BlockService, BlockGateway],
  controllers: [BlockController],
})
export class BlockModule { }
