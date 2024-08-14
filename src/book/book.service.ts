import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Book, BookDocument } from './entities/book.entity'
import { Model, Connection } from 'mongoose';
import { CategoryService } from '../category/category.service'
import { Types } from 'mongoose';
import { ID } from 'graphql-ws';


@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectConnection() private connection: Connection,
    private categoryService: CategoryService
  ) { }

  async create(createBookInput: CreateBookInput, userId: ID): Promise<Book> {
    try {
      const bookData = {
        ...createBookInput,
        author: userId
      }

      const createdBook = new this.bookModel(bookData);
      return createdBook.save();

    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  findOne(id: ID) {
    return this.bookModel.findById(id).exec();
  }

  async update(id: string, updateBookInput: UpdateBookInput, userId: ID): Promise<Book> {
    try {

      const objectId = new Types.ObjectId(id);

      if (updateBookInput.categories) {
        const categories = await this.categoryService.findByIds(updateBookInput.categories);
        if (categories.length !== updateBookInput.categories.length) {
          throw new NotFoundException('One or more categories not found');
        }
      }

      const book = await this.bookModel.findById(objectId).exec();
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      if (book.author.toString() !== userId) {
        throw new ForbiddenException('You do not have permission to update this book');
      }

      const updatedBook = await this.bookModel.findOneAndUpdate(
        { _id: objectId },
        { $set: updateBookInput },
        { new: true }
      ).exec();

      if (!updatedBook) {
        throw new NotFoundException('Book not found');
      }

      return updatedBook;

    } catch (error) {
      throw error;
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} book`;
  // }
}
