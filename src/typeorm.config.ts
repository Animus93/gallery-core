import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config({ path: '.env' });

export const sourceConfig = <DataSourceOptions>{
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['./dist/**/*.entity{.ts,.js}'],
  migrations: ['./dist/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: './src/migrations/*{.ts,.js}',
  },
  migrationsRun: false,
  migrationsTableName: 'migrations',
  autoLoadEntities: true,
  synchronize: false,
};

export const dataSource = new DataSource(sourceConfig);
