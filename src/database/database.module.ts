import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.getOrThrow('DB_TYPE') as 'mysql',
          host: configService.getOrThrow('DB_HOST'),
          port: Number(configService.getOrThrow('DB_PORT')) || 3306,
          database: configService.getOrThrow('DB_DATABASE'),
          username: configService.getOrThrow('DB_USERNAME'),
          password: configService.getOrThrow('DB_PASSWORD'),
          synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
          autoLoadEntities: true,
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
