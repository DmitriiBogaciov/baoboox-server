import { Injectable } from '@nestjs/common';
import { CreatePageInput } from './dto/create-page.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { UpdatePageInput } from './dto/update-page.input';
import { Page, PageDocument } from './entities/page.entity';
import { Model, Connection } from 'mongoose'
import { ID } from 'graphql-ws';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    @InjectConnection() private connection: Connection
  ) { }

  create(createPageInput: CreatePageInput) {
    const createdPage = new this.pageModel(createPageInput);
    return createdPage.save();
  }

  async findAll() {
    const response = await this.pageModel.find()
    // console.log(response)
    return response;
  }

  findOne(id: String) {
    return this.pageModel.findById(id);
  }

  async getPagesForBook(id: string){
    const response = await this.pageModel.find({bookId: id})
    // console.log(response)
    return response;
  }

  update(id: String, updatePageInput: UpdatePageInput) {

    const newPage = this.pageModel.findOneAndUpdate(
      { _id: id },
      { $set: updatePageInput },
      { new: true }
    )

    return newPage;
  }

  remove(id: ID) {
    return this.pageModel.deleteOne({_id: id});
  }
}
