import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CgptOpenaiModule } from './cgptopenai/cgpt-openai.module';
import { WhatsappModule } from './meta/whatsapp/whatsapp.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { AuthModule } from './auth/auth.module';
import { IsUniqueConstraint } from './validators/is-unique-constraint/is-unique-constraint.validator';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    CgptOpenaiModule,
    WhatsappModule,
    CustomerModule,
    TechnicianModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    IsUniqueConstraint,
  ],
})
export class AppModule {}
