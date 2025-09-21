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
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { PaginationOptions } from '../../commons/interfaces/pagination.interface';
import { JwtAuthGuard } from '../../commons/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';

interface RequestWithUser extends Request {
  user: { id: number; email: string; role: 'user' | 'admin' };
}

/**
 * Controller for user management.
 */
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Creates a new user.
   * @param createUserDto - The user data.
   * @returns The created user.
   */
  @Post()
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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  /**
   * Updates a user.
   * @param id - The user ID.
   * @param updateUserDto - The update data.
   * @returns The updated user.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Deletes a user (admin only).
   * @param id - The user ID.
   * @param req - The request with user.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.userService.delete(id, req.user);
  }

  /**
   * Logs in a user.
   * @param loginDto - Login credentials.
   * @returns Access token.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (
      user &&
      (await this.userService.validatePassword(
        loginDto.password,
        user.password,
      ))
    ) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
