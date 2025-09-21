import { Knex } from 'knex';
import { ConfigDto } from './src/commons/services/config/config.dto';

const configService = new (class {
  private config: ConfigDto = {
    DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
    DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432'),
    DATABASE_NAME: process.env.DATABASE_NAME || 'user_management_knex',
    DATABASE_USER: process.env.DATABASE_USER || 'postgres',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'rafly123',
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    PORT: parseInt(process.env.PORT || '3000'),
  };

  get databaseHost(): string {
    return this.config.DATABASE_HOST;
  }

  get databasePort(): number {
    return this.config.DATABASE_PORT;
  }

  get databaseName(): string {
    return this.config.DATABASE_NAME;
  }

  get databaseUser(): string {
    return this.config.DATABASE_USER;
  }

  get databasePassword(): string {
    return this.config.DATABASE_PASSWORD;
  }
})();

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: configService.databaseHost,
    port: configService.databasePort,
    user: configService.databaseUser,
    password: configService.databasePassword,
    database: configService.databaseName,
  },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

export default knexConfig;
