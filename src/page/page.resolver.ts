import { Resolver, Query, Mutation, Args, Context, Subscription } from '@nestjs/graphql';
import { PageService } from './page.service';
import { Page } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';
import { AuthGuard } from '../auth/AuthGuard';
import { UseGuards, Logger, Inject } from '@nestjs/common';
import { PUBSUB } from '../utils/pubsub.constants';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Page)
export class PageResolver {
  constructor(
    private readonly pageService: PageService,
    @Inject(PUBSUB) private readonly pubSub: PubSub,
  ) { }

  private logger: Logger = new Logger(PageResolver.name)

  @Mutation(() => Page)
  async createPage(@Args('createPageInput') createPageInput: CreatePageInput) {
    const newPage = await this.pageService.create(createPageInput);

    this.logger.log(`Publishing pageCreated event with payload: ${JSON.stringify(newPage)}`)

    await this.pubSub.publish('pageCreated', { pageCreated: newPage });

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
  async getPagesForBook(
    @Args('id', { type: () => String }) id: ID,
    @Args('parentIds', {type: () => [String], nullable: true}) parentIds?: ID[],
  ) {
    this.logger.log(`Fetching pages for book with id: ${id} and parentIds: ${parentIds}`);
    
    if (parentIds && parentIds.length > 0) {
      return this.pageService.getPagesForParents(parentIds);
    }
    return this.pageService.getPagesForBook(id);
  }


  @Mutation(() => Page)
  @UseGuards(new AuthGuard([]))
  async updatePage(@Args('updatePageInput') updatePageInput: UpdatePageInput, @Context() context: any) {
    const response = await this.pageService.update(updatePageInput.id, updatePageInput, context.req.auth.payload.sub);

    await this.pubSub.publish('pageUpdated', { pageUpdated: response });

    return response;
  }

  @Mutation(() => [Page])
  @UseGuards(new AuthGuard([]))
  async updatePages(
    @Args('updatePageInputs', { type: () => [UpdatePageInput] }) updatePageInputs: UpdatePageInput[],
    @Context() context: any
  ) {
    if (!Array.isArray(updatePageInputs) || updatePageInputs.length === 0) {
      return [];
    }

    const seen = new Set();
    for (const input of updatePageInputs) {
      if (!input.id) {
        throw new Error(`Missing id in updatePageInputs: ${JSON.stringify(input)}`);
      }
      if (seen.has(input.id)) {
        throw new Error(`Duplicate id found in updatePageInputs: ${input.id}`);
      }
      seen.add(input.id);
    }

    const userId = context?.req?.auth?.payload?.sub as string | undefined;

    // Service method should wrap in a transaction and return updated entities
    const updated = await this.pageService.updateMany(updatePageInputs, userId);

    // Emit subscription events (optional but useful for live UI)
    for (const page of updated) {
      await this.pubSub.publish('pageUpdated', { pageUpdated: page });
    }

    return updated;
  }

  @Mutation(() => Page)
  // @UseGuards(new AuthGuard([]))
  async removePage(@Args('id', { type: () => String }) id: ID) {
    const result = await this.pageService.remove(id);

    if (result._id == id) {
      await this.pubSub.publish('pageRemoved', { pageRemoved: result });
    }

    return result;
  }

  @Subscription(() => Page, {
    filter: (payload, variables) => {
      return payload.pageCreated.bookId.toString() === variables.bookId;
    },
  })
  pageCreated(@Args('bookId') bookId: string) {
    this.logger.log(`Connected to create page sub for bookId: ${bookId}`);
    return this.pubSub.asyncIterableIterator('pageCreated');
  }

  @Subscription(() => Page)
  pageRemoved() {
    this.logger.log('Connected to remove page sub')
    return this.pubSub.asyncIterableIterator('pageRemoved');
  }

  @Subscription(() => Page, {
    filter: (payload, variables) => {
      return payload.pageUpdated.id === variables.id;
    }
  })
  pageUpdated(@Args('id', {type: () => String}) id: string) {
    this.logger.log(`Connected to update page sub for id: ${id}`)
    return this.pubSub.asyncIterableIterator('pageUpdated');
  }
}
