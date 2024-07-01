import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

@InputType()
export class CreateBlockInput {
  @Field({nullable: true})
  @IsString()
  readonly type: string

  @Field()
  readonly order: number

  @Field(() => String, { nullable: true })
  readonly content: any;

  @Field(() => ID)
  readonly page: string;
}
