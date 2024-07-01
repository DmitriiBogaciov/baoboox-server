import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockResolver } from './block.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema} from './entities/block.entity'
import { PageModule } from '../page/page.module'

@Module({
  imports: [
    MongooseModule.forFeature([{name: Block.name, schema: BlockSchema}]),
    PageModule
  ],
  providers: [BlockResolver, BlockService],
})
export class BlockModule {}
