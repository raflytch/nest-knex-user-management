import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './commons/services/config/config.module';
import { KnexService } from './commons/services/knex/knex.service';
import { KnexModule } from './commons/services/knex/knex.module';
import { UserModule } from './modules/user/user.module';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    AppConfigModule,
    KnexModule,
    UserModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'locale', 'l']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, KnexService],
})
export class AppModule {}
