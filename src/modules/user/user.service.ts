import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { KnexService } from '../../commons/services/knex/knex.service';
import { User } from '../../models/user.model';
import { UserResponseDto } from './dtos/user-response.dto';
import {
  PaginationOptions,
  PaginationResult,
} from '../../commons/interfaces/pagination.interface';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';

/**
 * Service for managing user operations.
 */
@Injectable()
export class UserService {
  constructor(
    private knexService: KnexService,
    private jwtService: JwtService,
    private i18n: I18nService,
  ) {}

  /**
   * Creates a new user.
   * @param userData - The user data to create.
   * @returns The created user without password.
   */
  async create(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = (await this.knexService
      .knex('users')
      .insert({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
      })
      .returning('*')) as User[];
    return this.mapToUserResponse(user);
  }

  /**
   * Finds all users with pagination.
   * @param options - Pagination options.
   * @returns Paginated list of users without passwords.
   */
  async findAll(
    options: PaginationOptions,
  ): Promise<PaginationResult<UserResponseDto>> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.knexService.knex('users').select('*').limit(limit).offset(offset),
      this.knexService.knex('users').count('id as count').first(),
    ]);

    const totalCount = parseInt((total?.count as string) || '0');
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: (users as User[]).map((user) => this.mapToUserResponse(user)),
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Finds a user by ID.
   * @param id - The user ID.
   * @returns The user without password.
   */
  async findOne(id: number, lang?: string): Promise<UserResponseDto> {
    const user = (await this.knexService
      .knex('users')
      .where({ id })
      .first()) as User | undefined;
    if (!user) {
      const message = this.i18n.translate('USER.NOT_FOUND', { lang });
      throw new NotFoundException(message);
    }
    return this.mapToUserResponse(user);
  }

  /**
   * Finds a user by email.
   * @param email - The user email.
   * @returns The user or undefined.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return (await this.knexService.knex('users').where({ email }).first()) as
      | User
      | undefined;
  }

  /**
   * Updates a user.
   * @param id - The user ID.
   * @param updateData - The data to update.
   * @returns The updated user without password.
   */
  async update(
    id: number,
    updateData: Partial<{
      name: string;
      email: string;
      password: string;
      role: 'user' | 'admin';
    }>,
    lang?: string,
  ): Promise<UserResponseDto> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const [user] = (await this.knexService
      .knex('users')
      .where({ id })
      .update(updateData)
      .returning('*')) as User[];
    if (!user) {
      const message = this.i18n.translate('USER.NOT_FOUND', { lang });
      throw new NotFoundException(message);
    }
    return this.mapToUserResponse(user);
  }

  /**
   * Deletes a user (admin only).
   * @param id - The user ID.
   * @param currentUser - The current user.
   */
  async delete(
    id: number,
    currentUser: { role: 'user' | 'admin' },
    lang?: string,
  ): Promise<void> {
    if (currentUser.role !== 'admin') {
      const message = this.i18n.translate('USER.DELETE_FORBIDDEN', { lang });
      throw new ForbiddenException(message);
    }
    const deleted = await this.knexService.knex('users').where({ id }).del();
    if (!deleted) {
      const message = this.i18n.translate('USER.NOT_FOUND', { lang });
      throw new NotFoundException(message);
    }
  }

  /**
   * Validates a password against its hash.
   * @param password - The plain password.
   * @param hashedPassword - The hashed password.
   * @returns True if valid.
   */
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Logs in a user.
   * @param email - User email.
   * @param password - User password.
   * @returns Access token.
   */
  async login(
    email: string,
    password: string,
    lang?: string,
  ): Promise<{ access_token: string }> {
    const user = await this.findByEmail(email);
    if (user && (await this.validatePassword(password, user.password))) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return { access_token: this.jwtService.sign(payload) };
    }
    const message = this.i18n.translate('USER.INVALID_CREDENTIALS', { lang });
    throw new UnauthorizedException(message);
  }

  /**
   * Maps a User to UserResponseDto.
   * @param user - The user.
   * @returns The response DTO.
   */
  private mapToUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
