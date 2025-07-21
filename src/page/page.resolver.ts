import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { PageService } from './page.service';
import { Page } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';
import { AuthGuard } from '../auth/AuthGuard';
import { UseGuards, Logger } from '@nestjs/common';
import { pubsub } from 'src/utils/pubsub.provider'

@Resolver(() => Page)
export class PageResolver {
  constructor(
    private readonly pageService: PageService,
  ) { }

  private logger: Logger = new Logger(PageResolver.name)

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

    await pubsub.publish('pageUpdated', { pageUpdated: response });

    return response;
  }

  @Mutation(() => Page)
  // @UseGuards(new AuthGuard([]))
  async removePage(@Args('id', { type: () => String }) id: ID) {
    const result = await this.pageService.remove(id);

    if (result._id == id) {
      await pubsub.publish('pageRemoved', { pageRemoved: result });
    }

    return result;
  }

  @Subscription(() => Page, {
    filter: (payload, variables) =>
      payload.pageCreated.bookId === variables.bookId,
  })
  pageCreated(@Args('bookId') bookId: string) {
    this.logger.log('Connected to create page sub')
    return pubsub.asyncIterator('pageCreated');
  }

  @Subscription(() => Page)
  pageRemoved() {
    this.logger.log('Connected to remove page sub')
    return pubsub.asyncIterator('pageRemoved');
  }

  @Subscription(() => Page)
  pageUpdated() {
    this.logger.log('Connected to update page sub')
    return pubsub.asyncIterator('pageUpdated');
  }
}
