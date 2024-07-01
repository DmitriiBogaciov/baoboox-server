import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { Model, Connection } from 'mongoose';   

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectConnection() private connection: Connection
  ) {}
  
  create(createCategoryInput: CreateCategoryInput) {
    const createdCategory = new this.categoryModel(createCategoryInput);
    return createdCategory.save();
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryInput: UpdateCategoryInput) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }

  async checkCategoriesExist(categoryIds: string[]): Promise<void> {
    for (const categoryId of categoryIds) {
      const categoryExists = await this.categoryModel.exists({ _id: categoryId });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
    }
  }
}