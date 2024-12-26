import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateBlockInput {
  @Field({nullable: true})
  @IsString()
  @IsOptional()
  readonly type: string

  @Field({ nullable: true })
  @IsOptional()
  readonly order: number

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  readonly content: any;

  @Field(() => ID)
  readonly pageId: string;
}
