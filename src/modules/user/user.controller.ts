import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { PaginationOptions } from '../../commons/interfaces/pagination.interface';
import { JwtAuthGuard } from '../../commons/guards/jwt.guard';
import { I18nService } from 'nestjs-i18n';

interface RequestWithUser extends Request {
  user: { id: number; email: string; role: 'user' | 'admin' };
}

/**
 * Controller for user management.
 */
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Creates a new user.
   * @param createUserDto - The user data.
   * @returns The created user.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  /**
   * Gets all users with pagination.
   * @param page - Page number.
   * @param limit - Items per page.
   * @returns Paginated users.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const options: PaginationOptions = { page, limit };
    return this.userService.findAll(options);
  }

  /**
   * Gets a user by ID.
   * @param id - The user ID.
   * @returns The user.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiQuery({ name: 'lang', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'User retrieved',
    type: UserResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ): Promise<UserResponseDto> {
    return this.userService.findOne(id, lang);
  }

  /**
   * Updates a user.
   * @param id - The user ID.
   * @param updateUserDto - The update data.
   * @returns The updated user.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiQuery({ name: 'lang', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Query('lang') lang?: string,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto, lang);
  }

  /**
   * Deletes a user (admin only).
   * @param id - The user ID.
   * @param req - The request with user.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiQuery({ name: 'lang', required: false, type: String })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
    @Query('lang') lang?: string,
  ): Promise<void> {
    return this.userService.delete(id, req.user, lang);
  }

  /**
   * Logs in a user.
   * @param loginDto - Login credentials.
   * @returns Access token.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async login(@Body() loginDto: LoginDto, @Query('lang') lang?: string) {
    return this.userService.login(loginDto.email, loginDto.password, lang);
  }
}
