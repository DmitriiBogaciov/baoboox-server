import { Resolver, Query, Mutation, Args, Int, } from '@nestjs/graphql';
import { BlockService } from './block.service';
import { Block } from './entities/block.entity';
import { CreateBlockInput } from './dto/create-block.input';
import { UpdateBlockInput } from './dto/update-block.input';
import { ID } from 'graphql-ws';
import { RemoveRes } from 'src/utils/classes';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation(() => Block)
  createBlock(@Args('createBlockInput') createBlockInput: CreateBlockInput) {
    return this.blockService.create(createBlockInput);
  }

  @Query(() => [Block], { name: 'blocks' })
  findAll() {
    return this.blockService.findAll();
  }

  @Query(() => Block, { name: 'block' })
  findOne(@Args('id', { type: () => String }) id: ID) {
    return this.blockService.findOne(id);
  }

  @Query(() => [Block], { name: 'blocksForPage' })
  findForPage(@Args('id', { type: () => String }) id: ID) {
    return this.blockService.findForPage(id);
  }

  @Mutation(() => Block)
  updateBlock(@Args('updateBlockInput') updateBlockInput: UpdateBlockInput) {
    return this.blockService.update(updateBlockInput);
  }

  @Mutation(() => RemoveRes)
  removeBlock(@Args('id', { type: () => String }) id: ID) {
    return this.blockService.remove(id);
  }
}
