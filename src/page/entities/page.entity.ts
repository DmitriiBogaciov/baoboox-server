import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Book } from '../../book/entities/book.entity'

export type PageDocument = HydratedDocument<Page>

@Schema()
@ObjectType()
export class Page {
  @Field(() => ID)
  _id: string;
  
  @Field({ nullable: true})
  @Prop({default: 'Untitled', required: false})
  title: string;

  @Field(() => Boolean, {nullable: true})
  @Prop({default: false, required: false})
  visibility: boolean;

  @Field(() => ID, {nullable: true})
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null, required: false})
  parentId: Page | null;

  @Field(() => ID)
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Book'})
  bookId: Book | null;

  @Field(() => Int)
  @Prop({ required: true })
  order: number;
}

export const PageSchema = SchemaFactory.createForClass(Page);
