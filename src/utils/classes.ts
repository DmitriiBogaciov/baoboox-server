import { Field, Int, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class RemoveRes{
  @Field()
  acknowledged: boolean 
  
  @Field(() => Int)
  deletedCount: number
}