import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();
const configService = new ConfigService();

const options: DataSourceOptions = {
  type: configService.getOrThrow('DB_TYPE') as 'mysql',
  host: configService.getOrThrow('DB_HOST'),
  port: Number(configService.getOrThrow('DB_PORT')) || 3306,
  database: configService.getOrThrow('DB_DATABASE'),
  username: configService.getOrThrow('DB_USERNAME'),
  password: configService.getOrThrow('DB_PASSWORD'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['migrations/**'],
} as DataSourceOptions;

export default new DataSource(options);
