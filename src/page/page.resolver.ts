import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { PageService } from './page.service';
import { Page } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';
import { AuthGuard } from '../auth/AuthGuard';
import { UseGuards } from '@nestjs/common';
import { pubsub } from 'src/utils/pubsub.provider'

@Resolver(() => Page)
export class PageResolver {
  constructor(private readonly pageService: PageService) { }

  @Mutation(() => Page)
  async createPage(@Args('createPageInput') createPageInput: CreatePageInput) {
    const newPage = await this.pageService.create(createPageInput);

    await pubsub.publish('pageCreated', { pageCreated: newPage });
    
    return newPage;
  }

  @Query(() => [Page], { name: 'pages' })
  async findAll() {
    const result = await this.pageService.findAll();
    return result;
  }

  @Query(() => Page, { name: 'page', nullable: true })
  findOne(@Args('id', { type: () => String }) id: ID) {
    return this.pageService.findOne(id);
  }

  @Query(() => [Page], { name: 'pagesForBook' })
  async getPagesForBook(@Args('id', { type: () => String }) id: ID) {
    const response = await this.pageService.getPagesForBook(id);
    return response;
  }


  @Mutation(() => Page)
  @UseGuards(new AuthGuard([]))
  async updatePage(@Args('updatePageInput') updatePageInput: UpdatePageInput) {
    const response = await this.pageService.update(updatePageInput.id, updatePageInput);
    return response;
  }

  @Mutation(() => Page)
  // @UseGuards(new AuthGuard([]))
  async removePage(@Args('id', { type: () => String }) id: ID) {
    return await this.pageService.remove(id);
  }

  @Subscription(() => Page)
  pageCreated() {
    // Возвращаем итератор, который "слушает" события 'pageCreated'
    return pubsub.asyncIterator('pageCreated');
  }
}
