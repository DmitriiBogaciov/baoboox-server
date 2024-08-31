import { CreatePageInput } from './create-page.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdatePageInput extends PartialType(CreatePageInput) {
  @Field(() => ID)
  id: String;
}
