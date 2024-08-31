import { CreateBlockInput } from './create-block.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateBlockInput extends PartialType(CreateBlockInput) {
  @Field(() => ID)
  id: String;
}
