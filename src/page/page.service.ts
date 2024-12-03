import { Inject, Injectable, BadRequestException, forwardRef } from '@nestjs/common';
import { CreatePageInput } from './dto/create-page.input';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { UpdatePageInput } from './dto/update-page.input';
import { Page, PageDocument } from './entities/page.entity';
import { Model, Connection, Types } from 'mongoose'
import { ID } from 'graphql-ws';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    @InjectConnection() private connection: Connection,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway
  ) { }

  async create(createPageInput: CreatePageInput) {
    // Найти максимальный порядок для данной книги
    const maxOrderPage = await this.pageModel
      .findOne({ bookId: createPageInput.bookId })
      .sort({ order: -1 }) // Сортировка по `order` в убывающем порядке
      .exec();

    // Установить порядок для новой страницы
    const newOrder = maxOrderPage ? maxOrderPage.order + 1 : 1; // Если страниц нет, порядок будет 1
    const createdPage = new this.pageModel({ ...createPageInput, order: newOrder });

    this.eventsGateway.notifyPageAdded(createdPage);
    return createdPage.save();
  }

  async findAll() {
    const response = await this.pageModel.find()
    // console.log(response)
    return response;
  }

  async findOne(id: string): Promise<Page | null> {
    try {
      const page = await this.pageModel.findById(id).exec();

      if (!page) {
        return null;
      }

      return page;
    } catch (error) {
      console.error(`Error finding page with id ${id}:`, error);
      throw new Error(`Failed to find page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPagesForBook(bookId: string): Promise<Page[]> {
    // Проверка валидности ObjectId
    if (!Types.ObjectId.isValid(bookId)) {
      console.log(`Invalid bookId: ${bookId}`)
      throw new BadRequestException(`Invalid bookId: ${bookId}`);
    }

    const pages = await this.pageModel.find({ bookId }).exec();

    return pages;
  }

  async getChildren(parentId: string): Promise<Page[]> {
    return await this.pageModel.find({ parentId }).exec();
  }

  async update(id: String, updatePageInput: UpdatePageInput) {

    const newPage = await this.pageModel.findOneAndUpdate(
      { _id: id },
      { $set: updatePageInput },
      { new: true }
    )

    // console.log("New page: ", newPage)
    this.eventsGateway.notifyPageUpdated(newPage)

    return newPage;
  }

  async remove(id: ID): Promise<Page> {
    try {
      // Найти страницу, которую нужно удалить
      const rootPage = await this.pageModel.findById(id).exec();
      if (!rootPage) {
        throw new Error(`Page with id ${id} not found`);
      }

      // Используем MongoDB `$graphLookup` для нахождения всех связанных страниц
      const pagesToDelete = await this.pageModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(id) }, // Начинаем с корневой страницы
        },
        {
          $graphLookup: {
            from: "pages", // Коллекция с данными страниц
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parentId",
            as: "subPages", // Результат всех вложенных страниц
          },
        },
        {
          $project: {
            allPages: {
              $concatArrays: [["$_id"], "$subPages._id"], // Собираем корневую и все подстраницы
            },
          },
        },
      ]);

      // Получаем список всех связанных ID страниц
      const pageIds = pagesToDelete[0]?.allPages || [];
      if (pageIds.length === 0) {
        throw new Error(`No pages found for deletion`);
      }

      // Удаляем все страницы в одном запросе
      await this.pageModel.deleteMany({ _id: { $in: pageIds } });

      // Уведомляем клиентов через WebSocket
      pageIds.forEach((pageId) => {
        this.eventsGateway.notifyPageRemoved(pageId.toString(), rootPage.bookId.toString());
      });

      return rootPage;
    } catch (error) {
      throw error;
    }
  }
}
