import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Book, BookDocument } from './entities/book.entity'
import { Model, Connection } from 'mongoose';
import { CategoryService } from '../category/category.service'


@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectConnection() private connection: Connection,
    private categoryService: CategoryService
  ) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    if (createBookInput.categories) {
      await this.categoryService.checkCategoriesExist(createBookInput.categories);
    }

    const createdBook = new this.bookModel(createBookInput);
    return createdBook.save();
  }

  async findAll(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookInput: UpdateBookInput) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
