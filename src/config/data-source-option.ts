import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['db/migrations/*{.ts,.js}'],
  synchronize: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
