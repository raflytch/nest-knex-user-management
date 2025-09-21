import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConfigDto {
  @IsString()
  DATABASE_HOST: string;

  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value as string) : undefined))
  @IsNumber()
  PORT?: number;
}
