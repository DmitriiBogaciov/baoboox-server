import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PageService } from './page.service';
import { Page } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';
import { RemoveRes } from 'src/utils/classes';

@Resolver(() => Page)
export class PageResolver {
  constructor(private readonly pageService: PageService) {}

  @Mutation(() => Page)
  createPage(@Args('createPageInput') createPageInput: CreatePageInput) {
    return this.pageService.create(createPageInput);
  }

  @Query(() => [Page], { name: 'pages' })
  async findAll() {
    const result = await this.pageService.findAll();
    console.log(result);
    return result;
  }

  @Query(() => Page, { name: 'page' })
  findOne(@Args('id', { type: () => String }) id: ID) {
    return this.pageService.findOne(id);
  }

  @Query(() => [Page], { name: 'pagesForBook' })
  async getPagesForBook(@Args('id', { type: () => String }) id: ID) {
    const response = await this.pageService.getPagesForBook(id);
    console.log(response)
    return response;
  }

  @Mutation(() => Page)
  updatePage(@Args('updatePageInput') updatePageInput: UpdatePageInput) {
    return this.pageService.update(updatePageInput.id, updatePageInput);
  }

  @Mutation(() => RemoveRes)
  removePage(@Args('id', { type: () => String }) id: ID) {
    return this.pageService.remove(id);
  }
}
