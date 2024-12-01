import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PageService } from './page.service';
import { Page } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';
// import { RemoveRes } from 'src/utils/classes';
import { AuthGuard } from '../auth/AuthGuard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Page)
export class PageResolver {
  constructor(private readonly pageService: PageService) { }

  @Mutation(() => Page)
  createPage(@Args('createPageInput') createPageInput: CreatePageInput) {
    return this.pageService.create(createPageInput);
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

  @Query(() => [Page], { name: 'childrenForPage' })
  async getChildren(@Args('parentId') parentId: string): Promise<Page[]> {
    return this.pageService.getChildren(parentId);
  }

  @Mutation(() => Page)
  @UseGuards(new AuthGuard([]))
  async updatePage(@Args('updatePageInput') updatePageInput: UpdatePageInput) {
    const response = await this.pageService.update(updatePageInput.id, updatePageInput);
    console.log(response);
    return response;
  }

  @Mutation(() => Page)
  // @UseGuards(new AuthGuard([]))
  async removePage(@Args('id', { type: () => String }) id: ID) {
    return await this.pageService.remove(id);
  }
}
