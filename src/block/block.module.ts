import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockResolver } from './block.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema} from './entities/block.entity'
import { PageModule } from '../page/page.module'
import { BlockGateway } from './block.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Block.name, schema: BlockSchema}]),
    PageModule
  ],
  providers: [BlockResolver, BlockService, BlockGateway],
})
export class BlockModule {}
