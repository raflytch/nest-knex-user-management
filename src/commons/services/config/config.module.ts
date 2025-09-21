import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ConfigDto } from './config.dto';
import { AppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: async (config: Record<string, any>) => {
        const configDto = plainToClass(ConfigDto, config);
        const errors = await validate(configDto);
        if (errors.length > 0) {
          throw new Error(
            `Config validation error: ${errors.map((e) => e.toString()).join(', ')}`,
          );
        }
        return config;
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
