import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './commons/services/config/config.module';
import { KnexService } from './commons/services/knex/knex.service';
import { KnexModule } from './commons/services/knex/knex.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AppConfigModule, KnexModule, UserModule],
  controllers: [AppController],
  providers: [AppService, KnexService],
})
export class AppModule {}
