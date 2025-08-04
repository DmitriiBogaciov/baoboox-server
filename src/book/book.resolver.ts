import { Resolver, Query, Mutation, Args, Context, Subscription } from '@nestjs/graphql';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { UseGuards, Inject, Logger } from '@nestjs/common';
import { AuthGuard } from '../auth/AuthGuard';
import { UserService } from 'src/user/user.service';
import { ID } from 'graphql-ws';
import { RemoveRes } from 'src/utils/classes';
import { PUBSUB } from '../utils/pubsub.constants';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Book)
export class BookResolver {
  private readonly logger = new Logger(BookResolver.name);

  constructor(
    private readonly bookService: BookService,
    private readonly userService: UserService,
    @Inject(PUBSUB) private readonly pubSub: PubSub,
  ) { }

  @UseGuards(new AuthGuard([]))
  @Mutation(() => Book)
  createBook(@Args('createBookInput') createBookInput: CreateBookInput, @Context() context: any) {
    return this.bookService.create(createBookInput, context.req.auth.payload.sub);
  }

  @Query(() => [Book], { name: 'books' })
  findAll() {
    return this.bookService.findAll();
  }

  @Query(() => Book, { name: 'book' })
  findOne(@Args('id', { type: () => String }) id: ID) {
    return this.bookService.findOne(id);
  }

  @Query(() => [Book], { name: 'booksByCategory' })
  findByCategory(@Args('id', { type: () => String }) id: ID) {
    return this.bookService.findByCategory(id);
  }

  @Query(() => [Book], { name: 'booksForAuthor' })
  @UseGuards(new AuthGuard([]))
  findForAuthor(@Context() context: any) {
    return this.bookService.findForAuthor(context.req.auth.payload.sub);
  }

  @Mutation(() => Book)
  @UseGuards(new AuthGuard(['update:book']))
  async updateBook(@Args('updateBookInput') updateBookInput: UpdateBookInput, @Context() context: any) {
    const response = await this.bookService.update(updateBookInput.id, updateBookInput, context.req.auth.payload.sub);
    await this.pubSub.publish('bookUpdated', { bookUpdated: response });
    return response;
  }

  @Mutation(() => RemoveRes)
  removeBook(@Args('id', { type: () => String }) id: ID) {
    return this.bookService.remove(id);
  }

  @Subscription(() => Book)
  bookUpdated() {
    this.logger.log('Connected to update book sub')
    return this.pubSub.asyncIterableIterator('bookUpdated');
  }
}
