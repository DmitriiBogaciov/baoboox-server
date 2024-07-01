import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BlockService } from './block.service';
import { Block } from './entities/block.entity';
import { CreateBlockInput } from './dto/create-block.input';
import { UpdateBlockInput } from './dto/update-block.input';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation(() => Block)
  createBlock(@Args('createBlockInput') createBlockInput: CreateBlockInput) {
    return this.blockService.create(createBlockInput);
  }

  @Query(() => [Block], { name: 'block' })
  findAll() {
    return this.blockService.findAll();
  }

  @Query(() => Block, { name: 'block' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.blockService.findOne(id);
  }

  @Mutation(() => Block)
  updateBlock(@Args('updateBlockInput') updateBlockInput: UpdateBlockInput) {
    return this.blockService.update(updateBlockInput.id, updateBlockInput);
  }

  @Mutation(() => Block)
  removeBlock(@Args('id', { type: () => Int }) id: number) {
    return this.blockService.remove(id);
  }
}
