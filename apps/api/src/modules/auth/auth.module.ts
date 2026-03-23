import { Module } from '@nestjs/common';
import { JweStrategy } from './jwe.strategy.js';
import { JweAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  providers: [JweStrategy, JweAuthGuard],
  exports: [JweAuthGuard],
})
export class AuthModule {}
