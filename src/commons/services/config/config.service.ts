import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigDto } from './config.dto';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<ConfigDto, true>) {}

  get databaseHost(): string {
    return this.configService.get('DATABASE_HOST');
  }

  get databasePort(): number {
    return this.configService.get('DATABASE_PORT');
  }

  get databaseName(): string {
    return this.configService.get('DATABASE_NAME');
  }

  get databaseUser(): string {
    return this.configService.get('DATABASE_USER');
  }

  get databasePassword(): string {
    return this.configService.get('DATABASE_PASSWORD');
  }

  get jwtSecret(): string {
    return (
      this.configService.get('JWT_SECRET', { infer: true }) ||
      'default-secret-key'
    );
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true }) ?? 3000;
  }
}
