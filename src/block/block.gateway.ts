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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BlockService } from './block.service';
import { UpdateBlockInput } from './dto/update-block.input';

@WebSocketGateway({ cors: true })
export class BlockGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('BlockGateway');

  constructor(private readonly blockService: BlockService) { }

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
    const currentBlocks = await this.blockService.findForPage(pageId);
    client.emit('block_state', currentBlocks);
  }

  @SubscribeMessage('update_block')
  async handleUpdateBlock(
    @MessageBody()
    { pageId, blockId, content }: { pageId: string; blockId: string; content: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Обновляем состояние блока
      const dToIn = {
        id: blockId,
        content: content
      }
      const updatedBlock = await this.blockService.update(dToIn);

      // Рассылаем изменения всем клиентам в комнате, кроме отправителя
      client.to(pageId).emit('block_updated', {
        blockId: updatedBlock._id,
        content: updatedBlock.content,
      });

      this.logger.log(`Block ${blockId} updated by ${client.id}`);
    } catch (error) {
      this.logger.error(`Error updating block ${blockId}: ${error.message}`);
      client.emit('error', { message: `Failed to update block: ${error.message}` });
    }
  }
}