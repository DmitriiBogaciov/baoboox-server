import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model, Connection, Types } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Page, PageDocument } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    @InjectConnection() private connection: Connection,
  ) { }

  private readonly Logger: Logger = new Logger(PageService.name);

  //TODO: race condition possible here when two pages are created simultaneously
  async create(createPageInput: CreatePageInput) {
    const maxOrderPage = await this.pageModel
      .findOne({ bookId: createPageInput.bookId, parentId: createPageInput.parentId })
      .sort({ order: -1 })
      .exec();

    const newOrder = maxOrderPage ? maxOrderPage.order + 100 : 100;
    const createdPage = new this.pageModel({
      ...createPageInput,
      order: newOrder,
    });

    // Сохраняем в БД
    const savedPage = await createdPage.save();

    return savedPage;
  }

  async findAll() {
    return this.pageModel.find().exec();
  }

  async findOne(id: string): Promise<Page | null> {
    try {
      this.Logger.log(`Finding page with id: ${id}`);
      return await this.pageModel.findById(id).exec();
    } catch (error) {
      throw new Error(`Failed to find page: ${error.message}`);
    }
  }

  async getPagesForBook(bookId: string): Promise<Page[]> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException(`Invalid bookId: ${bookId}`);
    }
    return this.pageModel.find({ bookId }).exec();
  }

  async getPagesForParents(parentIds: string[]): Promise<Page[]> {
    for (const id of parentIds) {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid parentId: ${id}`);
      }
    }
    return this.pageModel.find({ parentId: { $in: parentIds } }).exec();
  }

  /**
   * Обновление страницы
   */
  async update(id: string, updatePageInput: UpdatePageInput, userId: ID): Promise<Page> {
    const page = await this.pageModel.findById(id).populate('bookId');
    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found`);
    }
    const book = page.bookId;
    if (!book) {
      throw new NotFoundException(`Book for page with id ${id} not found`);
    }

    if(page._id.toString() === updatePageInput?.parentId?.toString()) {
      throw new BadRequestException(`A page cannot be its own parent`);
    }

    if (!book.owner || (!book.editors || !Array.isArray(book.editors))) {
      throw new InternalServerErrorException('Invalid book access data');
    }
    if (book.owner !== userId && !book.editors.includes(userId)) {
      throw new ForbiddenException('You do not have permission to update this page');
    }

    // Проверка блокировки: если страница заблокирована другим пользователем и блокировка не истекла
    const lockTimeout = 5 * 60 * 1000; // 5 минут
    const now = new Date();

    if (page.lockedBy &&
      page.lockedBy !== userId &&
      page.lockedAt &&
      (now.getTime() - new Date(page.lockedAt).getTime()) < lockTimeout) {
      throw new BadRequestException(`Page is currently being edited by another user. Please try again later.`);
    }

    this.Logger.log(`Updating page ${page._id}`);
    const newPage = await this.pageModel.findOneAndUpdate(
      { _id: id },
      { $set: updatePageInput, lockedBy: userId, lockedAt: new Date() },
      { new: true },
    );

    return newPage;
  }

  async updateMany(updatePageInputs: UpdatePageInput[], userId: ID): Promise<Page[]> {
    const updatedPages: Page[] = [];
    for (const input of updatePageInputs) {
      const updatedPage = await this.update(input.id, input, userId);
      updatedPages.push(updatedPage);
    }
    return updatedPages;
  }

  /**
   * Удаление страницы (и рекурсивных подстраниц).
   * После удаления оповещаем все клиенты этой книги.
   */
  async remove(id: ID): Promise<Page> {
    try {
      const rootPage = await this.pageModel.findById(id).exec();
      if (!rootPage) {
        throw new Error(`Page with id ${id} not found`);
      }

      // Ищем рекурсивно все подстраницы (используем $graphLookup)
      const pagesToDelete = await this.pageModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(id) },
        },
        {
          $graphLookup: {
            from: 'pages',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: 'subPages',
          },
        },
        {
          $project: {
            allPages: {
              $concatArrays: [['$_id'], '$subPages._id'],
            },
          },
        },
      ]);

      const pageIds = pagesToDelete[0]?.allPages || [];
      if (pageIds.length === 0) {
        throw new Error(`No pages found for deletion`);
      }

      await this.pageModel.deleteMany({ _id: { $in: pageIds } });

      return rootPage;
    } catch (error) {
      throw error;
    }
  }
}
