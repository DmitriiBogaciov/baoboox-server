import { CreatePageInput } from './create-page.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePageInput extends PartialType(CreatePageInput) {
  @Field(() => Int)
  id: number;
}
