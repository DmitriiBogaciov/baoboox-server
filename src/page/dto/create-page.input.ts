import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

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

  @Field(() => Number, {nullable: true})
  @IsNumber()
  order: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}