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
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BlockService } from './block.service';
import { Ctx, Payload, RedisContext, ClientProxy, EventPattern } from '@nestjs/microservices';

@WebSocketGateway({ cors: true })
export class BlockGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly blockService: BlockService,
    @Inject('NOTIFICATION_SERVICE') private client: ClientProxy
  ) { }

  private logger: Logger = new Logger('BlockGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_page')
  async handleJoinPage(
    @MessageBody() pageId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(pageId); // Клиент присоединяется к комнате страницы
    this.logger.log(`Client ${client.id} joined page ${pageId}`);

    // Отправляем текущее состояние всех блоков клиенту
    // const currentBlocks = await this.blockService.findForPage(pageId);
    // client.emit('block_state', currentBlocks);
  }

  @SubscribeMessage('block_update')
  async handleUpdateBlock(
    @MessageBody()
    { pageId, blockId, content }: { pageId: string; blockId: string; content: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {

      this.client.emit('block_updated', { pageId, blockId, content })

      // Обновляем состояние блока
      const dToIn = {
        id: blockId,
        content: content
      }
      const updatedBlock = await this.blockService.update(dToIn);

      this.logger.log(`Block ${blockId} updated by ${client.id}`);
    } catch (error) {
      throw error;
    }
  }

}