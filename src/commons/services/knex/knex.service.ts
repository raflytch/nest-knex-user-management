import { Injectable } from '@nestjs/common';
import { Knex, knex } from 'knex';
import knexConfig from '../../../../knexfile';

@Injectable()
export class KnexService {
  private knexInstance: Knex;

  constructor() {
    this.knexInstance = knex(knexConfig);
  }

  get knex(): Knex {
    return this.knexInstance;
  }
}
