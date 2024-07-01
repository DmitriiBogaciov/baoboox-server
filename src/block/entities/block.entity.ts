import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument} from 'mongoose';
import { Page } from 'src/page/entities/page.entity';

export type BlockDocument = HydratedDocument<Block>;

@Schema()
@ObjectType()
export class Block {
  @Field(() => ID)
  _id: string

  @Field({nullable: true})
  @Prop({required: false})
  type?: string

  @Field()
  @Prop({required: true})
  order: number

  @Field(() => String, { nullable: true }) 
  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  content: any;

  @Field(() => Page)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Page' })
  page: Page;
}

export const BlockSchema = SchemaFactory.createForClass(Block)
