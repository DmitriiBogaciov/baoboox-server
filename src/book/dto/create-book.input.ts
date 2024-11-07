import { InputType, ID, Field } from '@nestjs/graphql';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field({ nullable: true})
  @IsString()
  readonly title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly author: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly image?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  readonly visibility: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  readonly categories: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  readonly tags?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly language: string;
}
