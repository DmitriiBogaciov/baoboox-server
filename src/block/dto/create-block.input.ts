import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

@InputType()
export class CreateBlockInput {
  @Field({nullable: true})
  @IsString()
  @IsOptional()
  readonly type: string

  @Field({ nullable: true })
  @IsOptional()
  readonly order: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  readonly content: any;

  @Field(() => ID)
  readonly page: string;
}
