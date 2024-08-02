import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './AuthGuard';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}