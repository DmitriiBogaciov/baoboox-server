import { Resolver, Query, Mutation, Args, Int, Context, ObjectType, Field } from '@nestjs/graphql';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/AuthGuard';
import { UserService } from 'src/user/user.service';
import { ID } from 'graphql-ws';

@ObjectType()
class RemoveRes{
  @Field()
  acknowledged: boolean 
  
  @Field(() => Int)
  deletedCount: number
}


@Resolver(() => Book)
export class BookResolver {
  constructor(
    private readonly bookService: BookService,
    private readonly userService: UserService
    ) {}

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

  @Query(() => [Book], { name: 'booksByCategory'})
  findByCategory(@Args('id', { type: () => String}) id: ID) {
    return this.bookService.findByCategory(id);
  }

  @Mutation(() => Book)
  @UseGuards(new AuthGuard(['update:book']))
  updateBook(@Args('updateBookInput') updateBookInput: UpdateBookInput, @Context() context: any) {
    return this.bookService.update(updateBookInput.id, updateBookInput, context.req.auth.payload.sub);
  }

  @Mutation(() => RemoveRes)
  removeBook(@Args('id', { type: () => String }) id: ID) {
    return this.bookService.remove(id);
  }
}
