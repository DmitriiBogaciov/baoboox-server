import { Injectable } from '@nestjs/common';
import { CreateBlockInput } from './dto/create-block.input';
import { UpdateBlockInput } from './dto/update-block.input';
import { Block, BlockDocument } from './entities/block.entity';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose'
import { ID } from 'graphql-ws';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createBlockInput: CreateBlockInput) {
    const createdBlock = new this.blockModel(createBlockInput);
    return createdBlock.save();
  }

  findAll() {
    return this.blockModel.find();
  }

  findOne(id: String) {
    return this.blockModel.findById(id);
  }

  update(id: String, updateBlockInput: UpdateBlockInput) {

    const newBlock = this.blockModel.findByIdAndUpdate(
      {_id: id},
      {$set: updateBlockInput},
      {new: true}
    )

    return newBlock;
  }

  remove(id: ID) {
    return this.blockModel.deleteOne({_id: id});
  }
}
