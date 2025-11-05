import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { Model, Connection, Types } from 'mongoose';
import { ID } from 'graphql-ws';
import { RemoveRes } from '../utils/classes'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectConnection() private connection: Connection
  ) { }

  create(createCategoryInput: CreateCategoryInput) {
    const createdCategory = new this.categoryModel(createCategoryInput);
    return createdCategory.save();
  }

  findAll() {
    return this.categoryModel.find().exec();
  }

  findByIds(categoryIds: string[]) {
    return this.categoryModel.find({ _id: { $in: categoryIds } }).exec();
  }

  findOne(id: ID) {
    return this.categoryModel.findOne({ _id: id }).exec();
  }

  update(id: string, updateCategoryInput: UpdateCategoryInput) {

    const catId = new Types.ObjectId(id);

    const newCat = this.categoryModel.findOneAndUpdate(
      { _id: catId },
      { $set: updateCategoryInput },
      { new: true }
    )

    if (!newCat) {
      throw new NotFoundException("The category doesn't exist!")
    }

    return newCat;
  }

  async remove(id: String): Promise<any> {
    const result = await this.categoryModel.deleteOne({ _id: id });
    return result;
  }

  // async checkCategoriesExist(categoryIds: string[]): Promise<void> {
  //   for (const categoryId of categoryIds) {
  //     const categoryExists = await this.categoryModel.exists({ _id: categoryId });
  //     if (!categoryExists) {
  //       throw new NotFoundException(`Category with ID ${categoryId} not found`);
  //     }
  //   }
  // }
}
