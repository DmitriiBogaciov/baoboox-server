import { Injectable, Logger} from '@nestjs/common';
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

  private readonly logger = new Logger(BlockService.name)

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

  findForPage(id: String) {
    return this.blockModel.find({ pageId: id });
  }

  async update(updateBlockInput: UpdateBlockInput): Promise<Block> {
    try {
      const updatedBlock = await this.blockModel.findByIdAndUpdate(
        { _id: updateBlockInput.id },
        { $set: updateBlockInput },
        { new: true }, // Возвращаем обновлённый документ
      );

      if (!updatedBlock) {
        throw new Error(`Block with id ${updateBlockInput.id} not found`);
      }

      return updatedBlock;
    } catch (error) {
      throw new Error(`Error updating block: ${error.message}`);
    }
  }
  remove(id: ID): Promise<any> {
    return this.blockModel.deleteOne({_id: id});
  }
}
