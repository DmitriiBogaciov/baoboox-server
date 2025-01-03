import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { GraphQLJSON } from 'graphql-type-json';
import { HydratedDocument} from 'mongoose';
import { Page } from 'src/page/entities/page.entity';

export type BlockDocument = HydratedDocument<Block>;

@Schema()
@ObjectType()
export class Block {
  @Field(() => ID)
  _id: string

  @Field({nullable: true})
  @Prop({required: false, default: null})
  type?: string

  @Field()
  @Prop({required: true, default: null})
  order: number

  @Field(() => GraphQLJSON, { nullable: true }) 
  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: null })
  content: any;

  @Field(() => ID, { nullable: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true })
  pageId: Page | null;
}

export const BlockSchema = SchemaFactory.createForClass(Block)
