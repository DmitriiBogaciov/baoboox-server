import { InputType, ID, Field } from '@nestjs/graphql';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  readonly title: string;

  // @Field({ nullable: true })
  // @IsString()
  // @IsOptional()
  // readonly description?: string;

  // @Field()
  // @IsString()
  // @IsOptional()
  // readonly author: string;

  // @Field({ nullable: true })
  // @IsString()
  // @IsOptional()
  // readonly image?: string;

  // @Field()
  // @IsBoolean()
  // @IsOptional()
  // readonly visibility: boolean;

  // @Field(() => [String])
  // @IsArray()
  // @IsOptional()
  // readonly categories: string[];

  // @Field(() => [String], { nullable: true })
  // @IsArray()
  // @IsOptional()
  // readonly tags?: string[];

  // @Field()
  // @IsString()
  // @IsOptional()
  // readonly language: string;
}
