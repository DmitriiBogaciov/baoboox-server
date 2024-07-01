import { Injectable } from '@nestjs/common';
import { CreatePageInput } from './dto/create-page.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { UpdatePageInput } from './dto/update-page.input';
import { Page, PageDocument } from './entities/page.entity';
import { Model, Connection } from 'mongoose'

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private categoryModel: Model<PageDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  create(createPageInput: CreatePageInput) {
    const createdPage = new this. categoryModel(createPageInput);
    return createdPage.save();
  }

  findAll() {
    return `This action returns all page`;
  }

  findOne(id: number) {
    return `This action returns a #${id} page`;
  }

  update(id: number, updatePageInput: UpdatePageInput) {
    return `This action updates a #${id} page`;
  }

  remove(id: number) {
    return `This action removes a #${id} page`;
  }
}
