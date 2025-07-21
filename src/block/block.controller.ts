import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { BlockGateway } from './block.gateway';

@Controller('block')
export class BlockController {
    private readonly logger = new Logger(BlockController.name);

    constructor(private readonly blockGateway: BlockGateway) {}

    @EventPattern('block_updated')
    async handleBlockUpdated(data: { pageId: string; blockId: string; content: any }) {
        // this.logger.log(`Received Redis event: ${JSON.stringify(data)}`);

        // Отправляем изменения всем пользователям на странице через WebSocket
        this.blockGateway.server.to(data.pageId).emit('block_updated', {
            _id: data.blockId,
            content: data.content,
        });
    }
}