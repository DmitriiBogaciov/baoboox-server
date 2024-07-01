import { CreateBlockInput } from './create-block.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateBlockInput extends PartialType(CreateBlockInput) {
  @Field(() => Int)
  id: number;
}
