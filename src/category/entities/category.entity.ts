import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
@ObjectType()
export class Category {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field({ nullable: true })
  @Prop({ required: false, default: null })
  description: string;

  @Field(() => ID, { nullable: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null })
  parentId: Category | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);