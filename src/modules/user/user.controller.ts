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
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserInterfaces } from 'src/types/user';
import { CreateUserDto } from 'src/types/user';
import { UserLogInDto } from 'src/types/user';
import { UpdateUserDto } from 'src/types/user';

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
  async createUser(
    @Body() data: CreateUserDto
  ): Promise<UserInterfaces.UserResponse> {
    return this.userService.createUser(data);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param('id') userId: string
  ): Promise<UserInterfaces.UserResponse> {
    return this.userService.getUserById(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<UserInterfaces.UsersResponse> {
    return this.userService.getAllUsers();
  }

  
  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)  
  async updateUser(
    @Param('id') userId: string,
    @Body() data: UpdateUserDto
  ): Promise<UserInterfaces.UserResponse> {
    return this.userService.updateUser(userId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string): Promise<void> {
    return this.userService.deleteUser(userId);
  }

  @Patch('restore/:id')
  @HttpCode(HttpStatus.OK)
  async restoreUser(
    @Param('id') userId: string
  ): Promise<UserInterfaces.UserResponse> {
    return this.userService.restoreUser(userId);
  }
}
