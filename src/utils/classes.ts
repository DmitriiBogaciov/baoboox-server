import { Field, ID, Int, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class RemoveRes{
  @Field()
  acknowledged: boolean 
  
  @Field(() => Int)
  deletedCount: number

  @Field(() => ID)
  bookId: string
}