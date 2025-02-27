import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserInterfaces, UserLogInDto } from 'src/types/user';

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
}
