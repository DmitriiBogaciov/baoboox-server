import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Category } from '../../category/entities/category.entity';

export type BookDocument = HydratedDocument<Book>;

@Schema()
@ObjectType()
export class Book {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field({ nullable: true })
  @Prop({type: String, default: null})
  description?: string;

  @Field({nullable: true})
  @Prop()
  owner: string;

  @Field(() => [String], {nullable: true})
  @Prop({type: [String], default: []})
  authors: string[];

  @Field(() => [String], {nullable: true})
  @Prop({type: [String], default: []})
  editors: string[];

  @Field({ nullable: true })
  @Prop({type: String, default: null})
  image?: string;

  @Field({ nullable: true })
  @Prop({type: Boolean, default: false })
  visibility: boolean;

  @Field(() => [Category], { nullable: true })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], default: null })
  categories: Category[];

  @Field(() => [String], { nullable: true })
  @Prop({type: [String], default: null})
  tags?: string[];

  @Field({ nullable: true })
  @Prop({type: String, default: null})
  language: string;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);
