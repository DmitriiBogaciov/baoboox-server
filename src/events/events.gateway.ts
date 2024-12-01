import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PageService } from '../page/page.service';

@WebSocketGateway({ cors: true }) // Разрешаем CORS
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService
  ) {}

  @WebSocketServer()
  server: Server; // Доступ к серверу Socket.IO

  private logger: Logger = new Logger('EventsGateway');

  // Хук инициализации
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  // Обработчик подключения клиента
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Получаем bookId из запроса клиента и добавляем его в соответствующую комнату
    const bookId = client.handshake.query.bookId as string; // bookId передаётся в запросе
    if (bookId) {
      client.join(bookId); // Добавляем клиента в комнату с bookId
      this.logger.log(`Client ${client.id} joined room: ${bookId}`);
    }
  }

  // Обработчик отключения клиента
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Обработчик получения дерева страниц
  @SubscribeMessage('get_pages')
  async handleGetPages(
    @MessageBody('bookId') bookId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // this.logger.log(`Fetching pages for book: ${bookId}`);
    const pagesTree = await this.pageService.getPagesForBook(bookId);
    // this.logger.log('PagesTree', pagesTree);
    client.emit('pages_tree', pagesTree); // Отправляем дерево страниц клиенту
  }

  // private emitToAll(event: string, data: any) {
  //   this.server.emit(event, data); // Рассылаем событие всем клиентам
  // }

  // Отправка события о добавлении страницы только клиентам в комнате
  async notifyPageAdded(newPage: any) {
    const bookId = newPage.bookId.toString();
    this.logger.log(`Page added: ${newPage.bookId}`);
    console.log('Added page: ', newPage)
    this.server.to(bookId).emit('page_added', newPage);
  }

  // Отправка события об удалении страницы только клиентам в комнате
  async notifyPageRemoved(removedPageId: string, bookId: string) {
    this.logger.log(`Page removed: ${removedPageId}`);
    this.server.to(bookId).emit('page_removed', removedPageId); // Отправляем только в комнату bookId
  }

  // Отправка события об обновлении страницы только клиентам в комнате
  async notifyPageUpdated(updatedPage: any) {
    this.logger.log(`Page updated: ${updatedPage._id}`);
    this.server.to(updatedPage.bookId).emit('page_updated', updatedPage); // Отправляем только в комнату bookId
  }
}
