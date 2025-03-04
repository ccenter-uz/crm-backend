import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserInterfaces } from 'src/types/user';
import { CreateUserDto } from 'src/types/user';
import { UserLogInDto } from 'src/types/user';
import { UpdateUserDto } from 'src/types/user';
import { UserDocument } from 'src/models/schemas/user.schema';
import { QueryUserDto } from 'src/types/user/dto/query-user.dto';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('log-in')
  @ApiBody({ type: UserLogInDto })
  @HttpCode(HttpStatus.OK)
  async logIn(
    @Body() data: UserLogInDto
  ): Promise<UserInterfaces.LogInResponse> {
    return this.userService.logIn(data);
  }

  @Post()
  @ApiBody({ type: CreateUserDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateUserDto): Promise<UserDocument> {
    return this.userService.create(data);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') userId: string): Promise<UserDocument> {
    return this.userService.getById(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query() query: QueryUserDto
  ): Promise<UserInterfaces.UsersResponse> {
    return this.userService.getAll(query);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') userId: string,
    @Body() data: UpdateUserDto
  ): Promise<UserDocument> {
    return this.userService.update(userId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') userId: string): Promise<void> {
    return this.userService.delete(userId);
  }

  @Patch('restore/:id')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') userId: string): Promise<UserDocument> {
    return this.userService.restore(userId);
  }
}
