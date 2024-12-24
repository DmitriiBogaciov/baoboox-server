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
  import { PageService } from 'src/page/page.service';
  
  @WebSocketGateway({ cors: true }) // Включаем CORS для Socket.IO
  export class PageGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    private readonly logger = new Logger(PageGateway.name);
  
    constructor(
      @Inject(forwardRef(() => PageService))
      private readonly pageService: PageService,
    ) {}
  
    @WebSocketServer()
    server: Server; // Ссылка на сам Socket.IO-сервер
  
    // Хук, вызывается после инициализации WebSocket-сервера
    afterInit(server: Server) {
      this.logger.log('PageGateway initialized');
    }
  
    // Вызывается при подключении нового клиента
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
  
      // Получаем bookId из query и добавляем клиента в соответствующую комнату
      const bookId = client.handshake.query.bookId as string;
      if (bookId) {
        client.join(bookId);
        this.logger.log(`Client ${client.id} joined room: ${bookId}`);
      }
    }
  
    // Вызывается при отключении клиента
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    // --- Подписки/обработчики событий ---
  
    // Клиент шлёт событие 'get_pages' с { bookId }, чтобы получить список/дерево страниц
    @SubscribeMessage('get_pages')
    async handleGetPages(
      @MessageBody('bookId') bookId: string,
      @ConnectedSocket() client: Socket,
    ) {
      this.logger.log(`Fetching pages for bookId: ${bookId}`);
      const pagesTree = await this.pageService.getPagesForBook(bookId);
      client.emit('pages_flat', pagesTree); 
    }
  
    // --- Методы-уведомления (вызываются из PageService при изменениях) ---
  
    async notifyPageAdded(newPage: any) {
      const bookId = newPage.bookId.toString();
      this.logger.log(`Page added in bookId: ${bookId}`);
      this.server.to(bookId).emit('page_added', newPage);
    }
  
    async notifyPageRemoved(removedPageId: string, bookId: string) {
      this.logger.log(`Page removed: ${removedPageId} (bookId: ${bookId})`);
      this.server.to(bookId).emit('page_removed', removedPageId);
    }
  
    async notifyPageUpdated(updatedPage: any) {
      const bookId = updatedPage.bookId.toString();
      this.logger.log(`Page updated in bookId: ${bookId}`);
      this.server.to(bookId).emit('page_updated', updatedPage);
    }
  }
  