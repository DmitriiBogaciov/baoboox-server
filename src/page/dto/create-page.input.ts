import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

@InputType()
export class CreatePageInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => Boolean, {nullable: true})
  @IsBoolean()
  visibility: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  parentId?: string;

  @Field(() => ID)
  bookId: string;

  @Field(() => Int, {nullable: true})
  @IsInt()
  order: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}