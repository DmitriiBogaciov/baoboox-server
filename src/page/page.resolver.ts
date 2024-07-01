import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PageService } from './page.service';
import { Page } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';

@Resolver(() => Page)
export class PageResolver {
  constructor(private readonly pageService: PageService) {}

  @Mutation(() => Page)
  createPage(@Args('createPageInput') createPageInput: CreatePageInput) {
    return this.pageService.create(createPageInput);
  }

  @Query(() => [Page], { name: 'page' })
  findAll() {
    return this.pageService.findAll();
  }

  @Query(() => Page, { name: 'page' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.pageService.findOne(id);
  }

  @Mutation(() => Page)
  updatePage(@Args('updatePageInput') updatePageInput: UpdatePageInput) {
    return this.pageService.update(updatePageInput.id, updatePageInput);
  }

  @Mutation(() => Page)
  removePage(@Args('id', { type: () => Int }) id: number) {
    return this.pageService.remove(id);
  }
}
