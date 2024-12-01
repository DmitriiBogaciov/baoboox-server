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

    const map: Record<string, Page & { children: Page[] }> = {};
    const tree: (Page & { children: Page[] })[] = [];

    pages.forEach((page) => {
      map[page._id] = { ...page.toObject(), children: [] };
    });

    pages.forEach((page) => {
      if (page.parentId) {
        map[page.parentId]?.children.push(map[page._id]);
      } else {
        tree.push(map[page._id]);
      }
    });

    return tree;
  }

  async getChildren(parentId: string): Promise<Page[]> {
    return await this.pageModel.find({ parentId }).exec();
  }

  update(id: String, updatePageInput: UpdatePageInput) {

    const newPage = this.pageModel.findOneAndUpdate(
      { _id: id },
      { $set: updatePageInput },
      { new: true }
    )

    return newPage;
  }

  async remove(id: ID): Promise<Page> {
    try {
      const response = await this.pageModel.findByIdAndDelete(id);
      this.eventsGateway.notifyPageRemoved(response._id, response.bookId.toString())
      return response;
    } catch(error) {
      throw error;
    }
  }
}
