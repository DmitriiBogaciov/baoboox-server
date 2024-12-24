import {
  Injectable,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Model, Connection, Types } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Page, PageDocument } from './entities/page.entity';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { ID } from 'graphql-ws';
import { PageGateway } from './page.gateway';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    @InjectConnection() private connection: Connection,
    @Inject(forwardRef(() => PageGateway))
    private readonly pageGateway: PageGateway,
  ) {}

  /**
   * Создание страницы с автогенерацией order
   */
  async create(createPageInput: CreatePageInput) {
    // Находим максимальный order для данной книги
    const maxOrderPage = await this.pageModel
      .findOne({ bookId: createPageInput.bookId })
      .sort({ order: -1 })
      .exec();

    const newOrder = maxOrderPage ? maxOrderPage.order + 1 : 1;
    const createdPage = new this.pageModel({
      ...createPageInput,
      order: newOrder,
    });

    // Сохраняем в БД
    const savedPage = await createdPage.save();

    // Оповещаем всех в книге о том, что страница добавлена
    this.pageGateway.notifyPageAdded(savedPage);

    return savedPage;
  }

  async findAll() {
    return this.pageModel.find().exec();
  }

  async findOne(id: string): Promise<Page | null> {
    try {
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

  /**
   * Обновление страницы, потом рассылаем событие
   */
  async update(id: string, updatePageInput: UpdatePageInput) {
    const newPage = await this.pageModel.findOneAndUpdate(
      { _id: id },
      { $set: updatePageInput },
      { new: true },
    );

    if (newPage) {
      this.pageGateway.notifyPageUpdated(newPage);
    }
    return newPage;
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

      // Уведомляем клиентов о каждой удалённой странице
      pageIds.forEach((pageId) => {
        this.pageGateway.notifyPageRemoved(
          pageId.toString(),
          rootPage.bookId.toString(),
        );
      });

      return rootPage;
    } catch (error) {
      throw error;
    }
  }
}
